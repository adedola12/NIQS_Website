import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import AdminHeader from '../../components/admin/AdminHeader';
import DataTable from '../../components/admin/DataTable';

const statusOptions = ['active', 'inactive', 'suspended', 'pending'];
const memberTypes = ['associate', 'full', 'fellow', 'honorary', 'student'];

export default function ManageMembers() {
  const { admin } = useAuth();
  const role = admin?.role || '';
  const isStateAdmin = role === 'state_admin';
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [viewDetail, setViewDetail] = useState(null);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const params = {};
      if (isStateAdmin && admin?.chapter) {
        params.chapter = admin.chapter._id || admin.chapter;
      }
      const { data } = await API.get('/members', { params });
      setMembers(data.members || data || []);
    } catch (err) {
      toast.error('Failed to fetch members');
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm({
      status: row.status || 'active',
      paymentStatus: row.paymentStatus || 'unpaid',
      membershipType: row.membershipType || 'associate',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.put(`/members/${editing._id}`, form);
      toast.success('Member updated');
      setShowModal(false);
      fetchMembers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setSubmitting(false);
    }
  };

  // Apply local filters
  const filtered = members.filter((m) => {
    if (filterStatus && m.status !== filterStatus) return false;
    if (filterType && m.membershipType !== filterType) return false;
    return true;
  });

  const columns = [
    {
      key: 'firstName',
      label: 'Name',
      render: (_, row) => `${row.firstName || ''} ${row.lastName || ''}`.trim() || '--',
    },
    { key: 'email', label: 'Email' },
    {
      key: 'membershipType',
      label: 'Type',
      render: (val) => (
        <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, background: '#e5e7eb', color: '#374151', textTransform: 'capitalize' }}>
          {val || '--'}
        </span>
      ),
    },
    {
      key: 'chapter',
      label: 'Chapter',
      render: (val) => (val && typeof val === 'object' ? val.name : val || '--'),
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => {
        const colors = { active: '#059669', inactive: '#6b7280', suspended: '#dc2626', pending: '#C9974A' };
        return (
          <span style={{ color: colors[val] || '#6b7280', fontWeight: 600, fontSize: 13, textTransform: 'capitalize' }}>
            {val || '--'}
          </span>
        );
      },
    },
    {
      key: 'paymentStatus',
      label: 'Payment',
      render: (val) => (
        <span
          style={{
            padding: '2px 8px',
            borderRadius: 4,
            fontSize: 11,
            fontWeight: 600,
            background: val === 'paid' ? '#dcfce7' : '#fef3c7',
            color: val === 'paid' ? '#059669' : '#b45309',
            textTransform: 'capitalize',
          }}
        >
          {val || 'unpaid'}
        </span>
      ),
    },
  ];

  return (
    <div>
      <AdminHeader title="Manage Members" breadcrumbs={['Members']} />

      <div style={{ padding: '24px 28px' }}>
        {/* Filters */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 18, flexWrap: 'wrap', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: 16, color: '#374151', marginRight: 'auto' }}>
            {isStateAdmin ? 'Chapter Members' : 'All Members'}
          </h3>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ ...filterSelect }}
          >
            <option value="">All Statuses</option>
            {statusOptions.map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{ ...filterSelect }}
          >
            <option value="">All Types</option>
            {memberTypes.map((t) => (
              <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>
        </div>

        <DataTable
          columns={columns}
          data={filtered}
          loading={loading}
          onEdit={openEdit}
          canDeleteRows={false}
        />
      </div>

      {/* Edit Modal */}
      {showModal && editing && (
        <ModalOverlay onClose={() => setShowModal(false)}>
          <h3 style={{ margin: '0 0 6px', color: '#0B1F4B' }}>Edit Member</h3>
          <p style={{ margin: '0 0 20px', fontSize: 13, color: '#6b7280' }}>
            {editing.firstName} {editing.lastName} ({editing.email})
          </p>
          <form onSubmit={handleSubmit}>
            <FormField label="Status">
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                style={inputStyle}
              >
                {statusOptions.map((s) => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Payment Status">
              <select
                value={form.paymentStatus}
                onChange={(e) => setForm({ ...form, paymentStatus: e.target.value })}
                style={inputStyle}
              >
                <option value="unpaid">Unpaid</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
            </FormField>
            <FormField label="Membership Type">
              <select
                value={form.membershipType}
                onChange={(e) => setForm({ ...form, membershipType: e.target.value })}
                style={inputStyle}
              >
                {memberTypes.map((t) => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </FormField>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
              <button type="button" onClick={() => setShowModal(false)} style={{ ...btnStyle, background: '#e5e7eb', color: '#374151' }}>
                Cancel
              </button>
              <button type="submit" disabled={submitting} style={{ ...btnStyle, background: '#C9974A', color: '#fff', opacity: submitting ? 0.6 : 1 }}>
                {submitting ? 'Saving...' : 'Update'}
              </button>
            </div>
          </form>
        </ModalOverlay>
      )}

      {/* View Detail Modal */}
      {viewDetail && (
        <ModalOverlay onClose={() => setViewDetail(null)}>
          <h3 style={{ margin: '0 0 16px', color: '#0B1F4B' }}>Member Details</h3>
          <div style={{ fontSize: 14, color: '#374151', lineHeight: 1.8 }}>
            <p><strong>Name:</strong> {viewDetail.firstName} {viewDetail.lastName}</p>
            <p><strong>Email:</strong> {viewDetail.email}</p>
            <p><strong>Phone:</strong> {viewDetail.phone || '--'}</p>
            <p><strong>Type:</strong> {viewDetail.membershipType}</p>
            <p><strong>Chapter:</strong> {viewDetail.chapter?.name || '--'}</p>
            <p><strong>Status:</strong> {viewDetail.status}</p>
            <p><strong>Payment:</strong> {viewDetail.paymentStatus || 'unpaid'}</p>
            <p><strong>Joined:</strong> {viewDetail.createdAt ? new Date(viewDetail.createdAt).toLocaleDateString() : '--'}</p>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
            <button onClick={() => setViewDetail(null)} style={{ ...btnStyle, background: '#e5e7eb', color: '#374151' }}>
              Close
            </button>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
}

function ModalOverlay({ children, onClose }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: 12, padding: '24px 28px', width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
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
const filterSelect = { padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13, color: '#374151', background: '#fff', cursor: 'pointer' };
