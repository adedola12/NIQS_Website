import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../../api/axios';
import { listRegistrations, setAttendance } from '../../api/registrationApi';
import AdminHeader from '../../components/admin/AdminHeader';
import DataTable from '../../components/admin/DataTable';

function fmtDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
}
function csvCell(v) {
  const s = v == null ? '' : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export default function ManageRegistrations() {
  const [params, setParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [selectedId, setSelectedId] = useState(params.get('event') || '');
  const [data, setData] = useState(null); // { event, registrations }
  const [loading, setLoading] = useState(false);

  // Load the admin's events (already scoped server-side by role)
  useEffect(() => {
    API.get('/events/admin/all')
      .then(({ data }) => {
        const list = Array.isArray(data) ? data : (data.events || []);
        setEvents(list);
        if (!selectedId && list.length) selectEvent(list[0]._id);
      })
      .catch(() => toast.error('Failed to load events'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function selectEvent(id) {
    setSelectedId(id);
    setParams(id ? { event: id } : {}, { replace: true });
    if (!id) { setData(null); return; }
    setLoading(true);
    listRegistrations(id)
      .then(setData)
      .catch((e) => { toast.error(e.response?.data?.message || 'Failed to load registrations'); setData(null); })
      .finally(() => setLoading(false));
  }

  async function toggleAttended(row) {
    try {
      const res = await setAttendance(row._id, !row.attended);
      setData((d) => ({
        ...d,
        registrations: d.registrations.map((r) =>
          r._id === row._id ? { ...r, attended: res.registration.attended, cpdPoints: res.registration.cpdPoints } : r
        ),
      }));
    } catch (e) {
      toast.error(e.response?.data?.message || 'Update failed');
    }
  }

  function exportCsv() {
    if (!data?.registrations?.length) return;
    const header = ['Name', 'Email', 'Phone', 'Address', 'Membership #', 'Member', 'Mode', 'Attended', 'CPD', 'Registered'];
    const lines = [header.join(',')];
    data.registrations.forEach((r) => {
      lines.push([
        r.fullName, r.email, r.phone, r.address, r.membershipNumber,
        r.isMember ? 'Yes' : 'No',
        r.participationMode === 'virtual' ? 'Online' : 'In person',
        r.attended ? 'Yes' : 'No', r.attended ? r.cpdPoints : 0,
        fmtDate(r.createdAt),
      ].map(csvCell).join(','));
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `registrations-${(data.event.title || 'event').replace(/[^a-z0-9]+/gi, '_')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const columns = [
    { key: 'fullName', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone', render: (v) => v || '--' },
    { key: 'address', label: 'Address', render: (v) => v || '--' },
    {
      key: 'membershipNumber', label: 'Member #',
      render: (v, row) => row.isMember ? (v || '—') : <span style={{ color: '#9ca3af' }}>Guest</span>,
    },
    { key: 'participationMode', label: 'Mode', render: (v) => (v === 'virtual' ? 'Online' : 'In person') },
    {
      key: 'attended', label: 'Attended',
      render: (v, row) => (
        <button
          onClick={() => toggleAttended(row)}
          style={{
            padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 700, cursor: 'pointer',
            border: '1px solid ' + (row.attended ? '#16a34a' : '#d1d5db'),
            background: row.attended ? '#dcfce7' : '#fff',
            color: row.attended ? '#166534' : '#6b7280',
          }}
          title="Toggle attendance (admin override)"
        >
          {row.attended ? '✓ Attended' : 'Mark'}
        </button>
      ),
    },
    { key: 'cpdPoints', label: 'CPD', render: (v, row) => (row.attended ? v : '—') },
  ];

  const regs = data?.registrations || [];
  const attendedCount = regs.filter((r) => r.attended).length;

  return (
    <div>
      <AdminHeader title="Event Registrations" breadcrumbs={['Registrations']} />

      <div style={{ padding: '24px 28px' }}>
        {/* Event picker + summary */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12, marginBottom: 18 }}>
          <select
            value={selectedId}
            onChange={(e) => selectEvent(e.target.value)}
            style={{ padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14, minWidth: 280, color: '#111827' }}
          >
            <option value="">— Select an event —</option>
            {events.map((ev) => (
              <option key={ev._id} value={ev._id}>
                {ev.title} · {fmtDate(ev.date)} ({ev.registrationCount ?? 0})
              </option>
            ))}
          </select>

          {data && (
            <>
              <span style={{ fontSize: 13, color: '#6b7280' }}>
                <strong style={{ color: '#0B1F4B' }}>{regs.length}</strong> registered ·{' '}
                <strong style={{ color: '#166534' }}>{attendedCount}</strong> attended
              </span>
              <button
                onClick={exportCsv}
                disabled={!regs.length}
                style={{ marginLeft: 'auto', padding: '9px 16px', background: '#0B1F4B', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 13.5, cursor: regs.length ? 'pointer' : 'default', opacity: regs.length ? 1 : 0.5 }}
              >
                ⬇ Export CSV
              </button>
            </>
          )}
        </div>

        {selectedId ? (
          <DataTable columns={columns} data={regs} loading={loading} />
        ) : (
          <p style={{ color: '#9ca3af', fontSize: 14 }}>Select an event to see its registrants.</p>
        )}

        {selectedId && !loading && regs.length === 0 && (
          <p style={{ color: '#9ca3af', fontSize: 13, marginTop: 12 }}>No registrations yet for this event.</p>
        )}
      </div>
    </div>
  );
}
