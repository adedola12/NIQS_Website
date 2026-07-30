import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { STATES, VIEWBOX } from '../../data/nigeriaStates';

/**
 * Interactive map of Nigeria — every state is clickable and opens its chapter.
 *
 * Geometry comes from Natural Earth 1:10m Admin 1, which is public domain, via
 * client/scripts/build-nigeria-map.py. That mattered: GADM is licensed for
 * non-commercial use only and geoBoundaries is CC-BY, so both would have put a
 * licence obligation on the institute's site for a map. Drawing the borders by
 * hand was never an option — approximate borders on a national body's own
 * website would be worse than no map.
 *
 * ~11.5 KB brotli for all 37 states, and it lives on a lazy route, so the entry
 * bundle is untouched.
 */

const ZONE_CLASS = {
  'North West':   'z-nw',
  'North East':   'z-ne',
  'North Central':'z-nc',
  'South West':   'z-sw',
  'South East':   'z-se',
  'South South':  'z-ss',
};

/**
 * Chapter records store "Abia State"; the map data uses "Abia". FCT is bare in
 * both. Getting this wrong silently matched almost nothing the first time round.
 */
function normaliseState(value) {
  return String(value || '')
    .replace(/\s+state$/i, '')
    .replace(/^federal capital territory$/i, 'FCT')
    .trim();
}

/**
 * A published profile, not merely a chapter record. Keyed on `about`, matching
 * the "Full profile" badge the list below already used — deliberately not
 * chairperson, which seedChapterExcos.js sets on every chapter as a stub and so
 * distinguishes nothing.
 */
function isProfiled(chapter) {
  return Boolean(chapter?.about);
}

/** Small states whose label will not fit inside their own outline. */
const TINY = new Set(['Lagos', 'Anambra', 'Abia', 'Imo', 'Ebonyi', 'Ekiti', 'Osun',
                      'Bayelsa', 'FCT', 'Enugu', 'Akwa Ibom', 'Rivers']);

export default function ChapterMap({ chapters = [], activeZone, onZoneChange }) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(null);

  const byState = useMemo(() => {
    const m = new Map();
    chapters.forEach((c) => {
      const key = normaliseState(c.state) || normaliseState(String(c.name).replace(/\s+chapter$/i, ''));
      if (key) m.set(key, c);
    });
    return m;
  }, [chapters]);

  const profiledCount = useMemo(
    () => STATES.filter((s) => isProfiled(byState.get(s.name))).length,
    [byState]
  );

  const zones = useMemo(() => {
    const set = new Set();
    chapters.forEach((c) => c.zone && set.add(c.zone));
    return [...set].sort();
  }, [chapters]);

  const go = (slug) => navigate(`/chapters/${slug}`);

  return (
    <div className="cmap-wrap">
      <div className="cmap-head">
        <div>
          <div className="ey">Nationwide</div>
          <h2 className="sh" style={{ marginBottom: '.4rem' }}>
            All 37 <em>Chapters</em>
          </h2>
          <p className="sd" style={{ marginBottom: 0 }}>
            {profiledCount} of {STATES.length} chapters have published a full profile.
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

      <div className="cmap-figure">
        <svg
          viewBox={VIEWBOX}
          className="cmap-svg"
          role="list"
          aria-label="Map of Nigeria. Each state links to its NIQS chapter."
        >
          {STATES.map((s) => {
            const chapter  = byState.get(s.name);
            const profiled = isProfiled(chapter);
            const zone     = chapter?.zone;
            const dimmed   = activeZone && zone !== activeZone;
            const slug     = chapter?.slug || `${s.name.toLowerCase().replace(/\s+/g, '-')}-chapter`;

            return (
              <g key={s.name} role="listitem">
                {/* SVG <a> is a real link: right-click, middle-click and
                    "copy link address" all behave. onClick is intercepted so
                    navigation stays client-side. */}
                <a
                  href={`/chapters/${slug}`}
                  onClick={(e) => { e.preventDefault(); go(slug); }}
                  onMouseEnter={() => setHovered(s.name)}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => setHovered(s.name)}
                  onBlur={() => setHovered(null)}
                  aria-label={
                    `${s.name} chapter${zone ? `, ${zone} zone` : ''}` +
                    (profiled ? '' : ' — full profile not yet published')
                  }
                >
                  <path
                    d={s.d}
                    className={[
                      'cmap-state',
                      ZONE_CLASS[zone] || '',
                      profiled ? 'is-profiled' : 'is-pending',
                      dimmed ? 'is-dimmed' : '',
                    ].filter(Boolean).join(' ')}
                  />
                </a>
              </g>
            );
          })}

          {/* Labels drawn after every shape so no neighbouring state paints over
              them. pointer-events none keeps the label from stealing the click
              from the state underneath it. */}
          {STATES.map((s) => {
            const chapter = byState.get(s.name);
            const dimmed  = activeZone && chapter?.zone !== activeZone;
            if (TINY.has(s.name)) return null;
            return (
              <text
                key={`t-${s.name}`}
                x={s.cx} y={s.cy}
                className={`cmap-label${dimmed ? ' is-dimmed' : ''}${hovered === s.name ? ' is-hover' : ''}`}
                textAnchor="middle"
                aria-hidden="true"
              >
                {s.name}
              </text>
            );
          })}
        </svg>

        {/* The small southern and central states cannot hold a label inside
            their own outline at this scale, so they get a shared key rather
            than labels overlapping each other into illegibility. */}
        <p className="cmap-tiny-key">
          <strong>Not labelled on the map:</strong>{' '}
          {[...TINY].sort().join(' · ')} — hover or select any state to identify it.
        </p>
      </div>

      <p className="cmap-note">
        <span className="cmap-key"><span className="cmap-dot" aria-hidden="true" /> full profile published</span>
        <span className="cmap-key"><span className="cmap-dash" aria-hidden="true" /> chapter listed, profile pending</span>
        {hovered && <span className="cmap-hovered">{hovered}</span>}
      </p>
    </div>
  );
}
