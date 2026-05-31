import { useState, useRef, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import useIsMobile from '../../hooks/useIsMobile';
import API from '../../api/axios';
import AdminHeader from '../../components/admin/AdminHeader';
import MainFlyerLeftDark from '../../flyer/MainFlyerLeftDark.jsx';
import AdminForm from '../../flyer/AdminForm.jsx';
import ExportControls from '../../flyer/ExportControls.jsx';
import { DEFAULT_EVENT } from '../../flyer/defaultEvent.js';
import { listFlyerEvents, saveFlyerEvent, deleteFlyerEvent, checkDate } from '../../flyer/flyerApi';

const FLYER_W = 1080;
const FLYER_H = 1350;
const PREVIEW_W = 400;

const HQ_ROLES = ['main_admin', 'national_admin'];

const SUB_LABELS = {
  noSpeakers: 'No Speakers', main: 'Speakers', countdown: 'Countdown',
  speakerCitation: 'Citation', thankYou: 'Thank You',
};

export default function FlyerStudio() {
  const { admin } = useAuth();
  const role = admin?.role || '';
  const isHQ = HQ_ROLES.includes(role);
  const lockChapter = !isHQ;
  const assignedChapterId = admin?.assignedChapter?._id || admin?.assignedChapter || '';

  const [searchParams] = useSearchParams();
  const seededDate = searchParams.get('date');

  const flyerRef = useRef(null);
  const exportRef = useRef(null);

  const [event, setEvent] = useState({
    ...DEFAULT_EVENT,
    id: null,
    ...(seededDate ? { dateStart: seededDate, dateEnd: '' } : {}),
  });
  const [editingId, setEditingId] = useState(null);
  const [scope, setScope] = useState(isHQ ? 'national' : 'chapter');
  const [chapter, setChapter] = useState(lockChapter ? assignedChapterId : '');
  const [subDeliverable, setSubDeliverable] = useState('main');

  const [chapters, setChapters] = useState([]);
  const [savedEvents, setSavedEvents] = useState([]);
  const [showEvents, setShowEvents] = useState(false);
  const [availability, setAvailability] = useState(null);
  const [saving, setSaving] = useState(false);
  const [overrideInfo, setOverrideInfo] = useState(null);

  const isMobile = useIsMobile();
  const previewW = isMobile
    ? Math.min(PREVIEW_W, (typeof window !== 'undefined' ? window.innerWidth : PREVIEW_W) - 36)
    : PREVIEW_W;
  const previewScale = previewW / FLYER_W;
  const previewH = Math.round(FLYER_H * previewScale);

  const effectiveScope = lockChapter ? 'chapter' : scope;
  const effectiveChapter = lockChapter ? assignedChapterId : (scope === 'chapter' ? chapter : '');

  // Once saved, the flyer QR encodes the live public registration page.
  const publicBase = (import.meta.env.VITE_PUBLIC_URL || window.location.origin).replace(/\/$/, '');
  const registerUrl = editingId ? `${publicBase}/events/${editingId}/register` : '';

  /* ── Data loads ── */
  useEffect(() => {
    API.get('/chapters')
      .then(({ data }) => setChapters(data.chapters || data || []))
      .catch(() => {});
    refreshSaved();
  }, []);

  const refreshSaved = useCallback(async () => {
    try {
      setSavedEvents(await listFlyerEvents());
    } catch {
      /* silent */
    }
  }, []);

  /* ── Live availability check (debounced) ── */
  useEffect(() => {
    if (!event.dateStart) { setAvailability(null); return; }
    const handle = setTimeout(async () => {
      try {
        const res = await checkDate({
          start: event.dateStart,
          end: event.dateEnd || event.dateStart,
          scope: effectiveScope,
          chapter: effectiveChapter || undefined,
          excludeId: editingId || undefined,
        });
        setAvailability(res);
      } catch {
        setAvailability(null);
      }
    }, 400);
    return () => clearTimeout(handle);
  }, [event.dateStart, event.dateEnd, effectiveScope, effectiveChapter, editingId]);

  /* ── Actions ── */
  function handleNew() {
    setEvent({ ...DEFAULT_EVENT, id: null });
    setEditingId(null);
    setScope(isHQ ? 'national' : 'chapter');
    setChapter(lockChapter ? assignedChapterId : '');
    setSubDeliverable('main');
    setAvailability(null);
  }

  function handleLoad(ev) {
    setEvent({ ...DEFAULT_EVENT, ...(ev.flyer || {}), id: ev._id });
    setEditingId(ev._id);
    setScope(ev.scope || 'national');
    setChapter(ev.chapter?._id || ev.chapter || '');
    setSubDeliverable('main');
    setShowEvents(false);
  }

  async function handleSave(force = false) {
    if (!event.title?.trim()) { toast.error('Add an event title first'); return; }
    if (!event.dateStart) { toast.error('Pick a start date first'); return; }
    // HQ choosing a chapter event must say which chapter. Locked sub-admins
    // (state w/ assigned chapter, or WAQSN/YQSF w/ none) save as-is.
    if (!lockChapter && scope === 'chapter' && !chapter) {
      toast.error('Select a chapter for this event'); return;
    }
    setSaving(true);
    try {
      const res = await saveFlyerEvent({
        id: editingId,
        flyer: event,
        scope: effectiveScope,
        chapter: effectiveChapter,
        force,
      });
      setEditingId(res.event._id);
      setEvent((e) => ({ ...e, id: res.event._id }));
      setOverrideInfo(null);
      toast.success(force ? 'Saved — date conflict overridden' : (editingId ? 'Flyer updated' : 'Flyer saved'));
      if (res.warnings?.length) {
        toast(`Heads up: ${res.warnings.length} other event(s) also fall on this date`, { icon: '⚠️' });
      }
      refreshSaved();
    } catch (err) {
      if (err.response?.status === 409) {
        const data = err.response.data || {};
        if (canOverride) {
          setOverrideInfo({ message: data.message, conflicts: data.conflicts || [] });
        } else {
          toast.error(data.message || 'That date is unavailable');
        }
      } else {
        toast.error(err.response?.data?.message || 'Save failed');
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this event and its flyer?')) return;
    try {
      await deleteFlyerEvent(id);
      toast.success('Event deleted');
      if (editingId === id) handleNew();
      refreshSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  }

  const canOverride = isHQ;
  const blocked = availability && availability.ok === false && !canOverride;

  return (
    <div>
      <AdminHeader title="Flyer Studio" breadcrumbs={['Flyer Studio']} />

      {/* Toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 12, padding: '12px 28px', background: '#fff', borderBottom: '1px solid #e5e7eb',
        flexWrap: 'wrap',
      }}>
        <AvailabilityBanner availability={availability} canOverride={canOverride} hasDate={!!event.dateStart} />
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleNew} style={toolBtn('#F0F0FF', '#000066', '1.5px solid #000066')}>
            + New event
          </button>
          <button onClick={() => setShowEvents((v) => !v)} style={toolBtn('#000066', '#fff')}>
            Saved events ({savedEvents.length})
          </button>
        </div>
      </div>

      {/* Studio */}
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: 'stretch', gap: 0, minHeight: isMobile ? 'auto' : 'calc(100vh - 130px)' }}>
        {/* Form panel */}
        <div style={{
          width: isMobile ? '100%' : 380, flexShrink: 0, alignSelf: 'stretch',
          background: '#fff',
          borderRight: isMobile ? 'none' : '1.5px solid #DDE3F0',
          borderBottom: isMobile ? '1.5px solid #DDE3F0' : 'none',
          padding: '20px 20px 40px', overflowY: 'auto',
          maxHeight: isMobile ? 'none' : 'calc(100vh - 130px)',
        }}>
          <AdminForm
            event={event}
            onChange={setEvent}
            subDeliverable={subDeliverable}
            onSubDeliverableChange={setSubDeliverable}
            publishing={{
              scope: effectiveScope,
              chapter: effectiveChapter,
              chapters,
              lockChapter,
              onScopeChange: setScope,
              onChapterChange: setChapter,
            }}
          />
        </div>

        {/* Preview panel */}
        <div style={{
          flex: 1, background: '#ECEEF5', alignSelf: 'stretch',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: 18, padding: isMobile ? '20px 12px 40px' : '24px 24px 48px', overflowY: 'auto',
          maxHeight: isMobile ? 'none' : 'calc(100vh - 130px)',
        }}>
          <div style={{ alignSelf: 'stretch', fontSize: 11, fontWeight: 700, color: '#5A6485', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Live Preview — {event.category} / {event.layout}-aligned / {event.theme} / {SUB_LABELS[subDeliverable]} · 1080×1350
          </div>

          <div style={{
            width: previewW, height: previewH, position: 'relative', flexShrink: 0,
            borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,102,0.14)', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: 0, left: 0,
              transform: `scale(${previewScale})`, transformOrigin: 'top left',
              width: FLYER_W, height: FLYER_H,
            }}>
              <MainFlyerLeftDark ref={flyerRef} event={event} subDeliverable={subDeliverable} registerUrl={registerUrl} />
            </div>
          </div>

          {blocked && (
            <div style={{ alignSelf: 'stretch', maxWidth: 520, margin: '0 auto', background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', borderRadius: 8, padding: '10px 14px', fontSize: 12.5, fontWeight: 500 }}>
              🔒 {availability.hard?.[0] ? `${availability.hard[0].owner} — “${availability.hard[0].title}” (${availability.hard[0].when})` : 'This date is reserved.'} You can't save on this date. Pick another.
            </div>
          )}

          <ExportControls
            flyerRef={exportRef}
            eventTitle={event.title}
            onSave={() => handleSave(false)}
            subDeliverable={subDeliverable}
            onSubDeliverableChange={setSubDeliverable}
            event={event}
            onEventChange={setEvent}
          />
          {saving && <p style={{ fontSize: 12, color: '#5A6485', margin: 0 }}>Saving…</p>}
          <p style={{ fontSize: 11, color: '#8892B0', textAlign: 'center', margin: 0, maxWidth: 460 }}>
            Edits update the preview live. <strong>Save event</strong> books the date on the calendar and stores the flyer; then export PNG / PDF / full pack.
            {' '}Once saved, the QR code links to the live registration page.
          </p>
        </div>
      </div>

      {/* Hidden 1080×1350 export target */}
      <div aria-hidden="true" style={{ position: 'fixed', top: 0, left: '-9999px', width: FLYER_W, height: FLYER_H, pointerEvents: 'none', zIndex: -1 }}>
        <MainFlyerLeftDark ref={exportRef} event={event} subDeliverable={subDeliverable} registerUrl={registerUrl} />
      </div>

      {/* Saved events drawer */}
      {showEvents && (
        <SavedDrawer
          events={savedEvents}
          currentId={editingId}
          onLoad={handleLoad}
          onDelete={handleDelete}
          onClose={() => setShowEvents(false)}
        />
      )}

      {/* Override confirmation (HQ only) */}
      {overrideInfo && (
        <OverrideModal
          info={overrideInfo}
          busy={saving}
          onCancel={() => setOverrideInfo(null)}
          onConfirm={() => handleSave(true)}
        />
      )}
    </div>
  );
}

/* ── Availability banner ── */
function AvailabilityBanner({ availability, canOverride, hasDate }) {
  if (!hasDate) {
    return <span style={{ fontSize: 12.5, color: '#9ca3af' }}>Pick a start date to check calendar availability</span>;
  }
  if (!availability) {
    return <span style={{ fontSize: 12.5, color: '#9ca3af' }}>Checking date…</span>;
  }
  if (availability.ok) {
    if (availability.warnings?.length) {
      const w = availability.warnings[0];
      return <Pill bg="#FEF9C3" fg="#854D0E">⚠ Date free for you — but {w.owner} also has “{w.title}” ({w.when})</Pill>;
    }
    return <Pill bg="#DCFCE7" fg="#166534">✓ Date available</Pill>;
  }
  const h = availability.hard?.[0];
  const msg = h ? `${h.owner} holds “${h.title}” (${h.when})` : 'Date reserved';
  return canOverride
    ? <Pill bg="#FEF9C3" fg="#854D0E">⚠ {msg} — you can override on save</Pill>
    : <Pill bg="#FEE2E2" fg="#991B1B">🔒 {msg} — unavailable</Pill>;
}

function Pill({ bg, fg, children }) {
  return (
    <span style={{ background: bg, color: fg, borderRadius: 999, padding: '5px 12px', fontSize: 12.5, fontWeight: 600 }}>
      {children}
    </span>
  );
}

/* ── Saved events drawer ── */
function fmtDate(d) {
  if (!d) return '';
  const date = new Date(typeof d === 'string' && d.length === 10 ? d + 'T00:00:00Z' : d);
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
}

function SavedDrawer({ events, currentId, onLoad, onDelete, onClose }) {
  return (
    <>
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,102,0.18)', zIndex: 1500 }} onClick={onClose} />
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 340, background: '#fff', zIndex: 1501,
        boxShadow: '-4px 0 20px rgba(0,0,102,0.12)', display: 'flex', flexDirection: 'column',
        fontFamily: "'Sora', sans-serif",
      }}>
        <div style={{ padding: '16px 20px', borderBottom: '1.5px solid #DDE3F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#000066' }}>Saved Flyer Events</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#5A6485' }}>×</button>
        </div>
        {events.length === 0 && (
          <div style={{ padding: 24, color: '#5A6485', fontSize: 13, textAlign: 'center' }}>
            No saved flyer events yet.<br />Design one and click Save.
          </div>
        )}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px' }}>
          {events.map((ev) => {
            const f = ev.flyer || {};
            const active = ev._id === currentId;
            return (
              <div key={ev._id}
                onClick={() => onLoad(ev)}
                style={{
                  borderRadius: 8, padding: '10px 12px', marginBottom: 6, cursor: 'pointer',
                  border: active ? '2px solid #000066' : '1.5px solid #DDE3F0',
                  background: active ? '#F0F0FF' : '#FAFBFF',
                }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#000066', margin: '0 0 3px', lineHeight: 1.3 }}>
                  {f.title || ev.title || 'Untitled event'}
                </p>
                <p style={{ fontSize: 10, color: '#5A6485', margin: 0 }}>
                  {(f.category || ev.type)} · {fmtDate(f.dateStart || ev.date)} ·{' '}
                  <span style={{ fontWeight: 700, color: ev.scope === 'national' ? '#C9974A' : '#059669' }}>
                    {ev.scope === 'national' ? 'National' : (ev.chapter?.name || 'Chapter')}
                  </span>
                </p>
                <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
                  <button onClick={(e) => { e.stopPropagation(); onLoad(ev); }}
                    style={drawerBtn('#000066')}>Load</button>
                  <button onClick={(e) => { e.stopPropagation(); onDelete(ev._id); }}
                    style={drawerBtn('#C9302C')}>Delete</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

/* ── Override modal (HQ) ── */
function OverrideModal({ info, busy, onCancel, onConfirm }) {
  return (
    <div onClick={onCancel} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: 12, padding: '24px 28px', width: '100%', maxWidth: 480, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <h3 style={{ margin: '0 0 8px', color: '#B45309' }}>Date already booked</h3>
        <p style={{ color: '#374151', fontSize: 13.5, margin: '0 0 12px' }}>{info.message}</p>
        {info.conflicts?.length > 0 && (
          <ul style={{ margin: '0 0 16px', paddingLeft: 18, color: '#4b5563', fontSize: 13 }}>
            {info.conflicts.map((c) => (
              <li key={c.id} style={{ marginBottom: 4 }}><strong>{c.title}</strong> — {c.owner}, {c.when}</li>
            ))}
          </ul>
        )}
        <p style={{ color: '#6b7280', fontSize: 12.5, margin: '0 0 18px' }}>
          As HQ you can override the guardrail and book this date anyway.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={{ padding: '9px 18px', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 13.5, cursor: 'pointer', background: '#e5e7eb', color: '#374151' }}>Cancel</button>
          <button onClick={onConfirm} disabled={busy} style={{ padding: '9px 18px', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 13.5, cursor: 'pointer', background: '#B45309', color: '#fff', opacity: busy ? 0.6 : 1 }}>
            {busy ? 'Saving…' : 'Override & save anyway'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── styles ── */
function toolBtn(bg, fg, border = 'none') {
  return {
    padding: '8px 16px', borderRadius: 6, fontSize: 12.5, fontWeight: 600,
    cursor: 'pointer', background: bg, color: fg, border,
    fontFamily: "'Sora', sans-serif",
  };
}
function drawerBtn(color) {
  return {
    fontSize: 10, fontWeight: 600, color, background: 'none',
    border: `1px solid ${color}`, borderRadius: 4, padding: '3px 8px', cursor: 'pointer',
    fontFamily: "'Sora', sans-serif",
  };
}
