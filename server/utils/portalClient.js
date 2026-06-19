/**
 * NIQS Membership Portal API client (portal.niqsng.org).
 *
 * Implements the contract in docs/PORTAL_INTEGRATION_SPEC.md §4. Env-gated and
 * graceful by design (mirrors utils/email.js): until PORTAL_API_URL +
 * PORTAL_API_KEY are set, every call no-ops — verify→null, search→empty,
 * postCpd→{skipped:true} — so the website works unchanged before the portal is live.
 *
 * Env: PORTAL_API_URL (e.g. https://portal.niqsng.org/api/v1), PORTAL_API_KEY,
 *      [PORTAL_TIMEOUT_MS=8000]
 */

const BASE = (process.env.PORTAL_API_URL || '').replace(/\/$/, '');
const KEY = process.env.PORTAL_API_KEY || '';
const TIMEOUT = Number(process.env.PORTAL_TIMEOUT_MS) || 8000;

function isConfigured() {
  return Boolean(BASE && KEY);
}

async function call(method, path, { query, body } = {}) {
  if (!isConfigured()) return { ok: false, skipped: true, status: 0, data: null };

  let url = BASE + path;
  if (query) {
    const qs = new URLSearchParams(
      Object.entries(query).filter(([, v]) => v !== undefined && v !== null && v !== '')
    ).toString();
    if (qs) url += `?${qs}`;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT);
  try {
    const res = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${KEY}`,
        Accept: 'application/json',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    let data = null;
    try { data = await res.json(); } catch { /* non-JSON / empty */ }
    return { ok: res.ok, skipped: false, status: res.status, data };
  } catch (err) {
    console.error('[portalClient]', method, path, '-', err.message);
    return { ok: false, skipped: false, status: 0, data: null, error: err.message };
  } finally {
    clearTimeout(timer);
  }
}

/** §4.1 — verify by membership number or email. Returns the member object or null. */
async function verifyMember({ membershipNumber, email } = {}) {
  const r = await call('GET', '/members/verify', { query: { membershipNumber, email } });
  if (!r.ok || !r.data) return null;
  return r.data.valid ? (r.data.member || null) : null;
}

/** §4.2 — full profile by membership number, or null. */
async function getMember(membershipNumber) {
  const r = await call('GET', `/members/${encodeURIComponent(membershipNumber)}`);
  return r.ok ? (r.data?.member || r.data || null) : null;
}

/** §4.3 — registered-QS people directory search → { results, total, page, pageSize, configured }. */
async function searchMembers({ q, state, type, status = 'active', page = 1, pageSize = 20 } = {}) {
  const r = await call('GET', '/members/search', { query: { q, state, type, status, page, pageSize } });
  if (!r.ok || !r.data) return { results: [], total: 0, page, pageSize, configured: isConfigured() };
  return { ...r.data, configured: true };
}

/** §4.5 — registered QS firms search (only if the portal owns firms). */
async function searchFirms({ q, state, page = 1, pageSize = 20 } = {}) {
  const r = await call('GET', '/firms/search', { query: { q, state, page, pageSize } });
  if (!r.ok || !r.data) return { results: [], total: 0, page, pageSize, configured: isConfigured() };
  return { ...r.data, configured: true };
}

/** §4.4 — post CPD earned at a website event to the member's portal ledger. Idempotent on `reference`. */
async function postCpd(membershipNumber, payload) {
  const r = await call('POST', `/members/${encodeURIComponent(membershipNumber)}/cpd`, {
    body: { source: 'niqs-website', ...payload },
  });
  if (r.status === 409) return { ok: true, duplicate: true }; // duplicate reference == success (spec §4.4)
  return { ok: r.ok, skipped: r.skipped, data: r.data };
}

module.exports = { isConfigured, verifyMember, getMember, searchMembers, searchFirms, postCpd };
