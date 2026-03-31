import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import PageHero from '../../components/common/PageHero';

const fallbackPartners = [
  {
    _id: null,
    tier: 'platinum',
    name: 'Julius Berger Nigeria Plc',
    industry: 'Construction & Engineering',
    description: 'A leading construction and engineering group operating across Nigeria\'s infrastructure, energy, and building sectors.',
  },
  {
    _id: null,
    tier: 'platinum',
    name: 'Dangote Construction Ltd',
    industry: 'Infrastructure Development',
    description: 'One of Nigeria\'s foremost infrastructure conglomerates with significant investments in roads, bridges, and real estate development.',
  },
];

export default function About() {
  const [partners, setPartners]   = useState([]);
  const [loadingP, setLoadingP]   = useState(true);

  useEffect(() => {
    API.get('/partners')
      .then(res => {
        const data = res.data?.partners || res.data || [];
        setPartners(data);
      })
      .catch(() => {})
      .finally(() => setLoadingP(false));
  }, []);

  // Show up to 2 featured partners; prefer platinum, then gold; fall back to placeholders
  const featured = (() => {
    if (loadingP) return [];
    const sorted = [...partners].sort((a, b) => {
      const order = { platinum: 0, gold: 1, silver: 2, bronze: 3, associate: 4 };
      return (order[a.tier] ?? 5) - (order[b.tier] ?? 5);
    });
    return sorted.length > 0 ? sorted.slice(0, 2) : fallbackPartners;
  })();
  const isPlaceholder = !loadingP && partners.length === 0;

  return (
    <>
      {/* ── PAGE HERO ── */}
      <PageHero
        label="Who We Are"
        title="About NIQS"
        titleHighlight="NIQS"
        backgroundImage="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1400&q=80&fit=crop"
      />

      {/* ── OUR STORY ── */}
      <section style={{ background: '#fff' }}>
        <div className="ct">
          <div className="tc2">
            <div className="rl">
              <div className="ey">Our Story</div>
              <h2 className="sh">55 Years Shaping Nigeria's <em>Built Environment</em></h2>
              <p style={{ fontSize: '.9rem', lineHeight: 1.88, color: 'var(--text2)', marginBottom: '1rem' }}>
                Founded in 1969 when fewer than 20 qualified quantity surveyors existed across Nigeria, NIQS has grown into a vibrant institution of over 10,000 members, with 4,000+ corporate practitioners working across Nigeria and internationally.
              </p>
              <p style={{ fontSize: '.9rem', lineHeight: 1.88, color: 'var(--text2)', marginBottom: '1.5rem' }}>
                With chapters in all 36 states and the FCT, and reciprocity agreements with leading international QS bodies, NIQS places Nigerian professionals on the global stage.
              </p>
              <Link to="/membership" className="btn bp">Join NIQS Today</Link>
            </div>
            <div className="rr">
              <img
                src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=700&q=80&fit=crop"
                alt="Construction Nigeria"
                style={{ borderRadius: 14, width: '100%', height: 420, objectFit: 'cover', boxShadow: 'var(--sh2)' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── VISION / MISSION / VALUE ── */}
      <section style={{ background: 'var(--off)', paddingTop: 0 }}>
        <div className="ct" style={{ paddingTop: '5rem' }}>
          <div className="ey">Our Principles</div>
          <h2 className="sh">Vision, Mission &amp; <em>Values</em></h2>
          <div className="valg">
            <div className="val">
              <div className="vali">🎯</div>
              <h4>Our Vision</h4>
              <p>To be the profession responsible for total cost and procurement management for client objectives in all capital projects — from conception to commissioning, across all sectors of the economy.</p>
            </div>
            <div className="val">
              <div className="vali">🚀</div>
              <h4>Our Mission</h4>
              <p>Contributing to sustainable national development by promoting world-class cost and procurement management expertise through developing unique and distinctive professional competencies.</p>
            </div>
            <div className="val">
              <div className="vali">💎</div>
              <h4>Our Value</h4>
              <p>Value for money is our watchword. NIQS members deliver comprehensive cost management services that create demonstrable financial benefit for every client in public and private sectors.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY NIQS ── */}
      <section style={{ background: '#fff' }}>
        <div className="ct">
          <div className="tc2">
            <div className="rl">
              <img
                src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=700&q=80&fit=crop"
                alt="QS Team"
                style={{ borderRadius: 14, width: '100%', height: 370, objectFit: 'cover', boxShadow: 'var(--sh)' }}
              />
            </div>
            <div className="rr">
              <div className="ey">Why NIQS</div>
              <h2 className="sh">A Professional Body You Can <em>Trust</em></h2>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '.8rem', marginBottom: '1.5rem' }}>
                <li style={{ display: 'flex', gap: '.8rem', fontSize: '.86rem', color: 'var(--text2)' }}>
                  <span style={{ color: 'var(--gold)', fontWeight: 800, flexShrink: 0 }}>✓</span>
                  Internationally recognised qualifications and credentials
                </li>
                <li style={{ display: 'flex', gap: '.8rem', fontSize: '.86rem', color: 'var(--text2)' }}>
                  <span style={{ color: 'var(--gold)', fontWeight: 800, flexShrink: 0 }}>✓</span>
                  Access to Nigeria's largest QS professional network
                </li>
                <li style={{ display: 'flex', gap: '.8rem', fontSize: '.86rem', color: 'var(--text2)' }}>
                  <span style={{ color: 'var(--gold)', fontWeight: 800, flexShrink: 0 }}>✓</span>
                  Structured CPD programmes and webinar series
                </li>
                <li style={{ display: 'flex', gap: '.8rem', fontSize: '.86rem', color: 'var(--text2)' }}>
                  <span style={{ color: 'var(--gold)', fontWeight: 800, flexShrink: 0 }}>✓</span>
                  Strong advocacy with government and industry stakeholders
                </li>
                <li style={{ display: 'flex', gap: '.8rem', fontSize: '.86rem', color: 'var(--text2)' }}>
                  <span style={{ color: 'var(--gold)', fontWeight: 800, flexShrink: 0 }}>✓</span>
                  15+ international reciprocity agreements
                </li>
              </ul>
              <Link to="/contact" className="btn bp">Get In Touch</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── STRATEGIC PARTNERS ── */}
      <section style={{ background: 'var(--off)' }}>
        <div className="ct">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <div className="ey">Strategic Partners</div>
              <h2 className="sh" style={{ marginBottom: 0 }}>Partners in <em>Excellence</em></h2>
            </div>
            {isPlaceholder && (
              <span style={{ fontSize: '.75rem', color: 'var(--color-txt-3)', background: 'var(--color-bdr)', padding: '4px 14px', borderRadius: 20, fontWeight: 600 }}>
                Sample — replaced when admin adds partners
              </span>
            )}
          </div>
          <p className="sd" style={{ marginBottom: '2rem' }}>
            NIQS works alongside organisations committed to raising the bar in Nigeria's construction industry.
          </p>

          {loadingP ? (
            <div style={{ padding: '2rem 0', color: 'var(--color-txt-3)', fontSize: '.85rem' }}>Loading partners…</div>
          ) : (
            featured.map((p, idx) => {
              const tierLabel = p.tier ? p.tier.charAt(0).toUpperCase() + p.tier.slice(0) + ' Partner' : 'Partner';
              const badgeLabel = p.tier === 'platinum' ? '💎 Platinum Partner' : p.tier === 'gold' ? '🥇 Gold Partner' : tierLabel;

              const cardInner = (
                <div
                  className="gpc"
                  key={p._id || idx}
                  style={{ opacity: isPlaceholder ? 0.75 : 1, position: 'relative', cursor: p._id ? 'pointer' : 'default' }}
                >
                  {isPlaceholder && (
                    <span style={{ position: 'absolute', top: 10, right: 12, fontSize: '.55rem', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', background: 'rgba(201,151,74,.15)', color: 'var(--color-gold)', padding: '3px 8px', borderRadius: 4, zIndex: 1, border: '1px solid rgba(201,151,74,.3)' }}>
                      Sample
                    </span>
                  )}

                  {/* Logo / initial panel */}
                  {p.logo ? (
                    <img className="gpimg" src={p.logo} alt={p.name} style={{ objectFit: 'contain', background: '#fff', padding: '1.5rem' }} />
                  ) : (
                    <div className="gpimg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '.5rem', background: 'linear-gradient(135deg,#f0f4fb,#e8edf6)' }}>
                      <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '2.8rem', color: 'var(--color-navy)', opacity: .18 }}>{p.name[0]}</span>
                      <span style={{ fontSize: '.62rem', fontWeight: 600, color: 'var(--color-txt-3)', textTransform: 'uppercase', letterSpacing: '.08em' }}>Logo</span>
                    </div>
                  )}

                  {/* Content */}
                  <div>
                    <div className="gpbadge">{badgeLabel}</div>
                    <h4>{p.name}</h4>
                    {p.industry && (
                      <div style={{ fontSize: '.76rem', color: 'var(--color-txt-3)', fontWeight: 600, marginBottom: '.5rem', letterSpacing: '.02em' }}>{p.industry}</div>
                    )}
                    {p.description && <p>{p.description}</p>}
                    {p._id
                      ? <span className="gpl">View partner profile →</span>
                      : <span style={{ fontSize: '.8rem', color: 'var(--color-txt-3)', fontStyle: 'italic' }}>Profile available once admin adds partner details</span>
                    }
                  </div>
                </div>
              );

              return p._id
                ? <Link key={p._id} to={`/partnership/${p._id}`} style={{ textDecoration: 'none', display: 'block' }}>{cardInner}</Link>
                : <div key={idx}>{cardInner}</div>;
            })
          )}

          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <Link to="/partnership" className="btn bp">Explore All Partnership Opportunities →</Link>
          </div>
        </div>
      </section>
    </>
  );
}
