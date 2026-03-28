import React from 'react';
import PageHero from '../../components/common/PageHero';

const agreements = [
  {
    body: 'Royal Institution of Chartered Surveyors (RICS)',
    country: 'United Kingdom', year: '2005', flag: '🇬🇧',
    desc: 'Full reciprocity for FNIQS members to attain MRICS status through an assessment of professional competence.',
  },
  {
    body: 'Australian Institute of Quantity Surveyors (AIQS)',
    country: 'Australia', year: '2012', flag: '🇦🇺',
    desc: 'Mutual recognition agreement enabling members to practice in either jurisdiction subject to local requirements.',
  },
  {
    body: 'Singapore Institute of Surveyors and Valuers (SISV)',
    country: 'Singapore', year: '2015', flag: '🇸🇬',
    desc: 'Professional reciprocity covering quantity surveying practice and professional development.',
  },
  {
    body: 'Ghana Institution of Surveyors (GhIS)',
    country: 'Ghana', year: '2008', flag: '🇬🇭',
    desc: 'Bilateral agreement for mutual recognition of professional qualifications within West Africa.',
  },
  {
    body: 'Institute of Quantity Surveyors of Kenya (IQSK)',
    country: 'Kenya', year: '2010', flag: '🇰🇪',
    desc: 'East-West African partnership for professional exchange and standards harmonisation.',
  },
  {
    body: 'Association of South African Quantity Surveyors (ASAQS)',
    country: 'South Africa', year: '2014', flag: '🇿🇦',
    desc: 'Reciprocity for qualified members to practice across both countries.',
  },
  {
    body: 'Hong Kong Institute of Surveyors (HKIS)',
    country: 'Hong Kong', year: '2017', flag: '🇭🇰',
    desc: 'Agreement covering professional recognition and collaborative research initiatives.',
  },
  {
    body: 'Chartered Institute of Building (CIOB)',
    country: 'United Kingdom', year: '2019', flag: '🇬🇧',
    desc: 'MoU for joint CPD programmes and shared professional development resources.',
  },
  {
    body: 'Pacific Association of Quantity Surveyors (PAQS)',
    country: 'International', year: '2016', flag: '🌏',
    desc: 'Membership in the Pacific rim QS alliance for international collaboration.',
  },
  {
    body: 'International Cost Engineering Council (ICEC)',
    country: 'International', year: '2003', flag: '🌐',
    desc: 'Affiliation with the global body for cost engineering and quantity surveying.',
  },
  {
    body: 'New Zealand Institute of Quantity Surveyors (NZIQS)',
    country: 'New Zealand', year: '2018', flag: '🇳🇿',
    desc: 'Mutual recognition and professional exchange framework.',
  },
  {
    body: 'Canadian Institute of Quantity Surveyors (CIQS)',
    country: 'Canada', year: '2021', flag: '🇨🇦',
    desc: 'Partnership for professional development and knowledge sharing.',
  },
];

export default function Reciprocity() {
  return (
    <>
      <PageHero
        label="International"
        title="Reciprocity Agreements"
        titleHighlight="Reciprocity"
        backgroundImage="https://images.unsplash.com/photo-1552664730-d307ca884978?w=1400&q=80&fit=crop"
      />

      {/* Intro */}
      <section style={{ background: '#fff' }}>
        <div className="ct" style={{ paddingTop: '5rem', paddingBottom: '5rem' }}>
          <div style={{ textAlign: 'center', maxWidth: 680, margin: '0 auto 3rem' }}>
            <div className="ey" style={{ justifyContent: 'center' }}>Global Reach</div>
            <h2 className="sh">International <em>Partnerships</em></h2>
            <p className="sd" style={{ maxWidth: '100%' }}>
              NIQS maintains reciprocity and mutual recognition agreements with over 12 professional
              bodies worldwide, enabling members to practice internationally and access global
              professional development opportunities.
            </p>
          </div>

          <div className="recip-grid">
            {agreements.map((a, i) => (
              <div className="recard" key={i}>
                <div style={{ fontSize: '1.8rem', lineHeight: 1, flexShrink: 0 }}>{a.flag}</div>
                <div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '.92rem', color: 'var(--color-navy)', marginBottom: '.3rem', letterSpacing: '-.02em' }}>{a.body}</div>
                  <div style={{ display: 'flex', gap: '.6rem', alignItems: 'center', marginBottom: '.5rem' }}>
                    <span style={{ fontSize: '.68rem', fontWeight: 700, color: 'var(--color-gold)', textTransform: 'uppercase', letterSpacing: '.06em' }}>{a.country}</span>
                    <span style={{ fontSize: '.62rem', color: 'var(--color-txt-3)' }}>Since {a.year}</span>
                    <span className="pill" style={{ fontSize: '.56rem', padding: '1px 8px' }}>Active</span>
                  </div>
                  <p style={{ fontSize: '.78rem', color: 'var(--color-txt-2)', lineHeight: 1.55, margin: 0 }}>{a.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-alt">
        <div className="ct" style={{ paddingTop: '5rem', paddingBottom: '5rem' }}>
          <div className="ctaw">
            <h2>Practise <em>Internationally</em></h2>
            <p>
              As an NIQS member, you can leverage reciprocity agreements to expand your practice
              internationally and access professional development opportunities worldwide.
            </p>
            <div className="ctarow">
              <a href="/membership" className="btn bg">Become a Member</a>
              <a href="/contact" className="btn bo" style={{ color: '#fff', borderColor: 'rgba(255,255,255,.3)' }}>Enquire</a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
