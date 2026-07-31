# NIQS Public Membership Statistics API — integration notes

**Upstream spec:** NIQS/API/PUBLIC-001 · v1 · 31 July 2026
**Endpoint:** `GET https://api.niqsng.org/api/public/stats`
**Serves:** section A (A1–A5) of the ADLM access schedule `ADLM/NIQS/API-001` — aggregate membership counts for the public website. No personal data.

Sections B–E of the schedule (member authentication and records, job listings, notifications, chapter directory) are **not** served by this endpoint. See [`PORTAL_INTEGRATION_SPEC.md`](./PORTAL_INTEGRATION_SPEC.md) and [`MEMBERSHIP_PORTAL_ACCESS_REQUIREMENTS.md`](./MEMBERSHIP_PORTAL_ACCESS_REQUIREMENTS.md) for those.

---

## 1. What was built

| Layer | File | Role |
|---|---|---|
| Upstream client | `server/utils/niqsStatsClient.js` | Auth, timeout, 30-min cache, single-flight, 429 backoff, stale-on-failure |
| Normaliser | `server/controllers/statsController.js` | Presentation-safety transforms + data-quality warnings |
| Route | `server/routes/stats.js` → `GET /api/stats/membership` | Public, read-only |
| Browser client | `client/src/api/statsApi.js` | Fetch + `sessionStorage` cache |
| Hook | `client/src/hooks/useMembershipStats.js` | `{ stats, loading }` + formatters |
| UI | `client/src/components/stats/MembershipStats.jsx` | Charts, KPI row, data table |
| Surfaces | `client/src/pages/public/Home.jsx`, `Membership.jsx` | Hero stat bar; full statistics section |

## 2. Why the website proxies instead of calling from the browser

The spec permits browser calls and even anticipates the key being visible in page source. We still call it server-to-server, for three reasons:

1. **CORS.** The upstream allowlist is `http://localhost:3000, :5173, :5174, :8080` only. A browser request from `niqsng.org` or a Vercel preview URL gets no `Access-Control-Allow-Origin` and fails. *Confirmed empirically* — a request carrying `Origin: https://niqs-website.vercel.app` comes back with no ACAO header. Proxying works today with no allowlist change; if NIQS later adds our origins, nothing here needs to change either.
2. **Rate limit.** 60 req/min is a budget per *key*, not per visitor. One cached upstream call per 30 minutes serves the entire site. Per-browser calls would spend the budget and start returning 429 to real visitors.
3. **Key hygiene.** The key is an identifier rather than a secret, so this is not a security control — but there is no reason to publish it either, and keeping it server-side means rotation is a deployment variable change rather than a redeploy of the frontend.

## 3. Where the live endpoint differs from the v1 document

Verified against production on 31 July 2026. **These are the things to raise with the NIQS technical contact** — the integration handles all of them, but each is a divergence from the written contract.

| # | Documented | Actual | How this repo handles it |
|---|---|---|---|
| 1 | `401` on missing/invalid key | **`200 OK`** with `{"message": "An API key is required…"}` | Success is decided on *shape* (`typeof total_members === 'number'`), never on status code — `niqsStatsClient.parseBody()` |
| 2 | `version` field identifies the response shape | **Absent** | Reported as `null`; a warning is emitted. We cannot log the shape version as the spec asks |
| 3 | `population` states what the counts describe | **Absent** | Figures are published without a population caption, and a warning says so |
| 4 | `by_chapter_complete` flags a complete list | **Absent** | Derived: the array is complete when it sums to `total_members` (it currently does) |
| 5 | `Cache-Control: public, max-age=1800` | **Not sent** | We set our own on the proxied response |
| 6 | `Content-Type: application/json` implied | **`text/html; charset=UTF-8`**, with ~10 blank lines before the JSON body | Body is read as text and trimmed before parsing |

Nothing above blocks the integration. Items 2 and 3 are the ones worth fixing upstream: without `population`, no figure on the site can be captioned with the definition it was computed from, and without `version` the change policy has no handle.

## 4. Data-quality findings in the register itself

Distinct from the API's behaviour — these are properties of the data, and they drive real editorial decisions on the page.

- **Chapter data is not publishable as chapter sizes.** 13,424 of 14,023 members (95.7%) are `Unassigned`. The remaining 4.3% is spread over 35 chapter labels. The spec anticipates this exactly: a large `Unassigned` reflects register completeness, not a fault. **The website therefore does not draw a chapter chart or a map from this data** — `by_chapter_publishable` gates it, and it flips on automatically once ≥50% of members carry a chapter.
- **Chapter names need normalising to match anything.** The register carries `"Lagos Chapter"`, `"Kaduna"`, `"FCT - Abuja Chapter"`, `"Yobe "` (trailing space) and `"fct chapter colledge"` (apparently a typo). Since no `state` field is returned and the spec says to hold chapter→state mapping on our side, the proxy emits a normalised `key` per chapter (`"FCT - Abuja Chapter"` → `fct-abuja`) for matching against the website's own chapter records.
- **Two grade buckets are register artefacts:** `Past president` (13) and `temp` (3). The spec is explicit that grade labels must not be hard-coded, so these are not filtered by name — anything under 0.5% of the membership folds into an `Other` bucket that names its contents. The untouched `by_grade` array ships alongside and is what the page's data table renders.
- **Date-of-birth coverage is 81.5%.** So `under_40.count` (4,485) is 32.0% of all members but 39.3% of those who *can* be classified. The page publishes the second figure against its actual denominator and states the coverage, because the first understates the truth.
- **The current year is partial.** 2026 shows 336 against 2025's 1,585. Charted at equal weight this reads as a collapse in admissions. The proxy flags `partial` on the current year and the chart draws it in a de-emphasised step with a legend entry.
- **A5 is "registered", not "elected".** The spec's own note: the register stores a registration date, which is not the same event for every grade. Every label on the site says *registered*. This must not be changed to "elected" without written confirmation from the secretariat.

## 5. Response shape from `GET /api/stats/membership`

Upstream fields pass through unchanged; everything else is additive.

```jsonc
{
  "available": true,
  "version": null,                      // upstream, currently absent
  "population": null,                   // upstream, currently absent
  "total_members": 14023,
  "by_grade": [ { "grade": "Member", "count": 5739 } ],   // untouched, sorted desc
  "by_grade_display": [ …, { "grade": "Other", "count": 16, "share": 0.001,
                             "folded": ["Past president", "temp"] } ],
  "by_grade_reconciles": true,          // the spec's own validation check
  "by_chapter": [ { "chapter": "Lagos Chapter", "key": "lagos", "count": 175 } ],
  "by_chapter_assigned": [ … ],         // "Unassigned" removed
  "by_chapter_unassigned": 13424,
  "by_chapter_assigned_share": 0.0427,
  "by_chapter_complete": true,          // derived; sums to total_members
  "by_chapter_publishable": false,      // complete AND >= 50% assigned
  "under_40": { "count": 4485, "known_dob": 11425, "age_limit": 40,
                "share_of_members": 0.3198, "share_of_known": 0.3926,
                "dob_coverage": 0.8147 },
  "new_members_per_year": [ { "year": 2026, "count": 336, "filled": false,
                              "partial": true } ],        // gaps filled with zero
  "new_members_complete_years": [ … ],  // the partial year removed
  "new_members_partial_year": { "year": 2026, "count": 336 },
  "generated_at": "2026-07-31T05:00:46+01:00",
  "meta": { "fetched_at": "…", "stale": false, "warnings": [ "…" ] }
}
```

`503 { "available": false, "configured": false|true, "message": "…" }` when no figures are known. `configured: false` means the key is unset in this environment.

**`meta.warnings`** is the honest-reporting channel — every judgement the proxy made, in plain English. It is not rendered on the page; read it when the figures look wrong.

## 6. Failure behaviour

The spec's instruction is *"render the last cached figures and a 'figures as at' date, or omit the statistics block. A public page should never show a membership figure of zero because a request timed out."* That is implemented as a chain:

1. Fresh cache (< 30 min) → served without touching upstream.
2. Upstream fails → **stale cache served for up to 24 hours**, `meta.stale: true`, and the page adds "Last successful refresh shown" to its as-at line.
3. No cache at all → `503`, the hook returns `null`, and `MembershipStats` **renders nothing**. The Home stat bar reverts to its static "10,000+".

A `429` sets a backoff from `Retry-After` and serves cache until it expires. Concurrent misses share a single upstream request (single-flight), so a burst of traffic cannot fan out into a burst of upstream calls.

## 7. Configuration

Server environment (see `server/.env.example`):

| Variable | Default | Notes |
|---|---|---|
| `NIQS_STATS_API_KEY` | — | **Required for live figures.** Unset ⇒ 503 ⇒ static copy |
| `NIQS_STATS_API_URL` | `https://api.niqsng.org/api/public/stats` | |
| `NIQS_STATS_TIMEOUT_MS` | `10000` | |
| `NIQS_STATS_CACHE_MS` | `1800000` | Matches the upstream 30-minute cache |
| `NIQS_STATS_STALE_MS` | `86400000` | How long stale figures stay servable |

The key is **not** in this repository and must not be added to it. Set it in the ECS task definition for production and in a local `server/.env` for development. It is revocable per consumer; report a suspected exposure to the NIQS technical contact for a same-day replacement.

There is no staging environment upstream. Develop against production and **do not load-test** — ask NIQS first if you need to.

## 8. Open items for NIQS

1. Add `version` and `population` to the response (§3, items 2–3).
2. Return `401` rather than `200` for auth failures (§3, item 1), or confirm the 200-with-envelope behaviour is intentional so it can be relied on.
3. Confirm whether "new members registered per year" may be published as an *elected* figure, or stays as registered (spec's own note on A5).
4. Chapter assignment in the register (§4) — until it improves, the website cannot publish per-chapter membership.
5. No origin allowlist change is needed while the website proxies server-side. If browser-side calls are ever wanted, the origins to add are `https://niqsng.org`, `https://www.niqsng.org`, and `https://niqs-website.vercel.app` (plus preview URLs, which are per-deployment and would need a wildcard).
