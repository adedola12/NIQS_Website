import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { requiresConsent, consentState, setConsent } from '../../utils/analytics';

/**
 * Cookie notice.
 *
 * It appears only when the site is actually doing something that needs asking
 * about. `requiresConsent()` is false whenever analytics is off or set to
 * Plausible, and this component returns null — so the day the Institute moves
 * to a cookieless provider, the banner disappears on its own rather than
 * lingering as a piece of theatre asking permission for nothing.
 *
 * Reject is a real button, given the same weight as Accept. A notice with only
 * an "OK" is not consent under the NDPR, and consent that cannot be refused is
 * not consent at all. Dismissing without choosing is not offered either, for
 * the same reason: the analytics module treats "no answer" as "do not measure",
 * so an ignored banner already means no.
 */
export default function CookieNotice() {
  const { pathname } = useLocation();
  const [decided, setDecided] = useState(true);

  useEffect(() => {
    // Read on the client only. Rendering the banner before this runs would
    // flash it at people who answered months ago.
    setDecided(consentState() !== null);
  }, []);

  if (!requiresConsent() || decided) return null;

  // The staff areas are excluded from measurement entirely (see analytics.js),
  // so there is nothing to consent to there.
  if (['/admin', '/portal', '/login'].some((p) => pathname.startsWith(p))) return null;

  const answer = (granted) => { setConsent(granted); setDecided(true); };

  return (
    <div
      role="region"
      aria-label="Cookie notice"
      style={{
        position: 'fixed', left: '1rem', right: '1rem', bottom: '1rem',
        // Clear of the "Built by ADLM" pill in the bottom-left corner.
        maxWidth: 560, marginLeft: 'auto',
        zIndex: 99998,
        background: '#fff',
        border: '1px solid var(--color-bdr)',
        borderRadius: 16,
        boxShadow: 'var(--shadow-lg)',
        padding: '1.15rem 1.25rem',
      }}
    >
      <div style={{
        fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '.9rem',
        color: 'var(--color-navy)', letterSpacing: '-.02em', marginBottom: '.4rem',
      }}>
        Cookies on this site
      </div>

      <p style={{
        fontSize: '.78rem', lineHeight: 1.6, color: 'var(--color-txt-2)', margin: '0 0 .9rem',
      }}>
        We would like to use Google Analytics to count visits and see which pages
        are useful. It sets cookies on your device. Nothing is measured unless you
        agree, and the pages you visit are never linked to your name or membership
        record. See our{' '}
        <Link to="/privacy-policy" style={{ color: 'var(--color-navy-2)', fontWeight: 600 }}>
          Privacy Policy
        </Link>.
      </p>

      <div style={{ display: 'flex', gap: '.6rem', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => answer(true)}
          style={{
            flex: '1 1 140px', padding: '.6rem 1.1rem', borderRadius: 10, border: 0,
            background: 'var(--color-navy)', color: '#fff', cursor: 'pointer',
            fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '.78rem',
          }}
        >
          Accept
        </button>
        <button
          type="button"
          onClick={() => answer(false)}
          style={{
            flex: '1 1 140px', padding: '.6rem 1.1rem', borderRadius: 10,
            border: '1px solid var(--color-bdr)', background: '#fff',
            color: 'var(--color-txt-2)', cursor: 'pointer',
            fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '.78rem',
          }}
        >
          Reject
        </button>
      </div>
    </div>
  );
}
