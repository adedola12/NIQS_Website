/**
 * Public membership statistics — normalised for the website.
 *
 * Thin read-only proxy over the NIQS Public Membership Statistics API
 * (utils/niqsStatsClient.js). The upstream response is authoritative; everything
 * here is presentation-safety, and each transformation exists because publishing
 * the raw array would mislead a visitor:
 *
 *   · the register's current year is partial, so charting it beside full years
 *     draws a cliff that looks like a collapse in admissions
 *   · missing years are omitted upstream, so a line chart joins across the gap
 *   · a handful of grade buckets are register artefacts with single-digit counts
 *   · ~96% of members have no chapter recorded, so chapter counts are not
 *     chapter sizes and must not be presented as such
 *
 * Nothing is dropped: the untouched arrays travel alongside the display copies,
 * and every judgement call is reported in meta.warnings.
 */

const { getStats, CACHE_MS } = require('../utils/niqsStatsClient');

// Grade buckets below this share of the membership are folded into "Other" for
// display. A share test rather than a name list, because the spec is explicit that
// grade labels are the Institute's to change and must not be hard-coded here.
const GRADE_FOLD_SHARE = 0.005; // 0.5%

// Below this share of members carrying a chapter, the chapter breakdown describes
// the completeness of the register rather than the distribution of members, and
// the website must not draw a map or a directory from it.
const CHAPTER_PUBLISH_SHARE = 0.5;

const slugify = (s) =>
  String(s || '')
    .toLowerCase()
    .replace(/\bchapters?\b/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, '-');

function normaliseGrades(byGrade, total, warnings) {
  const grades = (Array.isArray(byGrade) ? byGrade : [])
    .filter((g) => g && typeof g.count === 'number')
    .map((g) => ({ grade: String(g.grade ?? 'Unspecified'), count: g.count }))
    .sort((a, b) => b.count - a.count);

  const sum = grades.reduce((n, g) => n + g.count, 0);
  // The spec offers this as the integration's validation check. Run it.
  const reconciles = sum === total;
  if (!reconciles) {
    warnings.push(`by_grade sums to ${sum} but total_members is ${total}`);
  }

  const threshold = total * GRADE_FOLD_SHARE;
  const kept = grades.filter((g) => g.count >= threshold);
  const folded = grades.filter((g) => g.count < threshold);

  const display = kept.map((g) => ({ ...g, share: total ? g.count / total : 0 }));
  if (folded.length) {
    const count = folded.reduce((n, g) => n + g.count, 0);
    display.push({
      grade: 'Other',
      count,
      share: total ? count / total : 0,
      folded: folded.map((g) => g.grade),
    });
  }

  return { grades, display, reconciles, sum };
}

function normaliseChapters(byChapter, total, warnings) {
  const chapters = (Array.isArray(byChapter) ? byChapter : [])
    .filter((c) => c && typeof c.count === 'number')
    .map((c) => {
      const name = String(c.chapter ?? '').trim();
      return {
        chapter: name,
        // Upstream returns no state field, and chapter names arrive with mixed
        // spellings ("Kaduna", "Lagos Chapter", "FCT - Abuja Chapter"). This key
        // is what the website matches its own chapter records on — the
        // chapter→state mapping stays in the site's own content, per the spec.
        key: slugify(name),
        count: c.count,
      };
    })
    .sort((a, b) => b.count - a.count);

  const isUnassigned = (c) => c.key === 'unassigned' || c.key === '';
  const unassigned = chapters.filter(isUnassigned).reduce((n, c) => n + c.count, 0);
  const assigned = chapters.filter((c) => !isUnassigned(c)).reduce((n, c) => n + c.count, 0);
  const sum = assigned + unassigned;

  // Upstream does not send by_chapter_complete, so derive it the way the spec
  // defines it: the array is complete when it accounts for every member.
  const complete = sum === total;
  if (!complete) {
    warnings.push(`by_chapter sums to ${sum} but total_members is ${total} — treating the list as partial`);
  }

  const assignedShare = total ? assigned / total : 0;
  const publishable = complete && assignedShare >= CHAPTER_PUBLISH_SHARE;
  if (!publishable) {
    warnings.push(
      `only ${(assignedShare * 100).toFixed(1)}% of members have a chapter recorded — ` +
      `chapter counts reflect register completeness, not chapter size`,
    );
  }

  return {
    chapters,
    assigned: chapters.filter((c) => !isUnassigned(c)),
    unassigned,
    assigned_total: assigned,
    assigned_share: assignedShare,
    complete,
    publishable,
  };
}

function normaliseRegistrations(perYear, generatedAt, warnings) {
  const rows = (Array.isArray(perYear) ? perYear : [])
    .filter((r) => r && typeof r.year === 'number' && typeof r.count === 'number')
    .sort((a, b) => a.year - b.year);

  if (!rows.length) return { years: [], complete_years: [], partial_year: null };

  // Years with no admissions are omitted upstream, and a line chart would draw
  // straight across the gap. Fill them so a zero year reads as a zero year.
  const first = rows[0].year;
  const last = rows[rows.length - 1].year;
  const byYear = new Map(rows.map((r) => [r.year, r.count]));
  const filled = [];
  for (let y = first; y <= last; y += 1) {
    filled.push({ year: y, count: byYear.get(y) ?? 0, filled: !byYear.has(y) });
  }
  const gaps = filled.filter((r) => r.filled).map((r) => r.year);
  if (gaps.length) warnings.push(`no registrations recorded for ${gaps.join(', ')} — filled with zero`);

  // The register's newest year is still running, so it is not comparable with the
  // years beside it. Flag it rather than letting a chart imply a collapse.
  const currentYear = new Date(generatedAt || Date.now()).getFullYear();
  const partial = filled.find((r) => r.year === currentYear) || null;
  if (partial) partial.partial = true;

  return {
    years: filled,
    complete_years: filled.filter((r) => r.year !== currentYear),
    partial_year: partial ? { year: partial.year, count: partial.count } : null,
  };
}

function normaliseUnder40(under40, total, warnings) {
  if (!under40 || typeof under40.count !== 'number') return null;

  const knownDob = typeof under40.known_dob === 'number' ? under40.known_dob : null;
  const coverage = knownDob && total ? knownDob / total : null;

  if (coverage !== null && coverage < 0.95) {
    warnings.push(
      `date of birth is on file for ${(coverage * 100).toFixed(1)}% of members — ` +
      `the under-${under40.age_limit ?? 40} count is a floor, not a total`,
    );
  }

  return {
    count: under40.count,
    known_dob: knownDob,
    age_limit: under40.age_limit ?? 40,
    // Two denominators, because they answer different questions and the honest
    // caption depends on which one is used. share_of_members understates whenever
    // date-of-birth coverage is incomplete; share_of_known is the defensible one.
    share_of_members: total ? under40.count / total : null,
    share_of_known: knownDob ? under40.count / knownDob : null,
    dob_coverage: coverage,
  };
}

/**
 * GET /api/stats/membership
 *
 * 200 — figures, possibly stale (meta.stale). 503 — nothing known; the client
 * must omit the block rather than render zeros.
 */
exports.getMembershipStats = async (req, res) => {
  const result = await getStats({ force: req.query.refresh === '1' });

  if (!result.ok || !result.data) {
    // No Cache-Control: a failure should not be held onto by a CDN.
    return res.status(503).json({
      available: false,
      configured: result.configured,
      message: result.configured
        ? 'Membership statistics are temporarily unavailable.'
        : 'Membership statistics are not configured for this environment.',
    });
  }

  const d = result.data;
  const warnings = [];
  const total = d.total_members;

  const grades = normaliseGrades(d.by_grade, total, warnings);
  const chapters = normaliseChapters(d.by_chapter, total, warnings);
  const registrations = normaliseRegistrations(d.new_members_per_year, d.generated_at, warnings);
  const under40 = normaliseUnder40(d.under_40, total, warnings);

  // v1 of the spec documents both of these. The live endpoint omits them, so the
  // population a figure describes is currently unstated — surface that rather than
  // captioning the number with a definition nobody has confirmed.
  if (!d.version) warnings.push('upstream response carries no version field');
  if (!d.population) warnings.push('upstream response carries no population field — figures are uncaptioned');

  // Match the upstream 30-minute cache; a CDN or browser holding it that long is
  // exactly the "cache it at your end" the spec asks for.
  res.set('Cache-Control', `public, max-age=${Math.floor(CACHE_MS / 1000)}`);

  res.json({
    available: true,
    version: d.version || null,
    population: d.population || null,
    total_members: total,
    by_grade: grades.grades,
    by_grade_display: grades.display,
    by_grade_reconciles: grades.reconciles,
    by_chapter: chapters.chapters,
    by_chapter_assigned: chapters.assigned,
    by_chapter_unassigned: chapters.unassigned,
    by_chapter_assigned_share: chapters.assigned_share,
    by_chapter_complete: chapters.complete,
    by_chapter_publishable: chapters.publishable,
    under_40: under40,
    new_members_per_year: registrations.years,
    new_members_complete_years: registrations.complete_years,
    new_members_partial_year: registrations.partial_year,
    generated_at: d.generated_at || null,
    meta: {
      fetched_at: result.fetchedAt ? new Date(result.fetchedAt).toISOString() : null,
      stale: Boolean(result.stale),
      stale_reason: result.stale ? result.reason : undefined,
      warnings,
    },
  });
};
