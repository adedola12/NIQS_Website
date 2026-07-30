import { useMemo } from 'react';
import { Link } from 'react-router-dom';

/**
 * Interactive chapter map — a schematic tile grid, not a geographic outline.
 *
 * Why a grid rather than state boundaries: accurate Nigerian admin-1 boundary
 * data is not in this repo, and approximating 37 borders by hand would put a map
 * with wrong borders on a national institute's website — authoritative-looking
 * and incorrect, which is worse than not having one. A tile grid makes no
 * boundary claim at all; it is read as a diagram, so nothing about it can be
 * wrong in that way.
 *
 * It is also the better instrument for this job. On a true map Lagos is a speck
 * and Niger is enormous, which inverts their importance to NIQS — the smallest
 * state on the map has the largest membership. Equal tiles give every chapter
 * equal presence. And the whole thing is ~3 KB of DOM and CSS against the ~30 KB
 * of path data the plan had budgeted for an SVG.
 *
 * Positions are relative, not projected: column 1 is the west, column 7 the
 * east, row 1 the north, row 8 the south. If licensed boundary data is ever
 * approved, only GRID below needs replacing — the rest of the component works
 * off chapter data.
 */

/* [state, column, row]. Zones come from the chapter data, not from here. */
const GRID = [
  // Far north
  ['Sokoto', 2, 1], ['Katsina', 4, 1], ['Jigawa', 5, 1], ['Yobe', 6, 1], ['Borno', 7, 1],
  // Upper middle
  ['Kebbi', 1, 2], ['Zamfara', 3, 2], ['Kano', 4, 2], ['Bauchi', 5, 2], ['Gombe', 6, 2],
  // Middle
  ['Niger', 2, 3], ['Kaduna', 4, 3], ['Plateau', 5, 3], ['Adamawa', 7, 3],
  // Middle belt
  ['Kwara', 1, 4], ['FCT', 4, 4], ['Nasarawa', 5, 4], ['Taraba', 6, 4],
  // Lower middle
  ['Oyo', 1, 5], ['Osun', 2, 5], ['Ekiti', 3, 5], ['Kogi', 4, 5], ['Benue', 5, 5],
  // South
  ['Ogun', 1, 6], ['Ondo', 2, 6], ['Edo', 3, 6], ['Anambra', 4, 6],
  ['Enugu', 5, 6], ['Ebonyi', 6, 6],
  // Coast
  ['Lagos', 1, 7], ['Delta', 3, 7], ['Imo', 4, 7], ['Abia', 5, 7], ['Cross River', 6, 7],
  ['Bayelsa', 3, 8], ['Rivers', 4, 8], ['Akwa Ibom', 5, 8],
];

const ZONE_CLASS = {
  'North West':   'z-nw',
  'North East':   'z-ne',
  'North Central':'z-nc',
  'South West':   'z-sw',
  'South East':   'z-se',
  'South South':  'z-ss',
};

/** Short label for the tile face. Full name stays in the accessible name. */
function abbreviate(state) {
  if (state === 'FCT') return 'FCT';
  if (state === 'Cross River') return 'C/River';
  if (state === 'Akwa Ibom') return 'A/Ibom';
  return state;
}

/**
 * Whether a chapter has real content behind it rather than the generic fallback
 * ChapterDetail renders. Derived from the data instead of a hardcoded list, so
 * the map updates itself as NIQS seeds more chapters.
 */
function isProfiled(chapter) {
  if (!chapter) return false;
  return Boolean(chapter.chairperson || chapter.about || chapter.address) ||
         Number(chapter.memberCount) > 0;
}

export default function ChapterMap({ chapters = [], activeZone, onZoneChange }) {
  const byState = useMemo(() => {
    const m = new Map();
    chapters.forEach((c) => { if (c.state) m.set(c.state, c); });
    return m;
  }, [chapters]);

  const profiledCount = useMemo(
    () => GRID.filter(([s]) => isProfiled(byState.get(s))).length,
    [byState]
  );

  const zones = useMemo(() => {
    const set = new Set();
    chapters.forEach((c) => c.zone && set.add(c.zone));
    return [...set].sort();
  }, [chapters]);

  return (
    <div className="cmap-wrap">
      <div className="cmap-head">
        <div>
          <div className="ey">Nationwide</div>
          <h2 className="sh" style={{ marginBottom: '.4rem' }}>
            All 37 <em>Chapters</em>
          </h2>
          <p className="sd" style={{ marginBottom: 0 }}>
            {profiledCount} of {GRID.length} chapters have published a full profile.
            Select any state to open its chapter.
          </p>
        </div>

        {zones.length > 1 && (
          <div className="cmap-legend" role="group" aria-label="Filter chapters by geopolitical zone">
            <button
              type="button"
              className={`cmap-zone${!activeZone ? ' on' : ''}`}
              onClick={() => onZoneChange?.(null)}
              aria-pressed={!activeZone}
            >
              All zones
            </button>
            {zones.map((z) => (
              <button
                key={z}
                type="button"
                className={`cmap-zone ${ZONE_CLASS[z] || ''}${activeZone === z ? ' on' : ''}`}
                onClick={() => onZoneChange?.(activeZone === z ? null : z)}
                aria-pressed={activeZone === z}
              >
                <span className="cmap-swatch" aria-hidden="true" />
                {z}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Schematic, and says so — a reader should not take tile adjacency for a
          shared border. */}
      <div
        className="cmap"
        role="list"
        aria-label="NIQS chapters by state, arranged as a schematic grid from north-west to south-east"
      >
        {GRID.map(([state, col, row]) => {
          const chapter  = byState.get(state);
          const profiled = isProfiled(chapter);
          const zone     = chapter?.zone;
          const dimmed   = activeZone && zone !== activeZone;
          const slug     = chapter?.slug || state.toLowerCase().replace(/\s+/g, '-');

          return (
            <div
              key={state}
              role="listitem"
              className="cmap-cell"
              style={{ gridColumn: col, gridRow: row }}
            >
              <Link
                to={`/chapters/${slug}`}
                className={[
                  'cmap-tile',
                  ZONE_CLASS[zone] || '',
                  profiled ? 'is-profiled' : 'is-pending',
                  dimmed ? 'is-dimmed' : '',
                ].filter(Boolean).join(' ')}
                aria-label={
                  `${state} chapter${zone ? `, ${zone} zone` : ''}` +
                  (profiled ? '' : ' — full profile not yet published')
                }
              >
                <span className="cmap-name">{abbreviate(state)}</span>
                {profiled
                  ? <span className="cmap-dot" aria-hidden="true" />
                  : <span className="cmap-pending" aria-hidden="true">·</span>}
              </Link>
            </div>
          );
        })}
      </div>

      <p className="cmap-note">
        Schematic layout — tiles are arranged by approximate position, not drawn to
        scale or to state boundaries.
        <span className="cmap-key">
          <span className="cmap-dot" aria-hidden="true" /> full profile published
        </span>
      </p>
    </div>
  );
}
