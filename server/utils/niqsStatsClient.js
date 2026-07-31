/**
 * NIQS Public Membership Statistics API client (api.niqsng.org).
 *
 * Implements NIQS/API/PUBLIC-001 v1 — see docs/PUBLIC_STATS_API.md. Serves
 * section A of the ADLM access schedule: aggregate counts only, no personal data.
 *
 * Why the website proxies this instead of calling it from the browser:
 *
 *   1. The upstream CORS allowlist is localhost-only (:3000, :5173, :5174, :8080).
 *      A browser request from niqsng.org or a Vercel preview gets no
 *      Access-Control-Allow-Origin back and fails. Server-to-server is unaffected,
 *      so proxying works today with no allowlist change.
 *   2. 60 requests/minute is a per-key budget shared by every visitor. One cached
 *      upstream call every 30 minutes serves the whole site; per-browser calls
 *      would burn the budget and return 429 to real users.
 *   3. It keeps the key out of page source. The spec is explicit that the key is
 *      an identifier rather than a secret, so this is hygiene, not a control —
 *      but there is no reason to publish it.
 *
 * Env: NIQS_STATS_API_URL (default https://api.niqsng.org/api/public/stats),
 *      NIQS_STATS_API_KEY, [NIQS_STATS_TIMEOUT_MS=10000],
 *      [NIQS_STATS_CACHE_MS=1800000], [NIQS_STATS_STALE_MS=86400000]
 */

const URL_ = process.env.NIQS_STATS_API_URL || 'https://api.niqsng.org/api/public/stats';
const KEY = process.env.NIQS_STATS_API_KEY || '';
const TIMEOUT = Number(process.env.NIQS_STATS_TIMEOUT_MS) || 10_000;

// Upstream caches for 30 minutes server-side, so refreshing faster than that buys
// nothing but rate-limit consumption. Match it.
const CACHE_MS = Number(process.env.NIQS_STATS_CACHE_MS) || 30 * 60 * 1000;

// How long a stale entry stays servable once refresh starts failing. A day-old
// membership count with an honest "figures as at" date is a far better public page
// than an error — the spec asks for exactly this. Past that we admit we don't know.
const STALE_MS = Number(process.env.NIQS_STATS_STALE_MS) || 24 * 60 * 60 * 1000;

/** @type {{ data: object, fetchedAt: number } | null} */
let cache = null;
let inFlight = null;      // single-flight: concurrent misses share one upstream call
let blockedUntil = 0;     // set from Retry-After on a 429

function isConfigured() {
  return Boolean(URL_ && KEY);
}

/**
 * The live endpoint answers auth failures with HTTP 200 and an error envelope
 * ({"message": "An API key is required..."}), not the 401 the spec documents, and
 * sends Content-Type: text/html with leading whitespace before the JSON. So we
 * parse the body ourselves and decide success on shape, not on status.
 */
function parseBody(text) {
  const trimmed = (text || '').trim();
  if (!trimmed) return { ok: false, reason: 'empty response body' };
  let data;
  try {
    data = JSON.parse(trimmed);
  } catch {
    return { ok: false, reason: 'response was not JSON' };
  }
  if (!data || typeof data !== 'object') return { ok: false, reason: 'response was not an object' };
  if (typeof data.total_members !== 'number') {
    // Upstream error envelope, or a shape we do not recognise.
    return { ok: false, reason: data.message || 'response had no total_members' };
  }
  return { ok: true, data };
}

async function fetchUpstream() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT);
  try {
    const res = await fetch(URL_, {
      headers: { 'X-API-Key': KEY, Accept: 'application/json' },
      signal: controller.signal,
    });

    if (res.status === 429) {
      const retryAfter = Number(res.headers.get('retry-after')) || 60;
      blockedUntil = Date.now() + retryAfter * 1000;
      return { ok: false, reason: `rate limited, retry after ${retryAfter}s`, status: 429 };
    }

    const parsed = parseBody(await res.text());
    if (!parsed.ok) return { ...parsed, status: res.status };
    return { ok: true, data: parsed.data, status: res.status };
  } catch (err) {
    const reason = err.name === 'AbortError' ? `timed out after ${TIMEOUT}ms` : err.message;
    return { ok: false, reason, status: 0 };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Raw upstream figures, cached.
 *
 * Always resolves — callers get a result object rather than an exception, because
 * every caller's correct behaviour on failure is "render what we last knew", not
 * "fail the page".
 *
 * @param {{ force?: boolean }} [opts] force skips the freshness check (still
 *        respects a 429 backoff and still falls back to cache on failure).
 * @returns {Promise<{ ok: boolean, data: object|null, fetchedAt: number|null,
 *                     stale: boolean, configured: boolean, reason?: string }>}
 */
async function getStats({ force = false } = {}) {
  if (!isConfigured()) {
    return { ok: false, data: null, fetchedAt: null, stale: false, configured: false,
             reason: 'NIQS_STATS_API_KEY is not set' };
  }

  const now = Date.now();
  const fresh = cache && now - cache.fetchedAt < CACHE_MS;
  if (fresh && !force) {
    return { ok: true, data: cache.data, fetchedAt: cache.fetchedAt, stale: false, configured: true };
  }

  // Backing off from a 429: serve cache rather than adding to the pile.
  if (now < blockedUntil) return fromCache('rate limited upstream');

  if (!inFlight) {
    inFlight = fetchUpstream().finally(() => { inFlight = null; });
  }
  const result = await inFlight;

  if (result.ok) {
    cache = { data: result.data, fetchedAt: Date.now() };
    blockedUntil = 0;
    return { ok: true, data: cache.data, fetchedAt: cache.fetchedAt, stale: false, configured: true };
  }

  console.error('[niqsStatsClient] upstream fetch failed:', result.reason);
  return fromCache(result.reason);
}

function fromCache(reason) {
  if (cache && Date.now() - cache.fetchedAt < STALE_MS) {
    return { ok: true, data: cache.data, fetchedAt: cache.fetchedAt, stale: true, configured: true, reason };
  }
  return { ok: false, data: null, fetchedAt: cache?.fetchedAt ?? null, stale: false, configured: true, reason };
}

/** Test/ops hook — drops the cached copy so the next call refetches. */
function clearCache() {
  cache = null;
  blockedUntil = 0;
}

module.exports = { getStats, isConfigured, clearCache, CACHE_MS };
