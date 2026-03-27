import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { canDelete } from '../../utils/roleHelpers';
import AdminHeader from '../../components/admin/AdminHeader';
import DataTable from '../../components/admin/DataTable';

const tiers = ['platinum', 'gold', 'silver', 'bronze', 'associate'];

const emptyForm = {
  name: '',
  tier: 'gold',
  logo: '',
  description: '',
  benefits: '',
  price: '',
  website: '',
  contactEmail: '',
  isActive: true,
};

export default function ManagePartners() {
  const { admin } = useAuth();
  const role = admin?.role || '';
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [submitting, setSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      const { data } = await API.get('/partners');
      setPartners(data.partners || data || []);
    } catch (err) {
      toast.error('Failed to fetch partners');
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
      name: row.name || '',
      tier: row.tier || 'gold',
      logo: row.logo || '',
      description: row.description || '',
      benefits: Array.isArray(row.benefits) ? row.benefits.join('\n') : row.benefits || '',
      price: row.price || '',
      website: row.website || '',
      contactEmail: row.contactEmail || '',
      isActive: row.isActive !== false,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        price: form.price ? Number(form.price) : undefined,
        benefits: form.benefits
          .split('\n')
          .map((b) => b.trim())
          .filter(Boolean),
      };

      if (editing) {
        await API.put(`/partners/${editing._id}`, payload);
        toast.success('Partner updated');
      } else {
        await API.post('/partners', payload);
        toast.success('Partner created');
      }
      setShowModal(false);
      fetchPartners();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await API.delete(`/partners/${confirmDelete._id}`);
      toast.success('Partner deleted');
      setConfirmDelete(null);
      fetchPartners();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  const tierColors = {
    platinum: '#6b7280',
    gold: '#C9974A',
    silver: '#9ca3af',
    bronze: '#b45309',
    associate: '#2563EB',
  };

  const columns = [
    { key: 'name', label: 'Name' },
    {
      key: 'tier',
      label: 'Tier',
      render: (val) => (
        <span
          style={{
            padding: '2px 10px',
            borderRadius: 4,
            fontSize: 11,
            fontWeight: 700,
            background: `${tierColors[val] || '#e5e7eb'}20`,
            color: tierColors[val] || '#374151',
            textTransform: 'capitalize',
          }}
        >
          {val}
        </span>
      ),
    },
    {
      key: 'isActive',
      label: 'Active',
      render: (val) => (
        <span style={{ color: val !== false ? '#059669' : '#dc2626', fontWeight: 600, fontSize: 13 }}>
          {val !== false ? 'Yes' : 'No'}
        </span>
      ),
    },
  ];

  return (
    <div>
      <AdminHeader title="Manage Partners" breadcrumbs={['Partners']} />

      <div style={{ padding: '24px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h3 style={{ margin: 0, fontSize: 16, color: '#374151' }}>Partner Organizations</h3>
          <button onClick={openAdd} style={addBtnStyle}>+ Add Partner</button>
        </div>

        <DataTable
          columns={columns}
          data={partners}
          loading={loading}
          onEdit={openEdit}
          onDelete={(row) => setConfirmDelete(row)}
          canDeleteRows={canDelete(role)}
        />
      </div>

      {showModal && (
        <ModalOverlay onClose={() => setShowModal(false)}>
          <h3 style={{ margin: '0 0 20px', color: '#0B1F4B' }}>
            {editing ? 'Edit Partner' : 'Add Partner'}
          </h3>
          <form onSubmit={handleSubmit}>
            <FormField label="Organization Name" required>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required style={inputStyle} />
            </FormField>
            <FormField label="Partnership Tier" required>
              <select value={form.tier} onChange={(e) => setForm({ ...form, tier: e.target.value })} style={inputStyle}>
                {tiers.map((t) => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Logo URL">
              <input value={form.logo} onChange={(e) => setForm({ ...form, logo: e.target.value })} style={inputStyle} placeholder="https://..." />
            </FormField>
            <FormField label="Description">
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
            </FormField>
            <FormField label="Benefits (one per line)">
              <textarea value={form.benefits} onChange={(e) => setForm({ ...form, benefits: e.target.value })} rows={4} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Logo on website&#10;Event sponsorship&#10;Member discounts" />
            </FormField>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <FormField label="Price">
                <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} style={inputStyle} placeholder="Amount in Naira" />
              </FormField>
              <FormField label="Website">
                <input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} style={inputStyle} placeholder="https://..." />
              </FormField>
            </div>
            <FormField label="Contact Email">
              <input type="email" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} style={inputStyle} />
            </FormField>
            <FormField label="Active">
              <select value={form.isActive ? 'yes' : 'no'} onChange={(e) => setForm({ ...form, isActive: e.target.value === 'yes' })} style={inputStyle}>
                <option value="yes">Yes</option>
                <option value="no">No</option>
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

      {confirmDelete && (
        <ModalOverlay onClose={() => setConfirmDelete(null)}>
          <h3 style={{ margin: '0 0 12px', color: '#dc2626' }}>Confirm Delete</h3>
          <p style={{ color: '#374151', fontSize: 14 }}>Delete partner <strong>{confirmDelete.name}</strong>?</p>
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
      <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: 12, padding: '24px 28px', width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
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

const inputStyle = { width: '100%', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14, color: '#111827', outline: 'none', boxSizing: 'border-box' };
const btnStyle = { padding: '10px 22px', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 14, cursor: 'pointer' };
const addBtnStyle = { padding: '10px 20px', background: '#C9974A', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 14, cursor: 'pointer' };
