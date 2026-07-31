import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageHero from '../../components/common/PageHero';
import API from '../../api/axios';

const NIGERIAN_STATES = [
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue',
  'Borno','Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT',
  'Gombe','Imo','Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi',
  'Kwara','Lagos','Nasarawa','Niger','Ogun','Ondo','Osun','Oyo',
  'Plateau','Rivers','Sokoto','Taraba','Yobe','Zamfara',
];

function FirmCard({ firm }) {
  const initials = firm.name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();

  return (
    <div style={{
      background: '#fff',
      border: '1px solid var(--color-bdr)',
      borderRadius: 14,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      transition: 'box-shadow .2s, transform .2s',
      position: 'relative',
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(11,31,75,.10)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = ''; }}
    >
      {/* Logo / Initials banner */}
      <div style={{
        height: 110, background: 'linear-gradient(135deg, var(--color-navy) 60%, #1a3a7a)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {firm.logo ? (
          <img
            src={firm.logo}
            alt={firm.name}
            style={{ maxHeight: 72, maxWidth: '80%', objectFit: 'contain', filter: 'brightness(0) invert(1)' }}
          />
        ) : (
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'rgba(255,255,255,.12)',
            border: '2px solid rgba(255,255,255,.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.4rem', fontWeight: 800, color: '#fff',
            fontFamily: 'var(--font-heading)',
          }}>
            {initials}
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: '1.2rem 1.4rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '.5rem' }}>

        {/* State badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', flexWrap: 'wrap' }}>
          <span style={{
            fontSize: '.62rem', fontWeight: 700, letterSpacing: '.08em',
            textTransform: 'uppercase', padding: '2px 8px', borderRadius: 4,
            background: 'var(--color-navy)', color: '#fff',
          }}>
            {firm.state}
          </span>
          {firm.regNumber && (
            <span style={{
              fontSize: '.62rem', fontWeight: 600, letterSpacing: '.06em',
              color: 'var(--color-txt-3)', padding: '2px 6px',
              border: '1px solid var(--color-bdr)', borderRadius: 4,
            }}>
              {firm.regNumber}
            </span>
          )}
        </div>

        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1rem', color: 'var(--color-navy)', lineHeight: 1.3 }}>
          {firm.name}
        </div>

        <div style={{ fontSize: '.78rem', color: 'var(--color-txt-3)', lineHeight: 1.5 }}>
          📍 {[firm.city, firm.address].filter(Boolean).join(', ')}
        </div>

        {firm.description && (
          <p style={{ fontSize: '.78rem', color: 'var(--color-txt-2)', lineHeight: 1.6, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {firm.description}
          </p>
        )}

        {/* Contact row */}
        <div style={{ marginTop: 'auto', paddingTop: '.8rem', display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
          {firm.phone && (
            <a href={`tel:${firm.phone.replace(/\s/g, '')}`}
              style={{ fontSize: '.72rem', color: 'var(--color-gold)', fontWeight: 600, textDecoration: 'none' }}>
              📞 {firm.phone}
            </a>
          )}
          {firm.email && (
            <a href={`mailto:${firm.email}`}
              style={{ fontSize: '.72rem', color: 'var(--color-navy)', fontWeight: 600, textDecoration: 'none' }}>
              ✉ {firm.email}
            </a>
          )}
          {firm.website && (
            <a href={firm.website} target="_blank" rel="noopener noreferrer"
              style={{ fontSize: '.72rem', color: 'var(--color-gold)', fontWeight: 600, textDecoration: 'none' }}>
              🌐 Website ↗
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SearchQSFirms() {
  const [firms, setFirms]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [query, setQuery]         = useState({ search: '', state: '' });
  const [failed, setFailed]       = useState(false);

  /* Debounce the search input */
  useEffect(() => {
    const t = setTimeout(() => setQuery({ search, state: stateFilter }), 350);
    return () => clearTimeout(t);
  }, [search, stateFilter]);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (query.search) params.set('search', query.search);
    if (query.state)  params.set('state',  query.state);
    params.set('limit', '100');

    API.get(`/qs-firms?${params}`)
      .then(res => { setFirms(res.data?.firms || []); setFailed(false); })
      .catch(() => { setFirms([]); setFailed(true); })
      .finally(() => setLoading(false));
  }, [query]);

  /* The results come from the server already filtered, so what is on screen is
     what the register holds. Three different reasons for an empty grid, and they
     are not interchangeable on a page whose whole purpose is verifying that a
     firm is genuine: the request failed, nobody matched the search, or the
     directory has not been published yet. */
  const filtered = firms;
  const hasFilters = Boolean(query.search || query.state);

  return (
    <>
      <PageHero
        label="Membership"
        title="Search QS Firms"
        titleHighlight="QS Firms"
        backgroundImage="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1400&q=80&fit=crop"
      />

      {/* Intro */}
      <section style={{ background: '#fff' }}>
        <div className="ct" style={{ paddingTop: '4rem', paddingBottom: '2.5rem' }}>
          <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 2.5rem' }}>
            <div className="ey" style={{ justifyContent: 'center' }}>Directory</div>
            <h2 className="sh" style={{ textAlign: 'center' }}>
              Registered <em>QS Firms</em> in Nigeria
            </h2>
            <p className="sd" style={{ maxWidth: '100%', textAlign: 'center' }}>
              Search and verify NIQS-registered quantity surveying firms across all 36 states
              and the FCT. All listed firms are recognised by NIQS and registered with the QSRBN.
            </p>
          </div>

          {/* Search + Filter Bar */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', maxWidth: 720, margin: '0 auto' }}>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by firm name, city, or registration number…"
              style={{
                flex: 1, minWidth: 220, padding: '12px 16px', fontSize: '.84rem',
                borderRadius: 10, border: '1.5px solid var(--color-bdr)',
                background: 'var(--color-off)', fontFamily: 'var(--font-body)',
                color: 'var(--color-txt)', outline: 'none',
              }}
              onFocus={e => { e.target.style.borderColor = 'var(--color-navy)'; e.target.style.background = '#fff'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--color-bdr)'; e.target.style.background = 'var(--color-off)'; }}
            />
            <select
              value={stateFilter}
              onChange={e => setStateFilter(e.target.value)}
              style={{
                padding: '12px 16px', fontSize: '.84rem', borderRadius: 10,
                border: '1.5px solid var(--color-bdr)', background: 'var(--color-off)',
                fontFamily: 'var(--font-body)', color: 'var(--color-txt)',
                cursor: 'pointer', minWidth: 160,
              }}
            >
              <option value="">All States</option>
              {NIGERIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="section-alt">
        <div className="ct" style={{ paddingTop: '2.5rem', paddingBottom: '5rem' }}>

          {/* Result count */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '.5rem' }}>
            <div style={{ fontSize: '.78rem', color: 'var(--color-txt-3)', fontWeight: 600 }}>
              {loading || failed || filtered.length === 0
                ? (loading ? 'Loading…' : '')
                : `${filtered.length} firm${filtered.length !== 1 ? 's' : ''} found`
              }
            </div>
            {(search || stateFilter) && (
              <button
                onClick={() => { setSearch(''); setStateFilter(''); }}
                style={{ fontSize: '.72rem', color: 'var(--color-gold)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Clear filters ✕
              </button>
            )}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-txt-3)' }}>
              Loading firms…
            </div>
          ) : failed ? (
            /* Could not ask the register — deliberately not phrased as "none
               found", which would tell a visitor a firm is unregistered when in
               fact we simply could not check. */
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-txt-3)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '.8rem' }}>⚠️</div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-navy)', marginBottom: '.4rem' }}>
                The directory could not be loaded
              </div>
              <div style={{ fontSize: '.82rem', maxWidth: 460, margin: '0 auto', lineHeight: 1.7 }}>
                This is a problem at our end, not a statement about any firm. Please try
                again shortly, or contact the National Secretariat to verify a firm directly.
              </div>
            </div>
          ) : filtered.length === 0 && hasFilters ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-txt-3)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '.8rem' }}>🔍</div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-navy)', marginBottom: '.4rem' }}>No firms found</div>
              <div style={{ fontSize: '.82rem' }}>Try adjusting your search or clearing the filters.</div>
            </div>
          ) : filtered.length === 0 ? (
            /* The register is genuinely empty. Say so plainly rather than filling
               the grid with invented firms — this page exists so a client can
               check that a practice is real, and a specimen listing is the one
               thing it must never show. */
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-txt-3)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '.8rem' }}>🗂️</div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-navy)', marginBottom: '.4rem' }}>
                The firm directory is not published yet
              </div>
              <div style={{ fontSize: '.82rem', maxWidth: 500, margin: '0 auto 1.4rem', lineHeight: 1.7 }}>
                NIQS is compiling the register of registered quantity surveying firms.
                Until it is published here, the National Secretariat can confirm whether
                a firm is NIQS-registered and in good standing.
              </div>
              <Link to="/contact" className="btn bp">Contact the Secretariat</Link>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1.4rem',
            }}>
              {filtered.map(firm => (
                <FirmCard key={firm._id} firm={firm} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: '#fff' }}>
        <div className="ct" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
          <div className="ctaw">
            <h2>Is Your Firm <em>Listed?</em></h2>
            <p>
              If your QS firm is NIQS-registered and does not appear in this directory,
              contact the National Secretariat to have your firm added.
            </p>
            <div className="ctarow">
              <a href="/contact" className="btn bg">Contact Secretariat</a>
              <a href="/membership" className="btn bo" style={{ color: '#fff', borderColor: 'rgba(255,255,255,.3)' }}>
                Membership Info
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
