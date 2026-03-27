import React from 'react';
import { Link } from 'react-router-dom';
import PageHero from '../../components/common/PageHero';

export default function About() {
  return (
    <>
      {/* ── PAGE HERO ── */}
      <PageHero
        label="Who We Are"
        title="About NIQS"
        titleHighlight="NIQS"
        backgroundImage="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1400&q=80&fit=crop"
      />

      {/* ── OUR STORY ── */}
      <section style={{ background: '#fff' }}>
        <div className="ct">
          <div className="tc2">
            <div className="rl">
              <div className="ey">Our Story</div>
              <h2 className="sh">55 Years Shaping Nigeria's <em>Built Environment</em></h2>
              <p style={{ fontSize: '.9rem', lineHeight: 1.88, color: 'var(--text2)', marginBottom: '1rem' }}>
                Founded in 1969 when fewer than 20 qualified quantity surveyors existed across Nigeria, NIQS has grown into a vibrant institution of over 10,000 members, with 4,000+ corporate practitioners working across Nigeria and internationally.
              </p>
              <p style={{ fontSize: '.9rem', lineHeight: 1.88, color: 'var(--text2)', marginBottom: '1.5rem' }}>
                With chapters in all 36 states and the FCT, and reciprocity agreements with leading international QS bodies, NIQS places Nigerian professionals on the global stage.
              </p>
              <Link to="/membership" className="btn bp">Join NIQS Today</Link>
            </div>
            <div className="rr">
              <img
                src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=700&q=80&fit=crop"
                alt="Construction Nigeria"
                style={{ borderRadius: 14, width: '100%', height: 420, objectFit: 'cover', boxShadow: 'var(--sh2)' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── VISION / MISSION / VALUE ── */}
      <section style={{ background: 'var(--off)', paddingTop: 0 }}>
        <div className="ct" style={{ paddingTop: '5rem' }}>
          <div className="ey">Our Principles</div>
          <h2 className="sh">Vision, Mission &amp; <em>Values</em></h2>
          <div className="valg">
            <div className="val">
              <div className="vali">🎯</div>
              <h4>Our Vision</h4>
              <p>To be the profession responsible for total cost and procurement management for client objectives in all capital projects — from conception to commissioning, across all sectors of the economy.</p>
            </div>
            <div className="val">
              <div className="vali">🚀</div>
              <h4>Our Mission</h4>
              <p>Contributing to sustainable national development by promoting world-class cost and procurement management expertise through developing unique and distinctive professional competencies.</p>
            </div>
            <div className="val">
              <div className="vali">💎</div>
              <h4>Our Value</h4>
              <p>Value for money is our watchword. NIQS members deliver comprehensive cost management services that create demonstrable financial benefit for every client in public and private sectors.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY NIQS ── */}
      <section style={{ background: '#fff' }}>
        <div className="ct">
          <div className="tc2">
            <div className="rl">
              <img
                src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=700&q=80&fit=crop"
                alt="QS Team"
                style={{ borderRadius: 14, width: '100%', height: 370, objectFit: 'cover', boxShadow: 'var(--sh)' }}
              />
            </div>
            <div className="rr">
              <div className="ey">Why NIQS</div>
              <h2 className="sh">A Professional Body You Can <em>Trust</em></h2>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '.8rem', marginBottom: '1.5rem' }}>
                <li style={{ display: 'flex', gap: '.8rem', fontSize: '.86rem', color: 'var(--text2)' }}>
                  <span style={{ color: 'var(--gold)', fontWeight: 800, flexShrink: 0 }}>✓</span>
                  Internationally recognised qualifications and credentials
                </li>
                <li style={{ display: 'flex', gap: '.8rem', fontSize: '.86rem', color: 'var(--text2)' }}>
                  <span style={{ color: 'var(--gold)', fontWeight: 800, flexShrink: 0 }}>✓</span>
                  Access to Nigeria's largest QS professional network
                </li>
                <li style={{ display: 'flex', gap: '.8rem', fontSize: '.86rem', color: 'var(--text2)' }}>
                  <span style={{ color: 'var(--gold)', fontWeight: 800, flexShrink: 0 }}>✓</span>
                  Structured CPD programmes and webinar series
                </li>
                <li style={{ display: 'flex', gap: '.8rem', fontSize: '.86rem', color: 'var(--text2)' }}>
                  <span style={{ color: 'var(--gold)', fontWeight: 800, flexShrink: 0 }}>✓</span>
                  Strong advocacy with government and industry stakeholders
                </li>
                <li style={{ display: 'flex', gap: '.8rem', fontSize: '.86rem', color: 'var(--text2)' }}>
                  <span style={{ color: 'var(--gold)', fontWeight: 800, flexShrink: 0 }}>✓</span>
                  15+ international reciprocity agreements
                </li>
              </ul>
              <Link to="/contact" className="btn bp">Get In Touch</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── STRATEGIC PARTNERS ── */}
      <section style={{ background: 'var(--off)' }}>
        <div className="ct">
          <div className="ey">Strategic Partners</div>
          <h2 className="sh">Partners in <em>Excellence</em></h2>
          <p className="sd" style={{ marginBottom: '2rem' }}>
            NIQS works alongside organisations committed to raising the bar in Nigeria's construction industry.
          </p>

          <div className="gpc">
            <img
              className="gpimg"
              src="https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=400&q=80&fit=crop"
              alt="Gold Partner"
            />
            <div>
              <div className="gpbadge">Gold Partner</div>
              <h4>Partner Organisation Name</h4>
              <p>This section features your Gold-tier NIQS partnership. Your brand is introduced to NIQS's professional community — covering your services, commitment to the built environment, and what this alliance means for Nigerian construction.</p>
              <a href="#" className="gpl">Visit Partner Website →</a>
            </div>
          </div>

          <div className="gpc">
            <img
              className="gpimg"
              src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80&fit=crop"
              alt="Gold Partner 2"
            />
            <div>
              <div className="gpbadge">Gold Partner</div>
              <h4>Second Partner Organisation</h4>
              <p>A second Gold Partnership slot available. Your brand story is presented to thousands of QS professionals, project owners, and industry stakeholders. Contact the partnerships team to get started.</p>
              <a href="#" className="gpl">Visit Partner Website →</a>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <Link to="/partnership" className="btn bp">Explore All Partnership Opportunities →</Link>
          </div>
        </div>
      </section>
    </>
  );
}
