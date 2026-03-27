import React from 'react';
import { Link } from 'react-router-dom';
import PageHero from '../../components/common/PageHero';

export default function WAQSN() {
  return (
    <>
      <PageHero
        title="West African QS Network"
        subtitle="Promoting quantity surveying excellence across West Africa"
        breadcrumbs={[{ label: 'International', to: '/reciprocity' }, { label: 'WAQSN' }]}
      />

      <section className="section">
        <div className="ct">
          <div className="two-col">
            <div>
              <h2 className="sh">About WAQSN</h2>
              <p>
                The West African Quantity Surveyors Network (WAQSN) is a collaborative platform
                established to promote the development, regulation, and practice of quantity
                surveying across the West African sub-region. The network brings together
                professional QS bodies from ECOWAS member states to share knowledge, harmonize
                standards, and advocate for the profession.
              </p>
              <p>
                NIQS plays a leading role in WAQSN as one of its founding members and the largest
                QS body in the region. Through WAQSN, NIQS has facilitated the exchange of
                professional expertise, joint CPD programmes, and mutual recognition of
                qualifications among member countries.
              </p>
              <p>
                The network holds biennial conferences hosted by member countries on a rotational
                basis, providing a platform for knowledge exchange, research presentation, and
                professional networking across West Africa.
              </p>
            </div>
            <div>
              <img
                src="https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=600&h=400&fit=crop"
                alt="West Africa collaboration"
                className="rounded-img"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="ct">
          <h2 className="sh" style={{ textAlign: 'center', marginBottom: '2rem' }}>NIQS's Role in WAQSN</h2>
          <div className="grid-3">
            <div className="card">
              <div className="card-icon">🤝</div>
              <h3>Founding Member</h3>
              <p>NIQS was instrumental in establishing WAQSN and continues to drive its strategic agenda for regional professional integration.</p>
            </div>
            <div className="card">
              <div className="card-icon">📚</div>
              <h3>Knowledge Sharing</h3>
              <p>NIQS actively contributes to joint CPD programmes, research publications, and technical workshops across the network.</p>
            </div>
            <div className="card">
              <div className="card-icon">🌍</div>
              <h3>Standards Harmonization</h3>
              <p>Leading efforts to develop common standards of measurement and professional practice guidelines for the West African region.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="ct">
          <h2 className="sh" style={{ textAlign: 'center', marginBottom: '2rem' }}>Member Countries</h2>
          <div className="grid-4">
            {['Nigeria', 'Ghana', 'Sierra Leone', 'The Gambia', 'Liberia', 'Senegal', 'Cameroon', 'Togo'].map((country, i) => (
              <div className="card" key={i} style={{ textAlign: 'center' }}>
                <h3>{country}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
