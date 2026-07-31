import React, { useState } from 'react';
import useMembershipStats, {
  formatCount, formatShare, formatAsAt,
} from '../../hooks/useMembershipStats';

/**
 * Live membership statistics, from the NIQS register.
 *
 * Every figure here is an aggregate count — the endpoint returns no names, no
 * membership numbers, no dates of birth. See docs/PUBLIC_STATS_API.md.
 *
 * Two editorial rules run through this component:
 *
 *   · Nothing is captioned more strongly than the register supports. The year
 *     series is "registered", not "elected", because registration date is what
 *     is actually recorded. The under-40 figure is shown against the members
 *     whose date of birth is on file, because that is the denominator it was
 *     derived from.
 *   · Nothing renders as zero on failure. When the figures are unavailable the
 *     whole block is omitted, which is the endpoint's own documented guidance.
 */

/* Chart palette — one hue for magnitude, a de-emphasis step for incomplete data,
   gold for the single proportion. Validated against a white surface: lightness
   band, chroma floor, CVD separation, normal-vision floor and 3:1 contrast all
   pass for the series/accent pair. The muted step sits below 3:1 by design, so
   the mark it paints is always directly labelled. */
const SERIES = '#27509f';
const MUTED  = '#9FAFD2';
const ACCENT = '#B5822F';

/* Nigeria's 37 chapters (36 states + FCT) are website content, not register data. */
const CHAPTER_COUNT = 37;

function Figure({ title, subtitle, children, note, wide }) {
  return (
    <figure className={`viz-fig${wide ? ' viz-fig--wide' : ''}`}>
      <figcaption>
        <div className="viz-fig-t">{title}</div>
        {subtitle && <div className="viz-fig-s">{subtitle}</div>}
      </figcaption>
      {children}
      {note && <div className="viz-note">{note}</div>}
    </figure>
  );
}

/** Horizontal bars, one hue. Single series, so the title carries identity and no
    legend box is needed. Values ride the bar ends; the axis is the labels. */
function GradeBars({ rows, total }) {
  const max = Math.max(...rows.map(r => r.count), 1);
  return (
    <div className="viz-bars">
      {rows.map((r) => {
        const label = r.grade === 'Other' && r.folded?.length
          ? `Other (${r.folded.join(', ')})`
          : r.grade;
        return (
          <div className="viz-bar-row" key={r.grade}>
            <div className="viz-bar-lbl" title={label}>{label}</div>
            <div className="viz-bar-track">
              <div
                className="viz-bar"
                style={{ width: `${(r.count / max) * 100}%`, background: SERIES }}
                title={`${label}: ${formatCount(r.count)} (${formatShare(r.count / total, 1)})`}
              />
            </div>
            <div className="viz-bar-val">
              {formatCount(r.count)}
              <span className="viz-bar-pct">{formatShare(r.count / total, 1)}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Columns, one per year. The register's current year is still running, so it is
    drawn in the de-emphasis step and labelled — plotting it at full weight beside
    completed years would read as a collapse in admissions rather than a part year. */
function YearColumns({ rows }) {
  const max = Math.max(...rows.map(r => r.count), 1);
  const hasPartial = rows.some(r => r.partial);
  // Clean top tick rather than the raw maximum, so the gridline reads as a value.
  const step = max > 1000 ? 500 : max > 200 ? 100 : 50;
  const top = Math.ceil(max / step) * step;

  // A value on every column is chaos and goes unread — the axis carries the rest,
  // and the table carries all of it. Label the peak and the part year, which are
  // the two columns a reader needs a number for.
  const labelled = new Set(
    rows.filter(r => r.count === max || r.partial).map(r => r.year),
  );

  return (
    <>
      <div className="viz-cols" style={{ '--viz-top': top }}>
        <div className="viz-col-grid" aria-hidden="true">
          <span><i>{formatCount(top)}</i></span>
          <span><i>{formatCount(top / 2)}</i></span>
          <span><i>0</i></span>
        </div>
        {rows.map((r) => {
          const pct = (r.count / top) * 100;
          return (
            <div className="viz-col-slot" key={r.year}>
              <div className="viz-col-plot">
                <div
                  className={`viz-col${r.partial ? ' is-partial' : ''}`}
                  style={{ height: `${pct}%`, background: r.partial ? MUTED : SERIES }}
                  title={`${r.year}${r.partial ? ' (part year)' : ''}: ${formatCount(r.count)} registered`}
                />
                {labelled.has(r.year) && (
                  <div className="viz-col-val" style={{ bottom: `${pct}%` }}>{formatCount(r.count)}</div>
                )}
              </div>
              <div className="viz-col-lbl">{r.year}</div>
            </div>
          );
        })}
      </div>
      {hasPartial && (
        <div className="viz-legend">
          <span><i style={{ background: SERIES }} />Completed year</span>
          <span><i style={{ background: MUTED }} />Year still in progress</span>
        </div>
      )}
    </>
  );
}

/** A single ratio against its denominator — a meter, not a two-slice pie. */
function Under40Meter({ u }) {
  const share = u.share_of_known ?? u.share_of_members ?? 0;
  return (
    <div className="viz-meter-wrap">
      <div className="viz-meter-n">{formatShare(share, 1)}</div>
      <div className="viz-meter">
        <div className="viz-meter-fill" style={{ width: `${share * 100}%`, background: ACCENT }} />
      </div>
      <div className="viz-meter-lbl">
        {formatCount(u.count)} members are under {u.age_limit}, of the{' '}
        {formatCount(u.known_dob)} whose date of birth is on file.
      </div>
    </div>
  );
}

function DataTable({ stats }) {
  return (
    <div className="viz-table-wrap">
      <table className="viz-table">
        <caption>Membership by grade</caption>
        <thead>
          <tr><th scope="col">Grade</th><th scope="col">Members</th><th scope="col">Share</th></tr>
        </thead>
        <tbody>
          {stats.by_grade.map(g => (
            <tr key={g.grade}>
              <th scope="row">{g.grade}</th>
              <td>{formatCount(g.count)}</td>
              <td>{formatShare(g.count / stats.total_members, 1)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr><th scope="row">Total</th><td>{formatCount(stats.total_members)}</td><td>100%</td></tr>
        </tfoot>
      </table>

      <table className="viz-table">
        <caption>New members registered per year</caption>
        <thead>
          <tr><th scope="col">Year</th><th scope="col">Registered</th></tr>
        </thead>
        <tbody>
          {stats.new_members_per_year.map(y => (
            <tr key={y.year}>
              <th scope="row">{y.year}{y.partial ? ' (part year)' : ''}</th>
              <td>{formatCount(y.count)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function MembershipStats() {
  const { stats, loading } = useMembershipStats();
  const [showTable, setShowTable] = useState(false);

  // Loading and unavailable both render nothing. A membership figure of zero
  // because a request timed out is worse than no statistics block at all.
  if (loading || !stats) return null;

  const asAt = formatAsAt(stats.generated_at || stats.meta?.fetched_at);
  const fellows = stats.by_grade.find(g => g.grade === 'Fellow')?.count ?? null;
  const lastFull = stats.new_members_complete_years?.[stats.new_members_complete_years.length - 1];

  return (
    <section className="viz-root" style={{ background: '#fff' }}>
      <div className="ct" style={{ paddingTop: '4.5rem', paddingBottom: '4.5rem' }}>
        <div className="ey">The Register</div>
        <h2 className="sh">Membership by the <em>Numbers</em></h2>
        <p className="sd">
          Aggregate figures drawn live from the NIQS membership register. Counts only —
          no personal details are published here.
        </p>

        {/* KPI row — headline figures that need no plot. */}
        <div className="viz-kpis">
          <div className="viz-kpi">
            <div className="viz-kpi-n">{formatCount(stats.total_members)}</div>
            <div className="viz-kpi-l">Registered members</div>
          </div>
          {fellows !== null && (
            <div className="viz-kpi">
              <div className="viz-kpi-n">{formatCount(fellows)}</div>
              <div className="viz-kpi-l">Fellows</div>
            </div>
          )}
          {lastFull && (
            <div className="viz-kpi">
              <div className="viz-kpi-n">{formatCount(lastFull.count)}</div>
              <div className="viz-kpi-l">Registered in {lastFull.year}</div>
            </div>
          )}
          <div className="viz-kpi">
            <div className="viz-kpi-n">{CHAPTER_COUNT}</div>
            <div className="viz-kpi-l">State chapters</div>
          </div>
        </div>

        <div className="viz-grid">
          <Figure
            title="Membership by grade"
            subtitle={`All ${formatCount(stats.total_members)} members, by the grade recorded on their account.`}
            note={
              stats.by_grade_reconciles
                ? 'Grades sum to the total membership.'
                : 'Grade counts do not currently sum to the total membership.'
            }
          >
            <GradeBars rows={stats.by_grade_display} total={stats.total_members} />
          </Figure>

          <Figure
            title="New members registered per year"
            /* Deliberately "registered", not "elected": the register records a
               registration date, and that is not the same event for every grade. */
            subtitle="By date of registration, as recorded in the register."
            note="Members with no registration date on file are not counted, so these years do not sum to total membership."
          >
            <YearColumns rows={stats.new_members_per_year} />
          </Figure>

          {stats.under_40 && (
            <Figure
              wide
              title={`Members under ${stats.under_40.age_limit}`}
              subtitle="Share of members with a recorded date of birth."
              note={
                stats.under_40.dob_coverage !== null && stats.under_40.dob_coverage < 0.95
                  ? `A date of birth is on file for ${formatShare(stats.under_40.dob_coverage, 1)} of members. ` +
                    'Members without one cannot be classified and are excluded rather than assumed to be over ' +
                    `${stats.under_40.age_limit}, so the true figure is higher.`
                  : undefined
              }
            >
              <Under40Meter u={stats.under_40} />
            </Figure>
          )}

          {/* Chapter counts are published only when the register actually carries
              them. Today the great majority of members have no chapter recorded,
              so a chapter chart would describe the completeness of the register
              rather than the size of the chapters. */}
          {stats.by_chapter_publishable && (
            <Figure
              title="Members by chapter"
              subtitle="Chapters with the largest recorded membership."
            >
              <GradeBars
                rows={stats.by_chapter_assigned.slice(0, 10).map(c => ({ grade: c.chapter, count: c.count }))}
                total={stats.by_chapter_assigned_share * stats.total_members}
              />
            </Figure>
          )}
        </div>

        <div className="viz-foot">
          <div className="viz-asat">
            {asAt && <>Figures as at {asAt}.</>}
            {stats.meta?.stale && ' Last successful refresh shown; the register was not reachable on the most recent attempt.'}
            {stats.population && ` Population: ${stats.population}.`}
          </div>
          <button type="button" className="viz-toggle" onClick={() => setShowTable(v => !v)}>
            {showTable ? 'Hide data table' : 'View as a table'}
          </button>
        </div>

        {showTable && <DataTable stats={stats} />}
      </div>
    </section>
  );
}
