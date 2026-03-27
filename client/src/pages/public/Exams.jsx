import React from 'react';
import { Link } from 'react-router-dom';
import PageHero from '../../components/common/PageHero';

const exams = [
  {
    title: 'Test of Professional Competence (TPC)',
    icon: '📝',
    description: 'The TPC is the final professional examination required for admission as a Graduate Member (MNIQS) of the Nigerian Institute of Quantity Surveyors. It assesses candidates\' competence in quantity surveying practice, professional ethics, and applied knowledge.',
    eligibility: [
      'Must be a registered Probationer member of NIQS',
      'Minimum of 2 years post-graduation practical experience',
      'Must hold HND/B.Sc in Quantity Surveying from an accredited institution',
      'Must be registered with QSRBN or in the process',
    ],
    format: [
      'Written examination: 3 papers covering measurement, cost management, and professional practice',
      'Oral examination: Interview assessing professional competence and ethics',
      'Case study presentation: Analysis of a real-world QS project',
    ],
    schedule: 'Held twice annually — April and October diets',
  },
  {
    title: 'General Development Exam (GDE)',
    icon: '🎓',
    description: 'The GDE is a preliminary examination designed for graduates of non-accredited programmes or those seeking to demonstrate foundational competence in quantity surveying. Passing the GDE is a prerequisite for registration as a Probationer and subsequent eligibility for the TPC.',
    eligibility: [
      'Holders of degrees or diplomas in related disciplines (e.g., Building, Architecture, Engineering)',
      'Quantity Surveying graduates from non-BQSRB-accredited programmes',
      'Must submit academic transcripts for evaluation',
    ],
    format: [
      'Written examination: Papers covering principles of QS, construction technology, and economics',
      'Practical assessment: Measurement and bill of quantities preparation',
    ],
    schedule: 'Held annually — usually in June',
  },
];

const scheduleData = [
  { exam: 'TPC — April Diet', registration: 'Jan 15 — Feb 28', examDate: 'April 20 — 22', results: 'June (expected)' },
  { exam: 'GDE 2026', registration: 'Feb 1 — April 30', examDate: 'June 15 — 16', results: 'August (expected)' },
  { exam: 'TPC — October Diet', registration: 'Jul 1 — Aug 31', examDate: 'October 19 — 21', results: 'December (expected)' },
];

export default function Exams() {
  return (
    <>
      <PageHero
        title="Examinations"
        subtitle="Professional examinations for aspiring quantity surveyors"
        breadcrumbs={[{ label: 'Professional Development', to: '/research' }, { label: 'Examinations' }]}
      />

      {/* Exam Cards */}
      <section className="section">
        <div className="ct">
          <div className="grid-2">
            {exams.map((exam, i) => (
              <div className="card" key={i} style={{ padding: '2rem' }}>
                <div className="card-icon" style={{ fontSize: '2.5rem' }}>{exam.icon}</div>
                <h2>{exam.title}</h2>
                <p>{exam.description}</p>

                <h4 style={{ marginTop: '1.5rem' }}>Eligibility</h4>
                <ul className="feature-list">
                  {exam.eligibility.map((e, j) => <li key={j}>{e}</li>)}
                </ul>

                <h4 style={{ marginTop: '1rem' }}>Exam Format</h4>
                <ul className="feature-list">
                  {exam.format.map((f, j) => <li key={j}>{f}</li>)}
                </ul>

                <p style={{ marginTop: '1rem' }}>
                  <strong>Schedule:</strong> {exam.schedule}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Exam Schedule */}
      <section className="section section-alt">
        <div className="ct">
          <h2 className="sh" style={{ textAlign: 'center', marginBottom: '2rem' }}>2026 Examination Schedule</h2>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Examination</th>
                  <th>Registration Period</th>
                  <th>Exam Date</th>
                  <th>Results</th>
                </tr>
              </thead>
              <tbody>
                {scheduleData.map((s, i) => (
                  <tr key={i}>
                    <td><strong>{s.exam}</strong></td>
                    <td>{s.registration}</td>
                    <td>{s.examDate}</td>
                    <td>{s.results}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Results Placeholder */}
      <section className="section">
        <div className="ct">
          <h2 className="sh" style={{ textAlign: 'center', marginBottom: '1rem' }}>Published Results</h2>
          <p className="sd" style={{ textAlign: 'center', marginBottom: '2rem' }}>
            Examination results are published here after ratification by the NEC.
          </p>
          <div style={{ background: '#f5f5f5', borderRadius: 8, padding: '3rem 2rem', textAlign: 'center' }}>
            <p style={{ color: '#888' }}>No results currently published. Check back after the examination period.</p>
            <Link to="/contact" className="btn btn-outline btn-sm" style={{ marginTop: '1rem' }}>
              Contact Exams Office
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
