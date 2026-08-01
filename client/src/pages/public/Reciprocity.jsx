import React from 'react';
import PageHero from '../../components/common/PageHero';
import { agreements } from '../../data/reciprocity';


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
              NIQS maintains reciprocity and mutual recognition agreements with {agreements.length} professional
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
