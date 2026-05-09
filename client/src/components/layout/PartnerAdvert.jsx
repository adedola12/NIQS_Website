import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';

const DISMISS_KEY = 'niqs-partner-ad-dismissed-until';
const REVEAL_DELAY_MS = 2500;

/**
 * Subtle floating partner advert shown on every public page.
 *
 * Behaviour is driven by SiteSettings.partnerAd (main_admin only):
 *   - enabled       — global on/off
 *   - tiers         — which partner tiers are eligible (e.g. ['platinum','gold'])
 *   - rotationMs    — interval between partner rotations
 *   - dismissible   — whether the user can dismiss for 24h
 *   - label         — small overline ("Featured Partner" by default)
 */
export default function PartnerAdvert() {
  const [config, setConfig] = useState(null);
  const [partners, setPartners] = useState([]);
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const hoverRef = useRef(false);

  /* Load site settings + matching partners (single-shot, cheap). */
  useEffect(() => {
    let cancelled = false;

    /* Honour an active dismissal up-front. */
    try {
      const until = parseInt(localStorage.getItem(DISMISS_KEY) || '0', 10);
      if (until && Date.now() < until) {
        setDismissed(true);
        return;
      }
    } catch { /* localStorage unavailable — keep going */ }

    Promise.all([
      API.get('/site-settings').catch(() => ({ data: {} })),
      API.get('/partners').catch(() => ({ data: [] })),
    ]).then(([settingsRes, partnersRes]) => {
      if (cancelled) return;
      const ad = settingsRes.data?.partnerAd || {};
      if (!ad.enabled) return;

      const tiers = Array.isArray(ad.tiers) && ad.tiers.length ? ad.tiers : ['platinum', 'gold'];
      const all = partnersRes.data?.partners || partnersRes.data || [];
      const eligible = (Array.isArray(all) ? all : [])
        .filter(p => p && p.isActive !== false && tiers.includes(p.tier));

      if (!eligible.length) return;

      setConfig({
        rotationMs:  Math.max(5000, Number(ad.rotationMs) || 25000),
        dismissible: ad.dismissible !== false,
        label:       ad.label || 'Featured Partner',
      });
      setPartners(eligible);
    });

    return () => { cancelled = true; };
  }, []);

  /* Reveal after a short delay so it doesn't compete with hero load. */
  useEffect(() => {
    if (!partners.length || dismissed) return;
    const t = setTimeout(() => setVisible(true), REVEAL_DELAY_MS);
    return () => clearTimeout(t);
  }, [partners.length, dismissed]);

  /* Rotation — paused while hovering. */
  useEffect(() => {
    if (!visible || partners.length < 2 || !config) return;
    const id = setInterval(() => {
      if (hoverRef.current) return;
      setIndex(i => (i + 1) % partners.length);
    }, config.rotationMs);
    return () => clearInterval(id);
  }, [visible, partners.length, config]);

  if (!config || !partners.length || dismissed) return null;

  const partner = partners[index];
  const handleDismiss = (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now() + 24 * 60 * 60 * 1000));
    } catch { /* ignore */ }
    setDismissed(true);
  };

  const inner = (
    <>
      <div className="padv-logo" aria-hidden>
        {partner.logo
          ? <img src={partner.logo} alt="" />
          : <span>{(partner.name || '?')[0]}</span>
        }
      </div>
      <div className="padv-body">
        <div className="padv-overline">{config.label}</div>
        <div className="padv-name">{partner.name}</div>
        {partner.industry && <div className="padv-industry">{partner.industry}</div>}
      </div>
      {config.dismissible && (
        <button
          type="button"
          onClick={handleDismiss}
          className="padv-x"
          aria-label="Dismiss partner advert for 24 hours"
        >
          ×
        </button>
      )}
    </>
  );

  const className = `padv${visible ? ' padv-on' : ''}`;
  const onEnter = () => { hoverRef.current = true; };
  const onLeave = () => { hoverRef.current = false; };

  return partner._id
    ? (
      <Link
        to={`/partnership/${partner._id}`}
        className={className}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
      >
        {inner}
      </Link>
    )
    : (
      <div className={className} onMouseEnter={onEnter} onMouseLeave={onLeave}>
        {inner}
      </div>
    );
}
