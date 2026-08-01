import API from './axios';

/**
 * Membership statistics, via the website's own server (server/routes/stats.js),
 * never the NIQS API directly — the upstream CORS allowlist does not include this
 * site's origins, and the shared rate limit is a per-key budget rather than a
 * per-visitor one. See docs/PUBLIC_STATS_API.md.
 */

const CACHE_KEY = 'niqs:membership-stats:v1';

// The figures move a few times a day at most and the server already caches for 30
// minutes. This second layer stops a visitor moving between pages from re-fetching
// on every route change.
const CACHE_MS = 30 * 60 * 1000;

function readCache() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { at, data } = JSON.parse(raw);
    if (!at || Date.now() - at > CACHE_MS) return null;
    return data;
  } catch {
    return null; // private mode, quota, or a stale shape — just refetch
  }
}

function writeCache(data) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), data }));
  } catch { /* non-fatal */ }
}

/**
 * Resolves to the stats object, or null when they are unavailable.
 *
 * Null means "render the block without live figures, or omit it" — never zero.
 * A public page showing a membership figure of 0 because a request timed out is
 * worse than one showing no figure at all.
 */
export async function fetchMembershipStats({ cache = true } = {}) {
  if (cache) {
    const hit = readCache();
    if (hit) return hit;
  }

  try {
    const res = await API.get('/stats/membership');
    const data = res?.data;
    if (!data || data.available !== true || typeof data.total_members !== 'number') return null;
    writeCache(data);
    return data;
  } catch {
    // 503 (upstream down and no cached copy) lands here too, which is correct —
    // the caller's fallback is the same in both cases.
    return null;
  }
}

export { CACHE_KEY as STATS_CACHE_KEY };
