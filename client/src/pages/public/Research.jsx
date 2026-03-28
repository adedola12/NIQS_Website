import React from 'react';
import PageHero from '../../components/common/PageHero';

const publications = [
  {
    title: 'Nigerian Journal of Quantity Surveying',
    type: 'Journal',
    frequency: 'Bi-annual',
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&q=80&fit=crop',
    desc: 'The flagship peer-reviewed journal of NIQS publishing original research in quantity surveying, cost management, and construction economics.',
  },
  {
    title: 'NIQS Standard Method of Measurement',
    type: 'Standard',
    frequency: 'Updated periodically',
    image: 'https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=600&q=80&fit=crop',
    desc: 'The definitive guide for measurement of building works in Nigeria, aligned with international best practices and RICS SMM.',
  },
  {
    title: 'Construction Cost Index',
    type: 'Index',
    frequency: 'Quarterly',
    image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&q=80&fit=crop',
    desc: "Quarterly publication tracking construction cost trends and material price indices across Nigeria's six geopolitical zones.",
  },
  {
    title: 'QS Practice Guide',
    type: 'Guide',
    frequency: 'Updated periodically',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80&fit=crop',
    desc: 'Practical guide for quantity surveying practitioners covering best practices, templates, and real-world case studies.',
  },
];

const webinars = [
  { title: 'BIM for Quantity Surveyors: Practical Applications', date: '2026-04-15', speaker: 'QS. (Dr.) Adewale Johnson, FNIQS', tag: 'Technology' },
  { title: 'Sustainable Construction: The QS Perspective', date: '2026-05-20', speaker: 'QS. (Prof.) Ngozi Okafor, FNIQS', tag: 'Sustainability' },
  { title: 'Dispute Resolution in Construction Contracts', date: '2026-06-10', speaker: 'QS. Barr. Ibrahim Musa, FNIQS', tag: 'Legal' },
  { title: 'Digital Transformation in QS Practice', date: '2026-07-18', speaker: 'QS. Tunde Afolabi, MNIQS', tag: 'Innovation' },
];

const cpd = [
  { label: 'National Conference attendance', points: '10 pts' },
  { label: 'Chapter workshops and seminars', points: '5 pts each' },
  { label: 'Webinar participation', points: '2 pts each' },
  { label: 'Published research paper', points: '10 pts' },
  { label: 'Mentoring a Probationer', points: '5 pts/year' },
];

export default function Research() {
  return (
    <>
      <PageHero
        label="Knowledge & Development"
        title="CPD & Research"
        titleHighlight="Research"
        backgroundImage="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1400&q=80&fit=crop"
      />

      {/* CPD Overview */}
      <section style={{ background: '#fff' }}>
        <div className="ct" style={{ paddingTop: '5rem', paddingBottom: '5rem' }}>
          <div className="tc2">
            <div>
              <div className="ey">CPD Framework</div>
              <h2 className="sh">Continuing Professional <em>Development</em></h2>
              <p className="sd" style={{ marginBottom: '1.2rem' }}>
                NIQS is committed to the continuous professional development of its members.
                Through a structured CPD framework, the Institute ensures that quantity surveyors
                in Nigeria maintain and enhance their knowledge, skills, and competence.
              </p>
              <p className="sd" style={{ marginBottom: '1.5rem' }}>
                Members are required to accumulate a minimum of <strong>20 CPD hours annually</strong> through
                approved activities. CPD compliance is monitored and forms part of the membership
                renewal process.
              </p>
            </div>
            <div>
              <div style={{ background: '#fff', border: '1px solid var(--color-bdr)', borderRadius: 14, padding: '1.8rem' }}>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '.9rem', color: 'var(--color-navy)', marginBottom: '1.2rem', letterSpacing: '-.02em' }}>CPD Points Guide</div>
                {cpd.map((c, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '.65rem 0', borderBottom: i < cpd.length - 1 ? '1px solid var(--color-bdr)' : 'none' }}>
                    <span style={{ fontSize: '.8rem', color: 'var(--color-txt-2)' }}>{c.label}</span>
                    <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '.78rem', color: 'var(--color-gold)', flexShrink: 0, marginLeft: '1rem' }}>{c.points}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Webinars */}
      <section className="section-alt">
        <div className="ct" style={{ paddingTop: '5rem', paddingBottom: '5rem' }}>
          <div style={{ textAlign: 'center', maxWidth: 560, margin: '0 auto 3rem' }}>
            <div className="ey" style={{ justifyContent: 'center' }}>Upcoming</div>
            <h2 className="sh">Webinar <em>Series</em></h2>
            <p className="sd" style={{ maxWidth: '100%' }}>
              Join NIQS-facilitated webinars led by experts in the field of quantity surveying
              and the broader built environment.
            </p>
          </div>

          <div className="evtl">
            {webinars.map((w, i) => {
              const d = new Date(w.date);
              return (
                <div className="erow" key={i}>
                  <div style={{ textAlign: 'center' }}>
                    <div className="eday">{d.getDate()}</div>
                    <div className="emon">{d.toLocaleDateString('en-NG', { month: 'short' }).toUpperCase()}</div>
                  </div>
                  <div className="einfo">
                    <h4>{w.title}</h4>
                    <p>Speaker: {w.speaker}</p>
                  </div>
                  <span className="epill">{w.tag}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Publications */}
      <section style={{ background: '#fff' }}>
        <div className="ct" style={{ paddingTop: '5rem', paddingBottom: '5rem' }}>
          <div style={{ textAlign: 'center', maxWidth: 580, margin: '0 auto 3rem' }}>
            <div className="ey" style={{ justifyContent: 'center' }}>Publications</div>
            <h2 className="sh">Research & <em>Publications</em></h2>
            <p className="sd" style={{ maxWidth: '100%' }}>
              NIQS publishes a range of scholarly and professional materials to advance knowledge
              in quantity surveying and construction economics.
            </p>
          </div>

          <div className="res-grid">
            {publications.map((pub, i) => (
              <div className="rcard" key={i}>
                <img src={pub.image} alt={pub.title} />
                <div className="rcard-body">
                  <span className="card-tag" style={{ marginBottom: '.6rem', display: 'inline-block' }}>{pub.type} · {pub.frequency}</span>
                  <h4>{pub.title}</h4>
                  <p>{pub.desc}</p>
                  <a href="/contact" className="btn bog" style={{ marginTop: '.5rem' }}>Request Copy</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
