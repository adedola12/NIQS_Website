import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageHero from '../../components/common/PageHero';
import LeaderCard from '../../components/common/LeaderCard';
import API from '../../api/axios';

const offerings = [
  { icon: '🧑‍🏫', title: 'Mentorship Programme',  desc: 'Pairing young QS professionals with experienced Fellows for career guidance, knowledge transfer, and professional development.',                        tag: 'Mentorship'  },
  { icon: '💻', title: 'Tech & Innovation',       desc: 'Workshops on BIM, cost estimation software, AI in construction, and digital tools transforming the QS profession.',                                  tag: 'Technology'  },
  { icon: '🏆', title: 'Young QS Awards',          desc: 'Annual awards recognising outstanding contributions by young quantity surveyors to the profession and community.',                                    tag: 'Awards'      },
  { icon: '🌐', title: 'Networking Events',        desc: 'Regular meetups, social events, and conferences designed to build connections among young professionals nationwide.',                                 tag: 'Networking'  },
  { icon: '📖', title: 'Exam Preparation',         desc: 'Study groups, mock exams, and revision workshops to help aspiring QS professionals pass the TPC and professional exams.',                           tag: 'Exams'       },
  { icon: '✈️', title: 'International Exposure',  desc: 'Opportunities to participate in international QS conferences, exchange programmes, and collaborative projects.',                                      tag: 'Global'      },
];

/* Placeholder defaults — replaced by admin-set values once loaded */
const DEFAULTS = { cpdEvents: '40', totalAwards: '10+' };

export default function YQSF() {
  const [cpdEvents,    setCpdEvents]    = useState(DEFAULTS.cpdEvents);
  const [totalAwards,  setTotalAwards]  = useState(DEFAULTS.totalAwards);
  const [chair, setChair] = useState(null);

  useEffect(() => {
    API.get('/site-settings')
      .then(res => {
        if (res.data?.yqsfCpdEvents)   setCpdEvents(res.data.yqsfCpdEvents);
        if (res.data?.yqsfTotalAwards) setTotalAwards(res.data.yqsfTotalAwards);
      })
      .catch(() => {});
    /* The YQSF Chairman sits on the NEC — pull his record from there. */
    API.get('/exco?scope=national')
      .then(res => {
        const data = res.data?.exco || res.data?.data || res.data;
        if (Array.isArray(data)) {
          const found = data.find(m => (m.title || '').toUpperCase().includes('YQSF'));
          if (found) setChair(found);
        }
      })
      .catch(() => {});
  }, []);

  /* Young Members count is a future TODO:
     Will be auto-calculated from Member portal users whose dateOfBirth < 40 years ago.
     Members >= 40 will automatically exit YQSF membership. */
  const stats = [
    { n: '2,400+', l: 'Young Members',  note: true  }, // wired later
    { n: '37',     l: 'State Chapters', note: false },
    { n: cpdEvents,    l: 'CPD Events/Year', note: false },
    { n: totalAwards,  l: 'Total Awards',    note: false },
  ];

  return (
    <>
      <PageHero
        label="Young Professionals"
        title="Young QS Forum"
        titleHighlight="Young QS"
        backgroundImage="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1400&q=80&fit=crop"
      />

      {/* About */}
      <section style={{ background: '#fff' }}>
        <div className="ct" style={{ paddingTop: '5rem', paddingBottom: '5rem' }}>
          <div className="tc2">
            <div>
              <div className="ey">About the Forum</div>
              <h2 className="sh">Empowering the Next Generation of <em>QS Professionals</em></h2>
              <p className="sd" style={{ marginBottom: '1.2rem' }}>
                The Young Quantity Surveyors Forum (YQSF) is a dedicated platform within NIQS for
                quantity surveyors under the age of 40 or those within their first ten years of
                professional practice.
              </p>
              <p className="sd" style={{ marginBottom: '1.2rem' }}>
                YQSF serves as a bridge between academic training and professional practice,
                providing mentorship, networking opportunities, and career development resources
                for its members.
              </p>
              <p className="sd" style={{ marginBottom: '2rem' }}>
                Through the YQSF, NIQS ensures that the profession remains vibrant, innovative,
                and attractive to young Nigerians, while preparing the next generation of leaders.
              </p>
              <Link to="/membership" className="btn bg">Join the Forum</Link>
            </div>
            <div>
              <img
                src={chair?.image || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=700&q=80&fit=crop'}
                alt={chair ? chair.name : 'Young QS professionals'}
                style={{ width: '100%', borderRadius: 14, objectFit: 'cover', objectPosition: 'center 20%', maxHeight: 420, border: '1px solid var(--color-bdr)' }}
              />
              {chair && (
                <div style={{ marginTop: '.8rem', textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '.95rem', color: 'var(--color-navy)' }}>{chair.name}</div>
                  <div style={{ fontSize: '.68rem', fontWeight: 700, color: 'var(--color-gold)', letterSpacing: '.08em', textTransform: 'uppercase', marginTop: 2 }}>{chair.title}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Leadership */}
      {chair && (
        <section style={{ background: 'var(--color-off)' }}>
          <div className="ct" style={{ paddingTop: '4.5rem', paddingBottom: '4.5rem' }}>
            <div style={{ textAlign: 'center', maxWidth: 620, margin: '0 auto 2rem' }}>
              <div className="ey" style={{ justifyContent: 'center' }}>Leadership</div>
              <h2 className="sh" style={{ textAlign: 'center' }}>Meet the <em>Chairman</em></h2>
              <p className="sd" style={{ maxWidth: '100%', textAlign: 'center' }}>
                The YQSF is led nationally by the Chairman, who also represents young
                professionals on the NIQS National Executive Council.
              </p>
            </div>
            <div style={{ maxWidth: 320, margin: '0 auto' }}>
              <LeaderCard member={chair} />
            </div>
          </div>
        </section>
      )}

      {/* Stats strip */}
      <div className="stats-strip">
        <div className="ct">
          <div className="strip-inner" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
            {stats.map((s, i) => (
              <div className="strip-item" key={i} style={{ textAlign: 'center' }}>
                <div className="strip-num">{s.n}</div>
                <div className="strip-lbl">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* What We Offer */}
      <section className="section-alt">
        <div className="ct" style={{ paddingTop: '5rem', paddingBottom: '5rem' }}>
          <div style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto 3rem' }}>
            <div className="ey" style={{ justifyContent: 'center' }}>What We Offer</div>
            <h2 className="sh">Programmes & <em>Initiatives</em></h2>
            <p className="sd" style={{ maxWidth: '100%' }}>
              YQSF offers a range of targeted programmes designed to accelerate the growth of
              young QS professionals across Nigeria.
            </p>
          </div>
          <div className="svc-grid">
            {offerings.map((o, i) => (
              <div className="svc" key={i}>
                <span className="svc-tag">{o.tag}</span>
                <div className="svc-ico">{o.icon}</div>
                <div className="svc-t">{o.title}</div>
                <p className="svc-d">{o.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: '#fff' }}>
        <div className="ct" style={{ paddingTop: '5rem', paddingBottom: '5rem' }}>
          <div className="ctaw">
            <h2>Join the <em>Young QS Forum</em></h2>
            <p>
              Are you a young quantity surveyor looking to accelerate your career? Join the YQSF
              community and connect with peers and mentors across Nigeria.
            </p>
            <div className="ctarow">
              <Link to="/membership" className="btn bg">Get Started</Link>
              <Link to="/contact?body=yqsf" className="btn bo" style={{ color: '#fff', borderColor: 'rgba(255,255,255,.3)' }}>Contact YQSF</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
