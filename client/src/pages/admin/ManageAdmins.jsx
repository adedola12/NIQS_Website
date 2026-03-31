import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  MdAdminPanelSettings, MdEdit, MdDelete, MdPersonAdd,
  MdToggleOn, MdToggleOff, MdShield, MdSearch,
} from 'react-icons/md';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import AdminHeader from '../../components/admin/AdminHeader';

/* ── Role config ──────────────────────────────────────── */
const ROLES = [
  { value: 'national_admin', label: 'National Admin',      color: '#2563EB', bg: '#eff6ff' },
  { value: 'state_admin',    label: 'State Chapter Admin', color: '#059669', bg: '#ecfdf5' },
  { value: 'waqsn_admin',    label: 'WAQSN Admin',         color: '#7c3aed', bg: '#f5f3ff' },
  { value: 'yqsf_admin',     label: 'YQSF Admin',         color: '#0891b2', bg: '#ecfeff' },
  { value: 'main_admin',     label: 'Main Admin',          color: '#C9974A', bg: '#fffbeb' },
];
const roleInfo = (val) => ROLES.find(r => r.value === val) || { label: val, color: '#6b7280', bg: '#f9fafb' };

const emptyForm = {
  firstName: '', lastName: '', email: '', password: '',
  role: 'national_admin', assignedChapter: '', isActive: true,
};

export default function ManageAdmins() {
  const { admin: me } = useAuth();
  const isMain = me?.role === 'main_admin';

  const [admins,   setAdmins]   = useState([]);
  const [chapters, setChapters] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');

  /* modal state */
  const [showModal,     setShowModal]     = useState(false);
  const [editing,       setEditing]       = useState(null);
  const [form,          setForm]          = useState({ ...emptyForm });
  const [submitting,    setSubmitting]    = useState(false);

  /* quick-role panel */
  const [roleTarget,    setRoleTarget]    = useState(null); // admin object
  const [quickRole,     setQuickRole]     = useState('');

  /* delete confirm */
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => { fetchAdmins(); fetchChapters(); }, []);

  const fetchAdmins = async () => {
    try {
      const { data } = await API.get('/admin');
      setAdmins(Array.isArray(data) ? data : data.admins || []);
    } catch { toast.error('Failed to load admins'); }
    finally { setLoading(false); }
  };

  const fetchChapters = async () => {
    try {
      const { data } = await API.get('/chapters');
      setChapters(Array.isArray(data) ? data : data.chapters || []);
    } catch { /* silent */ }
  };

  /* ── CRUD ── */
  const openAdd = () => { setEditing(null); setForm({ ...emptyForm }); setShowModal(true); };
  const openEdit = (row) => {
    setEditing(row);
    setForm({
      firstName: row.firstName || '', lastName: row.lastName || '',
      email: row.email || '', password: '',
      role: row.role || 'national_admin',
      assignedChapter: row.assignedChapter?._id || row.assignedChapter || '',
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
      if (payload.role !== 'state_admin') delete payload.assignedChapter;
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
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await API.delete(`/admin/${confirmDelete._id}`);
      toast.success('Admin deleted');
      setConfirmDelete(null);
      fetchAdmins();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to delete'); }
  };

  /* ── Quick role change ── */
  const openRolePanel = (row) => { setRoleTarget(row); setQuickRole(row.role); };
  const applyRoleChange = async () => {
    if (!roleTarget || quickRole === roleTarget.role) { setRoleTarget(null); return; }
    try {
      await API.put(`/admin/${roleTarget._id}`, { role: quickRole });
      toast.success(`Role updated to ${roleInfo(quickRole).label}`);
      setRoleTarget(null);
      fetchAdmins();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to update role'); }
  };

  /* ── Toggle active ── */
  const toggleActive = async (row) => {
    if (row._id === me?._id) { toast.error("Can't deactivate your own account"); return; }
    try {
      await API.put(`/admin/${row._id}`, { isActive: !row.isActive });
      toast.success(row.isActive ? 'Admin deactivated' : 'Admin activated');
      fetchAdmins();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to update status'); }
  };

  const filtered = admins
    // Non-main_admin users must not see the main admin account
    .filter(a => isMain || a.role !== 'main_admin')
    .filter(a =>
      `${a.firstName} ${a.lastName} ${a.email} ${a.role}`.toLowerCase().includes(search.toLowerCase())
    );

  /* ── Summaries (hide main_admin row for non-main_admin viewers) ── */
  const summary = ROLES
    .filter(r => isMain || r.value !== 'main_admin')
    .map(r => ({ ...r, count: admins.filter(a => a.role === r.value).length }));

  return (
    <div>
      <AdminHeader title="Admin Management (UAC)" breadcrumbs={['UAC']} />

      <div style={{ padding: '24px 28px' }}>

        {/* Summary badges */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
          {summary.map(r => (
            <div key={r.value} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: r.bg, border: `1.5px solid ${r.color}22`, borderRadius: 10 }}>
              <MdShield size={16} color={r.color} />
              <span style={{ fontSize: 13, fontWeight: 700, color: r.color }}>{r.count}</span>
              <span style={{ fontSize: 12, color: '#6b7280' }}>{r.label}</span>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 10, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
            <MdSearch size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input
              type="text" placeholder="Search admins…" value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '9px 12px 9px 32px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, boxSizing: 'border-box' }}
            />
          </div>
          {isMain && (
            <button onClick={openAdd} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', background: '#0B1F4B', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
              <MdPersonAdd size={18} /> Add New Admin
            </button>
          )}
        </div>

        {/* Table */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Loading...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>No admins found.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  {['Admin', 'Email', 'Role', 'Chapter', 'Status', 'Last Login', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: '#6b7280', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(a => {
                  const ri = roleInfo(a.role);
                  const isSelf = a._id === me?._id;
                  return (
                    <tr key={a._id} style={{ borderBottom: '1px solid #f3f4f6' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}>

                      {/* Name */}
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 34, height: 34, borderRadius: '50%', background: ri.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                            {(a.firstName?.[0] || '?').toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: '#111827' }}>{a.firstName} {a.lastName}{isSelf ? ' (You)' : ''}</div>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td style={{ padding: '10px 14px', color: '#6b7280' }}>{a.email}</td>

                      {/* Role badge */}
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 6, background: ri.bg, color: ri.color, fontWeight: 700, fontSize: 11, border: `1px solid ${ri.color}33` }}>
                          <MdAdminPanelSettings size={13} />{ri.label}
                        </span>
                      </td>

                      {/* Chapter */}
                      <td style={{ padding: '10px 14px', color: '#6b7280', fontSize: 12 }}>
                        {a.assignedChapter ? (typeof a.assignedChapter === 'object' ? a.assignedChapter.name : a.assignedChapter) : '—'}
                      </td>

                      {/* Status toggle */}
                      <td style={{ padding: '10px 14px' }}>
                        {isMain && !isSelf && a.role !== 'main_admin' ? (
                          <button onClick={() => toggleActive(a)} title={a.isActive ? 'Click to deactivate' : 'Click to activate'}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, color: a.isActive ? '#059669' : '#dc2626' }}>
                            {a.isActive ? <MdToggleOn size={22} /> : <MdToggleOff size={22} />}
                            <span style={{ fontSize: 12, fontWeight: 600 }}>{a.isActive ? 'Active' : 'Inactive'}</span>
                          </button>
                        ) : (
                          <span style={{ fontSize: 12, fontWeight: 600, color: a.isActive ? '#059669' : '#dc2626' }}>
                            {a.isActive ? 'Active' : 'Inactive'}
                          </span>
                        )}
                      </td>

                      {/* Last login */}
                      <td style={{ padding: '10px 14px', color: '#9ca3af', fontSize: 12 }}>
                        {a.lastLogin ? new Date(a.lastLogin).toLocaleDateString() : 'Never'}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '10px 14px' }}>
                        {isMain && (
                          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                            {/* Change Role — not shown for main_admin or self */}
                            {!isSelf && a.role !== 'main_admin' && (
                              <button onClick={() => openRolePanel(a)} title="Change Role"
                                style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', background: '#f0f9ff', border: '1px solid #0891b2', borderRadius: 6, color: '#0891b2', fontWeight: 600, fontSize: 11, cursor: 'pointer' }}>
                                <MdShield size={13} /> Role
                              </button>
                            )}
                            {/* Edit */}
                            <button onClick={() => openEdit(a)} title="Edit"
                              style={{ padding: 6, background: '#f3f4f6', border: 'none', borderRadius: 6, cursor: 'pointer', color: '#374151', display: 'flex' }}>
                              <MdEdit size={15} />
                            </button>
                            {/* Delete — never shown for main_admin or self */}
                            {!isSelf && a.role !== 'main_admin' && (
                              <button onClick={() => setConfirmDelete(a)} title="Delete"
                                style={{ padding: 6, background: '#fef2f2', border: 'none', borderRadius: 6, cursor: 'pointer', color: '#dc2626', display: 'flex' }}>
                                <MdDelete size={15} />
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Add / Edit Modal ── */}
      {showModal && (
        <Modal onClose={() => setShowModal(false)} title={editing ? 'Edit Admin' : 'Add New Admin'}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="First Name" required>
                <input style={iStyle} value={form.firstName} required
                  onChange={e => setForm({ ...form, firstName: e.target.value })} />
              </Field>
              <Field label="Last Name" required>
                <input style={iStyle} value={form.lastName} required
                  onChange={e => setForm({ ...form, lastName: e.target.value })} />
              </Field>
            </div>
            <Field label="Email" required>
              <input style={iStyle} type="email" value={form.email} required
                onChange={e => setForm({ ...form, email: e.target.value })} />
            </Field>
            <Field label={editing ? 'Password (leave blank to keep)' : 'Password'} required={!editing}>
              <input style={iStyle} type="password" value={form.password}
                required={!editing}
                onChange={e => setForm({ ...form, password: e.target.value })} />
            </Field>
            <Field label="Role" required>
              <select style={iStyle} value={form.role}
                onChange={e => setForm({ ...form, role: e.target.value })}>
                {ROLES.filter(r => r.value !== 'main_admin').map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </Field>
            {form.role === 'state_admin' && (
              <Field label="Assigned Chapter" required>
                <select style={iStyle} value={form.assignedChapter} required
                  onChange={e => setForm({ ...form, assignedChapter: e.target.value })}>
                  <option value="">-- Select Chapter --</option>
                  {chapters.map(ch => (
                    <option key={ch._id} value={ch._id}>{ch.name}</option>
                  ))}
                </select>
              </Field>
            )}
            {editing && (
              <Field label="Status">
                <select style={iStyle} value={form.isActive ? 'active' : 'inactive'}
                  onChange={e => setForm({ ...form, isActive: e.target.value === 'active' })}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </Field>
            )}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
              <Btn onClick={() => setShowModal(false)} style={{ background: '#e5e7eb', color: '#374151' }}>Cancel</Btn>
              <Btn type="submit" disabled={submitting} style={{ background: '#0B1F4B', color: '#fff', opacity: submitting ? .6 : 1 }}>
                {submitting ? 'Saving…' : editing ? 'Update' : 'Create Admin'}
              </Btn>
            </div>
          </form>
        </Modal>
      )}

      {/* ── Quick Role Change Panel ── */}
      {roleTarget && (
        <Modal onClose={() => setRoleTarget(null)} title="Change Admin Role">
          <div style={{ marginBottom: 16 }}>
            <p style={{ margin: '0 0 4px', fontSize: 13, color: '#6b7280' }}>Changing role for:</p>
            <p style={{ margin: 0, fontWeight: 700, color: '#0B1F4B', fontSize: 15 }}>
              {roleTarget.firstName} {roleTarget.lastName} — {roleTarget.email}
            </p>
          </div>
          <Field label="Select New Role" required>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
              {ROLES.filter(r => r.value !== 'main_admin').map(r => (
                <label key={r.value} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', border: `2px solid ${quickRole === r.value ? r.color : '#e5e7eb'}`, borderRadius: 8, cursor: 'pointer', background: quickRole === r.value ? r.bg : '#fff', transition: 'all .15s' }}>
                  <input type="radio" name="role" value={r.value} checked={quickRole === r.value}
                    onChange={() => setQuickRole(r.value)} style={{ accentColor: r.color }} />
                  <MdAdminPanelSettings size={16} color={r.color} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: r.color }}>{r.label}</span>
                </label>
              ))}
            </div>
          </Field>
          {quickRole === 'state_admin' && (
            <div style={{ margin: '12px 0', padding: '10px 14px', background: '#fffbeb', borderRadius: 8, border: '1px solid #fbbf24', fontSize: 12, color: '#92400e' }}>
              ⚠️ Please use the Edit modal to assign a chapter after changing the role.
            </div>
          )}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
            <Btn onClick={() => setRoleTarget(null)} style={{ background: '#e5e7eb', color: '#374151' }}>Cancel</Btn>
            <Btn onClick={applyRoleChange} style={{ background: '#0B1F4B', color: '#fff' }}>Apply Role Change</Btn>
          </div>
        </Modal>
      )}

      {/* ── Delete Confirm ── */}
      {confirmDelete && (
        <Modal onClose={() => setConfirmDelete(null)} title="Confirm Delete">
          <p style={{ color: '#374151', fontSize: 14, marginBottom: 20 }}>
            Are you sure you want to permanently delete admin{' '}
            <strong>{confirmDelete.firstName} {confirmDelete.lastName}</strong>? This cannot be undone.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Btn onClick={() => setConfirmDelete(null)} style={{ background: '#e5e7eb', color: '#374151' }}>Cancel</Btn>
            <Btn onClick={handleDelete} style={{ background: '#dc2626', color: '#fff' }}>Delete</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ── Helpers ────────────────────────────────────── */
function Modal({ children, onClose, title }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 14, padding: '24px 28px', width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ margin: 0, color: '#0B1F4B', fontSize: 17 }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#9ca3af', lineHeight: 1 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.04em' }}>
        {label}{required && <span style={{ color: '#dc2626' }}> *</span>}
      </label>
      {children}
    </div>
  );
}

function Btn({ children, style, ...props }) {
  return (
    <button style={{ padding: '10px 22px', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: 'pointer', ...style }} {...props}>
      {children}
    </button>
  );
}

const iStyle = { width: '100%', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, color: '#111827', outline: 'none', boxSizing: 'border-box' };
