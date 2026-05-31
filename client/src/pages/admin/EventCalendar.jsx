import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import useIsMobile from '../../hooks/useIsMobile';
import AdminHeader from '../../components/admin/AdminHeader';
import { getCalendarEvents } from '../../flyer/flyerApi';

const HQ_ROLES = ['main_admin', 'national_admin'];
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function isoDay(d) {
  const x = new Date(d);
  return `${x.getUTCFullYear()}-${String(x.getUTCMonth() + 1).padStart(2, '0')}-${String(x.getUTCDate()).padStart(2, '0')}`;
}

export default function EventCalendar() {
  const { admin } = useAuth();
  const navigate = useNavigate();
  const isHQ = HQ_ROLES.includes(admin?.role);
  const isMobile = useIsMobile();
  const maxChips = isMobile ? 1 : 3;

  const today = new Date();
  const [year, setYear] = useState(today.getUTCFullYear());
  const [month, setMonth] = useState(today.getUTCMonth());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // 6-week grid (Monday-start) covering the visible month
  const days = useMemo(() => {
    const monthStart = new Date(Date.UTC(year, month, 1));
    const firstWeekday = (monthStart.getUTCDay() + 6) % 7; // Monday = 0
    return Array.from({ length: 42 }, (_, i) => new Date(Date.UTC(year, month, 1 - firstWeekday + i)));
  }, [year, month]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getCalendarEvents({ from: isoDay(days[0]), to: isoDay(days[41]) })
      .then((evs) => { if (!cancelled) setEvents(evs); })
      .catch(() => { if (!cancelled) toast.error('Failed to load calendar'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [days]);

  // dayKey -> events covering it
  const byDay = useMemo(() => {
    const map = {};
    for (const ev of events) {
      const startKey = isoDay(ev.date);
      const endKey = ev.endDate ? isoDay(ev.endDate) : startKey;
      for (const d of days) {
        const key = isoDay(d);
        if (key >= startKey && key <= endKey) (map[key] ||= []).push(ev);
      }
    }
    return map;
  }, [events, days]);

  const todayKey = isoDay(today);

  function goMonth(delta) {
    const m = month + delta;
    if (m < 0) { setMonth(11); setYear((y) => y - 1); }
    else if (m > 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth(m);
  }
  function goToday() { setYear(today.getUTCFullYear()); setMonth(today.getUTCMonth()); }

  function book(dayKey) {
    navigate(`/admin/flyer-studio?date=${dayKey}`);
  }

  return (
    <div>
      <AdminHeader title="Event Calendar" breadcrumbs={['Event Calendar']} />

      <div style={{ padding: isMobile ? '16px 10px' : '20px 28px' }}>
        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={() => goMonth(-1)} style={navBtn}>‹</button>
            <h2 style={{ margin: 0, fontSize: 18, color: '#0B1F4B', minWidth: 190, textAlign: 'center' }}>
              {MONTHS[month]} {year}
            </h2>
            <button onClick={() => goMonth(1)} style={navBtn}>›</button>
            <button onClick={goToday} style={{ ...navBtn, width: 'auto', padding: '0 14px', fontSize: 13 }}>Today</button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 12, color: '#4b5563' }}>
            <Legend color="#C9974A" label="National (HQ-reserved)" />
            <Legend color="#059669" label="Chapter" />
            <span style={{ color: '#9ca3af' }}>{loading ? 'Loading…' : 'Click a day to book'}</span>
          </div>
        </div>

        {/* Weekday header */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: isMobile ? 4 : 6, marginBottom: 6 }}>
          {WEEKDAYS.map((w) => (
            <div key={w} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{w}</div>
          ))}
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: isMobile ? 4 : 6 }}>
          {days.map((d) => {
            const key = isoDay(d);
            const inMonth = d.getUTCMonth() === month;
            const dayEvents = byDay[key] || [];
            const hasNational = dayEvents.some((e) => e.scope === 'national');
            const lockedForMe = !isHQ && hasNational;
            const isToday = key === todayKey;

            return (
              <div
                key={key}
                onClick={() => book(key)}
                title={lockedForMe ? 'Reserved by National (HQ)' : 'Click to book this date'}
                style={{
                  minHeight: isMobile ? 58 : 104, borderRadius: 8, padding: isMobile ? 4 : 7, cursor: 'pointer',
                  background: inMonth ? '#fff' : '#f9fafb',
                  border: isToday ? '2px solid #0B1F4B' : '1px solid #e5e7eb',
                  opacity: inMonth ? 1 : 0.55,
                  position: 'relative', overflow: 'hidden',
                  transition: 'box-shadow .15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 4px 14px rgba(11,31,75,0.12)')}
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: isMobile ? 11 : 12.5, fontWeight: isToday ? 800 : 600, color: isToday ? '#0B1F4B' : '#374151' }}>
                    {d.getUTCDate()}
                  </span>
                  {lockedForMe && <span style={{ fontSize: 11 }} title="Reserved by HQ">🔒</span>}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {dayEvents.slice(0, maxChips).map((ev) => (
                    <div key={ev._id + key} style={{
                      fontSize: isMobile ? 8.5 : 10, fontWeight: 600, lineHeight: 1.2,
                      padding: '2px 5px', borderRadius: 4,
                      background: ev.scope === 'national' ? 'rgba(201,151,74,0.16)' : 'rgba(5,150,105,0.14)',
                      color: ev.scope === 'national' ? '#92600F' : '#04603A',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }} title={`${ev.title}${ev.chapter?.name ? ' — ' + ev.chapter.name : ''}`}>
                      {ev.hasFlyer ? '🖼 ' : ''}{ev.title}
                    </div>
                  ))}
                  {dayEvents.length > maxChips && (
                    <span style={{ fontSize: 9.5, color: '#9ca3af', fontWeight: 600 }}>+{dayEvents.length - maxChips}{isMobile ? '' : ' more'}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Legend({ color, label }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span style={{ width: 12, height: 12, borderRadius: 3, background: color, display: 'inline-block' }} />
      {label}
    </span>
  );
}

const navBtn = {
  width: 34, height: 34, borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff',
  cursor: 'pointer', fontSize: 18, color: '#0B1F4B', display: 'flex', alignItems: 'center', justifyContent: 'center',
};
