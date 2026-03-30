import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import PageHero from '../../components/common/PageHero';

const tierColors = {
  platinum: '#6b7280',
  gold:     '#C9974A',
  silver:   '#9ca3af',
  bronze:   '#b45309',
  associate:'#2563EB',
};

const fallbackPlatinum = [
  {
    _id: null,
    name: 'Julius Berger Nigeria Plc',
    tier: 'platinum',
    logo: null,
    industry: 'Construction & Engineering',
    description: 'A leading construction and engineering group operating across Nigeria\'s infrastructure, energy, and building sectors.',
  },
  {
    _id: null,
    name: 'Dangote Construction Ltd',
    tier: 'platinum',
    logo: null,
    industry: 'Infrastructure Development',
    description: 'One of Nigeria\'s foremost infrastructure conglomerates with significant investments in roads, bridges, and real estate development.',
  },
  {
    _id: null,
    name: 'CCECC Nigeria Ltd',
    tier: 'platinum',
    logo: null,
    industry: 'Civil Engineering & Roads',
    description: 'A major civil engineering contractor delivering landmark road, rail, and building projects across West Africa.',
  },
];

const fallbackOthers = [
  { _id: null, name: 'AECOM Nigeria', tier: 'gold', logo: null, industry: 'Engineering Consultancy' },
  { _id: null, name: 'Setraco Nigeria Ltd', tier: 'gold', logo: null, industry: 'Roads & Civil Works' },
  { _id: null, name: 'Craneburg Construction', tier: 'silver', logo: null, industry: 'Building Construction' },
  { _id: null, name: 'RMB Nigeria', tier: 'silver', logo: null, industry: 'Project Finance' },
  { _id: null, name: 'Structon Group', tier: 'bronze', logo: null, industry: 'Structural Engineering' },
  { _id: null, name: 'QSRBN', tier: 'associate', logo: null, industry: 'Regulatory Body' },
];

const tiers = [
  {
    name: 'Platinum',
    price: '₦10,000,000+',
    period: 'per annum',
    platinum: true,
    icon: '💎',
    benefits: [
      'Premier branding at all NIQS national events',
      'Exclusive naming rights for one major NIQS programme',
      'Full-page advertisement in all NIQS publications',
      'Speaking slot at the Annual Conference',
      'Logo on NIQS website homepage',
      'Access to NIQS membership database for recruitment',
      'VIP hospitality at all NIQS events (10 seats)',
      'Quarterly meetings with NIQS leadership',
    ],
  },
  {
    name: 'Gold',
    price: '₦5,000,000+',
    period: 'per annum',
    platinum: false,
    icon: '🥇',
    benefits: [
      'Prominent branding at NIQS national events',
      'Half-page advertisement in NIQS publications',
      'Logo on NIQS website partners page',
      'Exhibition space at the Annual Conference',
      'Access to NIQS CPD workshops for staff training',
      'VIP hospitality at NIQS events (5 seats)',
      'Bi-annual meetings with NIQS leadership',
    ],
  },
  {
    name: 'Silver',
    price: '₦2,000,000+',
    period: 'per annum',
    platinum: false,
    icon: '🥈',
    benefits: [
      'Branding at selected NIQS events',
      'Quarter-page advertisement in NIQS Journal',
      'Logo on NIQS website partners page',
      'Complimentary conference registration (3 delegates)',
      'Newsletter mention to NIQS membership',
      'Certificate of Silver Partnership',
    ],
  },
];

export default function Partnership() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/partners')
      .then(res => {
        const data = res.data?.partners || res.data || [];
        setPartners(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const dbPlatinum = partners.filter(p => p.tier === 'platinum');
  const dbOthers   = partners.filter(p => p.tier !== 'platinum');

  const platinum        = dbPlatinum.length > 0 ? dbPlatinum : (!loading ? fallbackPlatinum : []);
  const others          = dbOthers.length   > 0 ? dbOthers   : (!loading ? fallbackOthers   : []);
  const isPlaceholder   = !loading && partners.length === 0;

  return (
    <>
      <PageHero
        label="Partner With Us"
        title="Strategic Partnerships"
        titleHighlight="Partnerships"
        backgroundImage="https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1400&q=80&fit=crop"
      />

      {/* Intro */}
      <section style={{ background: '#fff' }}>
        <div className="ct" style={{ paddingTop: '5rem', paddingBottom: '5rem' }}>
          <div className="tc2">
            <div>
              <div className="ey">Why Partner</div>
              <h2 className="sh">Partner with Nigeria's <em>Leading QS Body</em></h2>
              <p className="sd" style={{ marginBottom: '1.2rem' }}>
                The Nigerian Institute of Quantity Surveyors offers strategic partnership
                opportunities for organisations seeking to align with the leading professional
                body in construction cost management.
              </p>
              <p className="sd" style={{ marginBottom: '1.2rem' }}>
                With over 10,000 members across 37 state chapters, NIQS provides unparalleled
                access to the quantity surveying profession in Nigeria and across West Africa.
              </p>
              <p className="sd" style={{ marginBottom: '2rem' }}>
                Whether you are a construction firm, financial institution, technology provider,
                or government agency, NIQS offers tailored packages to meet your objectives.
              </p>
              <Link to="/contact" className="btn bg">Enquire Now</Link>
            </div>
            <div>
              <img
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=700&q=80&fit=crop"
                alt="Partnership handshake"
                style={{ width: '100%', borderRadius: 14, objectFit: 'cover', border: '1px solid var(--color-bdr)' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Partners — Platinum */}
      {!loading && platinum.length > 0 && (
        <section className="section-alt">
          <div className="ct" style={{ paddingTop: '5rem', paddingBottom: '5rem' }}>
            <div style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div className="ey">Platinum Partners</div>
                <h2 className="sh" style={{ marginBottom: 0 }}>Our <em>Premier Partners</em></h2>
              </div>
              {isPlaceholder && (
                <span style={{ fontSize: '.78rem', color: 'var(--color-txt-3)', background: 'var(--color-bdr)', padding: '4px 12px', borderRadius: 6, fontWeight: 600 }}>Sample — replaced when admin adds partners</span>
              )}
            </div>

            {platinum.map((p, idx) => (
              <div className="gpc" key={p._id || idx} style={{ opacity: isPlaceholder ? 0.7 : 1 }}>
                {p.logo ? (
                  <img src={p.logo} alt={p.name} className="gpimg" style={{ objectFit: 'contain', background: '#fff', padding: '1rem' }} />
                ) : (
                  <div className="gpimg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-off-2)' }}>
                    <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '2rem', color: 'var(--color-bdr)' }}>{p.name[0]}</span>
                  </div>
                )}
                <div>
                  <span className="gpbadge">Platinum Partner</span>
                  <h4 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.2rem', color: 'var(--color-navy)', margin: '.5rem 0 .6rem' }}>{p.name}</h4>
                  {p.description && <p style={{ color: 'var(--color-txt-2)', fontSize: '.92rem', lineHeight: 1.75, marginBottom: '1rem' }}>{p.description}</p>}
                  {p._id
                    ? <Link to={`/partnership/${p._id}`} className="gpl">View profile →</Link>
                    : <span style={{ fontSize: '.82rem', color: 'var(--color-txt-3)', fontStyle: 'italic' }}>Profile available once admin adds details</span>
                  }
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* All Other Partners */}
      {!loading && others.length > 0 && (
        <section style={{ background: '#fff' }}>
          <div className="ct" style={{ paddingTop: '5rem', paddingBottom: '5rem' }}>
            <div style={{ marginBottom: '2.5rem' }}>
              <div className="ey">Our Network</div>
              <h2 className="sh">All <em>Partner Organisations</em></h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.2rem' }}>
              {others.map((p, idx) => {
                const tc = tierColors[p.tier] || '#6b7280';
                const cardContent = (
                  <div style={{ opacity: isPlaceholder ? 0.7 : 1, textDecoration: 'none', display: 'block', border: '1px solid var(--color-bdr)', borderRadius: 12, overflow: 'hidden', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,.06)', position: 'relative' }}>
                    {isPlaceholder && (
                      <span style={{ position: 'absolute', top: 8, right: 8, fontSize: '.55rem', fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', background: 'var(--color-bdr)', color: 'var(--color-txt-3)', padding: '2px 6px', borderRadius: 4, zIndex: 1 }}>Sample</span>
                    )}
                    {p.logo ? (
                      <div style={{ height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid var(--color-bdr)', padding: '1rem', background: '#f9fafb' }}>
                        <img src={p.logo} alt={p.name} style={{ maxHeight: 70, maxWidth: '100%', objectFit: 'contain' }} />
                      </div>
                    ) : (
                      <div style={{ height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-off)', borderBottom: '1px solid var(--color-bdr)' }}>
                        <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '2rem', color: 'var(--color-bdr)' }}>{p.name[0]}</span>
                      </div>
                    )}
                    <div style={{ padding: '1rem' }}>
                      <span style={{ display: 'inline-block', marginBottom: '.4rem', padding: '2px 10px', borderRadius: 20, fontSize: '.68rem', fontWeight: 700, background: `${tc}18`, color: tc, textTransform: 'capitalize', border: `1px solid ${tc}30` }}>
                        {p.tier}
                      </span>
                      <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '.95rem', color: 'var(--color-navy)', marginBottom: '.3rem' }}>{p.name}</div>
                      {p.industry && <div style={{ fontSize: '.78rem', color: 'var(--color-txt-3)' }}>{p.industry}</div>}
                    </div>
                  </div>
                );
                return p._id
                  ? <Link key={p._id} to={`/partnership/${p._id}`} style={{ textDecoration: 'none' }}>{cardContent}</Link>
                  : <div key={idx}>{cardContent}</div>;
              })}
            </div>

            {isPlaceholder && (
              <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '.85rem', color: 'var(--color-txt-3)' }}>
                These are sample entries. Real partner profiles will appear here once added by the admin.
              </p>
            )}
          </div>
        </section>
      )}

      {/* Tiers */}
      <section className="section-alt">
        <div className="ct" style={{ paddingTop: '5rem', paddingBottom: '5rem' }}>
          <div style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto 3rem' }}>
            <div className="ey" style={{ justifyContent: 'center' }}>Partnership Tiers</div>
            <h2 className="sh">Choose Your <em>Partnership Level</em></h2>
            <p className="sd" style={{ maxWidth: '100%' }}>
              Choose the tier that aligns with your organisation's goals and budget. All partners
              receive formal certification and exclusive benefits.
            </p>
          </div>

          <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {tiers.map((tier, i) => (
              <div className={`ptcard${tier.platinum ? ' ptplat' : ''}`} key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.2rem' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ fontSize: '2rem' }}>{tier.icon}</div>
                    <div>
                      <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.15rem', color: 'var(--color-navy)', letterSpacing: '-.03em' }}>{tier.name} Partner</div>
                      <div style={{ fontSize: '.72rem', color: 'var(--color-txt-3)' }}>{tier.period}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.4rem', color: tier.platinum ? 'var(--color-gold)' : 'var(--color-navy)', letterSpacing: '-.04em' }}>{tier.price}</div>
                    <Link to="/contact" className="btn bg" style={{ marginTop: '.5rem', padding: '6px 18px', fontSize: '.76rem' }}>Inquire</Link>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '.35rem' }}>
                  {tier.benefits.map((b, j) => (
                    <div key={j} style={{ display: 'flex', gap: '.5rem', alignItems: 'flex-start', fontSize: '.8rem', color: 'var(--color-txt-2)', lineHeight: 1.5 }}>
                      <span style={{ color: 'var(--color-gold)', fontWeight: 800, flexShrink: 0 }}>✓</span>
                      {b}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: '#fff' }}>
        <div className="ct" style={{ paddingTop: '5rem', paddingBottom: '5rem' }}>
          <div className="ctaw">
            <h2>Become a <em>Strategic Partner</em></h2>
            <p>
              Interested in partnering with NIQS? Contact our partnerships team to discuss
              how your organisation can benefit from alignment with Nigeria's foremost QS body.
            </p>
            <div className="ctarow">
              <Link to="/contact" className="btn bg">Contact Us Today</Link>
              <a href="mailto:partnerships@niqs.org.ng" className="btn bo" style={{ color: '#fff', borderColor: 'rgba(255,255,255,.3)' }}>partnerships@niqs.org.ng</a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
