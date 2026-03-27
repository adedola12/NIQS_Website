import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import PageHero from '../../components/common/PageHero';

const fallbackEvents = [
  { _id: '1', slug: 'annual-conference-2026', title: '34th Annual Conference', description: 'The flagship event of NIQS bringing together quantity surveyors from across Nigeria and beyond.', date: '2026-06-15', endDate: '2026-06-17', location: 'Abuja International Conference Centre', type: 'Conference' },
  { _id: '2', slug: 'tpc-exam-april-2026', title: 'TPC Examination — April 2026 Diet', description: 'Test of Professional Competence examination for aspiring Graduate Members.', date: '2026-04-20', endDate: '2026-04-22', location: 'Lagos, Abuja, Port Harcourt', type: 'Examination' },
  { _id: '3', slug: 'cpd-workshop-bim', title: 'CPD Workshop: BIM for Quantity Surveyors', description: 'Hands-on workshop on Building Information Modelling applications in QS practice.', date: '2026-05-10', location: 'NIQS Lagos Chapter Secretariat', type: 'Workshop' },
  { _id: '4', slug: 'fellowship-investiture-2026', title: 'Fellowship Investiture Ceremony 2026', description: 'Formal investiture of new Fellows of the Nigerian Institute of Quantity Surveyors.', date: '2026-06-16', location: 'Abuja International Conference Centre', type: 'Ceremony' },
  { _id: '5', slug: 'gde-exam-june-2026', title: 'GDE Examination 2026', description: 'General Development Examination for graduates seeking probationer membership.', date: '2026-06-15', endDate: '2026-06-16', location: 'Lagos, Abuja', type: 'Examination' },
  { _id: '6', slug: 'yqsf-tech-summit', title: 'YQSF Technology Summit', description: 'Young QS Forum technology conference focusing on digital tools and AI in construction.', date: '2026-07-20', location: 'Landmark Event Centre, Lagos', type: 'Conference' },
  { _id: '7', slug: 'cpd-dispute-resolution', title: 'CPD: Construction Dispute Resolution', description: 'Workshop on mediation, arbitration, and adjudication in construction contracts.', date: '2026-08-12', location: 'NIQS National Secretariat, Abuja', type: 'Workshop' },
  { _id: '8', slug: 'tpc-exam-october-2026', title: 'TPC Examination — October 2026 Diet', description: 'Second sitting of the Test of Professional Competence for the year.', date: '2026-10-19', endDate: '2026-10-21', location: 'Lagos, Abuja, Port Harcourt', type: 'Examination' },
];

const typeFilters = ['All', 'Conference', 'Examination', 'Workshop', 'Ceremony'];

export default function Events() {
  const [events, setEvents] = useState(fallbackEvents);
  const [activeType, setActiveType] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/events')
      .then(res => {
        const data = res.data?.data || res.data;
        if (Array.isArray(data) && data.length) setEvents(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = activeType === 'All' ? events : events.filter(e => e.type === activeType);

  return (
    <>
      <PageHero
        title="Events"
        subtitle="Conferences, examinations, workshops, and ceremonies"
        breadcrumbs={[{ label: 'Events' }]}
      />

      <section className="section">
        <div className="ct">
          {/* Type Tabs */}
          <div className="tabs" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
            {typeFilters.map(t => (
              <button
                key={t}
                className={`tab-btn ${activeType === t ? 'tab-btn-active' : ''}`}
                onClick={() => setActiveType(t)}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Event List */}
          <div className="event-list">
            {filtered.map(e => {
              const d = new Date(e.date);
              return (
                <div className="erow" key={e._id}>
                  <div className="event-date-block">
                    <span className="event-month">{d.toLocaleDateString('en-NG', { month: 'short' }).toUpperCase()}</span>
                    <span className="event-day">{d.getDate()}</span>
                    <span className="event-year">{d.getFullYear()}</span>
                  </div>
                  <div className="event-info" style={{ flex: 1 }}>
                    <h3>{e.title}</h3>
                    <p>{e.description}</p>
                    <div className="event-meta" style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                      <span>📍 {e.location}</span>
                      {e.endDate && (
                        <span>📅 {d.toLocaleDateString('en-NG', { month: 'short', day: 'numeric' })} — {new Date(e.endDate).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      )}
                    </div>
                  </div>
                  <span className="pill pill-outline">{e.type}</span>
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <p style={{ textAlign: 'center', color: '#888', marginTop: '2rem' }}>
              No events found for this category.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
