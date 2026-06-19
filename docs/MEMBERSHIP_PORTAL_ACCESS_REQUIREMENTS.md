# NIQS Website ⇄ Membership Portal — Access Requirements (for the Portal dev team)

**Status:** Draft v1 for the Portal team
**Website:** ADLM Studio (this repo) · **Portal:** *(partner company)* — `portal.niqsng.org`
**Companion doc:** the low-level contract conventions (auth header, error envelope, security, field mapping, SSO mechanics) live in [`PORTAL_INTEGRATION_SPEC.md`](./PORTAL_INTEGRATION_SPEC.md). **Read that first** — this doc references its sections (e.g. *SPEC §4.3*) instead of repeating them.

This is the **feature checklist**: every member-facing surface the website needs to power, and exactly what the portal must expose for each. It is organised around the requested features so each line item maps to a deliverable.

---

## 0. How to read this doc

- **Website routes (ADLM builds)** = pages/screens we build in this repo.
- **Portal endpoints (you build)** = REST the portal exposes; we consume **server-to-server** with a Bearer API key (SPEC §3, §8) and proxy to the browser so the key never leaks.
- **Conventions for every endpoint below:** Base URL, `Authorization: Bearer <PORTAL_API_KEY>`, JSON, the error envelope, and the `membershipType` / `status` vocabularies are all defined in **SPEC §4**. New endpoints here follow the same conventions.
- **Phase** tags: **P1** = needed to launch member features · **P2** = SSO / write-backs · **P3** = nice-to-have / future.

### Requirement → section map (your list)

| # | What you asked for | Section | Phase |
|---|---|---|---|
| 1 | Routes for **all registered QS** | §B.1 | P1 |
| 2 | **Membership login** that links to the portal you built | §A | P2 |
| 3 | Route for **members' purchases** (dues, exams, events, store) | §C | P1 link-out / P2 API |
| 4 | **Job search & application** | §D | P1 search / P2 apply |
| 5 | **NIQS Digital Library** (coming soon) — track progress | §E | P3 |
| 6 | List of **all registered QS** | §B.1 | P1 |
| 7 | List of registered QS **per state chapter** | §B.2 | P1 |
| 8 | List of registered QS in **YQSF** | §B.3 | P1 |
| 9 | List of **female members for WAQSN** | §B.4 | P1 |
| — | Member dashboard data (profile, status, CPD, results, ID card) | §F | P1–P2 |

---

## A. Membership login → hand off to the portal you built (SSO)

**Goal:** a member clicks **Member Login** on the website and authenticates against *your* portal (single source of truth for member credentials — SPEC §1). The website never stores member passwords long-term.

> Today the website has a **temporary local** member login (`User` model) just so `/portal` isn't empty. It is replaced entirely by your SSO in P2.

**Website routes (ADLM):**
- `/login` — "Member" tab → kicks off SSO.
- `/login/portal/callback` — SSO return (SPEC §6).
- `/portal`, `/portal/profile`, … — gated member area (rendered by us from your APIs), **or** a deep-link straight into `portal.niqsng.org` if NIQS prefers your portal UI to own the whole experience. **Decision D1.**

**Portal endpoints (you):** the SSO flow in **SPEC §5** — either:
1. **Redirect + code exchange** (recommended): `GET /sso/authorize` → redirect back with `code` → website server `POST /sso/token` → `{ member, sessionId, expiresIn }`, **or**
2. **OIDC** (if you already speak it): standard `/.well-known/openid-configuration` + auth code + PKCE.

Plus token introspection for any portal token the browser presents (SPEC §5).

**What we need from you:** SSO style (D1), client_id, allowed `redirect_uri`s (prod + Vercel previews), token TTLs.

---

## B. Registered-QS directories (the core ask)

All four lists below are **one directory, four filtered views**. The portal owns the individual registered-QS directory (SPEC §1). The website renders the views and the counters.

> ⚠️ Distinction: the website **already** has a *firm/company* directory (`/search-qs-firms`, website-owned `QSFirm`). These sections are about the **individual person** directory, which the portal owns and the website does **not** have yet.

### B.0 — Two endpoints power everything in §B

**(1) Directory search** — extends **SPEC §4.3** with the filters the views need:

```
GET /members/search
  ?q=               # free text: name or membership number
  &state=Lagos      # state name
  &chapter=lagos    # chapter slug or id (see D3)
  &type=corporate   # membershipType (SPEC §4.1 enum)
  &status=active    # default active
  &gender=female    # for WAQSN (D5)
  &forum=yqsf|waqsn # convenience: portal applies the segment rule server-side (D4/D5)
  &sort=name|recent
  &page=1&pageSize=24
```

**200**
```json
{
  "results": [
    {
      "membershipNumber": "NIQS/12345",
      "fullName": "QS Jane Doe",
      "membershipType": "corporate",
      "status": "active",
      "state": "Lagos",
      "chapter": "Lagos",
      "gender": "female",
      "isYqsf": false,
      "firmName": "Greenfield QS Ltd",
      "photoUrl": null
    }
  ],
  "total": 134, "page": 1, "pageSize": 24
}
```
- Return **only publicly displayable** fields (no email/phone in list results — PII minimisation, SPEC §8). A member's contact details require auth (§F).
- Please return `state`, `chapter`, `gender`, and `isYqsf` on each row so the website can also facet client-side and render badges.

**(2) Directory stats** — new; powers every counter (YQSF "Young Members", per-chapter counts, WAQSN total, homepage figures):

```
GET /members/stats
```
**200**
```json
{
  "total": 10240, "active": 9120,
  "byType":    { "corporate": 5400, "graduate": 2600, "fellow": 720, "probationer": 900, "student": 500, "technician": 120 },
  "byState":   { "Lagos": 1820, "FCT": 940, "Rivers": 510 },
  "byChapter": { "lagos": 1820, "abuja": 940 },
  "female": 2310, "male": 7930,
  "yqsf": 2400, "waqsn": 2310,
  "updatedAt": "2026-06-19T00:00:00Z"
}
```
Caching is fine (e.g. hourly) — these are display counters, not transactional.

### B.1 — List of ALL registered QS
- **Website route (NEW):** `/directory` (a.k.a. "Find a Registered QS" / national register).
- **Portal:** `GET /members/search` (no segment filter) + `GET /members/stats` for the total.
- Also wires the **"Verify a Member"** box on `/membership` (currently a disabled "coming soon" stub) to `GET /members/verify` (SPEC §4.1).

### B.2 — List of registered QS in EACH state chapter
- **Website route:** `/chapters/:slug` already exists → add a **Members** section/tab (or `/chapters/:slug/members`).
- **Portal:** `GET /members/search?chapter=<slug>` (or `?state=<state>`), and `byChapter` / `byState` from `/members/stats` for the chapter's member count (the `Chapter.memberCount` field on the website is currently manual — we'd drive it from your stats).
- **Decision D3:** match members to chapters by **chapter id/slug** or by **state string**? The website's chapters carry both a `name` + `state`. Pick one canonical key so filtering is unambiguous.

### B.3 — List of registered QS in YQSF (Young QS Forum)
- **Website route:** `/yqsf` exists (marketing) → add a **YQSF members** directory section + wire the stats strip (the "Young Members 2,400+" figure is hard-coded today with a TODO to compute it).
- **Portal:** `GET /members/search?forum=yqsf` + `yqsf` from `/members/stats`.
- **Decision D4 — YQSF rule (must be defined by NIQS):** the website copy says **"under 40 years of age OR within the first ten years of professional practice,"** and notes members auto-**exit** at 40. For the portal to compute `forum=yqsf` / `isYqsf` / the `yqsf` count, you need to store **date of birth** and/or **year of first registration/practice**. Confirm the exact rule.

### B.4 — List of female NIQS members for WAQSN
- **Website route:** `/waqsn` exists (marketing) → add a **WAQSN members** directory section (today the page only has an external link).
- **Portal:** `GET /members/search?forum=waqsn` (or `?gender=female`) + `waqsn`/`female` from `/members/stats`.
- **Decision D5 — WAQSN definition:** is WAQSN simply **all female members** (derive from `gender`), or a **separately enrolled** subgroup (some women opt in/out)? If the latter, expose it as `forum=waqsn` rather than `gender=female`. Either way the portal must store **gender**.

---

## C. Members' purchases (dues, exams, events, store)

The portal owns dues/payments (SPEC §1). The website has a `/payment` page and a `/membership` flow that are **static "coming soon"** today.

**Phase 1 — deep-link out (fastest):** the website's "Pay / Renew" buttons link to your hosted checkout, prefilled where possible:
```
https://portal.niqsng.org/pay?item=<dues|tpc|gde|event|store-sku>&membershipNumber=<no>&ref=<our-ref>
```
- After payment, redirect back to `…/payment/success?ref=<our-ref>`.
- The website reads current standing (paid/expired) from `GET /members/verify` → `status`, `expiresOn` (SPEC §4.1), so the portal dashboard tiles ("Payment Status: Up to Date") become real.

**Phase 2 — optional API** (if NIQS wants payments initiated/listed inside the website):
```
GET  /members/:membershipNumber/invoices      → [{ id, item, amount, currency, dueOn, status }]
POST /payments/checkout { item, membershipNumber, ref } → { checkoutUrl }
```
plus a **payment webhook** to the website (`payment.succeeded`) modelled on SPEC §6.

**Catalog note:** the website currently hard-codes price lists (dues, exam fees, event fees, and a future **store/merch/publications**). **Decision D6:** do these prices/SKUs live in the portal (so we read them) or stay website-managed and we just pass an `item` code to your checkout?

**What we need from you:** the hosted-checkout URL pattern + success/cancel redirect handling (P1); the invoice/checkout API + webhook secret (P2).

---

## D. Job search & application

The **job board is website-owned** (`Job` model; `/jobs` with search/filter already works). Only the **application** step needs the portal — to identify the logged-in member and (optionally) attach their CV.

**Website (ADLM) builds:**
- `/jobs` search (done) and a `/jobs/:id` detail.
- `/jobs/:id/apply` — gated behind member auth (§A). A new website-side `JobApplication` record (member ref + job ref + CV + cover note + status).
- Employer "Post a Job" intake (today it links to `/contact`).

**Portal provides (only what we can't):**
- **Member identity** via SSO (§A) — so we know *who* is applying and can prefill name/email/membership number.
- **Optional** `GET /members/:membershipNumber/documents` → `[{ type: "cv", url, updatedAt }]` if the portal stores member CVs, so a member can "apply with my NIQS CV" instead of re-uploading.

**Decision D7:** do job **applications** stay on the website (we store them, recommended — keeps the board self-contained), or should we POST them to the portal? Recommended: website-owned, member identified by `membershipNumber` from SSO.

---

## E. NIQS Digital Library (coming soon — progress tracking)

Forward-looking; **non-blocking for launch.** Captured here so the contract is ready when it's built.

- **Website route (future):** `/library` (+ a "Coming Soon" tile already implied in the portal dashboard).
- **Ownership decision D8:** does the **library content** (catalog, documents, courses) live in the portal or the website? Member **progress** must live with the member record → portal.
- **Proposed progress API** (mirrors the CPD post-back pattern, SPEC §4.4, idempotent on `reference`):
```
GET  /members/:membershipNumber/library/progress
       → { items: [{ resourceId, title, percent, completedOn, points }] }
POST /members/:membershipNumber/library/progress
       { source:"niqs-website", resourceId, title, percent, points, earnedOn, reference }
```
- If library completion grants CPD, reuse the existing **CPD post-back** (SPEC §4.4) rather than a parallel ledger.

---

## F. Member dashboard data (makes the "Coming Soon" tiles real)

The `/portal` dashboard already lists tiles that are disabled placeholders: **My Profile, My Results, ID Card, Payments, CPD Records.** Each becomes live when the portal exposes the data.

| Portal tile | Website route | Portal endpoint | Phase | Notes |
|---|---|---|---|---|
| Profile / membership status | `/portal`, `/portal/profile` | `GET /members/:no` (SPEC §4.2) | P1 | name, type, status, expiry, chapter, photo, phone, address, firm |
| Payments / dues standing | `/portal/payments` | `GET /members/verify` + §C invoices | P1/P2 | status + expiresOn at minimum |
| CPD records | `/portal/cpd` | `GET /members/:no/cpd` → ledger | P2 | website already **posts** CPD on event attendance (SPEC §4.4); this is the read side |
| Exam results (per member) | `/portal/results` | `GET /members/:no/results` → `[{ examType, sitting, status, grade, resultUrl }]` | P2 | website's `ExamResult` is only *public sitting* announcements, **not** per-member results — those are yours |
| Digital ID card | `/portal/id-card` | `GET /members/:no/id-card` → `{ cardUrl }` or fields to render | P2 | confirm who renders the card artwork |

---

## G. Ownership summary (these features)

| Data / capability | Owner | Website does |
|---|---|---|
| Member identity & login | **Portal** | SSO redirect, mints short session (§A) |
| Individual registered-QS directory (+ state/YQSF/WAQSN segments, counts) | **Portal** | renders search views + counters (§B) |
| Dues / payments / invoices / store catalog | **Portal** (catalog TBD D6) | link-out checkout, reads standing (§C) |
| Member CPD / results / ID card | **Portal** | reads & displays; posts CPD on attendance (§F) |
| Library content | **TBD (D8)** | renders; posts progress (§E) |
| **Job board + applications** | **Website** | owns board; needs member identity + optional CV from portal (§D) |
| **Firm/company directory** | **Website** (`QSFirm`, today) | `/search-qs-firms` (could move to portal — see SPEC §9) |
| Public content (news, events, chapters, exco, partners, brand, journals) | **Website** | — |

---

## H. Open decisions (need NIQS + Portal team)

Carried over from SPEC §9 (domains, firm directory, SSO style, membership-number format, API base URL, CPD push vs pull) **plus** the ones this doc introduces:

- **D1** — SSO style + whether `/portal` is **website-rendered** (we consume your APIs) or a **deep-link** into your portal UI.
- **D2** — Canonical membership-number format (e.g. `NIQS/12345`) and the `membershipType` / `status` vocabularies (keep identical to SPEC §4.1).
- **D3** — Chapter matching key: **chapter id/slug** vs **state string**.
- **D4** — **YQSF rule** (under 40 and/or first 10 years) + which fields you store (DOB / first-reg year) so it's computable; confirm auto-exit at 40.
- **D5** — **WAQSN definition**: all female (from `gender`) vs separately-enrolled subgroup.
- **D6** — Payment **catalog/pricing** ownership (portal vs website item codes).
- **D7** — Job **applications** stored website-side (recommended) vs posted to portal; optional member-CV endpoint.
- **D8** — Digital **Library content** ownership; whether completions grant CPD.

---

## I. Minimum to unblock launch (priority order)

1. **Directory search + stats** — `GET /members/search` (with `state`, `chapter`, `type`, `gender`, `forum`) and `GET /members/stats`. → unlocks §B.1–B.4 (all four lists + counters) **and** the `/membership` verify box.
2. **Member verify** — `GET /members/verify` (SPEC §4.1). → unlocks event-registration member path (already wired in `registrationController`) + payment standing.
3. **SSO** — §A. → real member login + gates §D apply and §F dashboard.
4. **Profile read** — `GET /members/:no` (SPEC §4.2). → §F profile tile.
5. **Payments** — deep-link checkout (§C P1), then invoices/CPD/results/ID-card reads (P2).
6. **Library** — §E, when scheduled.

**On our side (already scaffolded, env-gated — SPEC §10):** `server/utils/portalClient.js` already implements verify/profile/search/firms/CPD and no-ops until `PORTAL_API_URL` + `PORTAL_API_KEY` are set. Adding the new endpoints above is mostly **config + a few client methods**, not a rewrite. Set these when you're ready:
```
PORTAL_API_URL=https://portal.niqsng.org/api/v1
PORTAL_API_KEY=********
PORTAL_SSO_URL=https://portal.niqsng.org/sso/authorize     # §A
PORTAL_OAUTH_CLIENT_ID=NIQS_WEBSITE                         # §A
PORTAL_WEBHOOK_SECRET=********                              # §C/§F webhooks
```
