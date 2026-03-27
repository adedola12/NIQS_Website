import React from 'react';
import { Link } from 'react-router-dom';
import PageHero from '../../components/common/PageHero';

const publications = [
  { title: 'Nigerian Journal of Quantity Surveying', type: 'Journal', frequency: 'Bi-annual', description: 'The flagship peer-reviewed journal of NIQS publishing original research in quantity surveying, cost management, and construction economics.' },
  { title: 'NIQS Standard Method of Measurement', type: 'Standard', frequency: 'Updated periodically', description: 'The definitive guide for measurement of building works in Nigeria, aligned with international best practices.' },
  { title: 'Annual Report & Accounts', type: 'Report', frequency: 'Annual', description: 'Comprehensive report on NIQS activities, financial statements, and strategic outlook.' },
  { title: 'Construction Cost Index', type: 'Index', frequency: 'Quarterly', description: 'Quarterly publication tracking construction cost trends and material price indices across Nigeria.' },
  { title: 'QS Practice Guide', type: 'Guide', frequency: 'Updated periodically', description: 'Practical guide for quantity surveying practitioners covering best practices, templates, and case studies.' },
];

const webinars = [
  { title: 'BIM for Quantity Surveyors: Practical Applications', date: '2026-04-15', speaker: 'QS. (Dr.) Adewale Johnson, FNIQS' },
  { title: 'Sustainable Construction: The QS Perspective', date: '2026-05-20', speaker: 'QS. (Prof.) Ngozi Okafor, FNIQS' },
  { title: 'Dispute Resolution in Construction Contracts', date: '2026-06-10', speaker: 'QS. Barr. Ibrahim Musa, FNIQS' },
  { title: 'Digital Transformation in QS Practice', date: '2026-07-18', speaker: 'QS. Tunde Afolabi, MNIQS' },
];

export default function Research() {
  return (
    <>
      <PageHero
        title="CPD & Research"
        subtitle="Continuing professional development and scholarly resources"
        breadcrumbs={[{ label: 'CPD & Research' }]}
      />

      {/* CPD Overview */}
      <section className="section">
        <div className="ct">
          <div className="two-col">
            <div>
              <h2 className="sh">Continuing Professional Development</h2>
              <p>
                NIQS is committed to the continuous professional development of its members.
                Through a structured CPD framework, the Institute ensures that quantity surveyors
                in Nigeria maintain and enhance their knowledge, skills, and competence throughout
                their careers.
              </p>
              <p>
                Members are required to accumulate a minimum of 20 CPD hours annually through
                approved activities including workshops, seminars, conferences, webinars, and
                self-directed learning. CPD compliance is monitored and forms part of the
                membership renewal process.
              </p>
            </div>
            <div>
              <h2 className="sh">Workshop Certificates</h2>
              <p>
                All NIQS-organized CPD workshops issue digital certificates upon completion.
                These certificates are verifiable through the member portal and contribute to
                annual CPD requirements.
              </p>
              <div className="card" style={{ marginTop: '1rem' }}>
                <h4>CPD Activities & Points</h4>
                <ul className="feature-list">
                  <li>National Conference attendance — 10 points</li>
                  <li>Chapter workshops and seminars — 5 points each</li>
                  <li>Webinar participation — 2 points each</li>
                  <li>Published research paper — 10 points</li>
                  <li>Mentoring a Probationer — 5 points/year</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Webinar Series */}
      <section className="section section-alt">
        <div className="ct">
          <h2 className="sh" style={{ textAlign: 'center', marginBottom: '2rem' }}>Upcoming Webinar Series</h2>
          <div className="grid-2">
            {webinars.map((w, i) => (
              <div className="card" key={i}>
                <span className="pill">Webinar</span>
                <h3 style={{ marginTop: '0.5rem' }}>{w.title}</h3>
                <p><strong>Speaker:</strong> {w.speaker}</p>
                <p><strong>Date:</strong> {new Date(w.date).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Publications */}
      <section className="section">
        <div className="ct">
          <h2 className="sh" style={{ textAlign: 'center', marginBottom: '0.5rem' }}>Publications</h2>
          <p className="sd" style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto 2.5rem' }}>
            NIQS publishes a range of scholarly and professional materials to advance knowledge
            in quantity surveying and construction economics.
          </p>
          <div className="grid-3">
            {publications.map((pub, i) => (
              <div className="card" key={i}>
                <span className="pill pill-outline">{pub.type}</span>
                <h3 style={{ marginTop: '0.5rem' }}>{pub.title}</h3>
                <p>{pub.description}</p>
                <p className="card-meta">Frequency: {pub.frequency}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
