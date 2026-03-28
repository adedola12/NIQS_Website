import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { canDelete } from '../../utils/roleHelpers';
import AdminHeader from '../../components/admin/AdminHeader';
import DataTable from '../../components/admin/DataTable';

const NIGERIAN_STATES = [
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue',
  'Borno','Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT',
  'Gombe','Imo','Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi',
  'Kwara','Lagos','Nasarawa','Niger','Ogun','Ondo','Osun','Oyo',
  'Plateau','Rivers','Sokoto','Taraba','Yobe','Zamfara',
];

const emptyForm = {
  name: '', logo: '', regNumber: '', address: '', city: '',
  state: '', phone: '', email: '', website: '', description: '', isActive: true,
};

export default function ManageQSFirms() {
  const { admin }           = useAuth();
  const role                = admin?.role || '';
  const [firms, setFirms]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [editing, setEditing]       = useState(null);
  const [form, setForm]             = useState({ ...emptyForm });
  const [submitting, setSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => { fetchFirms(); }, []);

  const fetchFirms = async () => {
    try {
      const { data } = await API.get('/qs-firms/admin/all');
      setFirms(data.firms || []);
    } catch {
      toast.error('Failed to fetch QS firms');
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ ...emptyForm });
    setShowModal(true);
  };

  const openEdit = row => {
    setEditing(row);
    setForm({
      name:        row.name        || '',
      logo:        row.logo        || '',
      regNumber:   row.regNumber   || '',
      address:     row.address     || '',
      city:        row.city        || '',
      state:       row.state       || '',
      phone:       row.phone       || '',
      email:       row.email       || '',
      website:     row.website     || '',
      description: row.description || '',
      isActive:    row.isActive !== false,
    });
    setShowModal(true);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editing) {
        await API.put(`/qs-firms/${editing._id}`, form);
        toast.success('QS Firm updated');
      } else {
        await API.post('/qs-firms', form);
        toast.success('QS Firm added');
      }
      setShowModal(false);
      fetchFirms();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save firm');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await API.delete(`/qs-firms/${confirmDelete._id}`);
      toast.success('QS Firm deleted');
      setConfirmDelete(null);
      fetchFirms();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete firm');
    }
  };

  const columns = [
    {
      key: 'name', label: 'Firm Name',
      render: (val, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {row.logo ? (
            <img src={row.logo} alt={val} style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'contain', border: '1px solid #e5e7eb', background: '#f9fafb' }} />
          ) : (
            <div style={{
              width: 36, height: 36, borderRadius: 6, background: '#0B1F4B',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 800, color: '#fff',
            }}>
              {val.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase()}
            </div>
          )}
          <div>
            <div style={{ fontWeight: 600, fontSize: 13, color: '#111827' }}>{val}</div>
            {row.regNumber && <div style={{ fontSize: 11, color: '#6b7280' }}>{row.regNumber}</div>}
          </div>
        </div>
      ),
    },
    { key: 'state', label: 'State',
      render: val => (
        <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, background: '#0B1F4B', color: '#fff' }}>
          {val}
        </span>
      ),
    },
    { key: 'city',    label: 'City',    render: val => val || '—' },
    { key: 'phone',   label: 'Phone',   render: val => val || '—' },
    { key: 'email',   label: 'Email',   render: val => val || '—' },
    {
      key: 'isActive', label: 'Status',
      render: val => (
        <span style={{ color: val !== false ? '#059669' : '#dc2626', fontWeight: 600, fontSize: 13 }}>
          {val !== false ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ];

  return (
    <div>
      <AdminHeader
        title="QS Firms Directory"
        subtitle="Manage registered quantity surveying firms listed in the public directory"
        breadcrumbs={['QS Firms']}
      />

      <div style={{ padding: '24px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h3 style={{ margin: 0, fontSize: 16, color: '#374151' }}>
            All QS Firms <span style={{ color: '#9ca3af', fontWeight: 400 }}>({firms.length})</span>
          </h3>
          <button
            onClick={openAdd}
            style={{
              padding: '10px 20px', background: '#C9974A', color: '#fff',
              border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 14, cursor: 'pointer',
            }}
          >
            + Add QS Firm
          </button>
        </div>

        <DataTable
          columns={columns}
          data={firms}
          loading={loading}
          onEdit={openEdit}
          onDelete={row => setConfirmDelete(row)}
          canDeleteRows={canDelete(role)}
        />
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <ModalOverlay onClose={() => setShowModal(false)}>
          <h3 style={{ margin: '0 0 20px', color: '#0B1F4B' }}>
            {editing ? 'Edit QS Firm' : 'Add QS Firm'}
          </h3>
          <form onSubmit={handleSubmit}>

            {/* Firm Name */}
            <FormField label="Firm Name" required>
              <input type="text" value={form.name} required style={inp}
                onChange={e => setForm({ ...form, name: e.target.value })} />
            </FormField>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <FormField label="QSRBN Reg. Number">
                <input type="text" value={form.regNumber} style={inp} placeholder="e.g. QSRBN/001/2010"
                  onChange={e => setForm({ ...form, regNumber: e.target.value })} />
              </FormField>
              <FormField label="State" required>
                <select value={form.state} required style={inp}
                  onChange={e => setForm({ ...form, state: e.target.value })}>
                  <option value="">-- Select State --</option>
                  {NIGERIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </FormField>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <FormField label="City">
                <input type="text" value={form.city} style={inp} placeholder="e.g. Lagos"
                  onChange={e => setForm({ ...form, city: e.target.value })} />
              </FormField>
              <FormField label="Phone">
                <input type="tel" value={form.phone} style={inp} placeholder="+234 800 000 0000"
                  onChange={e => setForm({ ...form, phone: e.target.value })} />
              </FormField>
            </div>

            <FormField label="Address" required>
              <input type="text" value={form.address} required style={inp} placeholder="Street / office address"
                onChange={e => setForm({ ...form, address: e.target.value })} />
            </FormField>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <FormField label="Email">
                <input type="email" value={form.email} style={inp} placeholder="info@firm.com.ng"
                  onChange={e => setForm({ ...form, email: e.target.value })} />
              </FormField>
              <FormField label="Website">
                <input type="url" value={form.website} style={inp} placeholder="https://firmwebsite.com"
                  onChange={e => setForm({ ...form, website: e.target.value })} />
              </FormField>
            </div>

            <FormField label="Logo URL">
              <input type="url" value={form.logo} style={inp} placeholder="https://… (image URL)"
                onChange={e => setForm({ ...form, logo: e.target.value })} />
              {form.logo && (
                <img src={form.logo} alt="Logo preview" style={{ marginTop: 6, height: 48, borderRadius: 6, border: '1px solid #e5e7eb', objectFit: 'contain', background: '#f9fafb' }} />
              )}
            </FormField>

            <FormField label="Short Description">
              <textarea value={form.description} rows={3} style={{ ...inp, resize: 'vertical' }}
                placeholder="Brief description of the firm's specialisation…"
                onChange={e => setForm({ ...form, description: e.target.value })} />
            </FormField>

            {editing && (
              <FormField label="Status">
                <select value={form.isActive ? 'active' : 'inactive'} style={inp}
                  onChange={e => setForm({ ...form, isActive: e.target.value === 'active' })}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </FormField>
            )}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
              <button type="button" onClick={() => setShowModal(false)}
                style={{ ...btn, background: '#e5e7eb', color: '#374151' }}>Cancel</button>
              <button type="submit" disabled={submitting}
                style={{ ...btn, background: '#C9974A', color: '#fff', opacity: submitting ? .6 : 1 }}>
                {submitting ? 'Saving…' : editing ? 'Update' : 'Add Firm'}
              </button>
            </div>
          </form>
        </ModalOverlay>
      )}

      {/* Delete Confirm */}
      {confirmDelete && (
        <ModalOverlay onClose={() => setConfirmDelete(null)}>
          <h3 style={{ margin: '0 0 12px', color: '#dc2626' }}>Confirm Delete</h3>
          <p style={{ color: '#374151', fontSize: 14 }}>
            Are you sure you want to remove <strong>{confirmDelete.name}</strong> from the directory? This cannot be undone.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
            <button onClick={() => setConfirmDelete(null)} style={{ ...btn, background: '#e5e7eb', color: '#374151' }}>Cancel</button>
            <button onClick={handleDelete} style={{ ...btn, background: '#dc2626', color: '#fff' }}>Delete</button>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
}

/* ── Sub-components ── */
function ModalOverlay({ children, onClose }) {
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#fff', borderRadius: 12, padding: '24px 28px',
        width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      }}>
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

const inp = {
  width: '100%', padding: '9px 12px', border: '1px solid #d1d5db',
  borderRadius: 6, fontSize: 14, color: '#111827', outline: 'none',
  boxSizing: 'border-box', fontFamily: 'inherit',
};

const btn = {
  padding: '10px 22px', border: 'none', borderRadius: 6,
  fontWeight: 600, fontSize: 14, cursor: 'pointer',
};
