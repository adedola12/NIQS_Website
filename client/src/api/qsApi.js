import API from './axios';

/**
 * Registered-QS directory, via the website's own server (server/routes/qs.js).
 *
 * The browser never talks to the member portal directly: the portal API key is
 * server-side only, and the server projects each record down to the fields that
 * may be published before it ever reaches the page. See
 * docs/PORTAL_INTEGRATION_SPEC.md.
 */

/**
 * One search box, two behaviours — the server decides which. A membership number
 * is verified; anything else is searched.
 *
 * Resolves to { configured, mode, results, total }. `configured: false` means the
 * portal credentials are not set in this environment, which the UI must show as
 * "not connected yet" rather than "no such member" — the two mean very different
 * things to someone checking a practitioner's credentials.
 */
export async function lookupQS(q, { signal } = {}) {
  try {
    const res = await API.get('/qs/lookup', { params: { q }, signal });
    const d = res?.data || {};
    return {
      configured: Boolean(d.configured),
      mode: d.mode || 'search',
      results: Array.isArray(d.results) ? d.results : [],
      total: d.total ?? 0,
      message: d.message,
    };
  } catch (err) {
    if (err?.code === 'ERR_CANCELED' || err?.name === 'CanceledError') throw err;
    const status = err?.response?.status;
    return {
      configured: true,
      mode: 'search',
      results: [],
      total: 0,
      error: status === 429
        ? 'Too many searches just now. Please wait a moment and try again.'
        : 'The register could not be reached. Please try again shortly.',
    };
  }
}

/** Full directory search with filters (server/routes/qs.js → /api/qs/search). */
export async function searchQS({ q = '', state = '', type = '', page = 1 } = {}) {
  try {
    const res = await API.get('/qs/search', { params: { q, state, type, page } });
    const d = res?.data || {};
    return {
      configured: Boolean(d.configured),
      results: Array.isArray(d.results) ? d.results : [],
      total: d.total ?? 0,
      page: d.page ?? page,
    };
  } catch {
    return { configured: true, results: [], total: 0, page, error: true };
  }
}
