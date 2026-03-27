import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';

const PortalProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await API.get('/members/me');
        setProfile(data.member || data.user || data);
      } catch (err) {
        toast.error('Failed to load profile');
        // Fall back to auth context user data
        setProfile(user);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  if (loading) {
    return (
      <div className="pp-loading">
        <div className="spinner" />
        <p>Loading profile...</p>
      </div>
    );
  }

  const data = profile || user || {};

  const fullName = data.name ||
    `${data.firstName || ''} ${data.lastName || ''}`.trim() ||
    'N/A';

  const initials = fullName
    .split(' ')
    .map((n) => n.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const fields = [
    { label: 'Full Name', value: fullName },
    { label: 'Email', value: data.email || 'N/A' },
    { label: 'Phone', value: data.phone || data.phoneNumber || 'N/A' },
    { label: 'Membership Type', value: data.membershipType || data.membership || 'N/A' },
    { label: 'Registration Number', value: data.registrationNumber || data.regNumber || 'N/A' },
    { label: 'Chapter', value: data.chapter || 'N/A' },
    { label: 'Status', value: data.status || 'Active' },
  ];

  return (
    <div className="pp">
      <h1 className="pp-title">My Profile</h1>
      <p className="pp-sub">View your membership information.</p>

      <div className="pp-card">
        {/* Header with avatar */}
        <div className="pp-header">
          <div className="pp-avatar">
            {data.photo || data.profilePhoto ? (
              <img
                src={data.photo || data.profilePhoto}
                alt={fullName}
                className="pp-avatar-img"
              />
            ) : (
              <span className="pp-avatar-initials">{initials}</span>
            )}
          </div>
          <div className="pp-header-info">
            <h2>{fullName}</h2>
            <span className="pp-header-type">
              {data.membershipType || data.membership || 'Member'}
            </span>
          </div>
          <div className="pp-edit-wrap" title="Coming Soon">
            <button className="pp-edit-btn" disabled>
              Edit Profile
            </button>
            <span className="pp-edit-tooltip">Coming Soon</span>
          </div>
        </div>

        {/* Fields */}
        <div className="pp-fields">
          {fields.map((f, i) => (
            <div className="pp-field" key={i}>
              <span className="pp-field-label">{f.label}</span>
              <span className="pp-field-value">
                {f.label === 'Status' ? (
                  <span className={`pp-status ${f.value.toLowerCase()}`}>
                    {f.value}
                  </span>
                ) : (
                  f.value
                )}
              </span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .pp-title {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--navy);
          margin-bottom: 0.3rem;
        }
        .pp-sub {
          font-size: 0.85rem;
          color: var(--text3);
          margin-bottom: 1.5rem;
        }

        /* Card */
        .pp-card {
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          overflow: hidden;
        }

        /* Header */
        .pp-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem;
          border-bottom: 1px solid var(--border);
          background: var(--off);
        }
        .pp-avatar {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--navy), var(--navy2));
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          overflow: hidden;
          border: 3px solid var(--borderg);
        }
        .pp-avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .pp-avatar-initials {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: 1.4rem;
          font-weight: 700;
          color: var(--white);
        }
        .pp-header-info h2 {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--navy);
          line-height: 1.2;
        }
        .pp-header-type {
          font-size: 0.72rem;
          color: var(--gold);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .pp-edit-wrap {
          margin-left: auto;
          position: relative;
        }
        .pp-edit-btn {
          padding: 0.5rem 1rem;
          border-radius: var(--radius-sm);
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--white);
          background: var(--navy);
          border: none;
          cursor: not-allowed;
          opacity: 0.5;
          transition: all 0.2s var(--ez);
        }
        .pp-edit-tooltip {
          position: absolute;
          bottom: -28px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 0.65rem;
          font-weight: 700;
          color: var(--white);
          background: var(--text);
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s var(--ez);
        }
        .pp-edit-wrap:hover .pp-edit-tooltip {
          opacity: 1;
        }

        /* Fields */
        .pp-fields {
          padding: 0.5rem 0;
        }
        .pp-field {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.9rem 1.5rem;
          border-bottom: 1px solid var(--border);
        }
        .pp-field:last-child {
          border-bottom: none;
        }
        .pp-field-label {
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--text3);
        }
        .pp-field-value {
          font-size: 0.88rem;
          font-weight: 600;
          color: var(--navy);
          text-align: right;
        }

        /* Status badge */
        .pp-status {
          display: inline-block;
          padding: 0.2rem 0.7rem;
          border-radius: 50px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: capitalize;
        }
        .pp-status.active {
          background: #dcfce7;
          color: #22c55e;
        }
        .pp-status.inactive,
        .pp-status.suspended {
          background: #fef2f2;
          color: #ef4444;
        }
        .pp-status.pending {
          background: var(--goldxl);
          color: var(--gold);
        }

        /* Loading */
        .pp-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 0;
          gap: 1rem;
        }
        .pp-loading p {
          font-size: 0.85rem;
          color: var(--text3);
        }

        @media (max-width: 600px) {
          .pp-header {
            flex-direction: column;
            text-align: center;
          }
          .pp-edit-wrap {
            margin-left: 0;
            margin-top: 0.5rem;
          }
          .pp-field {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.3rem;
          }
          .pp-field-value {
            text-align: left;
          }
        }
      `}</style>
    </div>
  );
};

export default PortalProfile;
