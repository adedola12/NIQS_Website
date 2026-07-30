/**
 * Prefetch a route's chunk when the user shows intent to visit it.
 *
 * Uses one delegated listener on the document rather than handlers on each link.
 * The navbar alone has 57 hand-written <Link> elements across its dropdowns, and
 * this way footer links, in-page CTAs and anything added later are covered for
 * free — no component needs to know prefetching exists.
 *
 * Hovering a link starts its import(); by the time the click lands the chunk is
 * usually parsed, so navigation renders with no Suspense fallback at all.
 */
import { useEffect } from 'react';
import { loaderFor } from '../routes/pages';

/** Wait this long before treating a hover as intent, so a cursor sweeping across
 *  a mega-dropdown does not fire twenty imports on its way past. */
const INTENT_DELAY_MS = 80;

/** Don't spend someone's data plan guessing. */
function shouldPrefetch() {
  const c = navigator.connection;
  if (!c) return true;
  if (c.saveData) return false;
  return !/(^|-)2g$/.test(c.effectiveType || '');
}

export default function useRoutePrefetch() {
  useEffect(() => {
    if (!shouldPrefetch()) return;

    const done = new Set();
    let timer;

    const resolve = (target) => {
      const link = target instanceof Element ? target.closest('a[href]') : null;
      if (!link) return null;

      // Same-origin internal links only — skip mailto:, tel:, downloads and
      // anything pointing off-site.
      const href = link.getAttribute('href');
      if (!href || !href.startsWith('/')) return null;
      if (link.hasAttribute('download') || link.target === '_blank') return null;

      const path = href.replace(/[?#].*$/, '');
      if (done.has(path)) return null;
      return { path, loader: loaderFor(path) };
    };

    const onIntent = (e) => {
      const hit = resolve(e.target);
      if (!hit?.loader) return;
      clearTimeout(timer);
      timer = setTimeout(() => {
        done.add(hit.path);
        // A rejected import just means the chunk will be fetched again on click.
        hit.loader().catch(() => done.delete(hit.path));
      }, INTENT_DELAY_MS);
    };

    const onLeave = () => clearTimeout(timer);

    document.addEventListener("mouseover", onIntent, { passive: true });
    document.addEventListener("mouseout", onLeave, { passive: true });
    // Keyboard users get the same benefit; touch has no hover, so a tap's
    // touchstart is the earliest signal available.
    document.addEventListener("focusin", onIntent, { passive: true });
    document.addEventListener("touchstart", onIntent, { passive: true });

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mouseover", onIntent);
      document.removeEventListener("mouseout", onLeave);
      document.removeEventListener("focusin", onIntent);
      document.removeEventListener("touchstart", onIntent);
    };
  }, []);
}
