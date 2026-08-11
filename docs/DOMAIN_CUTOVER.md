# Pointing niqs.org.ng at Vercel

**Verified against live DNS on 11 August 2026.** Every record below was read from
the authoritative nameservers, not assumed.

Doing this ends two problems at once: the live site stops being a manual upload
that someone has to remember, and the 404-on-every-deep-link problem disappears
without an `.htaccess` at all. Both were checked, not hoped for:

| Path | Apache (now) | Vercel |
|---|---|---|
| `/` | 200 | 200 |
| `/about` | **404** | 200 |
| `/contact` | **404** | 200 |
| `/chapters` | **404** | 200 |
| `/chapters/lagos-chapter` | — | 200 |
| `/events`, `/waqsn` | **404** | 200 |

Vercel serves those because `vercel.json` already carries the single-page
rewrite. Nothing needs building or changing in the code for this cutover.

---

## Read this before touching the A record

**The obvious cutover silently kills the Institute's email.**

The mail exchanger for `niqs.org.ng` is `niqs.org.ng` — the apex itself:

```
niqs.org.ng.   MX 0   niqs.org.ng.        <-- points at the apex
niqs.org.ng.   A      50.6.229.107        <-- which is the mail server
```

Change that A record to Vercel and the MX follows it. Every message sent to
`@niqs.org.ng` — every chapter address, `admin@`, the lot — is then delivered to
a static-site CDN that has never heard of them. There is no error on screen and
nothing in the Vercel dashboard looks wrong. Mail simply stops.

The SPF record has the same problem for outbound mail:

```
"v=spf1 ip4:50.6.229.107 +a +mx ~all"
```

`+a` and `+mx` both resolve through the apex. After a naive cutover they would
authorise Vercel's edge to send mail as the Institute, and stop authorising the
server that actually does.

**This is fixable in one step, and the fix is a no-op until the day it matters.**
Do Phase 1 first and the trap is gone.

---

## Phase 0 — lower the TTLs (about an hour before)

Current TTLs make a mistake slow to undo:

| Record | TTL |
|---|---|
| `niqs.org.ng` A | ~53 min |
| `www` CNAME | ~2h 38m |
| `MX` | ~2h 38m |

Set the TTL on the apex `A`, `www`, and `MX` records to **300** (5 minutes).
Change nothing else. Wait for the old TTL to expire before Phase 2, and rollback
becomes a five-minute operation instead of a three-hour one.

Put them back to 3600 a week after the cutover.

---

## Phase 1 — make mail independent of the apex

Do this **first**, on its own, ideally a day ahead. It causes no downtime and
changes nothing observable today.

`mail.niqs.org.ng` already exists as its own A record on `50.6.229.107` — this
was checked, and it is a real record, not a wildcard (`smtp.niqs.org.ng` does not
resolve, which a wildcard would have answered). So the MX can be repointed at it
and it will keep working after the apex moves.

| Record | Change from | Change to |
|---|---|---|
| `MX` `@` | `0 niqs.org.ng` | `0 mail.niqs.org.ng` |
| `TXT` `@` (SPF) | `v=spf1 ip4:50.6.229.107 +a +mx ~all` | `v=spf1 ip4:50.6.229.107 ~all` |

The new SPF is **exactly equivalent to the old one today** — `+a` and `+mx` both
resolve to `50.6.229.107`, which the `ip4:` term already names. It only differs
after the apex moves, which is the entire point.

Leave alone: `mail`, `webmail`, `cpanel` (all A → `50.6.229.107`), the DKIM key
at `default._domainkey`, and `_dmarc`. None of them reference the apex.

**Verify before going further** — send a test message to any `@niqs.org.ng`
address and confirm it arrives:

```bash
nslookup -type=MX niqs.org.ng 8.8.8.8
```

Expect `mail exchanger = mail.niqs.org.ng`. Do not start Phase 2 until you see
that and a test email has landed.

---

## Phase 2 — the cutover

**In Vercel first**, then DNS.

1. Vercel → project **niqs-website** → Settings → Domains → add `niqs.org.ng`
   and `www.niqs.org.ng`.
2. Vercel will display the exact records to create. **Use the values it shows**,
   not the ones in its generic documentation — Vercel's own docs say the public
   `76.76.21.21` and `cname.vercel-dns-0.com` are placeholders and that each
   project must be inspected for its own. Expect an `A` for the apex and a
   `CNAME` for `www`.
3. In HostBurly DNS, change only these two:

| Record | From | To |
|---|---|---|
| `A` `@` | `50.6.229.107` | *(the IP Vercel shows)* |
| `CNAME` `www` | `niqs.org.ng` | *(the target Vercel shows)* |

Nothing else changes. The nameservers stay at HostBurly — there is no need to
move DNS hosting to Vercel, and moving it would drag the mail records along for
no benefit.

There is no `CAA` record on the domain, so nothing blocks Vercel from issuing the
certificate, and no `AAAA` record to strand IPv6 visitors on the old host. Both
were checked.

---

## Phase 3 — verify

```bash
nslookup niqs.org.ng 8.8.8.8
```

Then, once it returns the Vercel address:

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://niqs.org.ng/about
```

`200` is the answer that matters — that single result is the 404 problem closed.
Check `https://www.niqs.org.ng` redirects or serves too, and confirm the padlock
(Vercel issues the certificate automatically, usually within a few minutes of the
DNS resolving).

Then send one more test email to an `@niqs.org.ng` address.

---

## Rollback

Set the apex `A` record back to `50.6.229.107` and `www` back to a CNAME at
`niqs.org.ng`. With Phase 0 done that takes effect in about five minutes. The
Phase 1 mail changes should **not** be rolled back — they are correct either way.

---

## Two things not to do

**Do not cancel the HostBurly hosting.** The email lives there. The web hosting
becomes redundant; the mailboxes do not.

**Do not do this on launch day.** The launch cover is set for Friday 14 August,
12:00 WAT. DNS propagation and certificate issuance both need slack, and neither
is worth discovering at noon on the day. Cutting over two or three days early
costs nothing: visitors reaching the domain before Friday see the launch cover
page, which is what it is for — and a cover page is a considerably better thing
to be showing than a stale build that 404s on every link but the homepage.
