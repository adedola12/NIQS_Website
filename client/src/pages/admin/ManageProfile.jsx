import { useState, useEffect } from 'react';
import { MdPerson, MdLock, MdEdit, MdSave, MdClose } from 'react-icons/md';
import toast from 'react-hot-toast';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import AdminHeader from '../../components/admin/AdminHeader';
import { getAdminLabel } from '../../utils/roleHelpers';

const ROLE_COLORS = {
  main_admin:     '#C9974A',
  national_admin: '#2563EB',
  state_admin:    '#059669',
  waqsn_admin:    '#7c3aed',
  yqsf_admin:     '#0891b2',
};

export default function ManageProfile() {
  const { admin: authAdmin, setAdmin } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);

  // Editable fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName]   = useState('');
  const [phone, setPhone]         = useState('');

  // Password change
  const [pwSection, setPwSection]       = useState(false);
  const [currentPw, setCurrentPw]       = useState('');
  const [newPw, setNewPw]               = useState('');
  const [confirmPw, setConfirmPw]       = useState('');
  const [pwSaving, setPwSaving]         = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/admin/profile');
      setProfile(data);
      setFirstName(data.firstName || '');
      setLastName(data.lastName   || '');
      setPhone(data.phone         || '');
    } catch {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      toast.error('First and last name are required');
      return;
    }
    setSaving(true);
    try {
      const { data } = await API.put('/admin/profile', { firstName, lastName, phone });
      setProfile(data);
      // Update AuthContext so sidebar name refreshes
      if (setAdmin) setAdmin((prev) => ({ ...prev, firstName: data.firstName, lastName: data.lastName, phone: data.phone }));
      setEditMode(false);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setFirstName(profile?.firstName || '');
    setLastName(profile?.lastName   || '');
    setPhone(profile?.phone         || '');
    setEditMode(false);
  };

  const handleChangePassword = async () => {
    if (!currentPw || !newPw || !confirmPw) {
      toast.error('Please fill in all password fields');
      return;
    }
    if (newPw !== confirmPw) {
      toast.error('New passwords do not match');
      return;
    }
    if (newPw.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    setPwSaving(true);
    try {
      await API.put('/admin/profile/password', { currentPassword: currentPw, newPassword: newPw });
      toast.success('Password changed successfully');
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
      setPwSection(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPwSaving(false);
    }
  };

  if (loading) {
    return (
      <div>
        <AdminHeader title="My Profile" breadcrumbs={['Dashboard', 'Profile']} />
        <div style={{ padding: 40, color: '#9ca3af', fontSize: 14 }}>Loading profile…</div>
      </div>
    );
  }

  const roleColor = ROLE_COLORS[profile?.role] || '#6b7280';

  return (
    <div>
      <AdminHeader title="My Profile" breadcrumbs={['Dashboard', 'Profile']} />

      <div style={{ padding: '24px 28px', maxWidth: 720 }}>

        {/* ── Profile Card ── */}
        <div
          style={{
            background: '#fff',
            borderRadius: 12,
            border: '1px solid #e5e7eb',
            overflow: 'hidden',
            marginBottom: 20,
          }}
        >
          {/* Coloured header strip */}
          <div style={{ height: 6, background: roleColor }} />

          <div style={{ padding: '24px 28px' }}>
            {/* Avatar + name row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28 }}>
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  background: roleColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 28,
                  fontWeight: 700,
                  color: '#fff',
                  flexShrink: 0,
                }}
              >
                {(profile?.firstName?.[0] || '?').toUpperCase()}
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#111827' }}>
                  {profile?.firstName} {profile?.lastName}
                </h2>
                <span
                  style={{
                    display: 'inline-block',
                    marginTop: 6,
                    padding: '3px 10px',
                    borderRadius: 20,
                    fontSize: 11,
                    fontWeight: 700,
                    background: roleColor,
                    color: '#fff',
                    textTransform: 'uppercase',
                    letterSpacing: 0.6,
                  }}
                >
                  {getAdminLabel(profile?.role)}
                </span>
              </div>

              {!editMode && (
                <button
                  onClick={() => setEditMode(true)}
                  style={{
                    marginLeft: 'auto',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 16px',
                    borderRadius: 8,
                    border: '1px solid #e5e7eb',
                    background: '#f9fafb',
                    color: '#374151',
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  <MdEdit size={16} />
                  Edit Profile
                </button>
              )}
            </div>

            {/* Read-only account info */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px 24px',
                marginBottom: 24,
                padding: '16px 20px',
                background: '#f9fafb',
                borderRadius: 8,
              }}
            >
              <div>
                <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5 }}>Email</p>
                <p style={{ margin: '4px 0 0', fontSize: 14, color: '#374151' }}>{profile?.email}</p>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5 }}>Role</p>
                <p style={{ margin: '4px 0 0', fontSize: 14, color: '#374151' }}>{getAdminLabel(profile?.role)}</p>
              </div>
              {profile?.assignedChapter && (
                <div>
                  <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5 }}>Assigned Chapter</p>
                  <p style={{ margin: '4px 0 0', fontSize: 14, color: '#374151' }}>{profile.assignedChapter?.name || '—'}</p>
                </div>
              )}
              <div>
                <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5 }}>Last Login</p>
                <p style={{ margin: '4px 0 0', fontSize: 14, color: '#374151' }}>
                  {profile?.lastLogin ? new Date(profile.lastLogin).toLocaleString() : 'N/A'}
                </p>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5 }}>Account Created</p>
                <p style={{ margin: '4px 0 0', fontSize: 14, color: '#374151' }}>
                  {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>

            {/* Edit form */}
            {editMode && (
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: '#0B1F4B', marginBottom: 16 }}>
                  Edit Details
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <div>
                    <label style={labelStyle}>First Name *</label>
                    <input
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      style={inputStyle}
                      placeholder="First name"
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Last Name *</label>
                    <input
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      style={inputStyle}
                      placeholder="Last name"
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Phone</label>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      style={inputStyle}
                      placeholder="e.g. 08012345678"
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '9px 20px',
                      borderRadius: 8,
                      border: 'none',
                      background: '#0B1F4B',
                      color: '#fff',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: saving ? 'not-allowed' : 'pointer',
                      opacity: saving ? 0.7 : 1,
                    }}
                  >
                    <MdSave size={16} />
                    {saving ? 'Saving…' : 'Save Changes'}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '9px 20px',
                      borderRadius: 8,
                      border: '1px solid #e5e7eb',
                      background: '#fff',
                      color: '#6b7280',
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: 'pointer',
                    }}
                  >
                    <MdClose size={16} />
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Change Password Card ── */}
        <div
          style={{
            background: '#fff',
            borderRadius: 12,
            border: '1px solid #e5e7eb',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '16px 24px',
              borderBottom: pwSection ? '1px solid #e5e7eb' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
            }}
            onClick={() => setPwSection(!pwSection)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <MdLock size={20} color="#6b7280" />
              <span style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>Change Password</span>
            </div>
            <span style={{ fontSize: 20, color: '#9ca3af', lineHeight: 1 }}>{pwSection ? '−' : '+'}</span>
          </div>

          {pwSection && (
            <div style={{ padding: '20px 24px' }}>
              <div style={{ display: 'grid', gap: 14, maxWidth: 400 }}>
                <div>
                  <label style={labelStyle}>Current Password</label>
                  <input
                    type="password"
                    value={currentPw}
                    onChange={(e) => setCurrentPw(e.target.value)}
                    style={inputStyle}
                    placeholder="Enter current password"
                  />
                </div>
                <div>
                  <label style={labelStyle}>New Password</label>
                  <input
                    type="password"
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                    style={inputStyle}
                    placeholder="At least 6 characters"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPw}
                    onChange={(e) => setConfirmPw(e.target.value)}
                    style={inputStyle}
                    placeholder="Repeat new password"
                  />
                </div>
              </div>

              <button
                onClick={handleChangePassword}
                disabled={pwSaving}
                style={{
                  marginTop: 18,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '9px 20px',
                  borderRadius: 8,
                  border: 'none',
                  background: '#C9974A',
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: pwSaving ? 'not-allowed' : 'pointer',
                  opacity: pwSaving ? 0.7 : 1,
                }}
              >
                <MdLock size={16} />
                {pwSaving ? 'Updating…' : 'Update Password'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const labelStyle = {
  display: 'block',
  fontSize: 12,
  fontWeight: 600,
  color: '#374151',
  marginBottom: 6,
};

const inputStyle = {
  width: '100%',
  padding: '9px 12px',
  fontSize: 13,
  border: '1px solid #d1d5db',
  borderRadius: 7,
  outline: 'none',
  color: '#111827',
  background: '#fff',
  boxSizing: 'border-box',
};
