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

const tickerItems = [
  'BEGM 2025 Notice — Registration now open for qualified members',
  '2025 Professional Examinations — TPC/GDE slated for March 2025',
  'Corporate Financial Members List as at 24th October 2025',
  'Erasure of Fees Defaulting Members — Important Notice',
  'Criteria for Mature & Experience Routes to Membership',
  'Brand Materials — Download the official NIQS brand kit',
];

const heroImages = [
  { src: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80&fit=crop', alt: 'Construction' },
  { src: 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=600&q=80&fit=crop', alt: 'Conference' },
  { src: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=600&q=80&fit=crop', alt: 'Professionals' },
  { src: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80&fit=crop', alt: 'Infrastructure' },
  { src: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&q=80&fit=crop', alt: 'QS Practice' },
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

export default function Home() {
  const [news, setNews] = useState(fallbackNews);
  const [events, setEvents] = useState(fallbackEvents);

  useEffect(() => {
    API.get('/news?limit=3').then(res => {
      if (res.data?.data?.length) setNews(res.data.data);
      else if (res.data?.length) setNews(res.data);
    }).catch(() => {});

    API.get('/events?limit=3&upcoming=true').then(res => {
      if (res.data?.data?.length) setEvents(res.data.data);
      else if (res.data?.length) setEvents(res.data);
    }).catch(() => {});
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
            Est. 1969 &nbsp;&middot;&nbsp; Nigeria's Premier QS Body
          </div>
          <h1 className="hc-title">
            Advancing Nigeria's<br />Built <em>Environment</em>
          </h1>
          <p className="hc-sub">
            Setting the gold standard for construction cost management and procurement excellence. Connecting 10,000+ professionals across every state in Nigeria.
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
              {i === 2 && <div className="hstrip-badge">&#128247; Professionals</div>}
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

      {/* ── STATS STRIP ── */}
      <div className="strip">
        <div className="ct">
          <div className="strip-inner">
            <div className="strip-item"><div className="strip-num">4,000+</div><div className="strip-lbl">Corporate Qualified Practitioners</div></div>
            <div className="strip-item"><div className="strip-num">1969</div><div className="strip-lbl">Year of Establishment</div></div>
            <div className="strip-item"><div className="strip-num">37</div><div className="strip-lbl">State Chapters &amp; FCT</div></div>
            <div className="strip-item"><div className="strip-num">15+</div><div className="strip-lbl">International Reciprocity Agreements</div></div>
          </div>
        </div>
      </div>

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
              <div className={`svc${i > 0 ? ` d${i}` : ''}`} key={i}>
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
      <section style={{ background: 'var(--off)' }}>
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
                className={`card${i > 0 ? ` d${i}` : ''}`}
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
                className={`erow${i > 0 ? ` d${i}` : ''}`}
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

      {/* ── QUOTE ── */}
      <section style={{ background: 'var(--off)', padding: '4rem 0' }}>
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
