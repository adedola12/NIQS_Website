import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';

/* ── fallback data ── */
const fallbackNews = [
  {
    _id: '1', slug: 'begm-2025-notice', title: 'BEGM 2025 Notice: Registration Now Open',
    excerpt: 'The Board of Examiners invites qualified members to register before the 28 February 2025 deadline.',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=80&fit=crop',
    date: '2025-02-10', category: 'Announcement',
  },
  {
    _id: '2', slug: '2025-exam-schedule', title: '2025 Professional Examination Schedule Released',
    excerpt: 'TPC and GDE examinations slated for March 2025. Check portal for timetable and centre assignments.',
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&q=80&fit=crop',
    date: '2025-01-28', category: 'Examinations',
  },
  {
    _id: '3', slug: 'corporate-members-oct-2025', title: 'Corporate Financial Members List — October 2025',
    excerpt: 'Official list of corporate members in good financial standing as at 24th October 2025 now available.',
    image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&q=80&fit=crop',
    date: '2025-10-24', category: 'Membership',
  },
];

const fallbackEvents = [
  { _id: '1', slug: 'annual-qs-conference-2025', title: 'Annual QS Conference 2025', date: '2025-03-14', location: 'Transcorp Hilton, Abuja', time: '9:00 AM – 5:00 PM', type: 'Conference' },
  { _id: '2', slug: 'tpc-gde-exams-2025', title: 'TPC/GDE Professional Examinations', date: '2025-03-22', location: 'Nationwide Centres', time: '8:00 AM', type: 'Examination' },
  { _id: '3', slug: 'lagos-cpd-seminar', title: 'Lagos Chapter CPD Seminar', date: '2025-04-05', location: 'Eko Hotel, Lagos', time: '10:00 AM – 3:00 PM', type: 'CPD' },
];

const services = [
  { icon: '\u{1F3D7}\uFE0F', title: 'Cost Management', desc: 'Comprehensive building economics and cost planning for capital projects of all scales, from pre-design through to final account.', tag: 'Core' },
  { icon: '\u{1F4CB}', title: 'Procurement Advice', desc: 'Strategic procurement route selection and contract administration that aligns client objectives with project risk profiles.', tag: 'Core' },
  { icon: '\u2696\uFE0F', title: 'Contract Administration', desc: 'Professional oversight of valuations, variations, claims, and final accounts — ensuring fair dealing for all parties.', tag: 'Core' },
  { icon: '\u{1F4CA}', title: 'Project Monitoring', desc: 'Independent assessment of project progress and expenditure — providing clients with objective reporting and early warning of overruns.' },
  { icon: '\u{1F393}', title: 'Professional Examinations', desc: 'NIQS administers rigorous entry and upgrade examinations that uphold the standard expected of all corporate members.' },
  { icon: '\u{1F30D}', title: 'International Engagement', desc: 'Through reciprocity agreements with leading QS bodies worldwide, NIQS members enjoy access to global recognition.' },
];

const defaultTickerItems = [
  'BEGM 2025 Notice — Registration now open for qualified members',
  '2025 Professional Examinations — TPC/GDE slated for March 2025',
  'Corporate Financial Members List as at 24th October 2025',
  'Erasure of Fees Defaulting Members — Important Notice',
  'Criteria for Mature & Experience Routes to Membership',
  'Brand Materials — Download the official NIQS brand kit',
];

const heroImages = [
  { src: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80&fit=crop', alt: 'Construction site cost survey' },
  { src: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&q=80&fit=crop', alt: 'Architectural plans & take-off' },
  { src: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&q=80&fit=crop', alt: 'Quantity surveying practice' },
  { src: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80&fit=crop', alt: 'Built infrastructure' },
  { src: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=80&fit=crop', alt: 'Cost analysis & estimation' },
];

/* ── helpers ── */
function fmtDate(d) {
  try {
    return new Date(d).toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch { return d; }
}
function dayNum(d) { try { return new Date(d).getDate(); } catch { return ''; } }
function monthYear(d) {
  try { return new Date(d).toLocaleDateString('en-NG', { month: 'short', year: 'numeric' }); } catch { return ''; }
}

const fallbackPartners = [
  { _id: null, name: 'Julius Berger Nigeria Plc', industry: 'Construction & Engineering', tier: 'platinum', logo: null },
  { _id: null, name: 'Dangote Construction Ltd', industry: 'Infrastructure Development', tier: 'platinum', logo: null },
  { _id: null, name: 'CCECC Nigeria Ltd', industry: 'Civil Engineering & Roads', tier: 'platinum', logo: null },
];

const principles = [
  {
    icon: '👁️',
    label: 'Our Vision',
    title: 'A World-Class QS Profession',
    body: 'To be the foremost professional body driving excellence in quantity surveying and construction cost management across Nigeria and West Africa.',
  },
  {
    icon: '🎯',
    label: 'Our Mission',
    title: 'Advancing the Profession',
    body: 'To promote, regulate, and advance the practice of quantity surveying; protect the public interest; and develop a globally competitive pool of professionals.',
  },
  {
    icon: '⚖️',
    label: 'Our Values',
    title: 'Integrity & Excellence',
    body: 'Integrity, professionalism, innovation, inclusiveness, and service. These are the values that guide every NIQS member and every programme we deliver.',
  },
];

export default function Home() {
  const [news, setNews] = useState(fallbackNews);
  const [events, setEvents] = useState(fallbackEvents);
  const [platinumPartners, setPlatinumPartners] = useState([]);
  const [tickerItems, setTickerItems] = useState(defaultTickerItems);

  useEffect(() => {
    API.get('/news?limit=3').then(res => {
      if (res.data?.data?.length) setNews(res.data.data);
      else if (res.data?.length) setNews(res.data);
    }).catch(() => {});

    API.get('/events?limit=3&upcoming=true').then(res => {
      const data = res.data?.data || res.data || [];
      if (data.length) setEvents(data);
    }).catch(() => {});

    API.get('/partners?tier=platinum&limit=3').then(res => {
      const data = res.data?.partners || res.data || [];
      setPlatinumPartners(data.slice(0, 3));
    }).catch(() => {});

    // Load dynamic banner: site settings + upcoming events auto-appended
    Promise.all([
      API.get('/site-settings').catch(() => ({ data: {} })),
      API.get('/events?upcoming=true&limit=10').catch(() => ({ data: [] })),
    ]).then(([settingsRes, eventsRes]) => {
      const customItems = Array.isArray(settingsRes.data?.bannerItems) ? settingsRes.data.bannerItems : [];
      /* The events endpoint can return either an array or { data: [...] } depending on the route shape. */
      const rawEvts = eventsRes.data?.data ?? eventsRes.data;
      const upcomingEvts = Array.isArray(rawEvts) ? rawEvts : [];

      // Build event ticker entries for future events
      const eventItems = upcomingEvts
        .filter(e => e.date && new Date(e.date) >= new Date())
        .slice(0, 5)
        .map(e => {
          const d = new Date(e.date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
          return `${e.title} — ${d}${e.location ? ` · ${e.location}` : ''}`;
        });

      const merged = [...customItems, ...eventItems];
      if (merged.length > 0) setTickerItems(merged);
    });
  }, []);

  return (
    <>
      {/* ── TICKER ── */}
      <div className="tkbar" id="tkbar">
        <span className="tklbl">Live</span>
        <div className="tkwrap">
          <div className="ticker">
            {/* duplicate items for seamless loop */}
            {[...tickerItems, ...tickerItems].map((t, i) => (
              <span className="ti" key={i}>
                <span className="td">&#9670;</span> {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── HERO ── */}
      <div className="hero" id="heroWrap">
        {/* Centred content */}
        <div className="hc">
          <div className="hc-eyebrow">
            <div className="hc-eyebrow-dot"></div>
            Est. 1969 &nbsp;&middot;&nbsp; Chartered Professional Body
          </div>
          <div className="hc-institute">
            Nigerian Institute of <em>Quantity Surveyors</em>
          </div>
          <h1 className="hc-title">
            Advancing Nigeria's<br />Built <em>Environment</em>
          </h1>
          <p className="hc-sub">
            The premier professional body for quantity surveying in Nigeria — setting the gold standard for construction cost management, procurement, and contract administration across 10,000+ professionals in every state.
          </p>
          <div className="hc-btns">
            <Link to="/membership" className="hc-btn-p">
              Become a Member &nbsp;&rarr;
            </Link>
            <Link to="/about" className="hc-btn-s">
              Learn More
            </Link>
          </div>
        </div>

        {/* Image strip */}
        <div className="hstrip">
          {heroImages.map((img, i) => (
            <div className="hstrip-img" key={i}>
              <img
                src={img.src}
                alt={img.alt}
                loading={i < 3 ? 'eager' : 'lazy'}
              />
              {i === 2 && <div className="hstrip-badge">&#128202; Quantity Surveyors</div>}
            </div>
          ))}
        </div>

        {/* Stat bar */}
        <div className="hstat-row">
          <div className="hstat"><div className="hstat-n">10,000+</div><div className="hstat-l">Total Members</div></div>
          <div className="hstat"><div className="hstat-n">4,000+</div><div className="hstat-l">Corporate QS</div></div>
          <div className="hstat"><div className="hstat-n">37</div><div className="hstat-l">State Chapters</div></div>
          <div className="hstat"><div className="hstat-n">56</div><div className="hstat-l">Years of Excellence</div></div>
          <div className="hstat"><div className="hstat-n">15+</div><div className="hstat-l">International Agreements</div></div>
        </div>
      </div>

      {/* ── VISION / MISSION / VALUES ── */}
      <section style={{ background: 'var(--color-off)' }}>
        <div className="ct" style={{ paddingTop: '5rem', paddingBottom: '5rem' }}>
          <div style={{ textAlign: 'center', maxWidth: 560, margin: '0 auto 3rem' }}>
            <div className="ey" style={{ justifyContent: 'center' }}>Who We Are</div>
            <h2 className="sh">Principles That <em>Guide Us</em></h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {principles.map((p, i) => (
              <div
                key={i}
                className={`reveal d${i + 1}`}
                style={{
                  background: i === 1
                    ? 'linear-gradient(145deg, var(--color-navy), var(--color-navy-3, #1a3280))'
                    : '#fff',
                  borderRadius: 18,
                  padding: '2.2rem 2rem',
                  border: i === 1 ? 'none' : '1px solid var(--color-bdr)',
                  boxShadow: i === 1 ? '0 12px 40px rgba(11,31,75,.22)' : '0 2px 12px rgba(11,31,75,.06)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* subtle grid texture on navy card */}
                {i === 1 && (
                  <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px)', backgroundSize: '44px 44px' }} />
                )}
                {/* gold accent line on top */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, var(--color-gold), var(--color-gold-2, #D9AB60))', borderRadius: '18px 18px 0 0' }} />
                <div style={{ fontSize: '2.4rem', marginBottom: '1.2rem', position: 'relative' }}>{p.icon}</div>
                <div style={{ fontSize: '.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--color-gold)', marginBottom: '.5rem', position: 'relative' }}>{p.label}</div>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.35rem', color: i === 1 ? '#fff' : 'var(--color-navy)', marginBottom: '1rem', letterSpacing: '-.025em', lineHeight: 1.2, position: 'relative' }}>{p.title}</div>
                <p style={{ fontSize: '1rem', color: i === 1 ? 'rgba(255,255,255,.82)' : 'var(--color-txt-2)', lineHeight: 1.8, margin: 0, position: 'relative' }}>{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section style={{ background: '#fff' }}>
        <div className="ct">
          <div className="ey">What We Do</div>
          <h2 className="sh">Professional Services &amp; <em>Standards</em></h2>
          <p className="sd">
            NIQS regulates and advances quantity surveying practice in Nigeria — from cost planning to procurement, across all sectors of the built environment.
          </p>
          <div className="svc-grid">
            {services.map((s, i) => (
              <div className={`svc reveal${i > 0 ? ` d${i}` : ''}`} key={i}>
                {s.tag && <span className="svc-tag">{s.tag}</span>}
                <div className="svc-ico">{s.icon}</div>
                <div className="svc-t">{s.title}</div>
                <div className="svc-d">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NEWS ── */}
      <section style={{ background: 'var(--color-off)' }}>
        <div className="ct">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div className="ey">Latest</div>
              <h2 className="sh" style={{ marginBottom: 0 }}>News &amp; <em>Announcements</em></h2>
            </div>
            <Link to="/news" className="btn bo">View All &rarr;</Link>
          </div>
          <div className="tc3">
            {news.map((n, i) => (
              <Link
                to={`/news/${n.slug}`}
                className={`card reveal${i > 0 ? ` d${i}` : ''}`}
                key={n._id}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div className="card-img-wrap">
                  <img
                    className="card-img"
                    src={n.image || 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=80&fit=crop'}
                    alt={n.title}
                  />
                </div>
                <div className="card-body">
                  <div className="card-tag">{n.category || 'News'}</div>
                  <div className="card-title">{n.title}</div>
                  <div className="card-text">{n.excerpt}</div>
                  <div className="card-date">{fmtDate(n.date || n.createdAt)}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── EVENTS ── */}
      <section style={{ background: '#fff' }}>
        <div className="ct">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div className="ey">Calendar</div>
              <h2 className="sh" style={{ marginBottom: 0 }}>Upcoming <em>Events</em></h2>
            </div>
            <Link to="/events" className="btn bo">Full Calendar &rarr;</Link>
          </div>
          <div className="evtl">
            {events.map((e, i) => (
              <Link
                to={`/events/${e.slug}`}
                className={`erow reveal d${i + 1}`}
                key={e._id}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div>
                  <div className="eday">{dayNum(e.date)}</div>
                  <div className="emon">{monthYear(e.date)}</div>
                </div>
                <div className="einfo">
                  <h4>{e.title}</h4>
                  <p>&#128205; {e.location}{e.time ? ` \u00A0\u00B7\u00A0 ${e.time}` : ''}</p>
                </div>
                <span className="epill">{e.type}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLATINUM PARTNERS ── */}
      {(() => {
        const displayPartners = platinumPartners.length > 0 ? platinumPartners : fallbackPartners;
        const isPlaceholder = platinumPartners.length === 0;
        return (
          <section style={{ background: 'var(--color-off)' }}>
            <div className="ct" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div className="ey">Our Network</div>
                  <h2 className="sh" style={{ marginBottom: 0 }}>Platinum <em>Partners</em></h2>
                </div>
                <Link to="/partnership" className="btn bo">All Partners &rarr;</Link>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.2rem' }}>
                {displayPartners.map((p, idx) => {
                  const card = (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.8rem', padding: '1.5rem', background: '#fff', borderRadius: 14, border: `1px solid ${isPlaceholder ? 'var(--color-bdr)' : 'var(--color-bdr)'}`, boxShadow: '0 1px 4px rgba(0,0,0,.05)', opacity: isPlaceholder ? 0.65 : 1, position: 'relative' }}>
                      {isPlaceholder && (
                        <span style={{ position: 'absolute', top: 10, right: 10, fontSize: '.58rem', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', background: 'var(--color-bdr)', color: 'var(--color-txt-3)', padding: '2px 7px', borderRadius: 4 }}>Sample</span>
                      )}
                      <div style={{ height: 56, width: 56, borderRadius: 10, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--color-bdr)' }}>
                        {p.logo
                          ? <img src={p.logo} alt={p.name} style={{ height: 50, maxWidth: '100%', objectFit: 'contain' }} />
                          : <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.4rem', color: '#d1d5db' }}>{p.name[0]}</span>
                        }
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '.9rem', color: 'var(--color-navy)' }}>{p.name}</div>
                        {p.industry && <div style={{ fontSize: '.75rem', color: 'var(--color-txt-3)', marginTop: 2 }}>{p.industry}</div>}
                      </div>
                    </div>
                  );
                  return p._id
                    ? <Link key={p._id} to={`/partnership/${p._id}`} style={{ textDecoration: 'none' }}>{card}</Link>
                    : <div key={idx}>{card}</div>;
                })}
              </div>
              {isPlaceholder && (
                <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '.8rem', color: 'var(--color-txt-3)' }}>
                  Partner logos appear here once added by the admin. <Link to="/contact" style={{ color: 'var(--color-gold)', fontWeight: 600 }}>Enquire about partnership →</Link>
                </p>
              )}
            </div>
          </section>
        );
      })()}

      {/* ── QUOTE ── */}
      <section style={{ background: '#fff', padding: '4rem 0' }}>
        <div className="ct">
          <div className="qblock">
            <div className="qtext">
              &ldquo;The Nigerian Institute of Quantity Surveyors remains committed to producing world-class professionals who will drive the sustainable development of our nation&rsquo;s built environment.&rdquo;
            </div>
            <div className="qattr">— The President, Nigerian Institute of Quantity Surveyors</div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ background: '#fff' }}>
        <div className="ct">
          <div className="ctaw">
            <h2>Ready to Join <em>NIQS?</em></h2>
            <p>Join 10,000+ professionals and unlock examinations, CPD, networking, and career growth across Nigeria and beyond.</p>
            <div className="ctarow">
              <Link to="/membership" className="btn bg">Apply for Membership</Link>
              <Link
                to="/contact"
                className="btn"
                style={{ background: 'rgba(255,255,255,.12)', color: '#fff', border: '1.5px solid rgba(255,255,255,.25)' }}
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
