import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageHero from '../../components/common/PageHero';
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
  const [chapters, setChapters] = useState(FALLBACK);
  const [search, setSearch]     = useState('');

  useEffect(() => {
    API.get('/chapters')
      .then(res => {
        const data = res.data?.chapters || res.data?.data || res.data;
        if (Array.isArray(data) && data.length > 0) setChapters(data);
      })
      .catch(() => {});
  }, []);

  const filtered = chapters.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.state || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.zone  || '').toLowerCase().includes(search.toLowerCase())
  );

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
          <div className="ey">37 Chapters</div>
          <h2 className="sh">NIQS in Every <em>State</em></h2>
          <p className="sd" style={{ marginBottom: '2.5rem' }}>
            NIQS has active chapters in all 36 states of Nigeria and the FCT, bringing
            professional QS services to every community.
          </p>

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
