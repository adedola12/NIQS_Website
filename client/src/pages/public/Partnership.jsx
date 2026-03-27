import React from 'react';
import { Link } from 'react-router-dom';
import PageHero from '../../components/common/PageHero';

const tiers = [
  {
    name: 'Platinum Partner',
    price: '₦10,000,000+',
    period: 'per annum',
    color: '#E5E4E2',
    benefits: [
      'Premier branding at all NIQS national events and conferences',
      'Exclusive naming rights for one major NIQS programme',
      'Full-page advertisement in all NIQS publications',
      'Speaking slot at the Annual Conference',
      'Logo placement on NIQS website homepage',
      'Access to NIQS membership database for recruitment',
      'VIP hospitality at all NIQS events (10 seats)',
      'Quarterly meetings with NIQS leadership',
      'Certificate of Platinum Partnership from NIQS President',
    ],
  },
  {
    name: 'Gold Partner',
    price: '₦5,000,000+',
    period: 'per annum',
    color: '#C9974A',
    benefits: [
      'Prominent branding at NIQS national events',
      'Half-page advertisement in NIQS publications',
      'Logo placement on NIQS website partners page',
      'Exhibition space at the Annual Conference',
      'Access to NIQS CPD workshops for staff training',
      'VIP hospitality at NIQS events (5 seats)',
      'Bi-annual meetings with NIQS leadership',
      'Certificate of Gold Partnership',
    ],
  },
  {
    name: 'Silver Partner',
    price: '₦2,000,000+',
    period: 'per annum',
    color: '#C0C0C0',
    benefits: [
      'Branding at selected NIQS events',
      'Quarter-page advertisement in NIQS Journal',
      'Logo placement on NIQS website partners page',
      'Complimentary conference registration (3 delegates)',
      'Newsletter mention to NIQS membership',
      'Certificate of Silver Partnership',
    ],
  },
];

const partnerLogos = [
  'Julius Berger Nigeria', 'Dangote Group', 'CCECC Nigeria', 'Federal Ministry of Works',
  'RICS', 'QSRBN', 'BMPIU', 'Federal Ministry of Housing',
];

export default function Partnership() {
  return (
    <>
      <PageHero
        title="Strategic Partnerships"
        subtitle="Partner with NIQS to shape Nigeria's built environment"
        breadcrumbs={[{ label: 'Partnership' }]}
      />

      {/* Introduction */}
      <section className="section">
        <div className="ct">
          <div className="two-col">
            <div>
              <h2 className="sh">Why Partner with NIQS?</h2>
              <p>
                The Nigerian Institute of Quantity Surveyors offers strategic partnership
                opportunities for organizations seeking to align with the leading professional
                body in construction cost management. With over 10,000 members across 37 state
                chapters, NIQS provides unparalleled access to the quantity surveying profession
                in Nigeria.
              </p>
              <p>
                Our partners benefit from extensive brand visibility, access to a highly skilled
                professional network, and the opportunity to contribute to the development of
                Nigeria's built environment. Whether you are a construction firm, financial
                institution, technology provider, or government agency, NIQS offers tailored
                partnership packages to meet your objectives.
              </p>
            </div>
            <div>
              <img
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop"
                alt="Partnership handshake"
                className="rounded-img"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Partnership Tiers */}
      <section className="section section-alt">
        <div className="ct">
          <h2 className="sh" style={{ textAlign: 'center', marginBottom: '0.5rem' }}>Partnership Tiers</h2>
          <p className="sd" style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto 2.5rem' }}>
            Choose the partnership tier that aligns with your organization's goals and budget.
          </p>

          <div className="grid-3">
            {tiers.map((tier, i) => (
              <div className="card pricing-card" key={i}>
                <div style={{ width: 60, height: 60, borderRadius: '50%', background: tier.color, margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                  {i === 0 ? '💎' : i === 1 ? '🥇' : '🥈'}
                </div>
                <h3 style={{ textAlign: 'center' }}>{tier.name}</h3>
                <div className="pricing-price" style={{ textAlign: 'center' }}>
                  <span className="pricing-amount">{tier.price}</span>
                  <span className="pricing-period">{tier.period}</span>
                </div>

                <ul className="pricing-list pricing-list-check">
                  {tier.benefits.map((b, j) => (
                    <li key={j}>{b}</li>
                  ))}
                </ul>

                <Link to="/contact" className="btn btn-gold" style={{ width: '100%', textAlign: 'center' }}>
                  Inquire Now
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partner Logos */}
      <section className="section">
        <div className="ct">
          <h2 className="sh" style={{ textAlign: 'center', marginBottom: '0.5rem' }}>Our Partners</h2>
          <p className="sd" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            Organizations that have partnered with NIQS to advance the built environment.
          </p>

          <div className="grid-4" style={{ maxWidth: 900, margin: '0 auto' }}>
            {partnerLogos.map((name, i) => (
              <div
                key={i}
                className="partner-logo-card"
                style={{
                  background: '#f5f5f5',
                  borderRadius: 8,
                  padding: '2rem 1rem',
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  color: '#555',
                }}
              >
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section cta-section">
        <div className="ct" style={{ textAlign: 'center' }}>
          <h2 className="sh">Become a Partner</h2>
          <p className="sd" style={{ maxWidth: 600, margin: '0 auto 2rem' }}>
            Interested in partnering with NIQS? Contact our partnerships team to discuss
            how we can collaborate.
          </p>
          <Link to="/contact" className="btn btn-gold">Contact Us</Link>
        </div>
      </section>
    </>
  );
}
