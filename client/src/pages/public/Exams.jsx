import React from 'react';
import { Link } from 'react-router-dom';
import PageHero from '../../components/common/PageHero';

const exams = [
  {
    title: 'Test of Professional Competence (TPC)',
    tag: 'Corporate Membership',
    desc: "The TPC is the final professional examination required for admission as a Graduate Member (MNIQS) of the Nigerian Institute of Quantity Surveyors. It assesses candidates' competence in quantity surveying practice, professional ethics, and applied knowledge.",
    eligibility: [
      'Must be a registered Probationer member of NIQS',
      'Minimum of 2 years post-graduation practical experience',
      'Must hold HND/B.Sc in QS from an accredited institution',
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
    tag: 'Foundation Level',
    desc: 'The GDE is a preliminary examination for graduates of non-accredited programmes or those seeking to demonstrate foundational competence in quantity surveying. Passing the GDE is a prerequisite for Probationer registration.',
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
        label="Professional Development"
        title="Professional Examinations"
        titleHighlight="Examinations"
        backgroundImage="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1400&q=80&fit=crop"
      />

      {/* Exam Cards */}
      <section style={{ background: '#fff' }}>
        <div className="ct" style={{ paddingTop: '5rem', paddingBottom: '5rem' }}>
          <div style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto 3rem' }}>
            <div className="ey" style={{ justifyContent: 'center' }}>Examinations</div>
            <h2 className="sh">Pathways to <em>Corporate Membership</em></h2>
            <p className="sd" style={{ maxWidth: '100%' }}>
              NIQS administers professional examinations that certify competence and admit
              candidates into full corporate membership of the Institute.
            </p>
          </div>

          <div className="exam-grid">
            {exams.map((exam, i) => (
              <div className="ecard" key={i}>
                <span className="card-tag" style={{ marginBottom: '1rem', display: 'inline-block' }}>{exam.tag}</span>
                <h3>{exam.title}</h3>
                <p style={{ fontSize: '.82rem', color: 'var(--color-txt-2)', lineHeight: 1.7, marginBottom: '1.5rem' }}>{exam.desc}</p>

                <div style={{ marginBottom: '1.2rem' }}>
                  <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '.78rem', color: 'var(--color-navy)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '.6rem' }}>Eligibility</div>
                  <ul style={{ display: 'flex', flexDirection: 'column', gap: '.35rem' }}>
                    {exam.eligibility.map((e, j) => (
                      <li key={j} style={{ display: 'flex', gap: '.6rem', alignItems: 'flex-start', fontSize: '.8rem', color: 'var(--color-txt-2)', lineHeight: 1.55 }}>
                        <span style={{ color: 'var(--color-gold)', fontWeight: 800, flexShrink: 0, marginTop: 1 }}>✓</span>
                        {e}
                      </li>
                    ))}
                  </ul>
                </div>

                <div style={{ marginBottom: '1.2rem' }}>
                  <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '.78rem', color: 'var(--color-navy)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '.6rem' }}>Exam Format</div>
                  <ul style={{ display: 'flex', flexDirection: 'column', gap: '.35rem' }}>
                    {exam.format.map((f, j) => (
                      <li key={j} style={{ display: 'flex', gap: '.6rem', alignItems: 'flex-start', fontSize: '.8rem', color: 'var(--color-txt-2)', lineHeight: 1.55 }}>
                        <span style={{ color: 'var(--color-gold)', fontWeight: 800, flexShrink: 0, marginTop: 1 }}>→</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                <div style={{ background: 'var(--color-off)', borderRadius: 8, padding: '.75rem 1rem', fontSize: '.78rem', color: 'var(--color-navy)', fontWeight: 600 }}>
                  📅 {exam.schedule}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Schedule Table */}
      <section className="section-alt">
        <div className="ct" style={{ paddingTop: '5rem', paddingBottom: '5rem' }}>
          <div style={{ textAlign: 'center', maxWidth: 560, margin: '0 auto 3rem' }}>
            <div className="ey" style={{ justifyContent: 'center' }}>2026 Calendar</div>
            <h2 className="sh">Examination <em>Schedule</em></h2>
          </div>

          <div style={{ overflowX: 'auto' }}>
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
                    <td><strong style={{ color: 'var(--color-navy)' }}>{s.exam}</strong></td>
                    <td>{s.registration}</td>
                    <td>{s.examDate}</td>
                    <td><span className="pill">{s.results}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Published Results */}
      <section style={{ background: '#fff' }}>
        <div className="ct" style={{ paddingTop: '5rem', paddingBottom: '5rem' }}>
          <div style={{ textAlign: 'center', maxWidth: 560, margin: '0 auto 2rem' }}>
            <div className="ey" style={{ justifyContent: 'center' }}>Results</div>
            <h2 className="sh">Published <em>Results</em></h2>
            <p className="sd" style={{ maxWidth: '100%' }}>
              Examination results are published here after ratification by the NEC.
            </p>
          </div>
          <div style={{ background: 'var(--color-off)', border: '1px solid var(--color-bdr)', borderRadius: 14, padding: '3rem 2rem', textAlign: 'center', maxWidth: 600, margin: '0 auto' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📋</div>
            <p style={{ color: 'var(--color-txt-3)', fontSize: '.85rem', marginBottom: '1.5rem' }}>
              No results currently published. Check back after the examination period.
            </p>
            <Link to="/contact" className="btn bo">Contact Exams Office</Link>
          </div>
        </div>
      </section>
    </>
  );
}
