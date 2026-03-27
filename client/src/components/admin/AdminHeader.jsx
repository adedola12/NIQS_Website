import { useAuth } from '../../context/AuthContext';
import { getAdminLabel } from '../../utils/roleHelpers';

export default function AdminHeader({ title, breadcrumbs = [] }) {
  const { admin } = useAuth();
  const role = admin?.role || '';

  const roleBadgeColor =
    role === 'main_admin' ? '#C9974A' : role === 'national_admin' ? '#2563EB' : '#059669';

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 28px',
        background: '#fff',
        borderBottom: '1px solid #e5e7eb',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div>
        {breadcrumbs.length > 0 && (
          <nav style={{ fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>
            <span>Admin</span>
            {breadcrumbs.map((crumb, i) => (
              <span key={i}>
                <span style={{ margin: '0 6px' }}>/</span>
                <span style={{ color: i === breadcrumbs.length - 1 ? '#0B1F4B' : '#9ca3af' }}>
                  {crumb}
                </span>
              </span>
            ))}
          </nav>
        )}
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0B1F4B' }}>
          {title}
        </h1>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ textAlign: 'right' }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#0B1F4B' }}>
            {admin?.firstName} {admin?.lastName}
          </p>
          <span
            style={{
              display: 'inline-block',
              padding: '1px 8px',
              fontSize: 10,
              fontWeight: 600,
              borderRadius: 4,
              background: roleBadgeColor,
              color: '#fff',
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            {getAdminLabel(role)}
          </span>
        </div>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: '50%',
            background: '#0B1F4B',
            color: '#C9974A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: 15,
          }}
        >
          {admin?.firstName?.charAt(0) || 'A'}
          {admin?.lastName?.charAt(0) || ''}
        </div>
      </div>
    </header>
  );
}
