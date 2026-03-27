import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { MdLogout, MdMenu, MdClose } from 'react-icons/md';
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
    navigate('/admin/login');
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
          minHeight: '100vh',
          background: '#0B1F4B',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 1000,
          transition: 'transform 0.3s ease',
        }}
        className={`admin-sidebar ${collapsed ? 'sidebar-open' : ''}`}
      >
        {/* Branding */}
        <div
          style={{
            padding: '24px 20px 16px',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#C9974A' }}>
            NIQS
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: 11, opacity: 0.7, letterSpacing: 1 }}>
            ADMIN PANEL
          </p>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
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

        {/* Admin info + Logout */}
        <div
          style={{
            padding: '16px 20px',
            borderTop: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <div style={{ marginBottom: 12 }}>
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
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              width: '100%',
              padding: '10px 12px',
              background: 'rgba(255,255,255,0.08)',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 13,
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
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
