import { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { MdLogout, MdMenu, MdClose, MdManageAccounts, MdHome } from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';
import { getAdminSidebarItems, getAdminLabel } from '../../utils/roleHelpers';

export default function AdminSidebar() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const role = admin?.role || '';
  const sidebarItems = getAdminSidebarItems(role);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        style={{
          position: 'fixed',
          top: 12,
          left: 12,
          zIndex: 1100,
          background: '#0B1F4B',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          padding: '8px 10px',
          cursor: 'pointer',
          display: 'none',
        }}
        className="sidebar-toggle"
      >
        {collapsed ? <MdClose size={22} /> : <MdMenu size={22} />}
      </button>

      {/* Overlay for mobile */}
      {collapsed && (
        <div
          onClick={() => setCollapsed(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            zIndex: 999,
            display: 'none',
          }}
          className="sidebar-overlay"
        />
      )}

      <aside
        style={{
          width: 260,
          height: '100vh',
          background: '#0B1F4B',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 1000,
          transition: 'transform 0.3s ease',
          overflow: 'hidden',
        }}
        className={`admin-sidebar ${collapsed ? 'sidebar-open' : ''}`}
      >
        {/* Branding — clicking logo goes to main website home */}
        <div
          style={{
            padding: '20px 20px 14px',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#C9974A' }}>
                NIQS
              </h2>
              <p style={{ margin: '2px 0 0', fontSize: 11, opacity: 0.7, letterSpacing: 1 }}>
                ADMIN PANEL
              </p>
            </div>
            <Link
              to="/"
              title="Back to main website"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.6)',
                textDecoration: 'none',
                transition: 'all 0.15s',
                flexShrink: 0,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(201,151,74,0.2)'; e.currentTarget.style.color = '#C9974A'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
            >
              <MdHome size={18} />
            </Link>
          </div>
        </div>

        {/* Nav items — scrollable, fills space between header and footer */}
        <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto', minHeight: 0 }}>
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setCollapsed(false)}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '11px 20px',
                  color: isActive ? '#C9974A' : 'rgba(255,255,255,0.75)',
                  textDecoration: 'none',
                  fontSize: 14,
                  fontWeight: isActive ? 600 : 400,
                  borderLeft: isActive ? '3px solid #C9974A' : '3px solid transparent',
                  background: isActive ? 'rgba(201,151,74,0.08)' : 'transparent',
                  transition: 'all 0.15s ease',
                })}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Admin info + Profile + Logout — always pinned at bottom */}
        <div
          style={{
            padding: '14px 20px',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            flexShrink: 0,
          }}
        >
          {/* Name + role */}
          <div style={{ marginBottom: 10 }}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>
              {admin?.firstName} {admin?.lastName}
            </p>
            <span
              style={{
                display: 'inline-block',
                marginTop: 4,
                padding: '2px 8px',
                fontSize: 10,
                fontWeight: 600,
                borderRadius: 4,
                background: role === 'main_admin'
                  ? '#C9974A'
                  : role === 'national_admin'
                  ? '#2563EB'
                  : '#059669',
                color: '#fff',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              {getAdminLabel(role)}
            </span>
          </div>

          {/* My Profile link */}
          <NavLink
            to="/admin/profile"
            onClick={() => setCollapsed(false)}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              width: '100%',
              padding: '9px 12px',
              marginBottom: 8,
              background: isActive ? 'rgba(201,151,74,0.15)' : 'rgba(255,255,255,0.06)',
              color: isActive ? '#C9974A' : 'rgba(255,255,255,0.8)',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: isActive ? 600 : 400,
              textDecoration: 'none',
              transition: 'background 0.15s',
              boxSizing: 'border-box',
            })}
          >
            <MdManageAccounts size={18} />
            My Profile
          </NavLink>

          {/* Logout */}
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              width: '100%',
              padding: '9px 12px',
              background: 'rgba(255,255,255,0.06)',
              color: 'rgba(255,255,255,0.8)',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 13,
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
          >
            <MdLogout size={18} />
            Logout
          </button>
        </div>
      </aside>

      <style>{`
        @media (max-width: 768px) {
          .sidebar-toggle { display: block !important; }
          .sidebar-overlay { display: block !important; }
          .admin-sidebar {
            transform: translateX(-100%);
          }
          .admin-sidebar.sidebar-open {
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
}
