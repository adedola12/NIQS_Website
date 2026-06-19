# NIQS Website ⇄ Membership Portal — Integration Specification

**Status:** Draft v1 for review by the Portal team
**Owners:** Website — **ADLM Studio** · Portal — *(partner company)*
**Last updated:** 2026-06 · maintained at `docs/PORTAL_INTEGRATION_SPEC.md`

This document defines the boundary, API contract, auth/SSO model, linking/routing, and security between the **NIQS public website** (built by ADLM, this repo) and the **NIQS Membership Portal** (`portal.niqsng.org`, built by the partner company). The goal is that both teams build to one agreed contract so the systems link seamlessly.

> 📋 **Feature checklist / hand-off:** for the per-feature requirements (registered-QS directories by state/YQSF/WAQSN, member login hand-off, purchases, jobs, digital library, dashboard tiles) see the companion doc [`MEMBERSHIP_PORTAL_ACCESS_REQUIREMENTS.md`](./MEMBERSHIP_PORTAL_ACCESS_REQUIREMENTS.md). This doc is the low-level contract it references.

> ⚠️ **Everything the *portal* must expose is a proposal.** Endpoint shapes can be adjusted — but please keep the **field names** and **auth model** consistent so our client (`server/utils/portalClient.js`) needs only config, not rewrites.

---

## 1. Ownership / source of truth

| Domain | Owner | Notes |
|---|---|---|
| Member identity & login credentials | **Portal** | Website should not store member passwords long-term (Phase 2 → SSO). |
| Membership record (number, type, status, expiry) | **Portal** | Website reads via API. |
| Dues / payments | **Portal** | Website links out. |
| Member **CPD ledger** (lifetime) | **Portal** | Website **posts** CPD earned at events. |
| Individual **registered-QS directory** | **Portal** | Website searches via API ("Registered QS search"). |
| Member profile (name, email, phone, address, photo) | **Portal** | Website fetches after auth/verify. |
| Public content (news, events, exco, chapters, jobs, partners, journals, president, brand) | **Website** | — |
| **Flyer Studio, Event Calendar, event registrations, event CPD capture** | **Website** | Website awards CPD on attendance, then posts it to the Portal. |
| **QS Firm directory** (companies) | **Website (today)** | `QSFirm` model, admin-managed. **DECISION NEEDED** — keep on website or move to portal (§9). |

---

## 2. Membership-dependent surfaces on the website (what needs the portal)

| Surface | Route(s) | What it needs from the portal |
|---|---|---|
| **Member login / "My Portal"** | `/login` (Member tab), `/portal/*` | SSO or token verification + profile (§5). |
| **Event registration — "I'm a member"** | `/events/:id/register` | **Verify membership** + prefill profile; **post CPD** on attendance (§4.1, §4.4). Seam: `registrationController.lookupMember()`. |
| **Registered QS search** | `/search-qs-firms` (and a future "Registered QS" people search) | **Search** directory (§4.3 / §4.5). |
| **Reciprocity / member-only content** | `/reciprocity`, future gated pages | Verify membership status/type (§4.1). |
| **Membership application & dues** | `/membership`, `/payment` | Deep-link out to the portal. |

---

## 3. Integration mechanisms (3 channels)

1. **Server-to-server REST API** (Portal → exposes; Website server → consumes with an API key). Used for verify, profile, search, CPD post. The website **proxies** these from its backend so the API key never reaches the browser. **(Phase 1 — start here.)**
2. **SSO / member login** (redirect-based or OIDC). Lets a member sign in once; the website trusts the portal. **(Phase 2.)**
3. **Webhooks** (Portal → calls the Website) for membership status changes, so the website can invalidate sessions/caches. **(Phase 3, optional.)**

---

## 4. REST API contract (endpoints the **Portal** exposes)

**Base URL:** `https://portal.niqsng.org/api/v1` *(confirm; could be `https://api.niqsng.org/v1`)*
**Auth:** `Authorization: Bearer <PORTAL_API_KEY>` (one key per environment; server-to-server only).
**Transport:** HTTPS only. JSON request/response. UTF-8.
**Errors:** non-2xx returns `{ "error": { "code": "string", "message": "human readable" } }`. Use `404` (not found), `401` (bad key), `403` (not permitted), `422` (validation), `409` (duplicate), `429` (rate limit).

### 4.1 Verify membership
```
GET /members/verify?membershipNumber=NIQS/12345
GET /members/verify?email=jane@example.com
```
**200**
```json
{
  "valid": true,
  "member": {
    "membershipNumber": "NIQS/12345",
    "fullName": "QS Jane Doe",
    "email": "jane@example.com",
    "membershipType": "corporate",
    "status": "active",
    "expiresOn": "2026-12-31",
    "chapter": "Lagos",
    "cpdBalance": 42
  }
}
```
`{ "valid": false }` when no active member matches. `membershipType ∈ {probationer, graduate, corporate, fellow, student, technician}` (aligns with our `User.membershipType`). `status ∈ {active, expired, suspended, pending}`.

### 4.2 Member profile (fuller record, authorized)
```
GET /members/:membershipNumber
```
Returns §4.1 `member` plus `phone`, `address`, `photoUrl`, `firmName`. Used after SSO or for the member's own profile.

### 4.3 Registered-QS (people) directory search — "Registered QS search"
```
GET /members/search?q=&state=&type=&status=active&page=1&pageSize=20
```
**200**
```json
{
  "results": [
    { "membershipNumber": "NIQS/12345", "fullName": "QS Jane Doe",
      "membershipType": "corporate", "state": "Lagos", "chapter": "Lagos",
      "status": "active", "firmName": "Greenfield QS Ltd", "photoUrl": null }
  ],
  "total": 134, "page": 1, "pageSize": 20
}
```
Return only **publicly displayable** fields (the portal decides; default: no email/phone in search results).

### 4.4 Post CPD earned at a website event → portal ledger
```
POST /members/:membershipNumber/cpd
```
```json
{
  "source": "niqs-website",
  "eventId": "665f0c…",
  "eventTitle": "Advancing Digital Cost Management",
  "points": 5,
  "earnedOn": "2026-08-14",
  "reference": "<our Registration _id>"
}
```
**200/201** → `{ "ok": true, "cpdId": "…", "newBalance": 47 }`. **Must be idempotent on `reference`** (retries/duplicates → treat as success, don't double-count; `409` is acceptable and we'll treat it as success).

### 4.5 Registered QS **Firms** search *(only if the portal owns firms — see §9)*
```
GET /firms/search?q=&state=&page=1&pageSize=20
```
Mirror of §4.3 for companies (`name, regNumber, state, city, address, phone, email, website`).

---

## 5. SSO / member login (Phase 2)

**Recommended (pragmatic): redirect + code exchange.**
1. Website "Member Login" → `GET https://portal.niqsng.org/sso/authorize?client_id=NIQS_WEBSITE&redirect_uri=https://niqs.org.ng/login/portal/callback&state=<csrf>`.
2. Portal authenticates the member, redirects back to `redirect_uri?code=<one-time>&state=<csrf>`.
3. Website **server** exchanges: `POST /api/v1/sso/token` (Bearer API key) `{ "code": "…" }` → `{ "member": { …§4.1 }, "sessionId": "…", "expiresIn": 3600 }`.
4. Website mints its own short-lived session cookie tied to that member (no portal password stored).

**Alternative (if the portal already speaks OIDC):** standard OAuth2 Authorization Code + PKCE — `/.well-known/openid-configuration`, `/oauth/authorize`, `/oauth/token`, `/oauth/userinfo`, JWKS. We can consume either; tell us which.

**Token validation** (for any portal-issued token the browser presents): `GET /api/v1/auth/introspect` (Bearer API key) `{ "token": "…" }` → `{ "active": true, "member": {…} }`.

---

## 6. Endpoints the **Website** exposes (for the portal)

| Endpoint | Purpose | Auth |
|---|---|---|
| `GET /login/portal/callback` (client route) | SSO return; hands `code` to our server | CSRF `state` |
| `POST /api/auth/portal/exchange` (our server) | exchanges `code` with the portal, sets our session | internal |
| `POST /api/portal/webhooks/membership` | receive member status changes | `X-NIQS-Signature: sha256=<hmac(secret, rawBody)>` |

Webhook body (Phase 3): `{ "event": "member.updated|member.suspended|member.renewed", "membershipNumber": "…", "status": "active", "occurredAt": "ISO" }`.

---

## 7. Field mapping (website ⇄ portal)

| Website (`User` / `Registration`) | Portal | Notes |
|---|---|---|
| `membershipId` / `Registration.membershipNumber` | `membershipNumber` | Canonical key. Confirm format, e.g. `NIQS/12345`. |
| `membershipType` (enum) | `membershipType` | Keep enums identical (§4.1). |
| `firstName`+`lastName` | `fullName` | We can split/join. |
| `email` | `email` | Lowercased. |
| — | `status`, `expiresOn`, `cpdBalance` | Portal-owned; website reads. |
| `Registration.cpdPoints` (per event) | CPD ledger entry | Website posts (§4.4). |

---

## 8. Security & operations
- **API keys** live only in the website **server** env (`PORTAL_API_KEY`) — never shipped to the browser. All portal calls are server-side proxied.
- **HTTPS** everywhere; optional **IP allowlist** for server-to-server.
- **Webhook** requests signed with a shared secret (HMAC-SHA256 over the raw body).
- **Token TTLs:** SSO session ≤ 1h (refresh via re-exchange); reset/one-time codes ≤ 5 min.
- **PII minimization:** search endpoints return only public fields; full profile requires authorization.
- **CORS:** portal allowlists the website origins (prod + Vercel previews) for any browser-facing endpoints.
- **Rate limiting + idempotency:** CPD post idempotent on `reference`; agree on `429` behavior + retry/backoff.
- Agreed **error envelope** (§4) so both sides parse failures consistently.

---

## 9. Open decisions (need the portal team / NIQS)
1. **Canonical domains** — website emails/flyers use `niqs.org.ng`; portal is `portal.niqsng.org`. Is the institute domain `niqs.org.ng` or `niqsng.org`? (affects SSO redirect URIs, email From, CORS).
2. **QS Firm directory** — stays website-managed (current) or moves to the portal? If portal, we switch `/search-qs-firms` to proxy §4.5.
3. **SSO style** — redirect+code (§5 recommended) or full OIDC?
4. **Membership number format** + the canonical `membershipType` / `status` vocabularies.
5. **API base URL** + how keys are issued per environment (staging + prod).
6. Does CPD post-back happen **on attendance** (our flow) or should the portal **pull** it? (We propose push, §4.4.)

---

## 10. Our side — where this plugs in (already scaffolded)
- **`server/utils/portalClient.js`** — typed wrapper for §4 (`verifyMember`, `getMember`, `searchMembers`, `postCpd`). **Env-gated:** returns `null`/`[]` until `PORTAL_API_URL` + `PORTAL_API_KEY` are set, so nothing breaks pre-integration.
- **`server/controllers/registrationController.js`** → `lookupMember()` now calls `portalClient.verifyMember()`.
- **Phase 2/3 (not built yet):** `server/controllers/portalController.js` (SSO exchange + webhook receiver) + client `AuthContext` member-login redirect.
- **Env vars to set when the portal is ready:**
  ```
  PORTAL_API_URL=https://portal.niqsng.org/api/v1
  PORTAL_API_KEY=********
  PORTAL_SSO_URL=https://portal.niqsng.org/sso/authorize      # Phase 2
  PORTAL_OAUTH_CLIENT_ID=NIQS_WEBSITE                          # Phase 2
  PORTAL_WEBHOOK_SECRET=********                               # Phase 3
  ```

### Phased rollout
- **Phase 1 (unblocks the most):** membership **verify** + **QS search** proxy → makes the event-registration member path and the directory live.
- **Phase 2:** SSO member login (single source of truth for member auth).
- **Phase 3:** CPD post-back + membership webhooks.

---

## 11. Requests to NIQS Secretariat / IT

### A. Official email (SMTP) — needed now
The website sends transactional email: **event-registration confirmations, CPD "I attended" links, and admin password-reset links.** It's coded and graceful (`server/utils/email.js`) but **dormant until SMTP credentials are provided.** Please supply:

| Item | Env var | Example |
|---|---|---|
| SMTP host | `SMTP_HOST` | `smtp.zoho.com` / `smtp.gmail.com` / host's relay |
| SMTP port | `SMTP_PORT` | `587` (STARTTLS) or `465` (SSL) |
| Secure flag | `SMTP_SECURE` | `true` for port 465, else omit |
| Username | `SMTP_USER` | `events@niqs.org.ng` |
| Password / app password | `SMTP_PASS` | *(app-specific password preferred)* |
| Authorized **From** address | `SMTP_FROM` | `NIQS Events <events@niqs.org.ng>` |

Also confirm the sending domain's **SPF / DKIM / DMARC** permit this host (or provide a relay), so mail isn't marked as spam.

### B. Portal API access — needed when the portal team is ready
- API **base URL** (staging + prod) and an **API key** per environment.
- SSO style (§5) + client credentials/redirect URIs.
- Confirmation of the §7 field names and §9 decisions.

> **Copy-paste request (email draft) to the Secretariat:**
> *"To enable automated emails (event registration confirmations, CPD attendance links, and admin password resets) on the new NIQS website, we need an official mailbox configured for SMTP sending. Please provide: SMTP host, port, security (TLS/SSL), username, password (an app-specific password is ideal), and the authorised 'From' address (e.g. events@niqs.org.ng). Please also confirm the domain's SPF/DKIM records allow sending through this server. Separately, to integrate with the membership portal we'll need the portal team to share the API base URL, an API key, and the single-sign-on details."*
