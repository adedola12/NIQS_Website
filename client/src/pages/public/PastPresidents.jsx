import { useState, useEffect } from 'react';
import PageHero from '../../components/common/PageHero';
import API from '../../api/axios';

/* ── Placeholder portraits — diverse face-crop images ── */
const FALLBACK = [
  { _id: '1',  name: 'Surv. [President Name], FNIQS', term: '2020 – 2024', info: 'Immediate Past President', linkedIn: '', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80&fit=crop&crop=face', order: 0 },
  { _id: '2',  name: 'Surv. [President Name], FNIQS', term: '2016 – 2020', info: 'Past President',           linkedIn: '', image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&q=80&fit=crop&crop=face', order: 1 },
  { _id: '3',  name: 'Surv. [President Name], FNIQS', term: '2012 – 2016', info: 'Past President',           linkedIn: '', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80&fit=crop&crop=face', order: 2 },
  { _id: '4',  name: 'Surv. [President Name], FNIQS', term: '2008 – 2012', info: 'Past President',           linkedIn: '', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&q=80&fit=crop&crop=face', order: 3 },
  { _id: '5',  name: 'Surv. [President Name], FNIQS', term: '2004 – 2008', info: 'Past President',           linkedIn: '', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80&fit=crop&crop=face', order: 4 },
  { _id: '6',  name: 'Surv. [President Name], FNIQS', term: '2000 – 2004', info: 'Past President',           linkedIn: '', image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&q=80&fit=crop&crop=face', order: 5 },
  { _id: '7',  name: 'Surv. [President Name], FNIQS', term: '1996 – 2000', info: 'Past President',           linkedIn: '', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80&fit=crop&crop=face', order: 6 },
  { _id: '8',  name: 'Surv. [President Name], FNIQS', term: '1992 – 1996', info: 'Past President',           linkedIn: '', image: 'https://images.unsplash.com/photo-1480429370139-e0132c086e2a?w=200&q=80&fit=crop&crop=face', order: 7 },
  { _id: '9',  name: 'Surv. [President Name], FNIQS', term: '1988 – 1992', info: 'Past President',           linkedIn: '', image: 'https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?w=200&q=80&fit=crop&crop=face', order: 8 },
  { _id: '10', name: 'Surv. [President Name], FNIQS', term: '1984 – 1988', info: 'Past President',           linkedIn: '', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80&fit=crop&crop=face', order: 9 },
  { _id: '11', name: 'Surv. [President Name], FNIQS', term: '1980 – 1984', info: 'Past President',           linkedIn: '', image: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=200&q=80&fit=crop&crop=face', order: 10 },
  { _id: '12', name: 'Surv. [President Name], FNIQS', term: '1969 – 1980', info: 'Founding President',       linkedIn: '', image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&q=80&fit=crop&crop=face', order: 11 },
];

const DEFAULT_PORTRAIT = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80&fit=crop&crop=face';

/* LinkedIn SVG icon — shown on hover if URL is set */
function LinkedInIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" style={{ display: 'inline', marginLeft: 4, verticalAlign: 'middle', opacity: 0.7 }}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

export default function PastPresidents() {
  const [presidents, setPresidents] = useState(FALLBACK);

  useEffect(() => {
    API.get('/past-presidents')
      .then(res => {
        const data = res.data;
        if (Array.isArray(data) && data.length > 0) setPresidents(data);
      })
      .catch(() => {});
  }, []);

  return (
    <>
      <PageHero
        label="Our History"
        title="Past Presidents"
        titleHighlight="Presidents"
        backgroundImage="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1400&q=80&fit=crop"
      />

      <section style={{ background: '#fff' }}>
        <div className="ct" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
          <div className="ey">1969 — Present</div>
          <h2 className="sh">Presidents Who Shaped <em>NIQS</em></h2>
          <p className="sd" style={{ marginBottom: '3rem' }}>
            Since our founding in 1969, NIQS has been led by distinguished quantity surveyors
            who each contributed uniquely to the growth of the profession.
          </p>

          <div className="pp-grid">
            {presidents.map(p => (
              <div className="ppcard" key={p._id}>
                {/* Circular portrait */}
                <div className="ppcard-img-wrap">
                  <img
                    src={p.image || DEFAULT_PORTRAIT}
                    alt={p.name}
                    onError={e => { e.currentTarget.src = DEFAULT_PORTRAIT; }}
                  />
                </div>

                {/* Name — clickable if linkedIn URL is set */}
                <div className="ppcard-name">
                  {p.linkedIn ? (
                    <a
                      href={p.linkedIn}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="View LinkedIn Profile"
                      style={{
                        color: 'var(--color-navy)',
                        textDecoration: 'none',
                        borderBottom: '1px solid var(--color-bdr-gold)',
                        paddingBottom: 1,
                        cursor: 'pointer',
                      }}
                    >
                      {p.name}<LinkedInIcon />
                    </a>
                  ) : (
                    p.name
                  )}
                </div>

                {/* Term in gold */}
                <div className="ppcard-term">{p.term}</div>

                {/* Optional note */}
                {p.info && <div className="ppcard-info">{p.info}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
