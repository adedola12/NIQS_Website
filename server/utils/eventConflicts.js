/**
 * Event date guardrail — the core of the NIQS institutional calendar.
 *
 * Rule (locked with the product owner):
 *   • A NATIONAL-scope event reserves its date range for EVERYONE — chapter and
 *     sub-admins are hard-blocked from overlapping it ("HQ reserves globally").
 *   • A chapter event is ALSO hard-blocked by its OWN chapter's existing events.
 *   • Two DIFFERENT chapters may share a day → soft warning only.
 *   • A national (HQ) event overlapping anything → soft warning only (HQ outranks
 *     and can override with confirmation).
 *
 * Overlap is evaluated at DAY granularity, inclusive, on [date, endDate || date].
 * Mongo + Render run in UTC, and flyer dates arrive as 'YYYY-MM-DD' (parsed as UTC
 * midnight), so we normalise on UTC day components for consistency.
 */

const Event = require('../models/Event');

function dayStartUTC(d) {
  const x = new Date(d);
  return new Date(Date.UTC(x.getUTCFullYear(), x.getUTCMonth(), x.getUTCDate(), 0, 0, 0, 0));
}

function dayEndUTC(d) {
  const x = new Date(d);
  return new Date(Date.UTC(x.getUTCFullYear(), x.getUTCMonth(), x.getUTCDate(), 23, 59, 59, 999));
}

/**
 * @param {Object} p
 * @param {Date|string} p.start            event start date
 * @param {Date|string} [p.end]            event end date (defaults to start)
 * @param {'national'|'chapter'} p.scope   scope of the event being saved
 * @param {string|ObjectId} [p.chapter]    chapter id (for chapter-scope events)
 * @param {string|ObjectId} [p.excludeId]  event id to exclude (when editing)
 * @returns {Promise<{hard: Array, warnings: Array}>} categorised overlapping events
 */
async function classifyConflicts({ start, end, scope, chapter, excludeId }) {
  if (!start) return { hard: [], warnings: [] };

  const rangeStart = dayStartUTC(start);
  const rangeEnd = dayEndUTC(end || start);

  const query = {
    date: { $lte: rangeEnd },
    // effective end (endDate, else date) must reach our range start
    $expr: { $gte: [{ $ifNull: ['$endDate', '$date'] }, rangeStart] },
  };
  if (excludeId) query._id = { $ne: excludeId };

  const overlapping = await Event.find(query)
    .select('title date endDate scope chapter type hasFlyer')
    .populate('chapter', 'name')
    .sort('date')
    .lean();

  const chapterId = chapter ? String(chapter) : null;
  const hard = [];
  const warnings = [];

  for (const o of overlapping) {
    const oChapter = o.chapter ? String(o.chapter._id || o.chapter) : null;

    // Hard block only applies when the NEW event is chapter-scoped.
    const isHard =
      scope === 'chapter' &&
      (o.scope === 'national' || (chapterId && oChapter === chapterId));

    (isHard ? hard : warnings).push(o);
  }

  return { hard, warnings };
}

/** Build a human-readable summary of a conflicting event for messages/UI. */
function describeConflict(o) {
  const fmt = (d) =>
    d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }) : '';
  const when = o.endDate && String(o.endDate) !== String(o.date)
    ? `${fmt(o.date)} – ${fmt(o.endDate)}`
    : fmt(o.date);
  const owner = o.scope === 'national' ? 'National (HQ)' : (o.chapter?.name ? `${o.chapter.name} chapter` : 'a chapter');
  return { id: String(o._id), title: o.title, when, scope: o.scope, owner, chapterName: o.chapter?.name || null };
}

module.exports = { classifyConflicts, describeConflict, dayStartUTC, dayEndUTC };
