# Analytics, indexing and the legal pages

**As at 7 August 2026.** What was built, what is still switched off, and the
steps that can only be done by someone holding the Institute's Google account.

---

## Short answer

The site had no measurement of any kind, no robots.txt, no sitemap, social
previews pointing at a Vercel deployment nobody was meant to see, and no
published privacy policy while collecting names, phone numbers and addresses
through four different forms.

All of that is now built and in the repository. **Two things remain, and neither
is ADLM's to do:**

| | Who | Effort |
|---|---|---|
| Paste a Google Analytics Measurement ID into `client/.env.production` | Whoever owns the Institute's Google account | 10 minutes |
| Verify the site in Google Search Console and submit the sitemap | Same person | 15 minutes |

Until the first of those is done, **no visits are being counted.** Everything
else takes effect on the next upload to the host.

---

## 1. Analytics

### What was decided

**Google Analytics 4 now, Plausible wired behind an environment variable for
later.** GA4 is free and reports richly; the cost is that it sets cookies, which
under the Nigeria Data Protection Act obliges the Institute to ask permission
first and to accept that a good share of visitors will decline. Plausible is
cookieless — no banner, no consent, nothing to explain — and costs about $9 a
month. The switch is one line when the Institute wants it.

### Turning it on

1. Go to <https://analytics.google.com> with the account that should own the
   Institute's data — **not** a personal Gmail belonging to whoever happens to be
   in office. Admin → Create property.
2. Property name `NIQS`, time zone **Nigeria**, currency **NGN**.
3. Create a **Web** data stream for `https://niqs.org.ng`.
4. Copy the **Measurement ID**. It looks like `G-XXXXXXXXXX`.
5. Put it in `client/.env.production`:

   ```
   VITE_GA4_ID=G-XXXXXXXXXX
   ```

6. Rebuild and upload. That is the whole change.

The Measurement ID is **not a secret** — it ships inside the JavaScript bundle
and anyone can read it by viewing source. It identifies the property; it does not
grant access to it.

### Moving to Plausible later

Register the site at Plausible, then in `client/.env.production`:

```
VITE_ANALYTICS_PROVIDER=plausible
VITE_PLAUSIBLE_DOMAIN=niqs.org.ng
```

Rebuild. The cookie notice disappears on its own — it renders only when the
active provider sets cookies — and the privacy policy's clause 5 needs its
Google Analytics paragraphs replaced with a sentence saying the site uses a
cookieless provider.

### What is measured, and what is deliberately not

- **Nothing loads before consent.** Not the Google script, not a cookieless
  ping. Decline, or ignore the banner, and no request is ever made to Google.
  This is stricter than Google's own Consent Mode guidance, and it is the
  position that is straightforward to defend if anyone asks.
- **Staff traffic is excluded.** `/admin` and `/portal` are never counted, so the
  figures describe the public rather than the secretariat's own working day.
- **Token URLs are excluded.** `/flyer-request/<token>` and
  `/events/attend/<token>` are working links for whoever holds them; sending them
  to an analytics provider as a page path would hand it a live credential.
- **Advertising features are off**, and no name, email address or membership
  number is ever sent.

Code: `client/src/utils/analytics.js`, wired to the router by
`client/src/hooks/useAnalytics.js`.

---

## 2. robots.txt and the sitemap

Both live at the root of the site and were 404 on the live domain until now.

`client/public/robots.txt` is hand-written and allows everything except the
staff areas, the auth routes, the token URLs and the `?preview` launch-gate
bypass. It points crawlers at the sitemap.

`client/public/sitemap.xml` is **generated**, not hand-edited. Do not correct it
by hand — the next build will overwrite the change.

```bash
npm --prefix client run sitemap
```

It also runs automatically as part of `npm run build`, so a deploy cannot ship a
sitemap that is a release behind. It emits:

- the 29 public routes, from a list in `client/scripts/generate-sitemap.mjs`;
- all 37 chapter pages, taken from the live API so their slugs and modification
  dates are real; and
- every published news article, walked page by page through the API.

If the API is unreachable the script warns and writes what it can rather than
failing the build — a sitemap missing its news is better than no deploy.

**When a new page is added to the site, add it to `STATIC_ROUTES` in that
script.** Nothing enforces this; it is the one manual step.

### A bug this surfaced

The first generated sitemap contained 74 chapter URLs — 37 real and 37 dead. The
codebase derived chapter slugs as `abia`, while the records actually seeded in
the database use `abia-chapter`. The derived form has been corrected
(`client/src/data/chapters.js`) and the generator now lets the API's list replace
the built-in one rather than merging the two.

---

## 3. The canonical domain

All four of `https://niqs.org.ng`, `http://niqs.org.ng`, `https://www.niqs.org.ng`
and `https://niqsng.org` returned 200 with byte-for-byte identical content. To a
search engine that is four websites carrying the same pages, splitting between
them whatever standing a single site would have accumulated.

**`niqs.org.ng` is now canonical.** `client/public/.htaccess` 301-redirects the
other three to it, preserving the path.

> ⚠ **Check this immediately after the first upload.** A redirect rule that
> misfires takes the whole site down rather than degrading quietly. The rule is
> written defensively — it will not fire if the host terminates TLS at a proxy —
> but confirm it before walking away:
>
> ```bash
> curl -sI http://niqs.org.ng/about | head -3
> ```
>
> Expect `301` and `Location: https://niqs.org.ng/about`. Then open the site in a
> browser and confirm it loads rather than looping.

`niqsng.org` keeps working; it simply redirects. **The subdomains are untouched** —
`api.niqsng.org`, `portal.niqsng.org` and the mail hosts are separate records and
separate document roots.

---

## 4. Social previews and the favicon

`og:url` and `og:image` pointed at `https://niqs-website.vercel.app`. The site is
not served from Vercel, so every link shared on WhatsApp or LinkedIn was
previewing an image from — and advertising the address of — a deployment that was
never meant to be public. Both now point at `niqs.org.ng`.

Also added to `client/index.html`: an `og:locale`, and a JSON-LD `Organization`
block giving Google the crest, the founding year and the Secretariat address so
it can show a knowledge panel rather than a bare link.

**A known limitation.** Link scrapers do not run JavaScript, so they read
`index.html` exactly as the server sends it — one file, served for all 66 routes.
Sharing a deep link therefore previews as *the Institute* rather than as that
page. Page titles and canonical tags do vary per route (`useCanonical.js`,
which Googlebot sees because it does render JavaScript), but Open Graph tags
cannot be fixed this way. The fix is pre-rendering the public routes at build
time — worth doing when news articles start being shared, and not before.

### Favicon

`/favicon.ico` was returning 404 on the live domain — browsers and Google's
favicon fetcher request that path whether or not the HTML asks them to. And
Google only shows a favicon beside a search result when it is square **and a
multiple of 48px**; the 512×512 that was linked is square but 512 is not a
multiple of 48.

`client/scripts/build-favicons.py` now generates the full set from
`NIQS-LOGO-SQUARE.png` — `favicon.ico` (16/32/48), `icon-192.png`,
`icon-512.png` and a white-backed `apple-touch-icon.png`, because iOS composites
a transparent icon onto black and turns the crest into a smudge. A
`site.webmanifest` was added alongside them.

Re-run only if the crest changes:

```bash
python client/scripts/build-favicons.py
```

---

## 5. Google Search Console

**This cannot be done from the repository.** It needs someone signed in to the
Institute's Google account.

1. Go to <https://search.google.com/search-console> and add a property.
2. Choose **Domain** (`niqs.org.ng`) if you can add a DNS TXT record — it covers
   every subdomain and both protocols at once. That means a cPanel Zone Editor
   login, which as at 7 August is still the blocker on the DNS runbook. If that
   login is not available, choose **URL prefix** (`https://niqs.org.ng`) instead
   and verify by uploading the HTML file Google offers into `client/public/`,
   where the build will carry it to the host.
3. Once verified: **Sitemaps** → enter `sitemap.xml` → Submit.
4. **URL Inspection** → paste `https://niqs.org.ng/` → *Request indexing*. Do the
   same for `/about`, `/membership` and `/chapters`. This is the fastest way to
   get the site into results; the sitemap handles the rest over the following days.
5. Add the Secretariat as a user so access does not sit with one person.

> **Do not submit before the launch gate comes down on 14 August.** The countdown
> covers the site with a holding page. It is drawn in the browser, so Googlebot —
> which renders JavaScript — would index 66 pages of "Our new website goes live
> in…". Submit after the 14th.

Search Console and Analytics can be linked from either side once both exist;
it is worth doing, as it puts search queries next to visit numbers.

---

## 6. Privacy Policy and Terms of Use

Published at `/privacy-policy` and `/terms-of-use`, linked from the footer of
every page, and written against the **Nigeria Data Protection Act 2023** and the
**NDPR 2019**.

They describe what this site actually does. Every processor named is one the code
really talks to; every category of data is one a schema in `server/models` really
stores. That is deliberate — a notice describing a generic website is a published
statement the Institute cannot stand behind.

Worth knowing what they say:

- **The member portal is carved out.** `portal.niqsng.org` is operated by another
  provider and holds the register itself. The policy says so plainly and points
  enquiries about membership records at the Secretariat.
- **Cross-border transfer is disclosed.** The database and the API run in
  **France** (MongoDB Atlas and AWS, eu-west-3), and hosting, image storage and
  analytics are in the **United States**. Sections 41–43 of the Act require this
  to be stated.
- **Payments are described as not taken on this website**, which is true — the
  payments page lists fees and no gateway is connected. That clause must be
  revisited before one is.

### ⚠ Three things the Secretariat must confirm

These are the only places where reasonable defaults stand in for a decision the
Institute has not recorded:

1. **Retention periods** (privacy policy, clause 7) — 24 months for enquiries,
   6 years for event and CPD records, 24 months for flyer requests. Defensible,
   but they are ADLM's suggestion, not a stated NIQS records policy.
2. **The Data Protection Officer's address.** The policy routes requests to
   `info@niqs.org.ng` care of the Secretariat. Nothing invents a `dpo@` address
   that would bounce. If the Institute appoints a DPO, that address should
   replace it.
3. **A solicitor's read of the Terms.** Clauses 11 (liability) and 3 (the site is
   not the register) are the ones that matter if anything is ever disputed.

Neither document should be treated as final until someone at the Institute has
read them.

---

## Checklist for the person doing the upload

- [ ] `VITE_GA4_ID` filled in, or accept that nothing is being counted yet
- [ ] `npm --prefix client run build` (regenerates the sitemap automatically)
- [ ] Upload `client/dist/` to the host — **including the dot-file `.htaccess`**,
      which most FTP clients hide by default
- [ ] `curl -sI http://niqs.org.ng/about` returns 301 to https, and the site loads
- [ ] `https://niqs.org.ng/robots.txt` and `/sitemap.xml` both return 200
- [ ] `https://niqs.org.ng/favicon.ico` returns 200
- [ ] After 14 August: verify in Search Console, submit the sitemap, request indexing
