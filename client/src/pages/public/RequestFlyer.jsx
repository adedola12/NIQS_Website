import React from 'react';
import { Link } from 'react-router-dom';
import PageHero from '../../components/common/PageHero';

const STEPS = [
  {
    n: 1,
    title: 'Share your event details',
    body: 'Fill in a short form with your event title, date, venue or platform, speakers and CPD points. Takes about 3 minutes.',
  },
  {
    n: 2,
    title: 'We design your flyer',
    body: 'Our team builds a polished flyer in the official NIQS template — matched to your event, branded and ready to share.',
  },
  {
    n: 3,
    title: 'Receive & promote',
    body: 'We send you the finished flyer, and your event goes live with its own registration page and QR code.',
  },
];

const PREPARE = [
  'Event title and a one-line description',
  'Date(s), time and time zone',
  'Format — in-person, virtual or hybrid (with venue or platform)',
  'Speakers / facilitators and their topics (optional)',
  'CPD points, registration link and enquiry numbers (optional)',
];

export default function RequestFlyer() {
  return (
    <>
      <PageHero
        label="NIQS Design Service"
        title="Request a Flyer"
        titleHighlight="Flyer"
        subtitle="Have an event coming up? Send us the details and our team will design a professional, on-brand NIQS flyer for you."
        backgroundImage="https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1400&q=80&fit=crop"
      />

      {/* ── How it works ── */}
      <section style={{ background: '#fff' }}>
        <div className="ct" style={{ paddingTop: '5rem', paddingBottom: '4rem' }}>
          <div className="reveal" style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 3rem' }}>
            <div className="ey" style={{ justifyContent: 'center' }}>How it works</div>
            <h2 className="sh" style={{ marginTop: '.6rem' }}>
              From event details to a finished <em>flyer</em>
            </h2>
            <p style={{ color: 'var(--text2)', fontSize: '.92rem', lineHeight: 1.7, marginTop: '.8rem' }}>
              No design skills needed. Tell us about your event and we'll handle the rest.
            </p>
          </div>

          <div
            className="reveal"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1.4rem',
              marginBottom: '3.4rem',
            }}
          >
            {STEPS.map((s) => (
              <div
                key={s.n}
                style={{
                  background: '#fff',
                  border: '1px solid #e7eaf2',
                  borderRadius: 16,
                  padding: '1.8rem 1.6rem',
                  boxShadow: '0 6px 24px rgba(11,31,75,0.05)',
                }}
              >
                <div
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: '50%',
                    background: 'var(--navy)',
                    color: 'var(--color-gold)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 800,
                    fontSize: '1.2rem',
                    marginBottom: '1.1rem',
                  }}
                >
                  {s.n}
                </div>
                <h3
                  style={{
                    fontFamily: 'var(--font-heading)',
                    color: 'var(--navy)',
                    fontSize: '1.12rem',
                    fontWeight: 700,
                    margin: '0 0 .5rem',
                    letterSpacing: '-.01em',
                  }}
                >
                  {s.title}
                </h3>
                <p style={{ color: 'var(--text2)', fontSize: '.88rem', lineHeight: 1.65, margin: 0 }}>
                  {s.body}
                </p>
              </div>
            ))}
          </div>

          {/* Primary CTA */}
          <div className="reveal" style={{ textAlign: 'center' }}>
            <Link to="/flyer-request" className="btn bp" style={{ padding: '14px 34px', fontSize: '.92rem' }}>
              Request a flyer →
            </Link>
            <p style={{ color: 'var(--text2)', fontSize: '.78rem', marginTop: '.9rem' }}>
              Free for NIQS chapters, bodies and members.
            </p>
          </div>
        </div>
      </section>

      {/* ── What to prepare ── */}
      <section style={{ background: '#F6F7FB' }}>
        <div
          className="ct reveal"
          style={{
            paddingTop: '4rem',
            paddingBottom: '4rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2.4rem',
            alignItems: 'center',
          }}
        >
          <div>
            <div className="ey">Before you start</div>
            <h2 className="sh" style={{ marginTop: '.6rem' }}>
              What you'll <em>need</em>
            </h2>
            <p style={{ color: 'var(--text2)', fontSize: '.92rem', lineHeight: 1.7, marginTop: '.8rem' }}>
              Have these handy to breeze through the form. Anything optional can be left blank — we'll
              follow up if we need more.
            </p>
            <Link
              to="/flyer-request"
              className="btn bo"
              style={{ marginTop: '1.4rem', display: 'inline-block', padding: '11px 26px', fontSize: '.85rem' }}
            >
              Start my request →
            </Link>
          </div>

          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: '.8rem' }}>
            {PREPARE.map((item, i) => (
              <li
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '.8rem',
                  background: '#fff',
                  border: '1px solid #e7eaf2',
                  borderRadius: 12,
                  padding: '.9rem 1.1rem',
                  fontSize: '.88rem',
                  color: 'var(--navy)',
                  lineHeight: 1.5,
                }}
              >
                <span style={{ color: 'var(--color-gold)', fontWeight: 800, flexShrink: 0 }}>✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
