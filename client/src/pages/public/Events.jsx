import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import PageHero from '../../components/common/PageHero';

const TYPE_FILTERS = ['All', 'Conference', 'Examination', 'Workshop', 'Ceremony'];

/**
 * Whether an event can still be registered for.
 *
 * Measured against the end of its last day, not its start: a two-day workshop is
 * still open on the morning of day two, and a same-day event should not vanish
 * from registration at one minute past midnight. endDate wins where it exists,
 * because `date` is only the first day.
 */
function isUpcoming(e) {
  const last = new Date(e.endDate || e.date);
  if (Number.isNaN(last.getTime())) return false;
  last.setHours(23, 59, 59, 999);
  return last.getTime() >= Date.now();
}

export default function Events() {
  const [events, setEvents] = useState([]);
  const [status, setStatus] = useState('loading');
  const [activeType, setActiveType] = useState('All');

  useEffect(() => {
    API.get('/events')
      .then(res => {
        const data = res.data?.events || res.data?.data || res.data;
        setEvents(Array.isArray(data) ? data : []);
        setStatus('ready');
      })
      .catch(() => {
        setEvents([]);
        setStatus('error');
      });
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
                  {/* The registration flow existed but nothing on the public site
                      reached it: this page rendered no links at all, and the
                      homepage's rows pointed at a slug the Event model does not
                      have. /events/:id/register, the Registration record, the
                      attendance token and the CPD credit behind it were therefore
                      unreachable — including for the National Workshop &
                      Induction. An event carrying its own registrationLink keeps
                      it; everything still to come uses the site's own form. */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '.5rem' }}>
                    <span className="epill">{e.type}</span>
                    {isUpcoming(e) && (
                      e.registrationLink ? (
                        <a
                          href={e.registrationLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn bp"
                          style={{ fontSize: '.68rem', padding: '.35rem .9rem' }}
                        >
                          Register &rarr;
                        </a>
                      ) : (
                        <Link
                          to={`/events/${e._id}/register`}
                          className="btn bp"
                          style={{ fontSize: '.68rem', padding: '.35rem .9rem' }}
                        >
                          Register &rarr;
                        </Link>
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <p style={{ textAlign: 'center', color: 'var(--color-txt-3)', marginTop: '2rem' }}>
              {status === 'loading'
                ? 'Loading events…'
                : status === 'error'
                  ? 'We could not load the events just now. Please try again shortly.'
                  : activeType === 'All'
                    ? 'No events have been published yet.'
                    : 'No events found for this type.'}
            </p>
          )}
        </div>
      </section>
    </>
  );
}
