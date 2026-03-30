import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/* ── helper: closes dropdown when clicking outside ── */
function useClickOutside(ref, handler) {
  useEffect(() => {
    function listener(e) {
      if (!ref.current || ref.current.contains(e.target)) return;
      handler();
    }
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}

/* ── single dropdown component ── */
function NavDropdown({ label, children }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false));

  const childrenWithClose = React.Children.map(children, (child) => {
    if (!child) return child;
    if (child.props && child.props.to !== undefined) {
      return React.cloneElement(child, { onClick: () => setOpen(false) });
    }
    return child;
  });

  return (
    <div className="ndd" ref={ref}>
      <button
        className={`nl${open ? ' on' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        {label} <span className="nl-chevron" style={open ? { transform: 'rotate(180deg)', color: 'var(--color-gold)' } : {}}>&#9662;</span>
      </button>
      <div className={`ddmenu${open ? ' ddopen' : ''}`}>
        {childrenWithClose}
      </div>
    </div>
  );
}

/* ── User avatar chip (shown when logged in) ── */
function UserChip() {
  const { admin, user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false));

  const isAdminUser = !!admin;
  const firstName = admin?.firstName || user?.firstName || '';
  const lastName  = admin?.lastName  || user?.lastName  || '';
  const initials  = `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase() || '?';
  const fullName  = `${firstName} ${lastName}`.trim() || 'Account';
  const portalPath = isAdminUser ? '/admin' : '/portal';

  const bgColor = isAdminUser ? '#C9974A' : '#0B1F4B';

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    navigate('/login');
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'transparent',
          border: '1.5px solid rgba(255,255,255,0.25)',
          borderRadius: 50,
          padding: '5px 12px 5px 5px',
          cursor: 'pointer',
          color: '#fff',
          fontSize: 13,
          fontWeight: 600,
          transition: 'border-color 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#C9974A')}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)')}
      >
        {/* Avatar circle */}
        <span
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: bgColor,
            border: '2px solid rgba(255,255,255,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 11,
            fontWeight: 700,
            color: '#fff',
            flexShrink: 0,
          }}
        >
          {initials}
        </span>
        {firstName}
        <span style={{ fontSize: 10, opacity: 0.7 }}>&#9662;</span>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 10px)',
            right: 0,
            background: '#fff',
            borderRadius: 10,
            border: '1px solid #e5e7eb',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            minWidth: 200,
            zIndex: 2000,
            overflow: 'hidden',
          }}
        >
          {/* Info header */}
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #f3f4f6', background: '#f9fafb' }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: bgColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 15,
                fontWeight: 700,
                color: '#fff',
                marginBottom: 8,
              }}
            >
              {initials}
            </div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#111827' }}>{fullName}</p>
            <p style={{ margin: '2px 0 0', fontSize: 11, color: '#9ca3af' }}>
              {isAdminUser ? (admin?.role?.replace(/_/g, ' ') || 'Admin') : 'Member'}
            </p>
          </div>

          {/* Links */}
          <div style={{ padding: '6px 0' }}>
            <button
              onClick={() => { setOpen(false); navigate(portalPath); }}
              style={menuItemStyle}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#f3f4f6')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              {isAdminUser ? '🛡️  Admin Panel' : '👤  My Portal'}
            </button>
            <button
              onClick={handleLogout}
              style={{ ...menuItemStyle, color: '#dc2626' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#fef2f2')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              🚪  Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const menuItemStyle = {
  display: 'block',
  width: '100%',
  padding: '9px 16px',
  background: 'transparent',
  border: 'none',
  textAlign: 'left',
  fontSize: 13,
  fontWeight: 500,
  color: '#374151',
  cursor: 'pointer',
  transition: 'background 0.1s',
};

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { admin, user, logout } = useAuth();

  const isLoggedIn = !!(admin || user);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const toggleMenu = () => setMenuOpen((v) => !v);
  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <nav id="nav" className={scrolled ? 'sc' : ''}>
        <div className="ninner">
          {/* Logo */}
          <Link to="/" className="nlogo">
            <div className="nlogo-sq">
              <svg width="18" height="18" viewBox="0 0 345 477" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M172.5 0L345 100v277L172.5 477 0 377V100L172.5 0z" fill="currentColor"/>
              </svg>
            </div>
            <div className="nlogo-txt">
              <strong>NIQS</strong>
              <span>Nigerian Institute of Quantity Surveyors</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="nlinks">
            <Link to="/" className={`nl${location.pathname === '/' ? ' on' : ''}`}>Home</Link>

            <NavDropdown label="About Us">
              <Link to="/about" className="ddi">About NIQS</Link>
              <Link to="/brand-materials" className="ddi">Brand Materials</Link>
              <div className="ddi-div"></div>
              <Link to="/president" className="ddi">The President</Link>
              <Link to="/council" className="ddi">National Executive Council</Link>
              <Link to="/npc" className="ddi">National Policy Committee</Link>
              <Link to="/past-presidents" className="ddi">Past Presidents</Link>
              <div className="ddi-div"></div>
              <Link to="/chapters" className="ddi">State Chapters</Link>
              <Link to="/waqsn" className="ddi">WAQSN</Link>
              <Link to="/yqsf" className="ddi">YQSF</Link>
              <Link to="/reciprocity" className="ddi">Reciprocity Agreements</Link>
            </NavDropdown>

            <NavDropdown label="Membership">
              <Link to="/membership" className="ddi">Requirements &amp; Registration</Link>
              <Link to="/search-qs-firms" className="ddi">Search QS / QS Firm</Link>
              <div className="ddi-div"></div>
              <Link to="/login" className="ddi">Member Portal <span className="lock">&#128274;</span></Link>
              <Link to="/login" className="ddi">Induction Letter <span className="lock">&#128274;</span></Link>
              <Link to="/login" className="ddi">Upgrade Letter <span className="lock">&#128274;</span></Link>
            </NavDropdown>

            <NavDropdown label="Exams">
              <Link to="/exams" className="ddi">Examinations</Link>
              <Link to="/exams" className="ddi">Published Results</Link>
              <div className="ddi-div"></div>
              <Link to="/login" className="ddi">Interview Results <span className="lock">&#128274;</span></Link>
              <Link to="/login" className="ddi">TPC/GDE Results <span className="lock">&#128274;</span></Link>
              <Link to="/login" className="ddi">Logbook Result <span className="lock">&#128274;</span></Link>
            </NavDropdown>

            <NavDropdown label="Research &amp; Devt">
              <Link to="/login"              className="ddi">Workshop Certificates <span className="lock">&#128274;</span></Link>
              <Link to="/workshop-materials" className="ddi">Workshop Materials</Link>
              <Link to="/webinars"           className="ddi">Webinar Series</Link>
              <Link to="/research"           className="ddi">Publications</Link>
              <Link to="/research#journal"   className="ddi">Journal of QS</Link>
            </NavDropdown>

            <NavDropdown label="News">
              <Link to="/events" className="ddi">Upcoming Events</Link>
              <Link to="/news" className="ddi">Latest News</Link>
              <Link to="/news" className="ddi">QS Connect</Link>
            </NavDropdown>

            <Link to="/jobs" className={`nl${location.pathname === '/jobs' ? ' on' : ''}`}>Jobs</Link>
            <Link to="/contact" className={`nl${location.pathname === '/contact' ? ' on' : ''}`}>Contact</Link>
          </div>

          {/* CTA — swaps to user chip when logged in */}
          {isLoggedIn ? (
            <UserChip />
          ) : (
            <Link to="/login" className="ncta">Member Portal</Link>
          )}

          {/* Hamburger */}
          <button className={`ham${menuOpen ? ' op' : ''}`} onClick={toggleMenu} aria-label="Toggle navigation">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`mmenu${menuOpen ? ' op' : ''}`}>
        <Link to="/" className="ml" onClick={closeMenu}>Home</Link>

        <div className="ml-hd">About Us</div>
        <Link to="/about" className="ml-sub" onClick={closeMenu}>About NIQS</Link>
        <Link to="/president" className="ml-sub" onClick={closeMenu}>The President</Link>
        <Link to="/council" className="ml-sub" onClick={closeMenu}>National Executive Council</Link>
        <Link to="/past-presidents" className="ml-sub" onClick={closeMenu}>Past Presidents</Link>
        <Link to="/chapters" className="ml-sub" onClick={closeMenu}>State Chapters</Link>
        <Link to="/waqsn" className="ml-sub" onClick={closeMenu}>WAQSN</Link>
        <Link to="/yqsf" className="ml-sub" onClick={closeMenu}>YQSF</Link>
        <Link to="/reciprocity" className="ml-sub" onClick={closeMenu}>Reciprocity Agreements</Link>

        <div className="ml-hd">Membership</div>
        <Link to="/membership" className="ml-sub" onClick={closeMenu}>Requirements &amp; Registration</Link>
        {isLoggedIn ? (
          <>
            <button
              className="ml-sub"
              style={{ background: 'none', border: 'none', textAlign: 'left', width: '100%', cursor: 'pointer', padding: 0 }}
              onClick={() => { closeMenu(); navigate(admin ? '/admin' : '/portal'); }}
            >
              {admin ? '🛡️ Admin Panel' : '👤 My Portal'}
            </button>
            <button
              className="ml-sub"
              style={{ background: 'none', border: 'none', textAlign: 'left', width: '100%', cursor: 'pointer', padding: 0, color: '#dc2626' }}
              onClick={async () => { closeMenu(); await logout(); navigate('/login'); }}
            >
              🚪 Sign Out
            </button>
          </>
        ) : (
          <Link to="/login" className="ml-sub" onClick={closeMenu}>Member Portal &#128274;</Link>
        )}

        <div className="ml-hd">Exams</div>
        <Link to="/exams" className="ml-sub" onClick={closeMenu}>Examinations</Link>
        <Link to="/exams" className="ml-sub" onClick={closeMenu}>Published Results</Link>
        <Link to="/login" className="ml-sub" onClick={closeMenu}>My Results &#128274;</Link>

        <div className="ml-hd">Research &amp; Devt</div>
        <Link to="/research" className="ml-sub" onClick={closeMenu}>Publications &amp; Journal</Link>

        <Link to="/news" className="ml" onClick={closeMenu}>News</Link>
        <Link to="/jobs" className="ml" onClick={closeMenu}>Jobs</Link>
        <Link to="/contact" className="ml" onClick={closeMenu}>Contact</Link>
      </div>
    </>
  );
};

export default Navbar;
