import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';

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

  // Clone children to inject onClick that closes the dropdown
  const childrenWithClose = React.Children.map(children, (child) => {
    if (!child) return child;
    // Only inject onClick on Link elements (they have a "to" prop)
    if (child.props && child.props.to !== undefined) {
      return React.cloneElement(child, {
        onClick: () => setOpen(false),
      });
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

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
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
              <Link to="/membership" className="ddi">Search QS / QS Firm</Link>
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
              <Link to="/research" className="ddi">Workshop Certificates</Link>
              <Link to="/research" className="ddi">Workshop Materials</Link>
              <Link to="/research" className="ddi">Webinar Series</Link>
              <Link to="/research" className="ddi">Publications</Link>
              <Link to="/research" className="ddi">Journal</Link>
            </NavDropdown>

            <NavDropdown label="News">
              <Link to="/events" className="ddi">Upcoming Events</Link>
              <Link to="/news" className="ddi">Latest News</Link>
              <Link to="/news" className="ddi">QS Connect</Link>
            </NavDropdown>

            <Link to="/jobs" className={`nl${location.pathname === '/jobs' ? ' on' : ''}`}>Jobs</Link>
            <Link to="/contact" className={`nl${location.pathname === '/contact' ? ' on' : ''}`}>Contact</Link>
          </div>

          {/* CTA */}
          <Link to="/login" className="ncta">Member Portal</Link>

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
        <Link to="/login" className="ml-sub" onClick={closeMenu}>Member Portal &#128274;</Link>

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
