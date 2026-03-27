import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { canDelete } from '../../utils/roleHelpers';
import AdminHeader from '../../components/admin/AdminHeader';
import DataTable from '../../components/admin/DataTable';

const jobTypes = ['full-time', 'part-time', 'contract', 'internship', 'remote'];

const emptyForm = {
  title: '',
  company: '',
  location: '',
  type: 'full-time',
  description: '',
  requirements: '',
  salary: '',
  logo: '',
  applicationLink: '',
  deadline: '',
  isActive: true,
};

export default function ManageJobs() {
  const { admin } = useAuth();
  const role = admin?.role || '';
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [submitting, setSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const { data } = await API.get('/jobs');
      setJobs(data.jobs || data || []);
    } catch (err) {
      toast.error('Failed to fetch jobs');
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
      company: row.company || '',
      location: row.location || '',
      type: row.type || 'full-time',
      description: row.description || '',
      requirements: row.requirements || '',
      salary: row.salary || '',
      logo: row.logo || '',
      applicationLink: row.applicationLink || '',
      deadline: row.deadline ? row.deadline.slice(0, 10) : '',
      isActive: row.isActive !== false,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editing) {
        await API.put(`/jobs/${editing._id}`, form);
        toast.success('Job updated');
      } else {
        await API.post('/jobs', form);
        toast.success('Job created');
      }
      setShowModal(false);
      fetchJobs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await API.delete(`/jobs/${confirmDelete._id}`);
      toast.success('Job deleted');
      setConfirmDelete(null);
      fetchJobs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  const columns = [
    { key: 'title', label: 'Title' },
    { key: 'company', label: 'Company' },
    { key: 'location', label: 'Location', render: (val) => val || '--' },
    {
      key: 'type',
      label: 'Type',
      render: (val) => (
        <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, background: '#e5e7eb', color: '#374151', textTransform: 'capitalize' }}>
          {val}
        </span>
      ),
    },
    {
      key: 'deadline',
      label: 'Deadline',
      render: (val) => (val ? new Date(val).toLocaleDateString() : '--'),
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
      <AdminHeader title="Manage Jobs" breadcrumbs={['Jobs']} />

      <div style={{ padding: '24px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h3 style={{ margin: 0, fontSize: 16, color: '#374151' }}>Job Listings</h3>
          <button onClick={openAdd} style={addBtnStyle}>+ Add Job</button>
        </div>

        <DataTable
          columns={columns}
          data={jobs}
          loading={loading}
          onEdit={openEdit}
          onDelete={(row) => setConfirmDelete(row)}
          canDeleteRows={canDelete(role)}
        />
      </div>

      {showModal && (
        <ModalOverlay onClose={() => setShowModal(false)}>
          <h3 style={{ margin: '0 0 20px', color: '#0B1F4B' }}>
            {editing ? 'Edit Job' : 'Add Job'}
          </h3>
          <form onSubmit={handleSubmit}>
            <FormField label="Job Title" required>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required style={inputStyle} />
            </FormField>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <FormField label="Company" required>
                <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} required style={inputStyle} />
              </FormField>
              <FormField label="Location">
                <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} style={inputStyle} placeholder="Lagos, Nigeria" />
              </FormField>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <FormField label="Job Type">
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} style={inputStyle}>
                  {jobTypes.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </FormField>
              <FormField label="Salary">
                <input value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} style={inputStyle} placeholder="e.g. N500,000 - N800,000" />
              </FormField>
            </div>
            <FormField label="Description" required>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required rows={4} style={{ ...inputStyle, resize: 'vertical' }} />
            </FormField>
            <FormField label="Requirements">
              <textarea value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} rows={3} style={{ ...inputStyle, resize: 'vertical' }} placeholder="One per line" />
            </FormField>
            <FormField label="Company Logo URL">
              <input value={form.logo} onChange={(e) => setForm({ ...form, logo: e.target.value })} style={inputStyle} placeholder="https://..." />
            </FormField>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <FormField label="Application Link">
                <input value={form.applicationLink} onChange={(e) => setForm({ ...form, applicationLink: e.target.value })} style={inputStyle} placeholder="https://..." />
              </FormField>
              <FormField label="Deadline">
                <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} style={inputStyle} />
              </FormField>
            </div>
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
          <p style={{ color: '#374151', fontSize: 14 }}>Delete job <strong>{confirmDelete.title}</strong>?</p>
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
