import { useState, useEffect } from 'react';
import PageHero from '../../components/common/PageHero';
import API from '../../api/axios';

const roles = [
  { icon: '👩‍💼', title: 'Professional Advocacy',    desc: 'WAQSN advocates for the increased participation and recognition of women in quantity surveying, construction, and the broader built environment in Nigeria.',                   tag: 'Advocacy'     },
  { icon: '🎓', title: 'Mentorship & Training',     desc: 'Structured mentorship programmes pair emerging female QS professionals with experienced Fellows, providing career guidance and knowledge transfer.',                              tag: 'Mentorship'   },
  { icon: '🤝', title: 'Networking',                desc: 'Regular forums, seminars, and social events create a strong community where women QS professionals can connect, collaborate, and grow together.',                               tag: 'Community'    },
  { icon: '📚', title: 'Capacity Building',         desc: 'Workshops on leadership, entrepreneurship, BIM, contract management, and other skills equip members to excel and advance in their careers.',                                   tag: 'Development'  },
  { icon: '🏆', title: 'Women in QS Awards',        desc: 'Annual awards recognising outstanding female quantity surveyors who have made exceptional contributions to the profession and to society.',                                      tag: 'Recognition'  },
  { icon: '🌍', title: 'International Engagement',  desc: 'WAQSN engages with global women-in-construction networks, facilitating international exposure and collaboration opportunities for Nigerian female QS professionals.',           tag: 'Global'       },
];

export default function WAQSN() {
  const [waqsnUrl, setWaqsnUrl] = useState('');

  useEffect(() => {
    API.get('/site-settings')
      .then(res => { if (res.data?.waqsnUrl) setWaqsnUrl(res.data.waqsnUrl); })
      .catch(() => {});
  }, []);

  return (
    <>
      <PageHero
        label="Women in QS"
        title="Women Association of QS Nigeria"
        titleHighlight="QS Nigeria"
        backgroundImage="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1400&q=80&fit=crop"
      />

      {/* ── Org-hero banner ── */}
      <section style={{ background: 'var(--color-off)' }}>
        <div className="ct" style={{ paddingTop: '3.5rem', paddingBottom: '0' }}>
          <div className="org-hero">
            <div style={{
              position: 'absolute', inset: 0, pointerEvents: 'none',
              backgroundImage: 'linear-gradient(rgba(255,255,255,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.03) 1px,transparent 1px)',
              backgroundSize: '44px 44px',
            }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div className="ey" style={{ color: 'rgba(255,255,255,.55)' }}>
                Women Association of Quantity Surveyors in Nigeria
              </div>
              <h2>Empowering Women in Nigeria's Built Environment</h2>
              <p>
                WAQSN is the foremost platform within NIQS dedicated to advancing the professional
                growth, visibility, and leadership of women in quantity surveying across Nigeria.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Two-col: image LEFT / text RIGHT ── */}
      <section style={{ background: 'var(--color-off)' }}>
        <div className="ct" style={{ paddingTop: '4rem', paddingBottom: '5rem' }}>
          <div className="tc2">
            {/* Image — left */}
            <div>
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=700&q=80&fit=crop"
                alt="Women QS professionals"
                style={{ width: '100%', borderRadius: 16, objectFit: 'cover', maxHeight: 420, border: '1px solid var(--color-bdr)', display: 'block' }}
              />
            </div>

            {/* Text — right */}
            <div>
              <div className="ey">About WAQSN</div>
              <h2 className="sh">Women Shaping <em>Excellence</em></h2>
              <p className="sd" style={{ marginBottom: '1.2rem' }}>
                The Women Association of Quantity Surveyors in Nigeria (WAQSN) is a body within
                the Nigerian Institute of Quantity Surveyors established to champion the interests,
                welfare, and professional advancement of women in the QS profession.
              </p>
              <p className="sd" style={{ marginBottom: '1.2rem' }}>
                WAQSN provides a supportive community where female quantity surveyors at every
                stage of their career — from student to Fellow — can find mentorship, training,
                networking, and advocacy.
              </p>
              <p className="sd" style={{ marginBottom: '2rem' }}>
                Through targeted programmes and strong advocacy, WAQSN works to break barriers,
                increase female representation in leadership roles, and position women as key
                drivers of Nigeria's built environment.
              </p>

              {waqsnUrl ? (
                <a href={waqsnUrl} target="_blank" rel="noopener noreferrer" className="btn bp">
                  Visit WAQSN →
                </a>
              ) : (
                <span
                  className="btn bp"
                  style={{ opacity: .35, cursor: 'default', pointerEvents: 'none' }}
                  title="WAQSN website link not yet configured"
                >
                  Visit WAQSN →
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── What WAQSN Does ── */}
      <section style={{ background: '#fff' }}>
        <div className="ct" style={{ paddingTop: '5rem', paddingBottom: '5rem' }}>
          <div style={{ textAlign: 'center', maxWidth: 620, margin: '0 auto 3rem' }}>
            <div className="ey" style={{ justifyContent: 'center' }}>Our Work</div>
            <h2 className="sh" style={{ textAlign: 'center' }}>What <em>WAQSN Does</em></h2>
            <p className="sd" style={{ maxWidth: '100%', textAlign: 'center' }}>
              WAQSN runs a range of programmes designed to support, develop, and celebrate
              women across all levels of the quantity surveying profession in Nigeria.
            </p>
          </div>
          <div className="svc-grid">
            {roles.map((r, i) => (
              <div className="svc" key={i}>
                <span className="svc-tag">{r.tag}</span>
                <div className="svc-ico">{r.icon}</div>
                <div className="svc-t">{r.title}</div>
                <p className="svc-d">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ background: 'var(--color-off)' }}>
        <div className="ct" style={{ paddingTop: '5rem', paddingBottom: '5rem' }}>
          <div className="ctaw">
            <h2>Join the <em>WAQSN Community</em></h2>
            <p>
              Are you a female quantity surveyor or a student of QS? Connect with WAQSN and
              be part of a growing community shaping the future of Nigeria's built environment.
            </p>
            <div className="ctarow">
              {waqsnUrl && (
                <a href={waqsnUrl} target="_blank" rel="noopener noreferrer" className="btn bg">Visit WAQSN</a>
              )}
              <a href="/contact?body=waqsn" className="btn bo" style={{ color: '#fff', borderColor: 'rgba(255,255,255,.3)' }}>Contact Us</a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
