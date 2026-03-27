import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArticle, MdEvent, MdPeople, MdMail, MdAdminPanelSettings, MdAdd } from 'react-icons/md';
import toast from 'react-hot-toast';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { canManageAdmins } from '../../utils/roleHelpers';
import AdminHeader from '../../components/admin/AdminHeader';
import StatsCard from '../../components/admin/StatsCard';

export default function Dashboard() {
  const { admin } = useAuth();
  const navigate = useNavigate();
  const role = admin?.role || '';
  const [stats, setStats] = useState(null);
  const [recentNews, setRecentNews] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const { data } = await API.get('/admin/dashboard');
      setStats(data.stats || {});
      setRecentNews(data.recentNews || []);
      setUpcomingEvents(data.upcomingEvents || []);
    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { label: 'Add News', icon: MdArticle, path: '/admin/news', color: '#2563EB' },
    { label: 'Add Event', icon: MdEvent, path: '/admin/events', color: '#059669' },
    { label: 'View Members', icon: MdPeople, path: '/admin/members', color: '#7c3aed' },
    { label: 'Messages', icon: MdMail, path: '/admin/messages', color: '#C9974A' },
  ];

  return (
    <div>
      <AdminHeader title="Dashboard" breadcrumbs={['Dashboard']} />

      <div style={{ padding: '24px 28px' }}>
        {/* Stats cards */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 16,
            marginBottom: 28,
          }}
        >
          <StatsCard
            icon={MdArticle}
            value={loading ? '...' : stats?.totalNews ?? 0}
            label="Total News"
            color="#2563EB"
          />
          <StatsCard
            icon={MdEvent}
            value={loading ? '...' : stats?.upcomingEvents ?? 0}
            label="Upcoming Events"
            color="#059669"
          />
          <StatsCard
            icon={MdPeople}
            value={loading ? '...' : stats?.totalMembers ?? 0}
            label="Members"
            color="#7c3aed"
          />
          <StatsCard
            icon={MdMail}
            value={loading ? '...' : stats?.unreadMessages ?? 0}
            label="Unread Messages"
            color="#C9974A"
          />
          {canManageAdmins(role) && (
            <StatsCard
              icon={MdAdminPanelSettings}
              value={loading ? '...' : stats?.totalAdmins ?? 0}
              label="Admins"
              color="#0B1F4B"
            />
          )}
        </div>

        {/* Quick actions */}
        <div style={{ marginBottom: 28 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#0B1F4B', marginBottom: 12 }}>
            Quick Actions
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => navigate(action.path)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 18px',
                  background: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 500,
                  color: '#374151',
                  transition: 'border-color 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = action.color)}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#e5e7eb')}
              >
                <action.icon size={18} color={action.color} />
                {action.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Recent News */}
          <div
            style={{
              background: '#fff',
              borderRadius: 10,
              border: '1px solid #e5e7eb',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '14px 18px',
                borderBottom: '1px solid #e5e7eb',
                fontWeight: 600,
                fontSize: 15,
                color: '#0B1F4B',
              }}
            >
              Recent News
            </div>
            {loading ? (
              <div style={{ padding: 20, color: '#9ca3af', fontSize: 14 }}>Loading...</div>
            ) : recentNews.length === 0 ? (
              <div style={{ padding: 20, color: '#9ca3af', fontSize: 14 }}>No news yet.</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
                    <th style={{ padding: '8px 14px', textAlign: 'left', fontWeight: 600, color: '#6b7280' }}>Title</th>
                    <th style={{ padding: '8px 14px', textAlign: 'left', fontWeight: 600, color: '#6b7280' }}>Category</th>
                    <th style={{ padding: '8px 14px', textAlign: 'left', fontWeight: 600, color: '#6b7280' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentNews.slice(0, 5).map((item) => (
                    <tr key={item._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '8px 14px', color: '#374151' }}>{item.title}</td>
                      <td style={{ padding: '8px 14px', color: '#6b7280' }}>{item.category}</td>
                      <td style={{ padding: '8px 14px', color: '#6b7280' }}>
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '--'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Upcoming Events */}
          <div
            style={{
              background: '#fff',
              borderRadius: 10,
              border: '1px solid #e5e7eb',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '14px 18px',
                borderBottom: '1px solid #e5e7eb',
                fontWeight: 600,
                fontSize: 15,
                color: '#0B1F4B',
              }}
            >
              Upcoming Events
            </div>
            {loading ? (
              <div style={{ padding: 20, color: '#9ca3af', fontSize: 14 }}>Loading...</div>
            ) : upcomingEvents.length === 0 ? (
              <div style={{ padding: 20, color: '#9ca3af', fontSize: 14 }}>No upcoming events.</div>
            ) : (
              <div>
                {upcomingEvents.slice(0, 5).map((ev) => (
                  <div
                    key={ev._id}
                    style={{
                      padding: '12px 18px',
                      borderBottom: '1px solid #f3f4f6',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: '#374151' }}>
                        {ev.title}
                      </p>
                      <p style={{ margin: '2px 0 0', fontSize: 12, color: '#9ca3af' }}>
                        {ev.location || 'TBD'}
                      </p>
                    </div>
                    <span
                      style={{
                        fontSize: 12,
                        color: '#C9974A',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {ev.date ? new Date(ev.date).toLocaleDateString() : '--'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <style>{`
          @media (max-width: 900px) {
            div[style*="grid-template-columns: 1fr 1fr"] {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>
      </div>
    </div>
  );
}
