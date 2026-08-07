/**
 * Wires the analytics module to the router.
 *
 * A single-page app navigates without a page load, so nothing tells an
 * analytics provider that the visitor moved. Without this, the entire site
 * reports as one pageview per session — on whichever URL the visitor happened
 * to open first.
 */
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { initAnalytics, pageview } from '../utils/analytics';

export default function useAnalytics() {
  const { pathname, search } = useLocation();
  const started = useRef(false);

  useEffect(() => {
    const path = pathname + search;

    if (!started.current) {
      started.current = true;
      initAnalytics(pathname);
    }

    // Fires on first render too. Under StrictMode in development this effect
    // runs twice, which would double-count locally; harmless, and StrictMode
    // does not apply to the production build.
    pageview(path);
  }, [pathname, search]);
}
