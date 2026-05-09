import { Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { useEffect, useRef } from 'react';

/* ── Global scroll-reveal observer ── */
function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    // Observe existing + future elements
    const observe = () => {
      document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    };

    observe();
    // Re-run on route changes via MutationObserver
    const mo = new MutationObserver(observe);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => { observer.disconnect(); mo.disconnect(); };
  }, []);
}

/* ── Page fade wrapper ── */
function PageFade({ children }) {
  const { pathname } = useLocation();
  return (
    <div key={pathname} className="page-transition">
      {children}
    </div>
  );
}

// Layout
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import PartnerAdvert from './components/layout/PartnerAdvert';

// Common
import ProtectedRoute from './components/common/ProtectedRoute';

// Public Pages
import Home from './pages/public/Home';
import About from './pages/public/About';
import President from './pages/public/President';
import Council from './pages/public/Council';
import NPC from './pages/public/NPC';
import PastPresidents from './pages/public/PastPresidents';
import Chapters from './pages/public/Chapters';
import ChapterDetail from './pages/public/ChapterDetail';
import WAQSN from './pages/public/WAQSN';
import YQSF from './pages/public/YQSF';
import Reciprocity from './pages/public/Reciprocity';
import BrandMaterials from './pages/public/BrandMaterials';
import Membership from './pages/public/Membership';
import SearchQSFirms from './pages/public/SearchQSFirms';
import Webinars from './pages/public/Webinars';
import WorkshopMaterials from './pages/public/WorkshopMaterials';
import Exams from './pages/public/Exams';
import Research from './pages/public/Research';
import News from './pages/public/News';
import NewsArticle from './pages/public/NewsArticle';
import Events from './pages/public/Events';
import Jobs from './pages/public/Jobs';
import Payment from './pages/public/Payment';
import Contact from './pages/public/Contact';
import Partnership from './pages/public/Partnership';
import PartnerDetail from './pages/public/PartnerDetail';

// Auth Pages
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Portal Pages
import PortalLayout from './pages/portal/PortalLayout';
import PortalDashboard from './pages/portal/PortalDashboard';
import PortalProfile from './pages/portal/PortalProfile';

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import ManageAdmins from './pages/admin/ManageAdmins';
import ManageNews from './pages/admin/ManageNews';
import ManageEvents from './pages/admin/ManageEvents';
import ManageExco from './pages/admin/ManageExco';
import ManageChapters from './pages/admin/ManageChapters';
import ManageJobs from './pages/admin/ManageJobs';
import ManagePartners from './pages/admin/ManagePartners';
import ManageMembers from './pages/admin/ManageMembers';
import ManageBrandMaterials from './pages/admin/ManageBrandMaterials';
import ManagePresident from './pages/admin/ManagePresident';
import ManagePastPresidents from './pages/admin/ManagePastPresidents';
import ManageSiteSettings from './pages/admin/ManageSiteSettings';
import ManagePartnerAdvert from './pages/admin/ManagePartnerAdvert';
import ManageContactInfo from './pages/admin/ManageContactInfo';
import ManageQSFirms from './pages/admin/ManageQSFirms';
import ManageExamResults from './pages/admin/ManageExamResults';
import ManageQSConnect from './pages/admin/ManageQSConnect';
import ManageWebinars from './pages/admin/ManageWebinars';
import ManageWorkshopMaterials from './pages/admin/ManageWorkshopMaterials';
import ManageJournal from './pages/admin/ManageJournal';
import ManageMessages from './pages/admin/ManageMessages';
import ManageProfile from './pages/admin/ManageProfile';

// Public layout wrapper
function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      <main>
        <PageFade>{children}</PageFade>
      </main>
      <Footer />
      <PartnerAdvert />
    </>
  );
}

// Wrap each public page route
function PublicPage({ element }) {
  return <PublicLayout>{element}</PublicLayout>;
}

/* ── Built-by credit pill (fixed, visible on every page) ── */
function BuiltByBadge() {
  return (
    <div style={{
      position: 'fixed', bottom: '1rem', left: '1rem', zIndex: 9999,
      display: 'flex', alignItems: 'center', gap: '0.45rem',
      background: 'rgba(11,31,75,0.88)', backdropFilter: 'blur(8px)',
      border: '1px solid rgba(201,151,74,0.35)',
      borderRadius: 999, padding: '5px 13px 5px 10px',
      boxShadow: '0 2px 12px rgba(0,0,0,.18)',
      pointerEvents: 'none', userSelect: 'none',
    }}>
      <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-body)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.08em' }}>
        Built by
      </span>
      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--color-gold)', fontFamily: 'var(--font-heading)', letterSpacing: '.06em' }}>
        ADLM
      </span>
    </div>
  );
}

export default function App() {
  useScrollReveal();
  return (
    <AuthProvider>
      <BuiltByBadge />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            fontFamily: "'Sora', sans-serif",
            fontSize: '0.85rem',
          },
        }}
      />

      <Routes>
        {/* ══════ PUBLIC ROUTES ══════ */}
        <Route path="/" element={<PublicPage element={<Home />} />} />
        <Route path="/about" element={<PublicPage element={<About />} />} />
        <Route path="/president" element={<PublicPage element={<President />} />} />
        <Route path="/council" element={<PublicPage element={<Council />} />} />
        <Route path="/npc" element={<PublicPage element={<NPC />} />} />
        <Route path="/past-presidents" element={<PublicPage element={<PastPresidents />} />} />
        <Route path="/chapters" element={<PublicPage element={<Chapters />} />} />
        <Route path="/chapters/:slug" element={<PublicPage element={<ChapterDetail />} />} />
        <Route path="/waqsn" element={<PublicPage element={<WAQSN />} />} />
        <Route path="/yqsf" element={<PublicPage element={<YQSF />} />} />
        <Route path="/reciprocity" element={<PublicPage element={<Reciprocity />} />} />
        <Route path="/brand-materials" element={<PublicPage element={<BrandMaterials />} />} />
        <Route path="/membership" element={<PublicPage element={<Membership />} />} />
        <Route path="/search-qs-firms"    element={<PublicPage element={<SearchQSFirms />} />} />
        <Route path="/webinars"           element={<PublicPage element={<Webinars />} />} />
        <Route path="/workshop-materials" element={<PublicPage element={<WorkshopMaterials />} />} />
        <Route path="/exams" element={<PublicPage element={<Exams />} />} />
        <Route path="/research" element={<PublicPage element={<Research />} />} />
        <Route path="/news" element={<PublicPage element={<News />} />} />
        <Route path="/news/:slug" element={<PublicPage element={<NewsArticle />} />} />
        <Route path="/events" element={<PublicPage element={<Events />} />} />
        <Route path="/jobs" element={<PublicPage element={<Jobs />} />} />
        <Route path="/payment" element={<PublicPage element={<Payment />} />} />
        <Route path="/contact" element={<PublicPage element={<Contact />} />} />
        <Route path="/partnership" element={<PublicPage element={<Partnership />} />} />
        <Route path="/partnership/:id" element={<PublicPage element={<PartnerDetail />} />} />

        {/* ══════ AUTH ROUTES ══════ */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* ══════ MEMBER PORTAL ══════ */}
        <Route
          path="/portal"
          element={
            <ProtectedRoute>
              <PortalLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<PortalDashboard />} />
          <Route path="profile" element={<PortalProfile />} />
        </Route>

        {/* ══════ ADMIN PANEL ══════ */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="news" element={<ManageNews />} />
          <Route path="events" element={<ManageEvents />} />
          <Route path="exco" element={<ManageExco />} />
          <Route path="chapters" element={<ManageChapters />} />
          <Route path="jobs" element={<ManageJobs />} />
          <Route path="partners" element={<ManagePartners />} />
          <Route path="members" element={<ManageMembers />} />
          <Route path="admins" element={<ManageAdmins />} />
          <Route path="brand-materials" element={<ManageBrandMaterials />} />
          <Route path="president" element={<ManagePresident />} />
          <Route path="past-presidents" element={<ManagePastPresidents />} />
          <Route path="site-settings"  element={<ManageSiteSettings />} />
          <Route
            path="partner-advert"
            element={
              <ProtectedRoute adminRoles={['main_admin']}>
                <ManagePartnerAdvert />
              </ProtectedRoute>
            }
          />
          <Route path="contact-info"   element={<ManageContactInfo  />} />
          <Route path="qs-firms"        element={<ManageQSFirms />} />
          <Route path="exam-results"        element={<ManageExamResults />} />
          <Route path="qs-connect"          element={<ManageQSConnect />} />
          <Route path="webinars"            element={<ManageWebinars />} />
          <Route path="workshop-materials"  element={<ManageWorkshopMaterials />} />
          <Route path="journal"             element={<ManageJournal />} />
          <Route path="messages"            element={<ManageMessages />} />
          <Route path="profile"             element={<ManageProfile />} />
        </Route>

        {/* ══════ 404 ══════ */}
        <Route
          path="*"
          element={
            <PublicLayout>
              <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem', padding: '4rem 2rem', textAlign: 'center' }}>
                <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: '4rem', fontWeight: 800, color: 'var(--navy)', letterSpacing: '-.04em' }}>404</h1>
                <p style={{ color: 'var(--text2)', fontSize: '1rem' }}>Page not found</p>
                <a href="/" className="btn bp" style={{ marginTop: '1rem' }}>Back to Home</a>
              </div>
            </PublicLayout>
          }
        />
      </Routes>
    </AuthProvider>
  );
}
