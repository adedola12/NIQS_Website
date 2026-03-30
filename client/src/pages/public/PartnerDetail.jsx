import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../../api/axios';
import PageHero from '../../components/common/PageHero';

const tierColors = {
  platinum: '#6b7280',
  gold:     '#C9974A',
  silver:   '#9ca3af',
  bronze:   '#b45309',
  associate:'#2563EB',
};

export default function PartnerDetail() {
  const { id } = useParams();
  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    API.get(`/partners/${id}`)
      .then(res => setPartner(res.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--color-txt-2)', fontSize: '1rem' }}>Loading partner…</p>
      </div>
    );
  }

  if (error || !partner) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', textAlign: 'center', padding: '4rem 2rem' }}>
        <h2 style={{ color: 'var(--color-navy)', fontFamily: 'var(--font-heading)' }}>Partner not found</h2>
        <Link to="/partnership" className="btn bg">Back to Partners</Link>
      </div>
    );
  }

  const tierColor = tierColors[partner.tier] || '#6b7280';
  const mapQuery = [partner.address, partner.city, partner.state, partner.country].filter(Boolean).join(', ');

  return (
    <>
      <PageHero
        label="Partner Profile"
        title={partner.name}
        backgroundImage={partner.coverImage || 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1400&q=80&fit=crop'}
      />

      <section style={{ background: '#fff' }}>
        <div className="ct" style={{ paddingTop: '3rem', paddingBottom: '5rem' }}>

          {/* Back link */}
          <Link to="/partnership" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--color-gold)', fontSize: '.85rem', fontWeight: 600, textDecoration: 'none', marginBottom: '2rem' }}>
            &#8592; All Partners
          </Link>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '3rem', alignItems: 'flex-start' }}>

            {/* Left: Main info */}
            <div>
              {/* Logo + Name + Badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                {partner.logo && (
                  <img
                    src={partner.logo}
                    alt={partner.name}
                    style={{ height: 72, width: 'auto', objectFit: 'contain', borderRadius: 8, border: '1px solid var(--color-bdr)', padding: '6px 12px', background: '#fff' }}
                  />
                )}
                <div>
                  <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-navy)', margin: '0 0 6px', letterSpacing: '-.03em' }}>
                    {partner.name}
                  </h1>
                  <span style={{ display: 'inline-block', padding: '3px 14px', borderRadius: 20, fontSize: '.72rem', fontWeight: 700, background: `${tierColor}18`, color: tierColor, textTransform: 'capitalize', border: `1px solid ${tierColor}40` }}>
                    {partner.tier} Partner
                  </span>
                </div>
              </div>

              {/* Description */}
              {partner.description && (
                <div style={{ marginBottom: '2rem' }}>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 700, color: 'var(--color-navy)', marginBottom: '0.6rem' }}>About</h3>
                  <p style={{ color: 'var(--color-txt-2)', lineHeight: 1.8, fontSize: '.92rem' }}>{partner.description}</p>
                </div>
              )}

              {/* Benefits */}
              {partner.benefits?.length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 700, color: 'var(--color-navy)', marginBottom: '0.8rem' }}>Partnership Benefits</h3>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {partner.benefits.map((b, i) => (
                      <li key={i} style={{ display: 'flex', gap: '.6rem', alignItems: 'flex-start', fontSize: '.88rem', color: 'var(--color-txt-2)', lineHeight: 1.6 }}>
                        <span style={{ color: 'var(--color-gold)', fontWeight: 800, flexShrink: 0, marginTop: 1 }}>✓</span>
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Map */}
              {mapQuery && (
                <div style={{ marginTop: '2rem' }}>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 700, color: 'var(--color-navy)', marginBottom: '0.8rem' }}>Location</h3>
                  <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid var(--color-bdr)' }}>
                    <iframe
                      title={`${partner.name} location`}
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`}
                      width="100%"
                      height="300"
                      style={{ border: 'none', display: 'block' }}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Right: Info card */}
            <div style={{ background: 'var(--color-off, #f9fafb)', borderRadius: 14, padding: '1.5rem', border: '1px solid var(--color-bdr)', position: 'sticky', top: 100 }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 700, color: 'var(--color-navy)', marginTop: 0, marginBottom: '1rem' }}>Contact & Details</h3>

              {[
                partner.address && { icon: '📍', label: 'Address', value: [partner.address, partner.city, partner.state, partner.country].filter(Boolean).join(', ') },
                partner.phone && { icon: '📞', label: 'Phone', value: partner.phone, href: `tel:${partner.phone}` },
                partner.contactEmail && { icon: '✉️', label: 'Email', value: partner.contactEmail, href: `mailto:${partner.contactEmail}` },
                partner.website && { icon: '🌐', label: 'Website', value: partner.website.replace(/^https?:\/\//, ''), href: partner.website, external: true },
                partner.industry && { icon: '🏭', label: 'Industry', value: partner.industry },
                partner.founded && { icon: '📅', label: 'Founded', value: partner.founded },
              ].filter(Boolean).map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '.7rem', marginBottom: '1rem', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '1rem', flexShrink: 0, marginTop: 1 }}>{item.icon}</span>
                  <div>
                    <div style={{ fontSize: '.72rem', color: 'var(--color-txt-3, #9ca3af)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em' }}>{item.label}</div>
                    {item.href ? (
                      <a href={item.href} target={item.external ? '_blank' : undefined} rel={item.external ? 'noopener noreferrer' : undefined}
                        style={{ fontSize: '.85rem', color: 'var(--color-gold)', fontWeight: 500, textDecoration: 'none', wordBreak: 'break-all' }}>
                        {item.value}
                      </a>
                    ) : (
                      <div style={{ fontSize: '.85rem', color: 'var(--color-txt-2)', lineHeight: 1.5 }}>{item.value}</div>
                    )}
                  </div>
                </div>
              ))}

              {partner.website && (
                <a href={partner.website} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'block', marginTop: '1.2rem', padding: '10px 0', textAlign: 'center', background: 'var(--color-navy)', color: '#fff', borderRadius: 8, fontWeight: 700, fontSize: '.85rem', textDecoration: 'none' }}>
                  Visit Website →
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'var(--color-off, #f9fafb)', borderTop: '1px solid var(--color-bdr)' }}>
        <div className="ct" style={{ paddingTop: '3rem', paddingBottom: '3rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--color-txt-2)', fontSize: '.95rem', marginBottom: '1.2rem' }}>
            Interested in becoming a partner? Contact NIQS to discuss partnership opportunities.
          </p>
          <Link to="/contact" className="btn bg">Enquire About Partnership</Link>
        </div>
      </section>
    </>
  );
}
