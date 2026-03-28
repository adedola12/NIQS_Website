import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import PageHero from '../../components/common/PageHero';
import API from '../../api/axios';

const ZONE_MAP = {
  'abia':'South East','adamawa':'North East','akwa-ibom':'South South','anambra':'South East',
  'bauchi':'North East','bayelsa':'South South','benue':'North Central','borno':'North East',
  'cross-river':'South South','delta':'South South','ebonyi':'South East','edo':'South South',
  'ekiti':'South West','enugu':'South East','fct':'North Central','gombe':'North East',
  'imo':'South East','jigawa':'North West','kaduna':'North West','kano':'North West',
  'katsina':'North West','kebbi':'North West','kogi':'North Central','kwara':'North Central',
  'lagos':'South West','nasarawa':'North Central','niger':'North Central','ogun':'South West',
  'ondo':'South West','osun':'South West','oyo':'South West','plateau':'North Central',
  'rivers':'South South','sokoto':'North West','taraba':'North East','yobe':'North East',
  'zamfara':'North West',
};

const PLACEHOLDER_LEADERS = [
  { _id: 'l1', name: 'Surv. [Chairman Name], MNIQS', title: 'Chapter Chairman',   state: '', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80&fit=crop&crop=face' },
  { _id: 'l2', name: 'Surv. [Vice Chair], MNIQS',   title: 'Vice Chairman',       state: '', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80&fit=crop&crop=face' },
  { _id: 'l3', name: 'Surv. [Secretary], MNIQS',    title: 'Chapter Secretary',   state: '', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80&fit=crop&crop=face' },
  { _id: 'l4', name: 'Surv. [Treasurer], MNIQS',    title: 'Chapter Treasurer',   state: '', image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80&fit=crop&crop=face' },
];

export default function ChapterDetail() {
  const { slug } = useParams();
  const [chapter, setChapter]   = useState(null);
  const [exco,    setExco]      = useState([]);
  const [events,  setEvents]    = useState([]);
  const [loading, setLoading]   = useState(true);

  const stateName = slug
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
    .replace(/\bFct\b/, 'FCT');

  useEffect(() => {
    setLoading(true);
    API.get(`/chapters/${slug}`)
      .then(res => {
        const data = res.data?.data || res.data;
        setChapter(data);
        if (data?._id) {
          API.get(`/exco?scope=chapter&chapter=${data._id}`)
            .then(r => {
              const d = r.data?.exco || r.data?.data || r.data;
              if (Array.isArray(d) && d.length > 0) setExco(d.filter(m => m.isActive !== false));
            })
            .catch(() => {});
          API.get(`/events?chapter=${data._id}&limit=3`)
            .then(r => { const d = r.data?.data || r.data; if (Array.isArray(d)) setEvents(d); })
            .catch(() => {});
        }
      })
      .catch(() => {
        setChapter({
          name: `${stateName} Chapter`,
          state: stateName,
          zone: ZONE_MAP[slug] || '',
          address: `NIQS ${stateName} Chapter Secretariat`,
          about: `The ${stateName} State Chapter of the Nigerian Institute of Quantity Surveyors coordinates professional activities, organises CPD events, advocates for the profession, and supports member welfare within the state.`,
          email: `${slug}@niqs.org.ng`,
          phone: '+234 800 000 0000',
          memberCount: 0,
          image: '',
        });
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <>
        <PageHero
          label="State Chapter"
          title="Loading…"
          backgroundImage="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1400&q=80&fit=crop"
        />
        <div className="ct" style={{ padding: '4rem 0', textAlign: 'center', color: 'var(--color-txt-3)' }}>
          Loading chapter information…
        </div>
      </>
    );
  }

  const leaders = exco.length > 0 ? exco : PLACEHOLDER_LEADERS;
  const heroImg = chapter?.image || 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1400&q=80&fit=crop';

  return (
    <>
      <PageHero
        label={chapter?.zone ? `${chapter.zone} Zone` : 'State Chapter'}
        title={chapter?.name || `${stateName} Chapter`}
        titleHighlight="Chapter"
        backgroundImage={heroImg}
      />

      {/* ── ABOUT + CONTACT ── */}
      <section style={{ background: '#fff' }}>
        <div className="ct" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>

          {/* back link */}
          <Link to="/chapters" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--color-txt-3)', textDecoration: 'none', marginBottom: '2rem', fontWeight: 600 }}>
            ← All Chapters
          </Link>

          <div className="tc2">
            {/* Left: description + contact */}
            <div className="rl">
              <div className="ey">About This Chapter</div>
              <h2 className="sh">{chapter?.name || `${stateName} Chapter`}</h2>
              <p style={{ fontSize: '.9rem', lineHeight: 1.85, color: 'var(--color-txt-2)', marginBottom: '1.5rem' }}>
                {chapter?.about || `The ${stateName} State Chapter of the Nigerian Institute of Quantity Surveyors coordinates professional activities, organises CPD events, and supports member welfare within the state.`}
              </p>

              {/* Stats row */}
              <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                {chapter?.memberCount > 0 && (
                  <div style={{ background: 'var(--color-off)', borderRadius: 10, padding: '.8rem 1.2rem', textAlign: 'center', minWidth: 90 }}>
                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-navy)', letterSpacing: '-.04em' }}>{chapter.memberCount}</div>
                    <div style={{ fontSize: '.65rem', fontWeight: 700, color: 'var(--color-txt-3)', textTransform: 'uppercase', letterSpacing: '.08em' }}>Members</div>
                  </div>
                )}
                {chapter?.zone && (
                  <div style={{ background: 'var(--color-off)', borderRadius: 10, padding: '.8rem 1.2rem', textAlign: 'center', minWidth: 90 }}>
                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: '.9rem', fontWeight: 800, color: 'var(--color-navy)', letterSpacing: '-.02em' }}>{chapter.zone}</div>
                    <div style={{ fontSize: '.65rem', fontWeight: 700, color: 'var(--color-txt-3)', textTransform: 'uppercase', letterSpacing: '.08em' }}>Zone</div>
                  </div>
                )}
              </div>

              {/* Contact info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.7rem' }}>
                {chapter?.address && (
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: '.85rem', color: 'var(--color-txt-2)' }}>
                    <span style={{ fontSize: '1rem', marginTop: 1 }}>📍</span>
                    <span>{chapter.address}</span>
                  </div>
                )}
                {chapter?.email && (
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: '.85rem' }}>
                    <span>✉️</span>
                    <a href={`mailto:${chapter.email}`} style={{ color: 'var(--color-navy)', fontWeight: 600, textDecoration: 'none' }}>{chapter.email}</a>
                  </div>
                )}
                {chapter?.phone && (
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: '.85rem' }}>
                    <span>📞</span>
                    <a href={`tel:${chapter.phone}`} style={{ color: 'var(--color-navy)', fontWeight: 600, textDecoration: 'none' }}>{chapter.phone}</a>
                  </div>
                )}
                {chapter?.website && (
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: '.85rem' }}>
                    <span>🌐</span>
                    <a href={chapter.website} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-gold)', fontWeight: 600, textDecoration: 'none' }}>{chapter.website}</a>
                  </div>
                )}
              </div>
            </div>

            {/* Right: chapter image */}
            <div className="rr">
              <img
                src={chapter?.image || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=700&q=80&fit=crop'}
                alt={chapter?.name}
                style={{ width: '100%', height: 340, objectFit: 'cover', borderRadius: 14, boxShadow: 'var(--sh)' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── CHAPTER LEADERSHIP ── */}
      <section style={{ background: 'var(--color-off)' }}>
        <div className="ct" style={{ paddingTop: '3.5rem', paddingBottom: '3.5rem' }}>
          <div className="ey">Leadership</div>
          <h2 className="sh">Chapter <em>Executives</em></h2>
          <p className="sd" style={{ marginBottom: '2rem' }}>
            The executive committee leading {chapter?.name || `${stateName} Chapter`} in the current administration.
          </p>
          <div className="leader-grid">
            {leaders.map(m => (
              <div className="lcard" key={m._id}>
                <div className="lcard-img-wrap">
                  <img
                    className="lcard-img"
                    src={m.image || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80&fit=crop&crop=face'}
                    alt={m.name}
                    onError={e => { e.currentTarget.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80&fit=crop&crop=face'; }}
                  />
                </div>
                <div className="lcard-body">
                  <div className="lcard-name">{m.name}</div>
                  <div className="lcard-role">{m.title}</div>
                  {m.state && <div className="lcard-state">{m.state}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── UPCOMING EVENTS ── */}
      {events.length > 0 && (
        <section style={{ background: '#fff' }}>
          <div className="ct" style={{ paddingTop: '3rem', paddingBottom: '3rem' }}>
            <div className="ey">Events</div>
            <h2 className="sh" style={{ marginBottom: '1.5rem' }}>Upcoming <em>Events</em></h2>
            <div>
              {events.map(e => (
                <div className="erow" key={e._id}>
                  <div>
                    <div className="eday">{new Date(e.date).getDate()}</div>
                    <div className="emon">{new Date(e.date).toLocaleString('default', { month: 'short' }).toUpperCase()} {new Date(e.date).getFullYear()}</div>
                  </div>
                  <div className="einfo"><h4>{e.title}</h4><p>📍 {e.location || 'Venue TBC'}</p></div>
                  {e.type && <span className="epill">{e.type}</span>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
