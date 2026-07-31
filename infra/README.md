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
| AWS CLI v2 | `aws --version` | Installed at `C:\Program Files\Amazon\AWSCLIV2` — on the machine PATH, so a *new* shell picks it up |
| AWS credentials | `aws sts get-caller-identity` | Profile `adlm-deploy`, account `065634457992`. Needs permission to create IAM roles |
| Docker | — | **Not required.** See Step 3: the image is built by CodeBuild in the cloud, because Docker Desktop needs local administrator rights |

---

## Step 0a — Service-linked roles (do this first, in a fresh account or region)

ECS, its autoscaling, and the load balancer each need a service-linked role in
the account. IAM is global, so this is once per account, not per region.

```bash
aws iam create-service-linked-role --aws-service-name ecs.amazonaws.com --profile adlm-deploy
aws iam create-service-linked-role --aws-service-name ecs.application-autoscaling.amazonaws.com --profile adlm-deploy
aws iam create-service-linked-role --aws-service-name elasticloadbalancing.amazonaws.com --profile adlm-deploy
```

`InvalidInput ... has been taken` means it already exists — that is a success, not
a failure. Verify with:

```bash
aws iam get-role --role-name AWSServiceRoleForECS --profile adlm-deploy --query Role.Arn --output text
```

**Why this is a separate step and not left to CloudFormation.** On the first
deploy of `01-foundation.yml` the cluster failed with:

```
Unable to assume the service linked role. Please verify that the ECS service
linked role exists.
```

The role was not missing — creating the cluster had triggered its creation, and
the cluster then tried to assume it before IAM had propagated. It is a race, and
it only shows up on the very first ECS workload in an account, which is exactly
when nobody is expecting it. Creating the roles up front and letting them settle
removes the race. Done for account `065634457992` on 2026-07-30.

### If the stack still rolls back on the first attempt

The asset bucket carries `DeletionPolicy: Retain` — correct for a bucket holding
the only copy of uploaded constitutions and portraits, but it means a *failed
first deploy* leaves the bucket behind, and the retry then fails early validation
with `AWS::EarlyValidation::ResourceExistenceCheck`. Confirm the orphan is empty
before removing it:

```bash
aws s3 ls s3://niqs-assets-<account>-<region> --recursive
aws s3api delete-bucket --bucket niqs-assets-<account>-<region> --region <region> --profile adlm-deploy
```

Only do this for a bucket you just created and know is empty. Once real uploads
exist, import it into the stack instead.

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
`PORTAL_API_URL`, `PORTAL_API_KEY`, `NIQS_STATS_API_KEY`.

`NIQS_STATS_API_KEY` is the NIQS public statistics key (see
[`../docs/PUBLIC_STATS_API.md`](../docs/PUBLIC_STATS_API.md)). Without it the site
still works — `/api/stats/membership` answers 503 and every figure falls back to
its static copy — but no membership number on the site is live.

> ⚠️ **`load-secrets.ps1` replaces the whole secret, it does not merge.** It calls
> `put-secret-value` with whatever it found in `server/.env`, so a key missing
> from your local `.env` is a key deleted from the secret — and a task that
> references a deleted key fails to launch. To add one key to a populated secret,
> edit it in the console. Use the script when `server/.env` is complete.

Reuse the *same* `JWT_SECRET` as Render, or every signed-in admin gets logged out
at cutover.

Two keys are deliberately absent because the task role supplies them: there are
no AWS access keys anywhere in this setup. `S3_BUCKET` and `ASSET_CDN_URL` are
passed as plain environment variables by the service stack.

---

## Step 3 — Build and push the image

The image is built by **CodeBuild in the cloud**, not on the workstation: Docker
Desktop needs local administrator rights, which the deploying account does not
have. There is no Docker step here and none is needed.

```powershell
powershell -ExecutionPolicy Bypass -File .\infra\build-and-push.ps1
```

That packages `server/`, uploads it to the `build/` prefix of the asset bucket,
starts `niqs-api-build`, waits for it, and prints the image URI plus the deploy
command for Step 4. Pin the tag with `-ImageTag 2026-07-31-hotfix` if you want
something more meaningful than the timestamp.

If you would rather run it by hand:

```powershell
$p = 'adlm-deploy'; $r = 'eu-west-3'
$bucket = aws cloudformation list-exports --region $r --profile $p `
  --query "Exports[?Name=='niqs-asset-bucket'].Value" --output text
$tag = Get-Date -Format 'yyyy-MM-dd-HHmm'

git archive --format=zip --output server-source.zip HEAD:server
aws s3 cp server-source.zip "s3://$bucket/build/server-source.zip" --region $r --profile $p

$build = aws codebuild start-build --project-name niqs-api-build `
  --environment-variables-override "name=IMAGE_TAG,value=$tag,type=PLAINTEXT" `
  --region $r --profile $p --query 'build.id' --output text

aws codebuild batch-get-builds --ids $build --region $r --profile $p `
  --query 'builds[0].buildStatus' --output text   # poll until SUCCEEDED, ~2-4 min
```

Three things that bite:

- **The zip comes from `git archive`, so it contains committed files only.**
  Uncommitted work in `server/` is silently absent from the image. The script
  refuses to run on a dirty tree for exactly this reason; by hand, you get no
  warning. `git archive` is also what keeps `server/.env` and the 47 MB of
  `node_modules` out of S3 — `.dockerignore` only governs the build context
  inside CodeBuild, not what you upload.
- **`HEAD:server` puts the Dockerfile at the root of the zip,** which is where the
  buildspec's `docker build .` looks for it. Zipping the `server` folder itself
  nests everything one level down and the build fails.
- **Use a dated, immutable tag — never `:latest`.** Express Mode redeploys only
  when `ImageUri` changes, so a floating tag makes every subsequent deploy a
  silent no-op.

Merging to `main` does **not** trigger any of this. The CodeBuild source is an S3
zip, not a GitHub webhook, so a backend change ships only when someone runs this
step. Vercel does auto-deploy the client, so after a merge the front end can be
ahead of the API — which shows up as the site falling back to its static copy
rather than as an error.

---

## Step 4 — Deploy the service

```bash
aws cloudformation deploy --template-file infra/cloudformation/02-service.yml --stack-name niqs-api --parameter-overrides ProjectName=niqs ImageUri=<the URI you just pushed> ClientUrl=https://niqs-website.vercel.app,http://localhost:5173 IncludeStatsSecret=true
```

`IncludeStatsSecret=true` is what actually injects `NIQS_STATS_API_KEY` into the
task. It is gated separately from `IncludeOptionalSecrets` (which covers `SMTP_*`
and `PORTAL_*`) because the statistics key exists today while those credentials do
not — one shared switch would hold the live figures hostage to credentials nobody
has yet. **The key must already be in the secret from Step 2**, or ECS refuses to
start the task.

Check the current parameters before deploying and pass them back explicitly, so
nothing silently reverts to a template default:

```bash
aws cloudformation describe-stacks --stack-name niqs-api --query "Stacks[0].Parameters" --output table
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
