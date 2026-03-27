import React from 'react';
import PageHero from '../../components/common/PageHero';

const agreements = [
  { body: 'Royal Institution of Chartered Surveyors (RICS)', country: 'United Kingdom', year: '2005', status: 'Active', description: 'Full reciprocity for FNIQS members to attain MRICS status through an assessment of professional competence.' },
  { body: 'Australian Institute of Quantity Surveyors (AIQS)', country: 'Australia', year: '2012', status: 'Active', description: 'Mutual recognition agreement enabling members to practice in either jurisdiction subject to local requirements.' },
  { body: 'Singapore Institute of Surveyors and Valuers (SISV)', country: 'Singapore', year: '2015', status: 'Active', description: 'Professional reciprocity covering quantity surveying practice and professional development.' },
  { body: 'Ghana Institution of Surveyors (GhIS)', country: 'Ghana', year: '2008', status: 'Active', description: 'Bilateral agreement for mutual recognition of professional qualifications within West Africa.' },
  { body: 'Institute of Quantity Surveyors of Kenya (IQSK)', country: 'Kenya', year: '2010', status: 'Active', description: 'East-West African partnership for professional exchange and standards harmonization.' },
  { body: 'Association of South African Quantity Surveyors (ASAQS)', country: 'South Africa', year: '2014', status: 'Active', description: 'Reciprocity for qualified members to practice across both countries.' },
  { body: 'Hong Kong Institute of Surveyors (HKIS)', country: 'Hong Kong', year: '2017', status: 'Active', description: 'Agreement covering professional recognition and collaborative research.' },
  { body: 'Chartered Institute of Building (CIOB)', country: 'United Kingdom', year: '2019', status: 'Active', description: 'MoU for joint CPD programmes and shared professional development resources.' },
  { body: 'Pacific Association of Quantity Surveyors (PAQS)', country: 'International', year: '2016', status: 'Active', description: 'Membership in the Pacific rim QS alliance for international collaboration.' },
  { body: 'International Cost Engineering Council (ICEC)', country: 'International', year: '2003', status: 'Active', description: 'Affiliation with the global body for cost engineering and quantity surveying.' },
  { body: 'Quantity Surveyors International (QSi)', country: 'International', year: '2011', status: 'Active', description: 'Membership in the global alliance of QS professional bodies.' },
  { body: 'Royal Institute of Chartered Surveyors Sri Lanka (RICSSL)', country: 'Sri Lanka', year: '2020', status: 'Active', description: 'Bilateral professional recognition agreement.' },
  { body: 'New Zealand Institute of Quantity Surveyors (NZIQS)', country: 'New Zealand', year: '2018', status: 'Active', description: 'Mutual recognition and professional exchange framework.' },
  { body: 'Canadian Institute of Quantity Surveyors (CIQS)', country: 'Canada', year: '2021', status: 'Active', description: 'Partnership for professional development and knowledge sharing.' },
  { body: 'Chartered Institution of Civil Engineering Surveyors (CICES)', country: 'United Kingdom', year: '2022', status: 'Active', description: 'Collaboration on civil engineering cost management standards.' },
];

export default function Reciprocity() {
  return (
    <>
      <PageHero
        title="Reciprocity Agreements"
        subtitle="International partnerships expanding opportunities for NIQS members"
        breadcrumbs={[{ label: 'International', to: '/waqsn' }, { label: 'Reciprocity Agreements' }]}
      />

      <section className="section">
        <div className="ct">
          <p className="sd" style={{ textAlign: 'center', maxWidth: 800, margin: '0 auto 2.5rem' }}>
            NIQS maintains reciprocity and mutual recognition agreements with over 15 professional
            bodies worldwide. These agreements enable NIQS members to practice internationally and
            access professional development opportunities across the globe.
          </p>

          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Professional Body</th>
                  <th>Country</th>
                  <th>Year</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {agreements.map((a, i) => (
                  <tr key={i}>
                    <td>
                      <strong>{a.body}</strong>
                      <br />
                      <small style={{ color: '#888' }}>{a.description}</small>
                    </td>
                    <td>{a.country}</td>
                    <td>{a.year}</td>
                    <td><span className="pill pill-green">{a.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}
