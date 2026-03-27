import React from 'react';
import { Link } from 'react-router-dom';
import PageHero from '../../components/common/PageHero';

const categories = [
  {
    title: 'Probationer',
    tag: null,
    price: '₦25,000',
    period: 'Annual Dues',
    requirements: [
      'HND or B.Sc in Quantity Surveying from a recognized institution',
      'Must be registered with QSRBN or in the process of registration',
      'Two passport photographs and valid ID',
      'Completed application form with academic transcripts',
    ],
    benefits: [
      'Access to NIQS CPD events and workshops',
      'Eligibility to sit for professional examinations (GDE/TPC)',
      'NIQS membership certificate and ID card',
      'Access to the NIQS member portal',
      'Subscription to the QS Journal',
    ],
  },
  {
    title: 'Graduate Member (MNIQS)',
    tag: 'Most Popular',
    price: '₦50,000',
    period: 'Annual Dues',
    requirements: [
      'Passed the Test of Professional Competence (TPC)',
      'Minimum of 2 years post-qualification experience',
      'Registered with QSRBN',
      'Endorsed by two FNIQS members',
      'Completed application with professional portfolio',
    ],
    benefits: [
      'Full voting rights at AGM and chapter meetings',
      'Use of MNIQS designation',
      'Eligible to practice as a corporate quantity surveyor',
      'Access to reciprocity agreements with international bodies',
      'Priority access to CPD, conferences, and networking events',
      'Professional indemnity resources and guidance',
      'Listing in the NIQS directory of practitioners',
    ],
  },
  {
    title: 'Fellow (FNIQS)',
    tag: null,
    price: '₦100,000',
    period: 'Annual Dues',
    requirements: [
      'Minimum of 10 years as MNIQS in good standing',
      'Demonstrated outstanding contribution to the profession',
      'Nominated by the Fellowship Committee or NEC',
      'Evidence of leadership in QS practice, academia, or public service',
      'Approval by the National Executive Council',
    ],
    benefits: [
      'All MNIQS benefits plus Fellowship privileges',
      'Use of FNIQS designation',
      'Eligibility for NEC and NPC positions',
      'Invitation to Fellowship investiture ceremony',
      'Mentorship programme participation as a mentor',
      'Enhanced international recognition and reciprocity',
      'Voting rights on constitutional amendments',
    ],
  },
];

export default function Membership() {
  return (
    <>
      <PageHero
        title="Membership"
        subtitle="Join the largest body of Quantity Surveyors in West Africa"
        breadcrumbs={[{ label: 'Membership' }]}
      />

      {/* Membership Categories */}
      <section className="section">
        <div className="ct">
          <h2 className="sh" style={{ textAlign: 'center', marginBottom: '0.5rem' }}>Membership Categories</h2>
          <p className="sd" style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto 2.5rem' }}>
            Choose the membership category that matches your professional stage. Each level offers
            increasing benefits and recognition.
          </p>

          <div className="grid-3">
            {categories.map((cat, i) => (
              <div className={`card pricing-card ${cat.tag ? 'pricing-featured' : ''}`} key={i}>
                {cat.tag && <div className="pricing-tag">{cat.tag}</div>}
                <h3>{cat.title}</h3>
                <div className="pricing-price">
                  <span className="pricing-amount">{cat.price}</span>
                  <span className="pricing-period">{cat.period}</span>
                </div>

                <h4>Requirements</h4>
                <ul className="pricing-list">
                  {cat.requirements.map((r, j) => (
                    <li key={j}>{r}</li>
                  ))}
                </ul>

                <h4>Benefits</h4>
                <ul className="pricing-list pricing-list-check">
                  {cat.benefits.map((b, j) => (
                    <li key={j}>{b}</li>
                  ))}
                </ul>

                <Link to="/contact" className="btn btn-gold" style={{ width: '100%', textAlign: 'center' }}>
                  Apply Now
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Registration Info */}
      <section className="section section-alt">
        <div className="ct">
          <div className="two-col">
            <div>
              <h2 className="sh">How to Apply</h2>
              <ol className="steps-list">
                <li>
                  <strong>Download the Application Form</strong>
                  <p>Obtain the appropriate membership application form from the NIQS secretariat or member portal.</p>
                </li>
                <li>
                  <strong>Gather Required Documents</strong>
                  <p>Prepare your academic certificates, QSRBN registration, passport photographs, and endorsement letters.</p>
                </li>
                <li>
                  <strong>Submit Application</strong>
                  <p>Submit your completed form and documents to the National Secretariat or your state chapter.</p>
                </li>
                <li>
                  <strong>Pay Application Fee</strong>
                  <p>Make payment of the applicable registration and annual dues via the NIQS payment portal.</p>
                </li>
                <li>
                  <strong>Receive Confirmation</strong>
                  <p>Upon approval, you will receive your membership certificate, ID card, and portal access credentials.</p>
                </li>
              </ol>
            </div>
            <div>
              <h2 className="sh">Search QS Register</h2>
              <p>
                Verify a quantity surveyor's membership status and registration with NIQS. Enter
                the practitioner's name or membership number to search.
              </p>
              <div className="search-qs-placeholder" style={{ background: '#f5f5f5', borderRadius: 8, padding: '2rem', marginTop: '1rem' }}>
                <input
                  type="text"
                  placeholder="Enter name or membership number..."
                  className="input"
                  disabled
                />
                <button className="btn btn-gold" style={{ marginTop: '1rem', width: '100%' }} disabled>
                  Search Register
                </button>
                <p style={{ textAlign: 'center', marginTop: '1rem', color: '#888', fontSize: '0.85rem' }}>
                  This feature will be available soon. Please contact the Secretariat for verification.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
