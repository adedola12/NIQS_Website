import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

/* Derive a chapter page link from a chapter-chairman title, e.g.
   "Nasarawa State Chapter Chairman" / "Lagos Chapter Chairman" / "FCT Chapter
   Chairman" → "/chapters/nasarawa-chapter". Returns null for non-chapter roles
   or the bare "Chapter Chairman" (already on the chapter page). */
function chapterLinkFromTitle(title) {
  if (!title || !/chapter chairman/i.test(title)) return null;
  const state = title
    .replace(/\s*(state\s+)?chapter chairman.*/i, '')
    .trim();
  if (!state) return null;
  const slug = state.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  return `/chapters/${slug}-chapter`;
}

/* Fallback shown when a member has no portrait yet — initials on brand navy,
   never a stock stranger's face. */
function Initials({ name }) {
  const initials = (name || '')
    .replace(/^(QS|Surv\.?|Dr\.?|Prof\.?)\s+/gi, '')
    .split(/\s+/)
    .filter(w => /^[A-Za-z]/.test(w))
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('');
  return (
    <div style={{
      width: '100%', aspectRatio: '4 / 4.6', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 6,
      background: 'linear-gradient(160deg, #000066 0%, #12306e 100%)',
    }}>
      <span style={{
        fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '2.6rem',
        color: 'rgba(255,255,255,.85)', letterSpacing: '.02em',
      }}>{initials || 'QS'}</span>
      <span style={{ fontSize: '.6rem', fontWeight: 600, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,.45)' }}>
        Photo coming soon
      </span>
    </div>
  );
}

/**
 * Leadership card used on Council, NPC, chapter and body pages.
 * Portrait keeps a 4:4.6 ratio anchored near the face (studio portraits have
 * the head in the upper third).
 *
 * Hovering used to pop the full uncropped portrait up above the card, so a
 * viewer could see what the 4:4.6 crop had trimmed. It was read as a fault
 * rather than a feature — a second face appearing over the card above it,
 * overlapping the neighbour — so it is gone. The portraits are all normalised
 * to the same canvas and eye line now, which is what the pop-up was
 * compensating for. The quiet scale on hover stays, in CSS.
 */
export default function LeaderCard({ member, linkTo }) {
  const m = member;
  const href = linkTo || chapterLinkFromTitle(m.title);

  const nameEl = href
    ? <Link to={href} className="lcard-name" style={{ color: 'var(--color-navy)', textDecoration: 'none', borderBottom: '1.5px solid var(--color-gold)', cursor: 'pointer' }}>{m.name}</Link>
    : <div className="lcard-name">{m.name}</div>;

  return (
    <motion.div
      className="lcard"
      style={{ position: 'relative' }}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      whileHover={{ y: -5 }}
    >
      <div className="lcard-img-wrap" style={{ position: 'relative' }}>
        {m.image ? (
          /* Plain img: the hover scale is the .lcard:hover .lcard-img rule.
             It was a motion.img before, whose inline transform silently beat
             that rule — two zooms declared, one ever running. */
          <img className="lcard-img" src={m.image} alt={m.name} />
        ) : (
          <Initials name={m.name} />
        )}
      </div>
      <div className="lcard-body">
        {nameEl}
        <div className="lcard-role">{m.title}</div>
        {m.state && <div className="lcard-state">{m.state}</div>}
        {href && (
          <Link to={href} style={{ display: 'inline-block', marginTop: '.4rem', fontSize: '.66rem', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--color-gold)', textDecoration: 'none' }}>
            View chapter →
          </Link>
        )}
        {(m.email || m.phone) && (
          <div style={{ marginTop: '.5rem', display: 'flex', flexDirection: 'column', gap: 2 }}>
            {m.email && (
              <a href={`mailto:${m.email}`} style={{ fontSize: '.7rem', color: 'var(--color-navy)', fontWeight: 600, textDecoration: 'none' }}>
                ✉️ {m.email}
              </a>
            )}
            {m.phone && (
              <a href={`tel:${m.phone.split(',')[0].trim()}`} style={{ fontSize: '.7rem', color: 'var(--color-txt-2)', fontWeight: 600, textDecoration: 'none' }}>
                📞 {m.phone}
              </a>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
