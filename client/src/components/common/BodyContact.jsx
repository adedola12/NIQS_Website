import { useState, useEffect } from 'react';
import API from '../../api/axios';

/**
 * Contact details for one national body, rendered on that body's own landing page.
 *
 * The Contact page used to carry a tab per body. The secretariat took WAQSN and
 * YQSF off it on 2026-08-05: /contact is the National Secretariat's, and every
 * other body and all 37 chapters reach people from their own page, so two bodies
 * holding a seat there would fairly invite the rest to ask for one. This is where
 * those two blocks went.
 *
 * Reads the same /contact-info document the Contact page does — the admin screen
 * still edits all three bodies, and nothing about that had to change. `fallback`
 * covers a body the document has no entry for yet; a body with neither renders
 * nothing rather than an empty heading.
 */
export default function BodyContact({ bodyKey, heading, fallback }) {
  const [info, setInfo] = useState(fallback || null);

  useEffect(() => {
    API.get('/contact-info')
      .then((res) => {
        const found = res.data?.[bodyKey];
        if (found && Object.keys(found).length) setInfo((prev) => ({ ...prev, ...found }));
      })
      .catch(() => {});
  }, [bodyKey]);

  if (!info) return null;

  const rows = [
    info.phone1 || info.phone2
      ? {
        icon: '📞',
        title: 'Phone',
        lines: [info.phone1, info.phone2].filter(Boolean),
        hrefs: [info.phone1, info.phone2].filter(Boolean).map(p => `tel:${p.replace(/\s/g, '')}`),
      }
      : null,
    info.email1 || info.email2
      ? {
        icon: '✉️',
        title: 'Email',
        lines: [info.email1, info.email2].filter(Boolean),
        hrefs: [info.email1, info.email2].filter(Boolean).map(e => `mailto:${e}`),
      }
      : null,
    info.address     ? { icon: '📍', title: 'Address',      lines: [info.address],     plain: true } : null,
    info.officeHours ? { icon: '🕐', title: 'Office Hours', lines: [info.officeHours], plain: true } : null,
  ].filter(Boolean);

  const socials = [
    info.twitterUrl   && { label: 'Twitter / X', href: info.twitterUrl },
    info.facebookUrl  && { label: 'Facebook',    href: info.facebookUrl },
    info.linkedinUrl  && { label: 'LinkedIn',    href: info.linkedinUrl },
    info.instagramUrl && { label: 'Instagram',   href: info.instagramUrl },
  ].filter(Boolean);

  if (!rows.length && !socials.length) return null;

  return (
    <div>
      {heading && <h2 className="sh" style={{ marginBottom: '1.8rem' }}>{heading}</h2>}
      {rows.map((row, i) => (
        <div className="cii" key={i}>
          <h4>{row.icon} {row.title}</h4>
          {row.plain
            ? <p style={{ whiteSpace: 'pre-line' }}>{row.lines[0]}</p>
            : row.lines.map((l, j) => <p key={j}><a href={row.hrefs[j]}>{l}</a></p>)}
        </div>
      ))}
      {socials.length > 0 && (
        <div className="cii">
          <h4>🌐 Follow Us</h4>
          <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', marginTop: '.4rem' }}>
            {socials.map(s => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                className="btn bo" style={{ padding: '5px 14px', fontSize: '.72rem' }}>{s.label}</a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
