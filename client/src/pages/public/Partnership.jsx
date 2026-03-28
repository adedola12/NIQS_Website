import React from 'react';
import { Link } from 'react-router-dom';
import PageHero from '../../components/common/PageHero';

const GOLD_PARTNERS = [
  {
    name: 'Julius Berger Nigeria Plc',
    tier: 'Platinum Partner',
    desc: 'A leading construction and engineering group operating across Nigeria\'s infrastructure, energy, and building sectors. Proud Platinum Partner of NIQS.',
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=260&fit=crop',
    link: '#',
  },
  {
    name: 'Dangote Industries Limited',
    tier: 'Gold Partner',
    desc: 'One of Nigeria\'s largest conglomerates with significant investments across construction, cement, and real estate development throughout West Africa.',
    image: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=400&h=260&fit=crop',
    link: '#',
  },
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

const logoNames = [
  'Julius Berger', 'Dangote Group', 'CCECC Nigeria', 'Setraco',
  'QSRBN', 'FMW&H', 'BMPIU', 'RICS',
  'World Bank', 'AfDB',
];

export default function Partnership() {
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

      {/* Featured Partners */}
      <section className="section-alt">
        <div className="ct" style={{ paddingTop: '5rem', paddingBottom: '5rem' }}>
          <div style={{ marginBottom: '2.5rem' }}>
            <div className="ey">Featured Partners</div>
            <h2 className="sh">Our <em>Partners</em></h2>
          </div>

          {GOLD_PARTNERS.map((p, i) => (
            <div className="gpc" key={i}>
              <img src={p.image} alt={p.name} className="gpimg" />
              <div>
                <span className="gpbadge">{p.tier}</span>
                <h4>{p.name}</h4>
                <p>{p.desc}</p>
                <a href={p.link} className="gpl">View profile →</a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tiers */}
      <section style={{ background: '#fff' }}>
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

      {/* Partner Logos */}
      <section className="section-alt">
        <div className="ct" style={{ paddingTop: '5rem', paddingBottom: '5rem' }}>
          <div style={{ textAlign: 'center', maxWidth: 520, margin: '0 auto 2.5rem' }}>
            <div className="ey" style={{ justifyContent: 'center' }}>Our Network</div>
            <h2 className="sh">Trusted by <em>Industry Leaders</em></h2>
          </div>

          <div className="plogos">
            {logoNames.map((name, i) => (
              <div className="plogo" key={i} title={name}>
                <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '.72rem', color: 'var(--color-txt-2)', padding: '1rem', textAlign: 'center', lineHeight: 1.3 }}>{name}</span>
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
