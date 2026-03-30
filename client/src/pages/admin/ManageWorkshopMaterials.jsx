import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { canDelete } from '../../utils/roleHelpers';
import AdminHeader from '../../components/admin/AdminHeader';
import DataTable from '../../components/admin/DataTable';
import FileUpload from '../../components/common/FileUpload';

const TYPES  = ['slides', 'template', 'reading', 'video', 'other'];
const TYPE_LABEL = { slides: 'Slides', template: 'Template', reading: 'Reading', video: 'Video', other: 'Other' };

const emptyForm = {
  title: '', description: '', type: 'slides', scope: 'national', chapter: '',
  workshopTitle: '', workshopDate: '', thumbnailUrl: '', fileUrl: '', isPublished: true,
};

export default function ManageWorkshopMaterials() {
  const { admin } = useAuth();
  const role = admin?.role || '';
  const isStateAdmin = role === 'state_admin';
  const isYQSF  = role === 'yqsf_admin';
  const isWAQSN = role === 'waqsn_admin';
  const lockedScope = isStateAdmin ? 'chapter' : isYQSF ? 'yqsf' : isWAQSN ? 'waqsn' : null;

  const [materials, setMaterials]   = useState([]);
  const [chapters, setChapters]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [editing, setEditing]       = useState(null);
  const [form, setForm]             = useState({ ...emptyForm });
  const [submitting, setSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    fetchMaterials();
    API.get('/chapters').then(r => setChapters(r.data?.chapters || r.data || [])).catch(() => {});
  }, []);

  const fetchMaterials = async () => {
    try {
      const { data } = await API.get('/workshop-materials/admin/all');
      setMaterials(data.materials || []);
    } catch { toast.error('Failed to load materials'); }
    finally { setLoading(false); }
  };

  const openAdd = () => {
    setEditing(null);
    const d = { ...emptyForm };
    if (lockedScope) d.scope = lockedScope;
    if (isStateAdmin) d.chapter = admin?.chapter?._id || admin?.chapter || '';
    setForm(d);
    setShowModal(true);
  };

  const openEdit = row => {
    setEditing(row);
    setForm({ title: row.title || '', description: row.description || '', type: row.type || 'slides', scope: row.scope || 'national', chapter: row.chapter?._id || row.chapter || '', workshopTitle: row.workshopTitle || '', workshopDate: row.workshopDate ? row.workshopDate.slice(0, 10) : '', thumbnailUrl: row.thumbnailUrl || '', fileUrl: row.fileUrl || '', isPublished: row.isPublished !== false });
    setShowModal(true);
  };

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async e => {
    e.preventDefault(); setSubmitting(true);
    try {
      const payload = { ...form };
      if (payload.scope !== 'chapter') delete payload.chapter;
      if (editing) { await API.put(`/workshop-materials/${editing._id}`, payload); toast.success('Material updated'); }
      else         { await API.post('/workshop-materials', payload);                toast.success('Material added');   }
      setShowModal(false); fetchMaterials();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try { await API.delete(`/workshop-materials/${confirmDelete._id}`); toast.success('Deleted'); setConfirmDelete(null); fetchMaterials(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const columns = [
    { key: 'title', label: 'Title', render: v => <strong style={{ color: '#0B1F4B', fontSize: 13 }}>{v}</strong> },
    { key: 'type', label: 'Type', render: v => <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, background: '#e5e7eb' }}>{TYPE_LABEL[v] || v}</span> },
    { key: 'scope', label: 'Scope', render: v => <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, background: '#0B1F4B', color: '#fff', textTransform: 'capitalize' }}>{v}</span> },
    { key: 'workshopTitle', label: 'Workshop', render: v => v || '—' },
    { key: 'fileUrl', label: 'File', render: v => v ? <a href={v} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', fontSize: 12 }}>View ↗</a> : <span style={{ color: '#9ca3af', fontSize: 12 }}>—</span> },
    { key: 'isPublished', label: 'Status', render: v => <span style={{ color: v !== false ? '#059669' : '#dc2626', fontWeight: 600, fontSize: 12 }}>{v !== false ? 'Published' : 'Draft'}</span> },
  ];

  return (
    <div>
      <AdminHeader title="Workshop Materials" subtitle="Upload slides, templates, readings and videos. Scoped by admin role." breadcrumbs={['Workshop Materials']} />
      <div style={{ padding: '24px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h3 style={{ margin: 0, fontSize: 16, color: '#374151' }}>All Materials <span style={{ color: '#9ca3af', fontWeight: 400 }}>({materials.length})</span></h3>
          <button onClick={openAdd} style={addBtn}>+ Add Material</button>
        </div>
        <DataTable columns={columns} data={materials} loading={loading} onEdit={openEdit} onDelete={row => setConfirmDelete(row)} canDeleteRows={canDelete(role)} />
      </div>

      {showModal && (
        <Modal onClose={() => setShowModal(false)} title={editing ? 'Edit Material' : 'Add Workshop Material'}>
          <form onSubmit={handleSubmit}>
            <FF label="Title" required><input value={form.title} required style={inp} onChange={e => f('title', e.target.value)} /></FF>
            <FF label="Description"><textarea value={form.description} rows={3} style={{ ...inp, resize: 'vertical' }} onChange={e => f('description', e.target.value)} /></FF>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <FF label="Material Type">
                <select value={form.type} style={inp} onChange={e => f('type', e.target.value)}>
                  {TYPES.map(t => <option key={t} value={t}>{TYPE_LABEL[t]}</option>)}
                </select>
              </FF>
              <FF label="Scope">
                <select value={form.scope} style={{ ...inp, opacity: lockedScope ? .6 : 1 }} disabled={!!lockedScope} onChange={e => f('scope', e.target.value)}>
                  <option value="national">National</option>
                  <option value="chapter">Chapter</option>
                  <option value="yqsf">YQSF</option>
                  <option value="waqsn">WAQSN</option>
                </select>
              </FF>
            </div>

            {form.scope === 'chapter' && (
              <FF label="Chapter" required>
                <select value={form.chapter} required style={{ ...inp, opacity: isStateAdmin ? .6 : 1 }} disabled={isStateAdmin} onChange={e => f('chapter', e.target.value)}>
                  <option value="">-- Select --</option>
                  {chapters.map(ch => <option key={ch._id} value={ch._id}>{ch.name}</option>)}
                </select>
              </FF>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <FF label="Parent Workshop Title"><input value={form.workshopTitle} style={inp} onChange={e => f('workshopTitle', e.target.value)} placeholder="e.g. Cost Management Masterclass" /></FF>
              <FF label="Workshop Date"><input type="date" value={form.workshopDate} style={inp} onChange={e => f('workshopDate', e.target.value)} /></FF>
            </div>

            <FF label="Thumbnail Image">
              <FileUpload label="Upload thumbnail" accept="image/*" currentUrl={form.thumbnailUrl}
                onUpload={url => f('thumbnailUrl', url)} onError={msg => toast.error(msg)} />
              <input value={form.thumbnailUrl} style={{ ...inp, marginTop: 6 }} placeholder="…or paste image URL" onChange={e => f('thumbnailUrl', e.target.value)} />
            </FF>

            <FF label="Material File (PDF, PPTX, DOCX, Video…)">
              <FileUpload label="Upload file — <10 MB → Cloudinary, ≥10 MB → Cloudflare R2" accept=".pdf,.pptx,.docx,.mp4,video/*,application/pdf" maxMB={500} currentUrl={form.fileUrl}
                onUpload={url => f('fileUrl', url)} onError={msg => toast.error(msg)} />
              <input value={form.fileUrl} style={{ ...inp, marginTop: 6 }} placeholder="…or paste file URL" onChange={e => f('fileUrl', e.target.value)} />
            </FF>

            <FF label="Published">
              <select value={form.isPublished ? 'yes' : 'no'} style={inp} onChange={e => f('isPublished', e.target.value === 'yes')}>
                <option value="yes">Published</option><option value="no">Draft</option>
              </select>
            </FF>
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
