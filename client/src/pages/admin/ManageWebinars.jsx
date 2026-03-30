import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { canDelete } from '../../utils/roleHelpers';
import AdminHeader from '../../components/admin/AdminHeader';
import DataTable from '../../components/admin/DataTable';
import FileUpload from '../../components/common/FileUpload';

const CATEGORIES = ['General', 'Technology', 'Sustainability', 'Legal', 'Innovation', 'Practice', 'Professional Development', 'Finance', 'Project Management', 'Other'];

const emptyForm = {
  title: '', description: '', date: '', speaker: '', speakerTitle: '',
  category: 'General', scope: 'national', chapter: '',
  thumbnailUrl: '', recordingUrl: '', registrationUrl: '',
  isUpcoming: true, isPublished: true,
};

export default function ManageWebinars() {
  const { admin } = useAuth();
  const role = admin?.role || '';
  const isStateAdmin = role === 'state_admin';
  const isYQSF  = role === 'yqsf_admin';
  const isWAQSN = role === 'waqsn_admin';
  const lockedScope = isStateAdmin ? 'chapter' : isYQSF ? 'yqsf' : isWAQSN ? 'waqsn' : null;

  const [webinars, setWebinars]     = useState([]);
  const [chapters, setChapters]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [editing, setEditing]       = useState(null);
  const [form, setForm]             = useState({ ...emptyForm });
  const [submitting, setSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    fetchWebinars();
    API.get('/chapters').then(r => setChapters(r.data?.chapters || r.data || [])).catch(() => {});
  }, []);

  const fetchWebinars = async () => {
    try {
      const { data } = await API.get('/webinars/admin/all');
      setWebinars(data.webinars || []);
    } catch { toast.error('Failed to load webinars'); }
    finally { setLoading(false); }
  };

  const openAdd = () => {
    setEditing(null);
    const defaults = { ...emptyForm };
    if (lockedScope) { defaults.scope = lockedScope; }
    if (isStateAdmin) defaults.chapter = admin?.chapter?._id || admin?.chapter || '';
    setForm(defaults);
    setShowModal(true);
  };

  const openEdit = row => {
    setEditing(row);
    setForm({ title: row.title || '', description: row.description || '', date: row.date ? row.date.slice(0, 16) : '', speaker: row.speaker || '', speakerTitle: row.speakerTitle || '', category: row.category || 'General', scope: row.scope || 'national', chapter: row.chapter?._id || row.chapter || '', thumbnailUrl: row.thumbnailUrl || '', recordingUrl: row.recordingUrl || '', registrationUrl: row.registrationUrl || '', isUpcoming: !!row.isUpcoming, isPublished: row.isPublished !== false });
    setShowModal(true);
  };

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async e => {
    e.preventDefault(); setSubmitting(true);
    try {
      const payload = { ...form };
      if (payload.scope !== 'chapter') delete payload.chapter;
      if (editing) { await API.put(`/webinars/${editing._id}`, payload); toast.success('Webinar updated'); }
      else         { await API.post('/webinars', payload);                toast.success('Webinar added');   }
      setShowModal(false); fetchWebinars();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try { await API.delete(`/webinars/${confirmDelete._id}`); toast.success('Deleted'); setConfirmDelete(null); fetchWebinars(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const columns = [
    { key: 'title', label: 'Title', render: v => <strong style={{ color: '#0B1F4B', fontSize: 13 }}>{v}</strong> },
    { key: 'date', label: 'Date', render: v => v ? new Date(v).toLocaleDateString('en-NG') : '—' },
    { key: 'speaker', label: 'Speaker', render: v => v || '—' },
    { key: 'scope', label: 'Scope', render: v => <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, background: '#0B1F4B', color: '#fff', textTransform: 'capitalize' }}>{v}</span> },
    { key: 'category', label: 'Category', render: v => v || '—' },
    { key: 'isUpcoming', label: 'Status', render: v => <span style={{ color: v ? '#dc2626' : '#6b7280', fontWeight: 700, fontSize: 12 }}>{v ? '🔴 Upcoming' : '⏺ Past'}</span> },
  ];

  return (
    <div>
      <AdminHeader title="Webinars" subtitle="Manage NIQS webinar sessions. State, YQSF, and WAQSN admins manage their respective scopes." breadcrumbs={['Webinars']} />
      <div style={{ padding: '24px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h3 style={{ margin: 0, fontSize: 16, color: '#374151' }}>All Webinars <span style={{ color: '#9ca3af', fontWeight: 400 }}>({webinars.length})</span></h3>
          <button onClick={openAdd} style={addBtn}>+ Add Webinar</button>
        </div>
        <DataTable columns={columns} data={webinars} loading={loading} onEdit={openEdit} onDelete={row => setConfirmDelete(row)} canDeleteRows={canDelete(role)} />
      </div>

      {showModal && (
        <Modal onClose={() => setShowModal(false)} title={editing ? 'Edit Webinar' : 'Add Webinar'}>
          <form onSubmit={handleSubmit}>
            <FF label="Title" required><input value={form.title} required style={inp} onChange={e => f('title', e.target.value)} /></FF>
            <FF label="Description"><textarea value={form.description} rows={3} style={{ ...inp, resize: 'vertical' }} onChange={e => f('description', e.target.value)} /></FF>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <FF label="Speaker"><input value={form.speaker} style={inp} onChange={e => f('speaker', e.target.value)} placeholder="QS. Firstname Lastname, FNIQS" /></FF>
              <FF label="Speaker Title"><input value={form.speakerTitle} style={inp} onChange={e => f('speakerTitle', e.target.value)} placeholder="Director, Firm Name" /></FF>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <FF label="Date &amp; Time"><input type="datetime-local" value={form.date} style={inp} onChange={e => f('date', e.target.value)} /></FF>
              <FF label="Category">
                <select value={form.category} style={inp} onChange={e => f('category', e.target.value)}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </FF>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <FF label="Scope">
                <select value={form.scope} style={{ ...inp, opacity: lockedScope ? .6 : 1 }} disabled={!!lockedScope} onChange={e => f('scope', e.target.value)}>
                  <option value="national">National</option>
                  <option value="chapter">Chapter</option>
                  <option value="yqsf">YQSF</option>
                  <option value="waqsn">WAQSN</option>
                </select>
              </FF>
              {form.scope === 'chapter' && (
                <FF label="Chapter" required>
                  <select value={form.chapter} required style={{ ...inp, opacity: isStateAdmin ? .6 : 1 }} disabled={isStateAdmin} onChange={e => f('chapter', e.target.value)}>
                    <option value="">-- Select --</option>
                    {chapters.map(ch => <option key={ch._id} value={ch._id}>{ch.name}</option>)}
                  </select>
                </FF>
              )}
            </div>

            <FF label="Thumbnail Image">
              <FileUpload label="Upload thumbnail image" accept="image/*" currentUrl={form.thumbnailUrl}
                onUpload={url => f('thumbnailUrl', url)} onError={msg => toast.error(msg)} />
              <input value={form.thumbnailUrl} style={{ ...inp, marginTop: 6 }} placeholder="…or paste image URL" onChange={e => f('thumbnailUrl', e.target.value)} />
            </FF>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <FF label="Registration URL (upcoming)"><input type="url" value={form.registrationUrl} style={inp} onChange={e => f('registrationUrl', e.target.value)} placeholder="https://…" /></FF>
              <FF label="Recording URL (past)"><input type="url" value={form.recordingUrl} style={inp} onChange={e => f('recordingUrl', e.target.value)} placeholder="https://…" /></FF>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <FF label="Status">
                <select value={form.isUpcoming ? 'upcoming' : 'past'} style={inp} onChange={e => f('isUpcoming', e.target.value === 'upcoming')}>
                  <option value="upcoming">Upcoming</option><option value="past">Past Recording</option>
                </select>
              </FF>
              <FF label="Published">
                <select value={form.isPublished ? 'yes' : 'no'} style={inp} onChange={e => f('isPublished', e.target.value === 'yes')}>
                  <option value="yes">Published</option><option value="no">Draft</option>
                </select>
              </FF>
            </div>
            <Btns onCancel={() => setShowModal(false)} submitting={submitting} editing={!!editing} />
          </form>
        </Modal>
      )}

      {confirmDelete && (
        <Modal onClose={() => setConfirmDelete(null)} title="Confirm Delete">
          <p style={{ color: '#374151', fontSize: 14 }}>Delete <strong>{confirmDelete.title}</strong>?</p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
            <button onClick={() => setConfirmDelete(null)} style={{ ...btn, background: '#e5e7eb', color: '#374151' }}>Cancel</button>
            <button onClick={handleDelete} style={{ ...btn, background: '#dc2626', color: '#fff' }}>Delete</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({ children, onClose, title }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 12, padding: '24px 28px', width: '100%', maxWidth: 580, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <h3 style={{ margin: '0 0 20px', color: '#0B1F4B' }}>{title}</h3>
        {children}
      </div>
    </div>
  );
}
function FF({ label, required, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 4 }}>{label} {required && <span style={{ color: '#dc2626' }}>*</span>}</label>
      {children}
    </div>
  );
}
function Btns({ onCancel, submitting, editing }) {
  return (
    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
      <button type="button" onClick={onCancel} style={{ ...btn, background: '#e5e7eb', color: '#374151' }}>Cancel</button>
      <button type="submit" disabled={submitting} style={{ ...btn, background: '#C9974A', color: '#fff', opacity: submitting ? .6 : 1 }}>
        {submitting ? 'Saving…' : editing ? 'Update' : 'Add'}
      </button>
    </div>
  );
}
const inp    = { width: '100%', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14, color: '#111827', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' };
const btn    = { padding: '10px 22px', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 14, cursor: 'pointer' };
const addBtn = { padding: '10px 20px', background: '#C9974A', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 14, cursor: 'pointer' };
