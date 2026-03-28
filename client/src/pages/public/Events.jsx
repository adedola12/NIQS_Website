import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import PageHero from '../../components/common/PageHero';

const FALLBACK = [
  { _id: '1', slug: 'annual-conference-2026', title: '34th Annual Conference', description: 'The flagship event of NIQS bringing together quantity surveyors from across Nigeria and beyond for knowledge sharing and fellowship.', date: '2026-06-15', endDate: '2026-06-17', location: 'Abuja International Conference Centre', type: 'Conference' },
  { _id: '2', slug: 'tpc-exam-april-2026', title: 'TPC Examination — April 2026 Diet', description: 'Test of Professional Competence examination for aspiring Graduate Members (MNIQS) of the Institute.', date: '2026-04-20', endDate: '2026-04-22', location: 'Lagos, Abuja, Port Harcourt', type: 'Examination' },
  { _id: '3', slug: 'cpd-workshop-bim', title: 'CPD Workshop: BIM for Quantity Surveyors', description: 'Hands-on workshop on Building Information Modelling applications in QS practice. Earn 5 CPD points.', date: '2026-05-10', location: 'NIQS Lagos Chapter Secretariat', type: 'Workshop' },
  { _id: '4', slug: 'fellowship-investiture-2026', title: 'Fellowship Investiture Ceremony 2026', description: 'Formal investiture of new Fellows of the Nigerian Institute of Quantity Surveyors — a prestigious milestone.', date: '2026-06-16', location: 'Abuja International Conference Centre', type: 'Ceremony' },
  { _id: '5', slug: 'gde-exam-june-2026', title: 'GDE Examination 2026', description: 'General Development Examination for graduates of non-accredited programmes seeking probationer membership.', date: '2026-06-15', endDate: '2026-06-16', location: 'Lagos, Abuja', type: 'Examination' },
  { _id: '6', slug: 'yqsf-tech-summit', title: 'YQSF Technology Summit', description: 'Young QS Forum technology conference focusing on digital tools, AI in construction, and the future of QS practice.', date: '2026-07-20', location: 'Landmark Event Centre, Lagos', type: 'Conference' },
  { _id: '7', slug: 'cpd-dispute-resolution', title: 'CPD: Construction Dispute Resolution', description: 'Workshop on mediation, arbitration, and adjudication in construction contracts. Earn 5 CPD points.', date: '2026-08-12', location: 'NIQS National Secretariat, Abuja', type: 'Workshop' },
  { _id: '8', slug: 'tpc-exam-october-2026', title: 'TPC Examination — October 2026 Diet', description: 'Second sitting of the Test of Professional Competence for the 2026 examination year.', date: '2026-10-19', endDate: '2026-10-21', location: 'Lagos, Abuja, Port Harcourt', type: 'Examination' },
];

const TYPE_FILTERS = ['All', 'Conference', 'Examination', 'Workshop', 'Ceremony'];

export default function Events() {
  const [events, setEvents] = useState(FALLBACK);
  const [activeType, setActiveType] = useState('All');

  useEffect(() => {
    API.get('/events')
      .then(res => {
        const data = res.data?.data || res.data;
        if (Array.isArray(data) && data.length) setEvents(data);
      })
      .catch(() => {});
  }, []);

  const filtered = activeType === 'All' ? events : events.filter(e => e.type === activeType);

  return (
    <>
      <PageHero
        label="Calendar"
        title="Events & Conferences"
        titleHighlight="Events"
        backgroundImage="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1400&q=80&fit=crop"
      />

      <section style={{ background: '#fff' }}>
        <div className="ct" style={{ paddingTop: '5rem', paddingBottom: '5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div className="ey">2026 Calendar</div>
              <h2 className="sh" style={{ margin: 0 }}>Upcoming <em>Events</em></h2>
            </div>
            <div className="filter-bar" style={{ marginBottom: 0, marginTop: '.3rem' }}>
              {TYPE_FILTERS.map(t => (
                <button
                  key={t}
                  className={`fbtn${activeType === t ? ' on' : ''}`}
                  onClick={() => setActiveType(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="evtl">
            {filtered.map(e => {
              const d = new Date(e.date);
              return (
                <div className="erow" key={e._id}>
                  <div style={{ textAlign: 'center' }}>
                    <div className="eday">{d.getDate()}</div>
                    <div className="emon">{d.toLocaleDateString('en-NG', { month: 'short' }).toUpperCase()}</div>
                  </div>
                  <div className="einfo">
                    <h4>{e.title}</h4>
                    <p>{e.description}</p>
                    <p style={{ marginTop: '.3rem', fontSize: '.72rem', color: 'var(--color-txt-3)' }}>
                      📍 {e.location}
                      {e.endDate && (
                        <span style={{ marginLeft: '1rem' }}>
                          📅 {d.toLocaleDateString('en-NG', { month: 'short', day: 'numeric' })} — {new Date(e.endDate).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      )}
                    </p>
                  </div>
                  <span className="epill">{e.type}</span>
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <p style={{ textAlign: 'center', color: 'var(--color-txt-3)', marginTop: '2rem' }}>
              No events found for this type.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
