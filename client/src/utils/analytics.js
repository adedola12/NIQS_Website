/**
 * Web analytics — one module, two providers, nothing loaded without permission.
 *
 * The site had no measurement of any kind until now, so this is the first thing
 * on it that talks to a third party about a visitor. It is built so that fact
 * stays under control:
 *
 *   - Nothing is requested from Google until the visitor accepts. Not the
 *     gtag.js script, not a cookieless ping. Google's own Consent Mode v2
 *     guidance permits loading the tag first and withholding storage; that
 *     still contacts Google before consent, which is a harder position to
 *     defend under the NDPR than simply not loading it. So: no consent, no
 *     request. Consent Mode is still used, because a visitor who accepts and
 *     later withdraws must actually stop being measured.
 *
 *   - Plausible is wired but idle. It is cookieless and stores no personal
 *     data, so it needs no banner — flip VITE_ANALYTICS_PROVIDER to
 *     'plausible' and the cookie notice disappears along with the cookies.
 *     That is the intended destination; GA4 is here because it is free and the
 *     Institute needs numbers now.
 *
 *   - Staff traffic is never counted. See shouldTrack().
 *
 * Configuration lives in client/.env.production. With none of it set this
 * module is inert and the site behaves exactly as it did before — which is what
 * happens in local development unless a .env.local says otherwise.
 */

const ENV = import.meta.env;

const CONFIGURED_PROVIDER = (ENV.VITE_ANALYTICS_PROVIDER || '').toLowerCase();
const GA4_ID = ENV.VITE_GA4_ID || '';
const PLAUSIBLE_DOMAIN = ENV.VITE_PLAUSIBLE_DOMAIN || '';
const PLAUSIBLE_SRC = ENV.VITE_PLAUSIBLE_SRC || 'https://plausible.io/js/script.js';

/** Where the consent decision is remembered, and for how long. */
const CONSENT_KEY = 'niqs.consent.analytics';
/**
 * The NDPR treats consent as time-limited rather than perpetual. A year is the
 * common reading, and re-asking annually is not burdensome. An older record is
 * treated as absent, so the notice returns.
 */
const CONSENT_MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000;

/**
 * Paths that are never measured.
 *
 * Two different reasons, both worth keeping:
 *   /admin, /portal — the secretariat works in here daily. Counting them would
 *     make the traffic figures describe the staff rather than the public, and
 *     it is the public the Institute is trying to reach.
 *   the token routes — the URL *is* the credential. Sending it to an analytics
 *     provider as a page path hands them a working link to someone's flyer
 *     request or event attendance record.
 */
const NEVER_TRACK = ['/admin', '/portal', '/login', '/forgot-password', '/reset-password', '/flyer-request/', '/events/attend/'];

/* ────────────────────────────── provider ────────────────────────────── */

/**
 * The provider actually in force. An explicit VITE_ANALYTICS_PROVIDER wins; with
 * nothing set, whichever one has credentials is used, so a half-finished
 * configuration is inert rather than silently wrong.
 */
export function provider() {
  if (CONFIGURED_PROVIDER === 'ga4') return GA4_ID ? 'ga4' : null;
  if (CONFIGURED_PROVIDER === 'plausible') return PLAUSIBLE_DOMAIN ? 'plausible' : null;
  if (CONFIGURED_PROVIDER === 'none') return null;
  if (GA4_ID) return 'ga4';
  if (PLAUSIBLE_DOMAIN) return 'plausible';
  return null;
}

/** True when the active provider sets cookies, i.e. when a banner is required. */
export function requiresConsent() {
  return provider() === 'ga4';
}

/* ────────────────────────────── consent ─────────────────────────────── */

/** 'granted' | 'denied' | null (never asked, or the answer has expired). */
export function consentState() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const { value, at } = JSON.parse(raw);
    if (value !== 'granted' && value !== 'denied') return null;
    if (!at || Date.now() - at > CONSENT_MAX_AGE_MS) return null;
    return value;
  } catch {
    // Private browsing, or a record written by an older version. Treat as unasked.
    return null;
  }
}

/**
 * Record the visitor's answer and act on it immediately.
 *
 * Storing the timestamp is not decoration: the NDPR expects a controller to be
 * able to demonstrate *when* consent was obtained, and this is the only record
 * of it that exists — nothing about the decision is sent to a server.
 */
export function setConsent(granted) {
  const value = granted ? 'granted' : 'denied';
  try {
    window.localStorage.setItem(CONSENT_KEY, JSON.stringify({ value, at: Date.now() }));
  } catch {
    /* Private mode — the choice holds for this page load only, and we will ask again. */
  }

  if (provider() !== 'ga4') return;

  if (granted) {
    loadGa4();
    window.gtag?.('consent', 'update', { analytics_storage: 'granted' });
    // The pageview that was suppressed while the banner was up.
    pageview(window.location.pathname + window.location.search);
  } else {
    // Nothing was loaded, so there is nothing to unload — but if consent is
    // being withdrawn within the same page load, tell the tag to stop.
    window.gtag?.('consent', 'update', { analytics_storage: 'denied' });
  }
}

/** Wipes the stored decision so the notice is shown again. Used by the policy page. */
export function resetConsent() {
  try { window.localStorage.removeItem(CONSENT_KEY); } catch { /* private mode */ }
}

/* ─────────────────────────────── loading ────────────────────────────── */

let ga4Loaded = false;
let plausibleLoaded = false;

function loadGa4() {
  if (ga4Loaded || !GA4_ID) return;
  ga4Loaded = true;

  window.dataLayer = window.dataLayer || [];
  // Must be a real function, not an arrow: gtag forwards `arguments` verbatim
  // and Google's tag reads them positionally.
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;

  gtag('js', new Date());
  // Denied first, granted a moment later by the caller. Ordering matters — a
  // default set after the config call does not apply retroactively.
  gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  });
  gtag('config', GA4_ID, {
    // Pageviews are sent by hand on route change. GA4's automatic one fires at
    // config time and then never again in a single-page app, so leaving it on
    // would report every visit as a one-page visit to whatever URL was opened.
    send_page_view: false,
  });

  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA4_ID)}`;
  document.head.appendChild(s);
}

function loadPlausible() {
  if (plausibleLoaded || !PLAUSIBLE_DOMAIN) return;
  plausibleLoaded = true;

  const s = document.createElement('script');
  s.defer = true;
  s.setAttribute('data-domain', PLAUSIBLE_DOMAIN);
  s.src = PLAUSIBLE_SRC;
  document.head.appendChild(s);
  // No pageview call here, and none in pageview() below: Plausible's default
  // script hooks the History API itself and counts client-side navigations
  // without help. Sending our own as well would double every number.
}

/* ────────────────────────────── tracking ────────────────────────────── */

/** False for staff areas and credential-bearing URLs — see NEVER_TRACK. */
export function shouldTrack(pathname) {
  if (!provider()) return false;
  if (NEVER_TRACK.some((p) => pathname === p || pathname.startsWith(p.endsWith('/') ? p : `${p}/`))) return false;
  return true;
}

/**
 * Start whichever provider is configured, if it is allowed to start.
 * Safe to call more than once; both loaders are idempotent.
 */
export function initAnalytics(pathname = '/') {
  const p = provider();
  if (!p || !shouldTrack(pathname)) return;

  if (p === 'plausible') { loadPlausible(); return; }
  if (p === 'ga4' && consentState() === 'granted') { loadGa4(); window.gtag?.('consent', 'update', { analytics_storage: 'granted' }); }
}

/** Record one pageview. A no-op unless a provider is live and permitted. */
export function pageview(path) {
  const p = provider();
  if (!p) return;

  const pathname = path.replace(/[?#].*$/, '');
  if (!shouldTrack(pathname)) return;

  if (p === 'ga4') {
    if (consentState() !== 'granted' || !window.gtag) return;
    window.gtag('event', 'page_view', {
      page_path: path,
      page_location: window.location.origin + path,
      page_title: document.title,
    });
  }
  // Plausible counts navigations on its own — see loadPlausible().
}

/**
 * Record a named event. Nothing calls this yet; it exists so that when someone
 * wants to know how many people start the membership form, the answer is one
 * line in that component rather than a second analytics integration.
 */
export function trackEvent(name, props = {}) {
  const p = provider();
  if (!p || !shouldTrack(window.location.pathname)) return;

  if (p === 'ga4') {
    if (consentState() !== 'granted') return;
    window.gtag?.('event', name, props);
  } else if (p === 'plausible') {
    window.plausible?.(name, { props });
  }
}
