import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import API from '../../api/axios';
import { canDelete } from '../../utils/roleHelpers';
import { useAuth } from '../../context/AuthContext';
import AdminHeader from '../../components/admin/AdminHeader';
import DataTable from '../../components/admin/DataTable';

const emptyForm = {
  title: '',
  description: '',
  buttonLabel: 'Download',
  fileUrl: '',
  previewType: 'image',
  previewImage: '',
  previewBackground: '',
  imageFilter: '',
  order: 0,
  isPublished: true,
};

const previewTypeOptions = [
  { value: 'image', label: 'Full-cover image (Letterhead, Business Card, Guidelines)' },
  { value: 'image_contained', label: 'Contained logo image (Logo White / Navy)' },
  { value: 'gradient', label: 'Colour gradient only (Colour Palette)' },
];

export default function ManageBrandMaterials() {
  const { admin } = useAuth();
  const role = admin?.role || '';
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [submitting, setSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => { fetchMaterials(); }, []);

  const fetchMaterials = async () => {
    try {
      const { data } = await API.get('/brand-materials/admin/all');
      setMaterials(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Failed to load brand materials');
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ ...emptyForm });
    setShowModal(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm({
      title: row.title || '',
      description: row.description || '',
      buttonLabel: row.buttonLabel || 'Download',
      fileUrl: row.fileUrl || '',
      previewType: row.previewType || 'image',
      previewImage: row.previewImage || '',
      previewBackground: row.previewBackground || '',
      imageFilter: row.imageFilter || '',
      order: row.order || 0,
      isPublished: row.isPublished !== false,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editing) {
        await API.put(`/brand-materials/${editing._id}`, form);
        toast.success('Brand material updated');
      } else {
        await API.post('/brand-materials', form);
        toast.success('Brand material created');
      }
      setShowModal(false);
      fetchMaterials();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await API.delete(`/brand-materials/${confirmDelete._id}`);
      toast.success('Deleted');
      setConfirmDelete(null);
      fetchMaterials();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  const f = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const columns = [
    {
      key: 'previewImage',
      label: 'Preview',
      render: (val, row) => (
        row.previewType === 'gradient'
          ? <div style={{ width: 56, height: 36, borderRadius: 6, background: 'linear-gradient(135deg,#0B1F4B 50%,#C9974A 100%)' }} />
          : val
            ? <img src={val} alt="" style={{ width: 56, height: 36, objectFit: 'cover', borderRadius: 6 }} />
            : <div style={{ width: 56, height: 36, borderRadius: 6, background: '#f3f4f6' }} />
      )
    },
    { key: 'title', label: 'Title' },
    { key: 'description', label: 'Description', render: (v) => <span style={{ fontSize: 12, color: '#6b7280' }}>{v?.substring(0, 60)}{v?.length > 60 ? '…' : ''}</span> },
    { key: 'buttonLabel', label: 'Button' },
    {
      key: 'fileUrl', label: 'File URL',
      render: (v) => v
        ? <a href={v} target="_blank" rel="noreferrer" style={{ color: '#2563eb', fontSize: 12 }}>Link ↗</a>
        : <span style={{ color: '#9ca3af', fontSize: 12 }}>—</span>
    },
    { key: 'order', label: 'Order' },
    {
      key: 'isPublished', label: 'Published',
      render: (v) => <span style={{ color: v !== false ? '#059669' : '#dc2626', fontWeight: 600, fontSize: 13 }}>{v !== false ? 'Yes' : 'No'}</span>
    },
  ];

  return (
    <div>
      <AdminHeader title="Brand Materials" breadcrumbs={['Brand Materials']} />

      <div style={{ padding: '24px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, color: '#374151' }}>Brand Kit Assets</h3>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#9ca3af' }}>
              Add downloadable brand assets. Placeholders show on public page until items are saved here.
            </p>
          </div>
          <button onClick={openAdd} style={addBtnStyle}>+ Add Material</button>
        </div>

        <DataTable
          columns={columns}
          data={materials}
          loading={loading}
          onEdit={openEdit}
          onDelete={(row) => setConfirmDelete(row)}
          canDeleteRows={canDelete(role)}
        />
      </div>

      {/* ── ADD / EDIT MODAL ── */}
      {showModal && (
        <ModalOverlay onClose={() => setShowModal(false)}>
          <h3 style={{ margin: '0 0 20px', color: '#0B1F4B' }}>
            {editing ? 'Edit Brand Material' : 'Add Brand Material'}
          </h3>
          <form onSubmit={handleSubmit}>
            <FormField label="Title" required>
              <input value={form.title} onChange={e => f('title', e.target.value)} required style={inputStyle} placeholder="e.g. NIQS Logo (White)" />
            </FormField>

            <FormField label="Description" required>
              <textarea value={form.description} onChange={e => f('description', e.target.value)} required rows={2} style={{ ...inputStyle, resize: 'vertical' }} placeholder="e.g. Primary logo for dark backgrounds. PNG, SVG, EPS formats." />
            </FormField>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <FormField label="Button Label">
                <input value={form.buttonLabel} onChange={e => f('buttonLabel', e.target.value)} style={inputStyle} placeholder="Download" />
              </FormField>
              <FormField label="Sort Order">
                <input type="number" value={form.order} onChange={e => f('order', Number(e.target.value))} style={inputStyle} min={0} />
              </FormField>
            </div>

            <FormField label="File URL (direct download link)">
              <input value={form.fileUrl} onChange={e => f('fileUrl', e.target.value)} style={inputStyle} placeholder="https://... (leave blank to disable download)" />
            </FormField>

            <FormField label="Preview Type">
              <select value={form.previewType} onChange={e => f('previewType', e.target.value)} style={inputStyle}>
                {previewTypeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </FormField>

            {(form.previewType === 'image' || form.previewType === 'image_contained') && (
              <FormField label="Preview Image URL">
                <input value={form.previewImage} onChange={e => f('previewImage', e.target.value)} style={inputStyle} placeholder="https://..." />
              </FormField>
            )}

            {form.previewType === 'image_contained' && (
              <FormField label="Preview Background (CSS color/gradient)">
                <input value={form.previewBackground} onChange={e => f('previewBackground', e.target.value)} style={inputStyle} placeholder="e.g. #0B1F4B or var(--navy)" />
              </FormField>
            )}

            {form.previewType === 'image_contained' && (
              <FormField label="Image Filter (CSS filter value)">
                <input value={form.imageFilter} onChange={e => f('imageFilter', e.target.value)} style={inputStyle} placeholder="e.g. grayscale(100%) brightness(.3)" />
              </FormField>
            )}

            {form.previewType === 'gradient' && (
              <FormField label="Gradient Background (CSS background value)">
                <input value={form.previewBackground} onChange={e => f('previewBackground', e.target.value)} style={inputStyle} placeholder="e.g. linear-gradient(135deg,#0B1F4B 50%,#C9974A 100%)" />
              </FormField>
            )}

            <FormField label="Published">
              <select value={form.isPublished ? 'yes' : 'no'} onChange={e => f('isPublished', e.target.value === 'yes')} style={inputStyle}>
                <option value="yes">Yes</option>
                <option value="no">No (Draft)</option>
              </select>
            </FormField>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
              <button type="button" onClick={() => setShowModal(false)} style={{ ...btnStyle, background: '#e5e7eb', color: '#374151' }}>Cancel</button>
              <button type="submit" disabled={submitting} style={{ ...btnStyle, background: '#C9974A', color: '#fff', opacity: submitting ? 0.6 : 1 }}>
                {submitting ? 'Saving...' : editing ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </ModalOverlay>
      )}

      {/* ── DELETE CONFIRM ── */}
      {confirmDelete && (
        <ModalOverlay onClose={() => setConfirmDelete(null)}>
          <h3 style={{ margin: '0 0 12px', color: '#dc2626' }}>Confirm Delete</h3>
          <p style={{ color: '#374151', fontSize: 14 }}>
            Delete <strong>{confirmDelete.title}</strong>? This cannot be undone.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
            <button onClick={() => setConfirmDelete(null)} style={{ ...btnStyle, background: '#e5e7eb', color: '#374151' }}>Cancel</button>
            <button onClick={handleDelete} style={{ ...btnStyle, background: '#dc2626', color: '#fff' }}>Delete</button>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
}

function ModalOverlay({ children, onClose }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 12, padding: '24px 28px', width: '100%', maxWidth: 580, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        {children}
      </div>
    </div>
  );
}

function FormField({ label, required, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 4 }}>
        {label} {required && <span style={{ color: '#dc2626' }}>*</span>}
      </label>
      {children}
    </div>
  );
}

const inputStyle = { width: '100%', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14, color: '#111827', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' };
const btnStyle = { padding: '10px 22px', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 14, cursor: 'pointer' };
const addBtnStyle = { padding: '10px 20px', background: '#C9974A', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 14, cursor: 'pointer' };
