import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
      background: 'linear-gradient(160deg, #0B1F4B 0%, #12306e 100%)',
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
 * the head in the upper third); hovering pops up the full uncropped image.
 */
export default function LeaderCard({ member }) {
  const [hovered, setHovered] = useState(false);
  const m = member;

  return (
    <motion.div
      className="lcard"
      style={{ position: 'relative' }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      whileHover={{ y: -5 }}
    >
      <div className="lcard-img-wrap" style={{ position: 'relative' }}>
        {m.image ? (
          <motion.img
            className="lcard-img"
            src={m.image}
            alt={m.name}
            animate={{ scale: hovered ? 1.05 : 1 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          />
        ) : (
          <Initials name={m.name} />
        )}
      </div>
      <div className="lcard-body">
        <div className="lcard-name">{m.name}</div>
        <div className="lcard-role">{m.title}</div>
        {m.state && <div className="lcard-state">{m.state}</div>}
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

      {/* Full uncropped portrait pops above the card on hover */}
      <AnimatePresence>
        {hovered && m.image && (
          <motion.div
            initial={{ opacity: 0, scale: 0.86, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 8 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            style={{
              position: 'absolute', left: '50%', bottom: 'calc(100% + 10px)',
              transform: 'translateX(-50%)', zIndex: 60, pointerEvents: 'none',
              background: '#fff', borderRadius: 12, padding: 6,
              boxShadow: '0 18px 50px rgba(11,31,75,.35)',
              border: '1px solid var(--color-bdr-gold)',
            }}
          >
            <img
              src={m.image}
              alt={m.name}
              style={{
                display: 'block', maxWidth: 260, maxHeight: 320,
                width: 'auto', height: 'auto', objectFit: 'contain', borderRadius: 8,
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
