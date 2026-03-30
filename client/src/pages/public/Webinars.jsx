import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageHero from '../../components/common/PageHero';
import API from '../../api/axios';

const SCOPE_LABEL = { national: 'National', chapter: 'Chapter', yqsf: 'YQSF', waqsn: 'WAQSN' };
const SCOPE_COLOR = { national: '#0B1F4B', chapter: '#1a5276', yqsf: '#117a65', waqsn: '#6d3a9c' };

const PLACEHOLDER_WEBINARS = [
  {
    _id: 'w1', isUpcoming: true, scope: 'national', category: 'Technology',
    title: 'BIM for Quantity Surveyors: Practical Applications in Nigeria',
    description: 'A deep dive into how BIM is transforming quantity surveying practice — from cost modelling to procurement.',
    date: '2026-04-15T10:00:00Z', speaker: 'QS. (Dr.) Adewale Johnson, FNIQS', speakerTitle: 'Director, Apex QS Partners',
    thumbnailUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&q=80&fit=crop',
    registrationUrl: '',
  },
  {
    _id: 'w2', isUpcoming: true, scope: 'national', category: 'Sustainability',
    title: 'Sustainable Construction: The QS Perspective',
    description: "Exploring green building economics, LEED costing, and the role of QS in Nigeria's sustainability agenda.",
    date: '2026-05-20T11:00:00Z', speaker: 'QS. (Prof.) Ngozi Okafor, FNIQS', speakerTitle: 'Professor, University of Lagos',
    thumbnailUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80&fit=crop',
    registrationUrl: '',
  },
  {
    _id: 'w3', isUpcoming: false, scope: 'national', category: 'Legal',
    title: 'Dispute Resolution in Construction Contracts',
    description: 'Understanding ADR, arbitration, and adjudication in the context of Nigerian construction law.',
    date: '2025-11-10T10:00:00Z', speaker: 'QS. Barr. Ibrahim Musa, FNIQS', speakerTitle: 'Principal, Musa & Associates',
    thumbnailUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&q=80&fit=crop',
    recordingUrl: '',
  },
  {
    _id: 'w4', isUpcoming: false, scope: 'yqsf', category: 'Innovation',
    title: 'Digital Transformation in QS Practice',
    description: 'How young QS professionals can leverage technology, AI tools, and digital workflows in their work.',
    date: '2025-09-18T14:00:00Z', speaker: 'QS. Tunde Afolabi, MNIQS', speakerTitle: 'YQSF Technology Chair',
    thumbnailUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&q=80&fit=crop',
    recordingUrl: '',
  },
  {
    _id: 'w5', isUpcoming: true, scope: 'waqsn', category: 'Professional Development',
    title: 'Women in Quantity Surveying: Breaking Barriers',
    description: 'Celebrating achievements and addressing challenges facing women quantity surveyors in Nigeria.',
    date: '2026-03-08T10:00:00Z', speaker: 'QS. Amina Bello, FNIQS', speakerTitle: 'WAQSN Chair',
    thumbnailUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&q=80&fit=crop',
    registrationUrl: '',
  },
  {
    _id: 'w6', isUpcoming: false, scope: 'chapter', category: 'Practice',
    title: 'Infrastructure Projects & Value Engineering — Lagos Chapter',
    description: 'Case studies on Lagos infrastructure projects and how value engineering reduced costs.',
    date: '2025-08-22T09:00:00Z', speaker: 'QS. Chukwuemeka Nwosu, MNIQS', speakerTitle: 'Lagos Chapter Secretary',
    thumbnailUrl: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&q=80&fit=crop',
    recordingUrl: '',
  },
];

const CATEGORIES = ['All', 'Technology', 'Sustainability', 'Legal', 'Innovation', 'Practice', 'Professional Development'];

export default function Webinars() {
  const [webinars, setWebinars]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [tab, setTab]             = useState('all');     // 'all' | 'upcoming' | 'past'
  const [scope, setScope]         = useState('all');
  const [category, setCategory]   = useState('All');

  useEffect(() => {
    API.get('/webinars')
      .then(r => setWebinars(r.data?.webinars || []))
      .catch(() => setWebinars([]))
      .finally(() => setLoading(false));
  }, []);

  const isPlaceholder = webinars.length === 0;
  const source        = isPlaceholder ? PLACEHOLDER_WEBINARS : webinars;

  const filtered = source.filter(w => {
    if (tab === 'upcoming' && !w.isUpcoming) return false;
    if (tab === 'past'     &&  w.isUpcoming) return false;
    if (scope !== 'all'    &&  w.scope !== scope) return false;
    if (category !== 'All' &&  w.category !== category) return false;
    return true;
  });

  const fmt = (iso) => new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' });
  const fmtTime = (iso) => new Date(iso).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' });

  return (
    <>
      <PageHero
        label="Research &amp; Devt"
        title="Webinar Series"
        titleHighlight="Webinar Series"
        backgroundImage="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1400&q=80&fit=crop"
      />

      <section style={{ background: '#fff' }}>
        <div className="ct" style={{ paddingTop: '4rem', paddingBottom: '2rem' }}>
          <div className="ey">CPD</div>
          <h2 className="sh">NIQS <em>Webinars</em></h2>
          <p className="sd">
            Join NIQS-facilitated webinars led by experts in quantity surveying and the broader built environment.
            All sessions carry CPD points for registered members.
          </p>
          {isPlaceholder && !loading && (
            <p style={{ fontSize: '.73rem', color: 'var(--color-txt-3)', fontStyle: 'italic', marginTop: '.3rem' }}>
              Sample webinars shown — live sessions will appear once admin publishes them.
            </p>
          )}
        </div>
      </section>

      {/* Filters */}
      <section className="section-alt">
        <div className="ct" style={{ paddingTop: '2rem', paddingBottom: '5rem' }}>

          <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', marginBottom: '1.2rem' }}>
            {['all', 'upcoming', 'past'].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                padding: '6px 16px', borderRadius: 20, fontSize: '.74rem', fontWeight: 700,
                border: '1.5px solid var(--color-bdr)', cursor: 'pointer', textTransform: 'capitalize',
                background: tab === t ? 'var(--color-navy)' : '#fff',
                color:      tab === t ? '#fff' : 'var(--color-txt-3)',
              }}>{t === 'all' ? 'All Webinars' : t === 'upcoming' ? '🔴 Upcoming' : '⏺ Past Recordings'}</button>
            ))}
            <span style={{ flex: 1 }} />
            <select value={scope} onChange={e => setScope(e.target.value)} style={selStyle}>
              <option value="all">All Scopes</option>
              {Object.entries(SCOPE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <select value={category} onChange={e => setCategory(e.target.value)} style={selStyle}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Result count */}
          <div style={{ fontSize: '.74rem', color: 'var(--color-txt-3)', marginBottom: '1.2rem' }}>
            {loading ? 'Loading…' : `${filtered.length} webinar${filtered.length !== 1 ? 's' : ''} found`}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-txt-3)' }}>Loading webinars…</div>
          ) : filtered.length === 0 ? (
            <EmptyState label="No webinars match your filters." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filtered.map(w => (
                <WebinarCard key={w._id} w={w} fmt={fmt} fmtTime={fmtTime} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: '#fff' }}>
        <div className="ct" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
          <div className="ctaw">
            <h2>Suggest a <em>Topic?</em></h2>
            <p>Have a subject you'd like NIQS to address in an upcoming webinar? Let us know.</p>
            <div className="ctarow">
              <a href="/contact" className="btn bg">Contact Us</a>
              <Link to="/research" className="btn bo" style={{ color: '#fff', borderColor: 'rgba(255,255,255,.3)' }}>Research Hub</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function WebinarCard({ w, fmt, fmtTime }) {
  const scopeColor = SCOPE_COLOR[w.scope] || '#0B1F4B';
  return (
    <div style={{
      background: '#fff', border: '1px solid var(--color-bdr)', borderRadius: 14,
      display: 'flex', gap: 0, overflow: 'hidden',
      transition: 'box-shadow .2s, transform .2s',
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 30px rgba(11,31,75,.10)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = ''; }}>

      {/* Thumbnail */}
      <div style={{ width: 180, flexShrink: 0, overflow: 'hidden', position: 'relative' }}>
        <img src={w.thumbnailUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&q=70'} alt={w.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(11,31,75,.45)' }} />
        {/* Date overlay */}
        {w.date && (
          <div style={{ position: 'absolute', bottom: 10, left: 10, color: '#fff', textAlign: 'left' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-heading)', lineHeight: 1 }}>
              {new Date(w.date).getDate()}
            </div>
            <div style={{ fontSize: '.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em' }}>
              {new Date(w.date).toLocaleDateString('en-NG', { month: 'short' })}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: '1.2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '.4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '.58rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', padding: '2px 8px', borderRadius: 10, background: scopeColor, color: '#fff' }}>
            {SCOPE_LABEL[w.scope] || w.scope}
          </span>
          {w.category && (
            <span style={{ fontSize: '.58rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', padding: '2px 8px', borderRadius: 10, border: '1px solid var(--color-bdr)', color: 'var(--color-txt-3)' }}>
              {w.category}
            </span>
          )}
          <span style={{ fontSize: '.65rem', fontWeight: 700, color: w.isUpcoming ? '#dc2626' : '#6b7280', marginLeft: 'auto' }}>
            {w.isUpcoming ? '🔴 Upcoming' : '⏺ Past'}
          </span>
        </div>

        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '.95rem', color: 'var(--color-navy)', lineHeight: 1.35 }}>
          {w.title}
        </div>

        {w.description && (
          <p style={{ fontSize: '.78rem', color: 'var(--color-txt-2)', lineHeight: 1.65, margin: 0,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {w.description}
          </p>
        )}

        <div style={{ fontSize: '.74rem', color: 'var(--color-txt-3)', display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '.2rem' }}>
          {w.speaker && <span>🎤 {w.speaker}{w.speakerTitle ? ` · ${w.speakerTitle}` : ''}</span>}
          {w.date    && <span>📅 {fmt(w.date)} at {fmtTime(w.date)}</span>}
        </div>

        <div style={{ marginTop: '.4rem', display: 'flex', gap: '.6rem' }}>
          {w.isUpcoming && w.registrationUrl && (
            <a href={w.registrationUrl} target="_blank" rel="noopener noreferrer" className="btn bp"
              style={{ padding: '.5rem 1.2rem', fontSize: '.74rem', textDecoration: 'none', display: 'inline-flex' }}>
              Register →
            </a>
          )}
          {!w.isUpcoming && w.recordingUrl && (
            <a href={w.recordingUrl} target="_blank" rel="noopener noreferrer" className="btn bp"
              style={{ padding: '.5rem 1.2rem', fontSize: '.74rem', textDecoration: 'none', display: 'inline-flex' }}>
              ▶ Watch Recording
            </a>
          )}
          {!w.isUpcoming && !w.recordingUrl && (
            <span style={{ fontSize: '.72rem', color: 'var(--color-txt-3)', fontStyle: 'italic' }}>Recording coming soon</span>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ label }) {
  return (
    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-txt-3)' }}>
      <div style={{ fontSize: '2rem', marginBottom: '.8rem' }}>🎥</div>
      <div style={{ fontWeight: 700, color: 'var(--color-navy)' }}>{label}</div>
    </div>
  );
}

const selStyle = { padding: '6px 12px', borderRadius: 8, border: '1.5px solid var(--color-bdr)', fontSize: '.76rem', fontFamily: 'inherit', background: '#fff', color: 'var(--color-txt)', cursor: 'pointer' };
