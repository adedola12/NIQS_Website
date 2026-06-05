import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import AdminHeader from '../../components/admin/AdminHeader';
import { listFlyerRequests, setFlyerRequestStatus, deleteFlyerRequest } from '../../api/flyerRequestApi';

const NAVY = '#0B1F4B';
const GOLD = '#C9974A';

const TABS = [
  { value: 'active', label: 'To do' },        // pending + in_progress
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' },
];

const STATUS_STYLE = {
  pending: { bg: '#FEF9C3', fg: '#854D0E', label: 'New' },
  in_progress: { bg: '#DBEAFE', fg: '#1E40AF', label: 'In progress' },
  completed: { bg: '#DCFCE7', fg: '#166534', label: 'Completed' },
  archived: { bg: '#F3F4F6', fg: '#6B7280', label: 'Archived' },
};

function fmtDate(d) {
  if (!d) return '';
  const date = new Date(typeof d === 'string' && d.length === 10 ? d + 'T00:00:00Z' : d);
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
}

export default function FlyerRequests() {
  const [tab, setTab] = useState('active');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      // 'active' pulls everything non-archived; tabs filter client-side.
      const status = tab === 'archived' ? 'archived' : tab === 'completed' ? 'completed' : undefined;
      const list = await listFlyerRequests(status);
      setRequests(list);
    } catch {
      toast.error('Could not load requests');
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => { refresh(); }, [refresh]);

  const visible = tab === 'active'
    ? requests.filter((r) => r.status === 'pending' || r.status === 'in_progress')
    : requests;

  async function changeStatus(id, status) {
    try {
      await setFlyerRequestStatus(id, { status });
      toast.success(status === 'archived' ? 'Archived' : 'Updated');
      refresh();
    } catch {
      toast.error('Update failed');
    }
  }

  async function remove(id) {
    if (!window.confirm('Delete this request permanently?')) return;
    try {
      await deleteFlyerRequest(id);
      toast.success('Request deleted');
      refresh();
    } catch {
      toast.error('Delete failed');
    }
  }

  const pendingCount = requests.filter((r) => r.status === 'pending').length;

  return (
    <div>
      <AdminHeader title="Flyer Requests" breadcrumbs={['Flyer Requests']} />

      <div style={{ padding: '20px 28px' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
          {TABS.map((t) => (
            <button key={t.value} onClick={() => setTab(t.value)}
              style={{
                padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: 600, fontFamily: "'Sora', sans-serif",
                background: tab === t.value ? NAVY : '#fff',
                color: tab === t.value ? '#fff' : '#5A6485',
                boxShadow: tab === t.value ? 'none' : 'inset 0 0 0 1.5px #DDE3F0',
              }}>
              {t.label}
              {t.value === 'active' && pendingCount > 0 && (
                <span style={{ marginLeft: 8, background: GOLD, color: NAVY, borderRadius: 999, padding: '1px 7px', fontSize: 11, fontWeight: 800 }}>
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <p style={{ color: '#5A6485', fontSize: 14 }}>Loading…</p>
        ) : visible.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 12, padding: '40px 24px', textAlign: 'center', border: '1.5px solid #DDE3F0' }}>
            <p style={{ color: '#5A6485', fontSize: 14, margin: 0 }}>
              {tab === 'active' ? 'No open requests. Share the intake form link from Flyer Studio to start collecting briefs.' : 'Nothing here yet.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 14 }}>
            {visible.map((r) => (
              <RequestCard key={r._id} r={r} onStatus={changeStatus} onDelete={remove} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function RequestCard({ r, onStatus, onDelete }) {
  const [open, setOpen] = useState(false);
  const st = STATUS_STYLE[r.status] || STATUS_STYLE.pending;
  const when = r.dateEnd && String(r.dateEnd) !== String(r.dateStart)
    ? `${fmtDate(r.dateStart)} – ${fmtDate(r.dateEnd)}`
    : fmtDate(r.dateStart);

  return (
    <div style={{ background: '#fff', borderRadius: 12, border: '1.5px solid #DDE3F0', overflow: 'hidden' }}>
      <div style={{ padding: '16px 18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
              <span style={{ background: st.bg, color: st.fg, borderRadius: 999, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>{st.label}</span>
              <span style={{ fontSize: 11, color: '#8892B0', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{r.category}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: r.scope === 'national' ? GOLD : '#059669' }}>
                {r.scope === 'national' ? 'National' : (r.chapter?.name || 'Chapter')}
              </span>
            </div>
            <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 17, color: NAVY, margin: '0 0 4px', lineHeight: 1.25 }}>
              {r.title || 'Untitled event'}
            </h3>
            <p style={{ fontSize: 12.5, color: '#5A6485', margin: 0 }}>
              {when && <>📅 {when} &nbsp;·&nbsp; </>}
              Requested by <strong>{r.requesterName}</strong>
              {r.requesterOrg ? ` (${r.requesterOrg})` : ''}
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
            {r.status !== 'completed' && r.status !== 'archived' && (
              <Link to={`/admin/flyer-studio?request=${r._id}`}
                style={{ background: NAVY, color: '#fff', textDecoration: 'none', fontSize: 12.5, fontWeight: 700, padding: '8px 14px', borderRadius: 7, textAlign: 'center', whiteSpace: 'nowrap' }}>
                Build flyer →
              </Link>
            )}
            {r.status === 'completed' && r.createdEvent && (
              <Link to={`/admin/flyer-studio`}
                style={{ background: '#F0F0FF', color: NAVY, textDecoration: 'none', fontSize: 12.5, fontWeight: 700, padding: '8px 14px', borderRadius: 7, textAlign: 'center', border: `1.5px solid ${NAVY}`, whiteSpace: 'nowrap' }}>
                ✓ Built
              </Link>
            )}
            <button onClick={() => setOpen((o) => !o)} style={linkBtn}>{open ? 'Hide details' : 'View details'}</button>
          </div>
        </div>

        {open && (
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #EEF1F7', display: 'grid', gap: 10 }}>
            <Detail label="Contact">
              {r.requesterEmail}{r.requesterPhone ? ` · ${r.requesterPhone}` : ''}
            </Detail>
            {r.subtitle && <Detail label="Subtitle">{r.subtitle}</Detail>}
            {r.time && <Detail label="Time">{r.time} {r.timeZone}</Detail>}
            <Detail label="Format">
              {r.venueType}
              {r.venuePhysical ? ` · ${r.venuePhysical}` : ''}
              {r.venueCity ? `, ${r.venueCity}` : ''}
              {r.venueType !== 'In-Person' ? ` · ${r.platform}` : ''}
            </Detail>
            {r.cpdPoints > 0 && <Detail label="CPD">{r.cpdPoints} points</Detail>}
            {r.schedule && <Detail label="Modules"><span style={{ whiteSpace: 'pre-line' }}>{r.schedule}</span></Detail>}
            {r.speakers?.length > 0 && (
              <Detail label="Speakers">
                {r.speakers.map((s, i) => (
                  <div key={i}>{s.name}{s.role ? ` — ${s.role}` : ''}{s.topic ? `: ${s.topic}` : ''}</div>
                ))}
              </Detail>
            )}
            {r.registrationUrl && <Detail label="Register">{r.registrationUrl}</Detail>}
            {r.enquiries?.length > 0 && <Detail label="Enquiries">{r.enquiries.join(', ')}</Detail>}
            {r.notes && <Detail label="Notes">{r.notes}</Detail>}

            <div style={{ display: 'flex', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
              {r.status !== 'archived' && (
                <button onClick={() => onStatus(r._id, 'archived')} style={ghostBtn}>Archive</button>
              )}
              {r.status === 'archived' && (
                <button onClick={() => onStatus(r._id, 'pending')} style={ghostBtn}>Restore</button>
              )}
              {r.status === 'completed' && (
                <button onClick={() => onStatus(r._id, 'pending')} style={ghostBtn}>Reopen</button>
              )}
              <button onClick={() => onDelete(r._id)} style={{ ...ghostBtn, color: '#C9302C', borderColor: '#F3C2C0' }}>Delete</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Detail({ label, children }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '92px 1fr', gap: 10, fontSize: 13, color: '#374151' }}>
      <span style={{ color: '#8892B0', fontWeight: 600, fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '0.04em', paddingTop: 1 }}>{label}</span>
      <span>{children}</span>
    </div>
  );
}

const linkBtn = {
  background: 'none', border: 'none', color: '#5A6485', cursor: 'pointer',
  fontSize: 12, fontWeight: 600, fontFamily: "'Sora', sans-serif", padding: 0, textAlign: 'right',
};
const ghostBtn = {
  background: '#fff', border: '1.5px solid #DDE3F0', borderRadius: 6, padding: '6px 12px',
  fontSize: 12, fontWeight: 600, color: '#5A6485', cursor: 'pointer', fontFamily: "'Sora', sans-serif",
};
