import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminSidebar from '../../components/admin/AdminSidebar';

export default function AdminLayout() {
  const { admin, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate('/login', { replace: true });
    }
  }, [loading, isAdmin, navigate]);

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: '#f3f4f6',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 40,
              height: 40,
              border: '4px solid #e5e7eb',
              borderTopColor: '#C9974A',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 12px',
            }}
          />
          <p style={{ color: '#6b7280', fontSize: 14 }}>Loading admin panel...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (!isAdmin || !admin) return null;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f3f4f6' }}>
      <AdminSidebar />
      <main
        style={{
          flex: 1,
          marginLeft: 260,
          minHeight: '100vh',
          transition: 'margin-left 0.3s ease',
        }}
        className="admin-main-content"
      >
        <Outlet />
      </main>
      <style>{`
        @media (max-width: 768px) {
          .admin-main-content { margin-left: 0 !important; }
        }
      `}</style>
    </div>
  );
}
