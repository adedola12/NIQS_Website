import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageHero from '../../components/common/PageHero';
import API from '../../api/axios';

/* ── Placeholder — mirrors HTML file exactly ── */
const FALLBACK = {
  name: 'Arc. Dr. [President Name]',
  title: 'President, NIQS',
  tenure: 'Elected 2023 – Present',
  linkedIn: '',
  photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80&fit=crop&crop=face',
  backgroundImage: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=1400&q=80&fit=crop',
  paragraph1: 'It is my honour to serve as President of the Nigerian Institute of Quantity Surveyors at this critical juncture. The construction industry is undergoing significant transformation, and NIQS is well-positioned to lead that change.',
  paragraph2: 'Our focus rests on three pillars: strengthening professional standards, expanding access to quality education and examination, and deepening international partnerships that give our members global relevance.',
  quote: '"Together, we will build a stronger, more impactful NIQS for the benefit of our members and Nigerian society."',
};

export default function President() {
  const [data, setData] = useState(FALLBACK);

  useEffect(() => {
    API.get('/president')
      .then(res => { if (res.data?._id) setData(res.data); })
      .catch(() => {});
  }, []);

  /* Name is a link if LinkedIn URL is set, otherwise plain text */
  const NameEl = data.linkedIn ? (
    <a
      href={data.linkedIn}
      target="_blank"
      rel="noopener noreferrer"
      style={{ color: 'var(--navy)', textDecoration: 'none', borderBottom: '1.5px solid var(--gold)', paddingBottom: 1, cursor: 'pointer' }}
      title="View LinkedIn Profile"
    >
      {data.name}
    </a>
  ) : (
    <span>{data.name}</span>
  );

  return (
    <>
      {/* ── HERO — uses the president photo as background ── */}
      <PageHero
        label="Leadership"
        title="The President"
        titleHighlight="President"
        backgroundImage={data.photo}
      />

      {/* ── MAIN SECTION ── */}
      <section style={{ background: '#fff' }}>
        <div className="ct">
          <div className="tc2">

            {/* ── LEFT — portrait + name card ── */}
            <div className="rl" style={{ textAlign: 'center' }}>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <img
                  src={data.photo}
                  alt="NIQS President"
                  style={{
                    borderRadius: 16,
                    width: '100%',
                    maxWidth: 320,
                    height: 400,
                    objectFit: 'cover',
                    objectPosition: 'top',
                    boxShadow: 'var(--sh2)',
                    border: '3px solid var(--borderg)',
                    display: 'block',
                  }}
                />
              </div>
              <div style={{ marginTop: '1.2rem' }}>
                <h3 style={{
                  fontFamily: "'Bricolage Grotesque', sans-serif",
                  fontSize: '1.3rem',
                  fontWeight: 800,
                  color: 'var(--navy)',
                  letterSpacing: '-.03em',
                  marginBottom: 0,
                }}>
                  {NameEl}
                </h3>
                <p style={{ color: 'var(--gold)', fontSize: '.72rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', marginTop: '.3rem' }}>
                  {data.title}
                </p>
                <p style={{ fontSize: '.74rem', color: 'var(--text3)', marginTop: '.2rem' }}>
                  {data.tenure}
                </p>
                {data.linkedIn && (
                  <a
                    href={data.linkedIn}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '.4rem',
                      marginTop: '.8rem',
                      fontSize: '.72rem',
                      fontWeight: 600,
                      color: 'var(--gold)',
                      textDecoration: 'none',
                      border: '1px solid var(--borderg)',
                      borderRadius: 6,
                      padding: '.3rem .8rem',
                    }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    LinkedIn Profile
                  </a>
                )}
              </div>
            </div>

            {/* ── RIGHT — message ── */}
            <div className="rr">
              <div className="ey">Presidential Message</div>
              <h2 className="sh">A Message from the <em>President</em></h2>

              <p style={{ fontSize: '.9rem', lineHeight: 1.88, color: 'var(--text2)', marginBottom: '1rem' }}>
                {data.paragraph1}
              </p>
              <p style={{ fontSize: '.9rem', lineHeight: 1.88, color: 'var(--text2)', marginBottom: '1rem' }}>
                {data.paragraph2}
              </p>

              {/* Quote block — exact style from HTML */}
              <div style={{
                borderLeft: '3px solid var(--gold)',
                padding: '1.2rem 1.2rem 1.2rem 1.4rem',
                margin: '1.5rem 0',
                background: 'var(--off)',
                borderRadius: '0 10px 10px 0',
              }}>
                <p style={{ fontSize: '.88rem', color: 'var(--text2)', lineHeight: 1.7, fontWeight: 500, margin: 0 }}>
                  {data.quote}
                </p>
              </div>

              <Link to="/council" className="btn bp">Meet the Full Council</Link>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}
