import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { canDelete } from '../../utils/roleHelpers';
import AdminHeader from '../../components/admin/AdminHeader';
import DataTable from '../../components/admin/DataTable';
import FileUpload from '../../components/common/FileUpload';

const emptyForm = {
  title: '', volume: '', issue: '', year: new Date().getFullYear(),
  description: '', coverImage: '', fileUrl: '', isPublished: true, sortOrder: 0,
};

export default function ManageJournal() {
  const { admin } = useAuth();
  const role = admin?.role || '';
  const [journals, setJournals]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [editing, setEditing]       = useState(null);
  const [form, setForm]             = useState({ ...emptyForm });
  const [submitting, setSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => { fetchJournals(); }, []);

  const fetchJournals = async () => {
    try {
      const { data } = await API.get('/journals/admin/all');
      setJournals(data.journals || []);
    } catch { toast.error('Failed to load journals'); }
    finally { setLoading(false); }
  };

  const openAdd = () => { setEditing(null); setForm({ ...emptyForm }); setShowModal(true); };
  const openEdit = row => {
    setEditing(row);
    setForm({ title: row.title || '', volume: row.volume || '', issue: row.issue || '', year: row.year || new Date().getFullYear(), description: row.description || '', coverImage: row.coverImage || '', fileUrl: row.fileUrl || '', isPublished: row.isPublished !== false, sortOrder: row.sortOrder || 0 });
    setShowModal(true);
  };

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async e => {
    e.preventDefault(); setSubmitting(true);
    try {
      if (editing) { await API.put(`/journals/${editing._id}`, form); toast.success('Journal updated'); }
      else         { await API.post('/journals', form);                toast.success('Journal added');   }
      setShowModal(false); fetchJournals();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try { await API.delete(`/journals/${confirmDelete._id}`); toast.success('Deleted'); setConfirmDelete(null); fetchJournals(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const columns = [
    {
      key: 'coverImage', label: 'Cover',
      render: (val, row) => val
        ? <img src={val} alt={row.title} style={{ width: 44, height: 56, objectFit: 'cover', borderRadius: 4, border: '1px solid #e5e7eb' }} />
        : <div style={{ width: 44, height: 56, borderRadius: 4, background: '#0B1F4B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>📰</div>,
    },
    { key: 'title', label: 'Title', render: v => <strong style={{ color: '#0B1F4B', fontSize: 13 }}>{v}</strong> },
    { key: 'volume', label: 'Vol', render: v => v || '—' },
    { key: 'issue',  label: 'Issue', render: v => v || '—' },
    { key: 'year',   label: 'Year',  render: v => v || '—' },
    { key: 'fileUrl', label: 'PDF', render: v => v ? <a href={v} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', fontSize: 12 }}>View ↗</a> : <span style={{ color: '#9ca3af', fontSize: 12 }}>—</span> },
    { key: 'isPublished', label: 'Status', render: v => <span style={{ color: v !== false ? '#059669' : '#dc2626', fontWeight: 600, fontSize: 12 }}>{v !== false ? 'Published' : 'Draft'}</span> },
  ];

  return (
    <div>
      <AdminHeader title="Journal of Quantity Surveying" subtitle="Manage journal volumes. PDFs are auto-routed to Cloudinary (<10 MB) or Cloudflare R2 (≥10 MB)." breadcrumbs={['Journal of QS']} />
      <div style={{ padding: '24px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h3 style={{ margin: 0, fontSize: 16, color: '#374151' }}>All Issues <span style={{ color: '#9ca3af', fontWeight: 400 }}>({journals.length})</span></h3>
          <button onClick={openAdd} style={addBtn}>+ Add Journal Issue</button>
        </div>
        <DataTable columns={columns} data={journals} loading={loading} onEdit={openEdit} onDelete={row => setConfirmDelete(row)} canDeleteRows={canDelete(role)} />
      </div>

      {showModal && (
        <Modal onClose={() => setShowModal(false)} title={editing ? 'Edit Journal Issue' : 'Add Journal Issue'}>
          <form onSubmit={handleSubmit}>
            <FF label="Title" required><input value={form.title} required style={inp} onChange={e => f('title', e.target.value)} placeholder="e.g. Construction Cost Estimation Using BIM" /></FF>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
              <FF label="Volume"><input type="number" value={form.volume} style={inp} min={1} onChange={e => f('volume', e.target.value)} placeholder="12" /></FF>
              <FF label="Issue"><input type="number" value={form.issue} style={inp} min={1} onChange={e => f('issue', e.target.value)} placeholder="2" /></FF>
              <FF label="Year"><input type="number" value={form.year} style={inp} min={2000} max={2100} onChange={e => f('year', Number(e.target.value))} /></FF>
            </div>

            <FF label="Description / Abstract"><textarea value={form.description} rows={4} style={{ ...inp, resize: 'vertical' }} onChange={e => f('description', e.target.value)} /></FF>

            <FF label="Cover Image">
              <FileUpload label="Upload cover image" accept="image/*" currentUrl={form.coverImage}
                onUpload={url => f('coverImage', url)} onError={msg => toast.error(msg)} />
              <input value={form.coverImage} style={{ ...inp, marginTop: 6 }} placeholder="…or paste image URL" onChange={e => f('coverImage', e.target.value)} />
            </FF>

            <FF label="PDF File">
              <FileUpload label="Upload PDF — ≥10 MB auto-routes to Cloudflare R2" accept=".pdf,application/pdf" maxMB={500} currentUrl={form.fileUrl}
                onUpload={url => f('fileUrl', url)} onError={msg => toast.error(msg)} />
              <input value={form.fileUrl} style={{ ...inp, marginTop: 6 }} placeholder="…or paste PDF URL" onChange={e => f('fileUrl', e.target.value)} />
            </FF>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <FF label="Sort Order"><input type="number" value={form.sortOrder} style={inp} min={0} onChange={e => f('sortOrder', Number(e.target.value))} /></FF>
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
        {submitting ? 'Saving…' : editing ? 'Update' : 'Add Issue'}
      </button>
    </div>
  );
}
const inp    = { width: '100%', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14, color: '#111827', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' };
const btn    = { padding: '10px 22px', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 14, cursor: 'pointer' };
const addBtn = { padding: '10px 20px', background: '#C9974A', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 14, cursor: 'pointer' };
