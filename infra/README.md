# NIQS API → AWS migration runbook

Moves the Express API off Render onto **Amazon ECS Express Mode** (Fargate), and
gives uploaded PDFs and large images a real **S3 + CloudFront** home. The React
client stays on Vercel — it is already served from a global CDN, and moving it to
S3/CloudFront would not make it faster.

> **Why not App Runner?** App Runner moved to *maintenance* on 30 April 2026 and
> is closed to new customers. ECS Express Mode is its replacement and provisions
> the same things — ALB, HTTPS, autoscaling, managed domain — from one resource.

---

## What you need first

| Tool | Check | Notes |
|---|---|---|
| AWS CLI v2 | `aws --version` | Not currently installed on this machine |
| Docker | `docker --version` | Not currently installed on this machine |
| AWS credentials | `aws sts get-caller-identity` | Needs permission to create IAM roles |

---

## Step 0 — Region: eu-west-3 (Paris). Already determined.

**Deploy into `eu-west-3`.** This is settled, not a guess.

The API is chatty with Atlas — one page render is several queries — so every
millisecond between Fargate and the database is multiplied. The cluster was
located on 2026-07-30 without needing Atlas console access:

```bash
nslookup -type=SRV _mongodb._tcp.<cluster-host>   # -> ac-...-shard-00-0{0,1,2}
nslookup ac-...-shard-00-00.<host>                # -> 65.62.2.42 / .51 / .56
```

Those IPs are not in AWS, GCP or Azure published ranges. `65.62.0.0/15` is
registered to MongoDB, Inc., and their RFC 8805 geofeed
(https://as8011.s3.us-east-2.amazonaws.com/geo-ip.txt) maps `65.62.0.0/19` to
`FR, FR-IDF, Paris`.

So: **eu-west-3 is Paris — same city as the database, ~1-2ms.** eu-west-1
(Ireland) is ~800km away and would cost 10-15ms on every query. Re-run the
lookup above if the cluster is ever migrated.

```bash
aws configure set region eu-west-3 --profile adlm-deploy
```

## Step 1 — Deploy the foundation

Creates the ECR repo, S3 bucket, CloudFront distribution, ECS cluster, three IAM
roles and a placeholder secret.

```bash
aws cloudformation deploy --template-file infra/cloudformation/01-foundation.yml --stack-name niqs-foundation --capabilities CAPABILITY_NAMED_IAM --parameter-overrides ProjectName=niqs ClientOrigins=https://niqs-website.vercel.app,http://localhost:5173
```

CloudFront takes 5–10 minutes to finish. Then read the outputs:

```bash
aws cloudformation describe-stacks --stack-name niqs-foundation --query "Stacks[0].Outputs" --output table
```

---

## Step 2 — Fill in the secret

The template ships `REPLACE_ME` placeholders on purpose — credentials must never
live in a committed template. Put the real values in from your existing Render
environment. Easiest path is the console:

**Secrets Manager → `niqs/api` → Retrieve secret value → Edit**

Keys to fill: `MONGO_URI`, `JWT_SECRET`, `CLOUDINARY_*`, `SMTP_*`,
`PORTAL_API_URL`, `PORTAL_API_KEY`.

Reuse the *same* `JWT_SECRET` as Render, or every signed-in admin gets logged out
at cutover.

Two keys are deliberately absent because the task role supplies them: there are
no AWS access keys anywhere in this setup. `S3_BUCKET` and `ASSET_CDN_URL` are
passed as plain environment variables by the service stack.

---

## Step 3 — Build and push the image

```bash
aws ecr get-login-password | docker login --username AWS --password-stdin $(aws sts get-caller-identity --query Account --output text).dkr.ecr.$(aws configure get region).amazonaws.com
```

PowerShell needs `$(...)` spelled out — grab the account id and region into
variables first:

```powershell
$acct = aws sts get-caller-identity --query Account --output text
$region = aws configure get region
$repo = "$acct.dkr.ecr.$region.amazonaws.com/niqs-api"
aws ecr get-login-password | docker login --username AWS --password-stdin "$acct.dkr.ecr.$region.amazonaws.com"
docker build -t "${repo}:2026-07-30-1" ./server
docker push "${repo}:2026-07-30-1"
```

**Use a dated, immutable tag — never `:latest`.** Express Mode redeploys only when
`ImageUri` changes, so `:latest` makes every subsequent deploy a silent no-op.

The image is `linux/amd64`. On an Apple Silicon machine add
`--platform linux/amd64` or Fargate will fail to start the task.

---

## Step 4 — Deploy the service

```bash
aws cloudformation deploy --template-file infra/cloudformation/02-service.yml --stack-name niqs-api --parameter-overrides ProjectName=niqs ImageUri=<the URI you just pushed> ClientUrl=https://niqs-website.vercel.app,http://localhost:5173
```

Express Mode now builds the ALB, ACM certificate, HTTPS listener, target group,
security groups, log group and scaling policy. First deploy is ~5 minutes.

```bash
aws cloudformation describe-stacks --stack-name niqs-api --query "Stacks[0].Outputs" --output table
```

---

## Step 5 — Verify before touching the client

```bash
curl -i https://<ApiEndpoint>/api/health
```

If `ApiEndpoint` already includes a scheme, drop the `https://`.

You want `200` and `"mongo":"connected"`. Then check a route that actually reads
the database, so you know the Atlas connection and the security group egress both
work:

```bash
curl -s https://<ApiEndpoint>/api/news | head -c 400
```

If `mongo` reads `disconnected`:

1. **Atlas IP allowlist** — Fargate tasks get rotating public IPs. Atlas →
   Network Access needs `0.0.0.0/0`, or set up VPC peering / PrivateLink.
2. **DNS** — `mongodb+srv://` needs SRV lookups. The service stack sets
   `DNS_SERVERS=system` so the VPC resolver is used; the hardcoded public
   resolvers in `config/db.js` are for developer machines and fail in a private
   subnet.
3. Read the logs: `aws logs tail /aws/ecs/niqs-api --follow`

Test an upload through the admin UI too, and confirm the returned URL is on the
CloudFront domain — that proves the task role is signing S3 calls correctly.

---

## Step 6 — Cut the client over

Only after Step 5 passes. In `client/.env.production`:

```
VITE_API_URL=https://<ApiEndpoint>/api
```

Commit and push — Vercel redeploys automatically. Keep Render running for a few
days as a rollback target; reverting is a one-line change to this file.

### Custom domain (recommended)

A bare AWS endpoint in `.env.production` means a future infrastructure change
forces a client redeploy. Pointing `api.niqsng.org` at the managed ALB decouples
them:

1. Request an ACM certificate for `api.niqsng.org` **in the API's region**.
2. Add an HTTPS listener certificate to the ALB from the `LoadBalancerArn` output.
3. Create a DNS ALIAS/CNAME from `api.niqsng.org` to the ALB hostname.
4. Set `VITE_API_URL=https://api.niqsng.org/api`.

---

## Rollback

| Situation | Action |
|---|---|
| API broken, client already cut over | Revert `VITE_API_URL` to the Render URL, push |
| Bad image | Redeploy Step 4 with the previous image tag |
| Foundation needs to go | `aws cloudformation delete-stack --stack-name niqs-api` first, then the foundation stack |

The asset bucket has `DeletionPolicy: Retain` — deleting the foundation stack
will **not** delete uploaded files. Empty and remove it by hand if you truly
mean to.

---

## Cost

Rough monthly estimate at this traffic level. Confirm against the AWS Pricing
Calculator for your region before committing — these are approximations, not a quote.

| Item | ~USD/month |
|---|---|
| ALB (Express Mode manages it) | 17–20 |
| Fargate, 1 task, 0.5 vCPU / 1 GB, always on | ~18 |
| Secrets Manager (1 secret) | 0.40 |
| CloudWatch Logs + Container Insights | 2–5 |
| ECR + S3 storage | <1 |
| CloudFront at this volume | 0–2 |
| **Total** | **~$38–45** |

**This is more than Render.** A Render Starter plan at $7/month also removes cold
starts. You are buying: no cold starts, room to scale, S3/CloudFront for the PDFs
that Cloudinary refuses to serve, IAM-based credentials instead of static keys,
and real logs and metrics. That is a reasonable trade — but it is a trade, and
worth confirming with NIQS before the first bill.

The ALB is the largest fixed line item and Express Mode consolidates up to 25
services behind one, so a second service later is nearly free at that layer.

---

## Known gotchas

- **`uploads/` is ephemeral.** Fargate task storage does not survive a redeploy.
  The local tier in `utils/storage.js` is a degradation path, not storage — if
  files land there, `S3_BUCKET` is misconfigured.
- **Existing file URLs keep working.** Cloudinary and R2 URLs already in MongoDB
  are absolute, so they resolve as long as those accounts stay open. Only *new*
  uploads use S3. There is no data migration in this change — but don't close
  the Cloudinary or R2 account.
- **PDFs now bypass Cloudinary at every size.** Previously a 2 MB PDF went to
  Cloudinary, which blocks public raw PDF delivery, so it uploaded fine and then
  failed on download. Those now go to S3.
- **`server/uploads` is still served at `/uploads`** for legacy records. Harmless,
  but anything it serves is lost on redeploy.
