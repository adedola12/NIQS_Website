import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer>
      <div className="ct">
        <div className="fg4">
          {/* Column 1: Brand */}
          <div>
            <div className="flogo-txt">NIQS <em>Nigeria</em></div>
            <div className="fdesc">
              The Nigerian Institute of Quantity Surveyors — Nigeria's professional
              construction cost managers since 1969. Committed to sustainable national
              development.
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="fcol">
            <h5>Quick Links</h5>
            <ul className="flinks">
              <li><Link to="/about">About NIQS</Link></li>
              <li><Link to="/council">Leadership</Link></li>
              <li><Link to="/membership">Membership</Link></li>
              <li><Link to="/events">Events</Link></li>
              <li><Link to="/partnership">Partnerships</Link></li>
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div className="fcol">
            <h5>Resources</h5>
            <ul className="flinks">
              <li><Link to="/login">Member Portal</Link></li>
              <li><Link to="/exams">Examinations</Link></li>
              <li><Link to="/research">CPD &amp; Webinars</Link></li>
              <li><Link to="/research">QS Journal</Link></li>
              <li><Link to="/brand">Brand Materials</Link></li>
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div className="fcol">
            <h5>Contact</h5>
            <ul className="flinks">
              <li><a href="tel:08028303346">08028 303 346</a></li>
              <li><a href="mailto:info@niqs.org.ng">info@niqs.org.ng</a></li>
              <li><a href="#">Abuja Head Office</a></li>
              <li><a href="#">Lagos Liaison Office</a></li>
            </ul>
          </div>
        </div>

        <div className="fbot">
          <p>&copy; 2025 <span className="fgold">Nigerian Institute of Quantity Surveyors</span>. All rights reserved.</p>
          <p>No. 24, NIQS Crescent, Mabushi District, Abuja, Nigeria.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
