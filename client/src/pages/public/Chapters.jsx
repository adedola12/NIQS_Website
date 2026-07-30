import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageHero from '../../components/common/PageHero';
import ChapterMap from '../../components/chapters/ChapterMap';
import API from '../../api/axios';

/* All 37 chapters with geopolitical zones — used as fallback */
const ALL_STATES = [
  ['Abia',        'South East'],   ['Adamawa',    'North East'],
  ['Akwa Ibom',   'South South'],  ['Anambra',    'South East'],
  ['Bauchi',      'North East'],   ['Bayelsa',    'South South'],
  ['Benue',       'North Central'],['Borno',      'North East'],
  ['Cross River', 'South South'],  ['Delta',      'South South'],
  ['Ebonyi',      'South East'],   ['Edo',        'South South'],
  ['Ekiti',       'South West'],   ['Enugu',      'South East'],
  ['FCT',         'North Central'],['Gombe',      'North East'],
  ['Imo',         'South East'],   ['Jigawa',     'North West'],
  ['Kaduna',      'North West'],   ['Kano',       'North West'],
  ['Katsina',     'North West'],   ['Kebbi',      'North West'],
  ['Kogi',        'North Central'],['Kwara',      'North Central'],
  ['Lagos',       'South West'],   ['Nasarawa',   'North Central'],
  ['Niger',       'North Central'],['Ogun',       'South West'],
  ['Ondo',        'South West'],   ['Osun',       'South West'],
  ['Oyo',         'South West'],   ['Plateau',    'North Central'],
  ['Rivers',      'South South'],  ['Sokoto',     'North West'],
  ['Taraba',      'North East'],   ['Yobe',       'North East'],
  ['Zamfara',     'North West'],
];

const FALLBACK = ALL_STATES.map(([state, zone], i) => ({
  _id:   String(i + 1),
  name:  `${state} Chapter`,
  slug:  state.toLowerCase().replace(/\s+/g, '-'),
  state,
  zone,
  memberCount: 0,
}));

export default function Chapters() {
  const [chapters, setChapters]   = useState(FALLBACK);
  const [search, setSearch]       = useState('');
  // Shared between the map's zone legend and the list below it, so selecting a
  // zone on the map filters both rather than leaving the two views disagreeing.
  const [activeZone, setActiveZone] = useState(null);

  useEffect(() => {
    API.get('/chapters')
      .then(res => {
        const data = res.data?.chapters || res.data?.data || res.data;
        if (Array.isArray(data) && data.length > 0) setChapters(data);
      })
      .catch(() => {});
  }, []);

  const filtered = chapters.filter(c => {
    if (activeZone && c.zone !== activeZone) return false;
    const q = search.toLowerCase();
    return c.name.toLowerCase().includes(q) ||
           (c.state || '').toLowerCase().includes(q) ||
           (c.zone  || '').toLowerCase().includes(q);
  });

  return (
    <>
      <PageHero
        label="Nationwide"
        title="State Chapters"
        titleHighlight="Chapters"
        backgroundImage="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1400&q=80&fit=crop"
      />

      <section style={{ background: '#fff' }}>
        <div className="ct" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>

          <ChapterMap
            chapters={chapters}
            activeZone={activeZone}
            onZoneChange={setActiveZone}
          />

          {/* Search */}
          <div style={{ maxWidth: 400, marginBottom: '2rem' }}>
            <input
              type="text"
              placeholder="Search by state or zone…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%', padding: '10px 16px', border: '1.5px solid var(--color-bdr)',
                borderRadius: 8, fontSize: 14, color: 'var(--color-txt)', outline: 'none',
                boxSizing: 'border-box', fontFamily: 'inherit', background: 'var(--color-off)',
              }}
            />
          </div>

          <div className="chapters-grid">
            {filtered.map(c => (
              <Link
                to={`/chapters/${c.slug}`}
                key={c._id}
                style={{ textDecoration: 'none' }}
              >
                <div className="chcard">
                  <h4>{c.name}</h4>
                  <p>{c.zone ? `${c.zone} Zone` : 'Nigeria'}</p>
                  {c.chairperson && (
                    <p style={{ marginTop: 4, color: 'var(--color-txt-2)', fontWeight: 600 }}>{c.chairperson}</p>
                  )}
                  {/* A chapter with about copy has had its full profile + exco published,
                      so flag it — otherwise every card looks identical and the completed
                      ones are impossible to find in a 35-chapter grid. */}
                  {c.about && (
                    <span style={{
                      display: 'inline-block', marginTop: 8, padding: '2px 8px', borderRadius: 20,
                      background: 'var(--color-off)', border: '1px solid var(--color-bdr-gold)',
                      fontSize: '.6rem', fontWeight: 700, letterSpacing: '.06em',
                      textTransform: 'uppercase', color: 'var(--color-gold)',
                    }}>
                      Full profile
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {filtered.length === 0 && (
            <p style={{ textAlign: 'center', color: 'var(--color-txt-3)', marginTop: '2rem' }}>
              No chapters found.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
