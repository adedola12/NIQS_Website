# Go-live — pointing niqs.org.ng at Vercel

Approved by the President, 6 August 2026. This is the DNS cutover runbook.

**Read the email warning before changing anything.** One record that looks unrelated
to the website will take the Institute's email down if it is changed in the wrong order.

---

## Where things stand today

Everything the Institute runs is on **one server, `50.6.229.107`**, at HostBurly
(nameservers `ns1.hostburly.com` / `ns2.hostburly.com`):

| Host | Resolves to | What it is |
|---|---|---|
| `niqs.org.ng` | 50.6.229.107 | the website ← **moving to Vercel** |
| `niqsng.org` | 50.6.229.107 | the website, second domain ← **moving to Vercel** |
| `mail.niqs.org.ng` | 50.6.229.107 | mail server |
| `webmail.niqs.org.ng` | 50.6.229.107 | webmail |
| `api.niqsng.org` | 50.6.229.107 | **the membership statistics API** — leave alone |
| `portal.niqsng.org` | 50.6.229.107 | the member portal — leave alone |
| `mail.niqsng.org` | 50.6.229.107 | mail server |

Only the first two rows change. Everything else stays exactly as it is.

---

## ⚠️ The email warning

**`niqs.org.ng`'s MX record points at the bare hostname `niqs.org.ng`.**

Mail for `info@niqs.org.ng` and `secretary@niqs.org.ng` is delivered by looking up
that name — which today gives 50.6.229.107, the mail server. The moment the apex A
record is repointed to Vercel, that same lookup returns a Vercel address, **Vercel
runs no mail server, and mail to the Institute stops arriving.** Senders get bounces
or silent failure.

Both addresses are published on the site's own contact page, so this would be visible
and embarrassing within hours.

**It is easy to avoid, and the fix must go first.** `mail.niqs.org.ng` already exists
and already points at the mail server, so the MX simply needs to name it instead —
which is exactly what `niqsng.org` already does (`MX → mail.niqsng.org`).

---

## Order of work

### Step 1 — make email independent of the website record (do this first)

In the HostBurly / cPanel DNS zone editor for **niqs.org.ng**:

- Confirm `mail.niqs.org.ng` is an **A** record → `50.6.229.107`. It already is; check it.
- Change the **MX** record for `niqs.org.ng` from `niqs.org.ng` to **`mail.niqs.org.ng`**,
  priority `0` (or keep the existing priority).
- Leave every SPF / DKIM / DMARC TXT record untouched.

**Then wait for the old record's TTL to expire** — usually 1–4 hours, and the zone
editor shows it. Do not proceed until `nslookup -type=MX niqs.org.ng` returns
`mail.niqs.org.ng`. Send a test mail to `info@niqs.org.ng` and confirm it arrives.

Skipping this wait is the one way this cutover causes real damage.

### Step 2 — add the domains in Vercel

Vercel project **niqs-website** → Settings → Domains → Add:

- `niqs.org.ng`
- `www.niqs.org.ng`
- `niqsng.org` and `www.niqsng.org` — see *Which domain is canonical* below

Vercel then displays the exact records to create. **Use the values Vercel shows, not
the ones written here** — they vary by account and region. The general values are an
**A** record `76.76.21.21` for the apex and a **CNAME** to `cname.vercel-dns-0.com`
for `www`, but Vercel's own screen is authoritative.

Nothing needs changing on deployment protection: the project is set to
`all_except_custom_domains`, so a custom domain is publicly reachable the moment it
verifies, while the `.vercel.app` URLs stay behind sign-in.

### Step 3 — repoint only the website records

Still in the HostBurly zone editor, and **leaving `mail`, `webmail`, `api` and
`portal` exactly as they are**:

- `niqs.org.ng` **A** → the address Vercel gave (was `50.6.229.107`)
- `www.niqs.org.ng` **CNAME** → the target Vercel gave

Keep nameservers at HostBurly. Moving them to Vercel would hand it the whole zone,
and every mail, portal and API record would have to be recreated by hand — a much
larger change than this needs to be.

### Step 4 — verify

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://niqs.org.ng
curl -s -o /dev/null -w "%{http_code}\n" https://niqs.org.ng/chapters/cross-river-chapter
curl -s -o /dev/null -w "%{http_code}\n" https://api.niqsng.org/api/public/stats
nslookup -type=MX niqs.org.ng
```

Expected: `200`, `200`, `401` (the stats API without a key — proving it still answers),
and MX showing `mail.niqs.org.ng`. Then send one more test email.

**The second check is the important one.** A deep link returning 200 is what proves
the move worked — on the old host every address except the homepage returned 404,
because Apache had no rewrite rule. Vercel handles it natively.

---

## Which domain is canonical

`niqs.org.ng` should be the primary: the Institute's published email addresses use it.

`niqsng.org` currently serves the same site. In Vercel it can either serve the site
too, or redirect to `niqs.org.ng` — a redirect is better for search, since two domains
serving identical content split their own ranking. **Its subdomains must keep working
either way**, and they will: `api`, `portal` and `mail` are separate records that this
change never touches.

---

## What this buys

Every future correction goes live by itself, about a minute after it is pushed. No
build to package, no upload to remember, no dotfile for an FTP client to hide — which
is the class of problem that produced the 404s found on 6 August.
