import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { canDelete, getAdminLabel } from '../../utils/roleHelpers';
import AdminHeader from '../../components/admin/AdminHeader';
import DataTable from '../../components/admin/DataTable';

const emptyForm = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  role: 'national_admin',
  chapter: '',
  isActive: true,
};

export default function ManageAdmins() {
  const { admin } = useAuth();
  const role = admin?.role || '';
  const [admins, setAdmins] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [submitting, setSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    fetchAdmins();
    fetchChapters();
  }, []);

  const fetchAdmins = async () => {
    try {
      const { data } = await API.get('/admin');
      setAdmins(data.admins || data || []);
    } catch (err) {
      toast.error('Failed to fetch admins');
    } finally {
      setLoading(false);
    }
  };

  const fetchChapters = async () => {
    try {
      const { data } = await API.get('/chapters');
      setChapters(data.chapters || data || []);
    } catch (err) {
      // silent
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
      firstName: row.firstName || '',
      lastName: row.lastName || '',
      email: row.email || '',
      password: '',
      role: row.role || 'national_admin',
      chapter: row.chapter?._id || row.chapter || '',
      isActive: row.isActive !== false,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...form };
      if (editing && !payload.password) delete payload.password;
      if (payload.role !== 'state_admin') delete payload.chapter;

      if (editing) {
        await API.put(`/admin/${editing._id}`, payload);
        toast.success('Admin updated');
      } else {
        await API.post('/admin', payload);
        toast.success('Admin created');
      }
      setShowModal(false);
      fetchAdmins();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save admin');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await API.delete(`/admin/${confirmDelete._id}`);
      toast.success('Admin deleted');
      setConfirmDelete(null);
      fetchAdmins();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete admin');
    }
  };

  const columns = [
    {
      key: 'firstName',
      label: 'Name',
      render: (_, row) => `${row.firstName || ''} ${row.lastName || ''}`.trim(),
    },
    { key: 'email', label: 'Email' },
    {
      key: 'role',
      label: 'Role',
      render: (val) => (
        <span
          style={{
            padding: '2px 8px',
            borderRadius: 4,
            fontSize: 11,
            fontWeight: 600,
            background:
              val === 'main_admin' ? '#C9974A' : val === 'national_admin' ? '#2563EB' : '#059669',
            color: '#fff',
          }}
        >
          {getAdminLabel(val)}
        </span>
      ),
    },
    {
      key: 'chapter',
      label: 'Chapter',
      render: (val) => (val && typeof val === 'object' ? val.name : val || '--'),
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (val) => (
        <span style={{ color: val !== false ? '#059669' : '#dc2626', fontWeight: 600, fontSize: 13 }}>
          {val !== false ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'lastLogin',
      label: 'Last Login',
      render: (val) => (val ? new Date(val).toLocaleDateString() : 'Never'),
    },
  ];

  return (
    <div>
      <AdminHeader title="Admin Management (UAC)" breadcrumbs={['Admin Management']} />

      <div style={{ padding: '24px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h3 style={{ margin: 0, fontSize: 16, color: '#374151' }}>All Administrators</h3>
          <button
            onClick={openAdd}
            style={{
              padding: '10px 20px',
              background: '#C9974A',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            + Add New Admin
          </button>
        </div>

        <DataTable
          columns={columns}
          data={admins}
          loading={loading}
          onEdit={openEdit}
          onDelete={(row) => setConfirmDelete(row)}
          canDeleteRows={canDelete(role)}
        />
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <ModalOverlay onClose={() => setShowModal(false)}>
          <h3 style={{ margin: '0 0 20px', color: '#0B1F4B' }}>
            {editing ? 'Edit Admin' : 'Add New Admin'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <FormField label="First Name" required>
                <input
                  type="text"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  required
                  style={inputStyle}
                />
              </FormField>
              <FormField label="Last Name" required>
                <input
                  type="text"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  required
                  style={inputStyle}
                />
              </FormField>
            </div>
            <FormField label="Email" required>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                style={inputStyle}
              />
            </FormField>
            <FormField label={editing ? 'Password (leave blank to keep)' : 'Password'} required={!editing}>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required={!editing}
                style={inputStyle}
              />
            </FormField>
            <FormField label="Role" required>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                style={inputStyle}
              >
                <option value="national_admin">National Admin</option>
                <option value="state_admin">State Admin</option>
              </select>
            </FormField>
            {form.role === 'state_admin' && (
              <FormField label="Assigned Chapter" required>
                <select
                  value={form.chapter}
                  onChange={(e) => setForm({ ...form, chapter: e.target.value })}
                  required
                  style={inputStyle}
                >
                  <option value="">-- Select Chapter --</option>
                  {chapters.map((ch) => (
                    <option key={ch._id} value={ch._id}>
                      {ch.name}
                    </option>
                  ))}
                </select>
              </FormField>
            )}
            {editing && (
              <FormField label="Status">
                <select
                  value={form.isActive ? 'active' : 'inactive'}
                  onChange={(e) => setForm({ ...form, isActive: e.target.value === 'active' })}
                  style={inputStyle}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </FormField>
            )}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{ ...btnStyle, background: '#e5e7eb', color: '#374151' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                style={{ ...btnStyle, background: '#C9974A', color: '#fff', opacity: submitting ? 0.6 : 1 }}
              >
                {submitting ? 'Saving...' : editing ? 'Update' : 'Create'}
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
            Are you sure you want to delete admin{' '}
            <strong>{confirmDelete.firstName} {confirmDelete.lastName}</strong>? This cannot be undone.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
            <button
              onClick={() => setConfirmDelete(null)}
              style={{ ...btnStyle, background: '#e5e7eb', color: '#374151' }}
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              style={{ ...btnStyle, background: '#dc2626', color: '#fff' }}
            >
              Delete
            </button>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
}

/* ---- Shared sub-components & styles ---- */

function ModalOverlay({ children, onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: 12,
          padding: '24px 28px',
          width: '100%',
          maxWidth: 520,
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        }}
      >
        {children}
      </div>
    </div>
  );
}

function FormField({ label, required, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label
        style={{
          display: 'block',
          fontSize: 13,
          fontWeight: 600,
          color: '#374151',
          marginBottom: 4,
        }}
      >
        {label} {required && <span style={{ color: '#dc2626' }}>*</span>}
      </label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '9px 12px',
  border: '1px solid #d1d5db',
  borderRadius: 6,
  fontSize: 14,
  color: '#111827',
  outline: 'none',
  boxSizing: 'border-box',
};

const btnStyle = {
  padding: '10px 22px',
  border: 'none',
  borderRadius: 6,
  fontWeight: 600,
  fontSize: 14,
  cursor: 'pointer',
};
