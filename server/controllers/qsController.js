/**
 * Registered quantity surveyor directory — public read surface.
 *
 * Proxies the NIQS Membership Portal (docs/PORTAL_INTEGRATION_SPEC.md §4.1, §4.3)
 * so the portal's API key stays server-side and the browser never talks to the
 * portal directly.
 *
 * Two rules govern everything here:
 *
 *   1. **Project before publishing.** The portal returns a full member record —
 *      email, telephone, dues standing, CPD balance, expiry. A public directory
 *      publishes a person's professional standing, not their contact details or
 *      their subscription history. The projection happens on this side so the
 *      extra fields never reach the browser at all, where "we just don't render
 *      it" would still ship them in the JSON.
 *
 *   2. **Unconfigured is not an error.** Until PORTAL_API_URL and PORTAL_API_KEY
 *      are set, every route answers 200 with `configured: false` and an empty
 *      result. The website then says the directory is not connected yet, rather
 *      than showing a broken search box or, worse, invented people.
 *
 * Status today: the portal's REST API is not live — https://portal.niqsng.org is
 * the member-portal SPA, and its /api/v1/* paths serve that app's index.html. The
 * NIQS public statistics key does NOT grant member records; the Institute's
 * written position on schedule items B1–B4 is that they are not provided. So
 * these routes are correct and inert, and light up when credentials exist.
 */

const portal = require('../utils/portalClient');

/**
 * The only member fields the website is willing to make public.
 *
 * Everything omitted here is omitted on purpose. `email`, `phone` and `address`
 * are personal contact details; `expiresOn` and any dues field expose a member's
 * payment position; `cpdBalance` is a private training record. A visitor
 * checking whether a quantity surveyor is genuinely registered needs the name,
 * the number, the grade, the standing and the chapter — and nothing else.
 */
function publicMember(m) {
  if (!m || typeof m !== 'object') return null;
  return {
    membershipNumber: m.membershipNumber ?? null,
    fullName: m.fullName ?? null,
    membershipType: m.membershipType ?? null,
    status: m.status ?? null,
    chapter: m.chapter ?? null,
    state: m.state ?? m.chapter ?? null,
  };
}

/** A membership number, as opposed to a person's name. */
const looksLikeMembershipNumber = (q) => /^[A-Za-z]*[\/\-]?\s*\d{2,}/.test(String(q).trim());

/**
 * GET /api/qs/search?q=&state=&type=&page=&pageSize=
 *
 * Registered-QS directory search (SPEC §4.3). Always 200 — an unconfigured
 * portal, a portal outage and a genuine no-match all render the same way on a
 * public page, and `configured` tells them apart when it matters.
 */
exports.searchRegisteredQS = async (req, res) => {
  const { q = '', state = '', type = '', page = 1, pageSize = 24 } = req.query;

  if (!portal.isConfigured()) {
    return res.json({ configured: false, results: [], total: 0, page: 1, pageSize: Number(pageSize) });
  }

  // An unfiltered search would return the whole register a page at a time. The
  // directory answers questions about someone; it is not a bulk export.
  if (!String(q).trim() && !state && !type) {
    return res.json({
      configured: true, results: [], total: 0, page: 1, pageSize: Number(pageSize),
      message: 'Enter a name, membership number, or choose a state to search.',
    });
  }

  const r = await portal.searchMembers({
    q: String(q).trim(),
    state,
    type,
    status: 'active',           // only members in good standing are listed publicly
    page: Number(page) || 1,
    pageSize: Math.min(Number(pageSize) || 24, 50),
  });

  res.json({
    configured: true,
    results: (r.results || []).map(publicMember).filter(Boolean),
    total: r.total ?? 0,
    page: r.page ?? (Number(page) || 1),
    pageSize: r.pageSize ?? (Number(pageSize) || 24),
  });
};

/**
 * GET /api/qs/verify?membershipNumber=NIQS/12345
 *
 * Confirms one membership (SPEC §4.1). Membership number only — verifying by
 * email address would let anyone test whether a given address belongs to a
 * member, which is a disclosure the register should not make to the public.
 * Name lookups belong in the search route above.
 */
exports.verifyRegisteredQS = async (req, res) => {
  const { membershipNumber = '' } = req.query;

  if (!portal.isConfigured()) {
    return res.json({ configured: false, valid: false, member: null });
  }
  if (!String(membershipNumber).trim()) {
    return res.status(400).json({ configured: true, valid: false, member: null,
      message: 'A membership number is required.' });
  }

  const member = await portal.verifyMember({ membershipNumber: String(membershipNumber).trim() });
  res.json({ configured: true, valid: Boolean(member), member: publicMember(member) });
};

/**
 * GET /api/qs/lookup?q=
 *
 * What the website's single search box calls. A membership number is a
 * verification; anything else is a directory search. Kept on the server so the
 * two pages that offer a search box cannot drift apart on which is which.
 */
exports.lookup = async (req, res) => {
  const q = String(req.query.q || '').trim();

  if (!portal.isConfigured()) {
    return res.json({ configured: false, mode: 'search', results: [], total: 0 });
  }
  if (!q) {
    return res.json({ configured: true, mode: 'search', results: [], total: 0,
      message: 'Enter a name or membership number.' });
  }

  if (looksLikeMembershipNumber(q)) {
    const member = await portal.verifyMember({ membershipNumber: q });
    if (member) {
      return res.json({ configured: true, mode: 'verify', results: [publicMember(member)], total: 1 });
    }
    // Not a number the portal recognises — fall through and try it as a search
    // term, since plenty of names and firms contain digits.
  }

  const r = await portal.searchMembers({ q, status: 'active', page: 1, pageSize: 24 });
  res.json({
    configured: true,
    mode: 'search',
    results: (r.results || []).map(publicMember).filter(Boolean),
    total: r.total ?? 0,
  });
};

module.exports.publicMember = publicMember;
