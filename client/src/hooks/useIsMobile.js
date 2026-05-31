import { useState, useEffect } from 'react';

/**
 * Returns true when the viewport is at or below `maxWidth` (default 768px).
 * Updates live on resize / orientation change.
 */
export default function useIsMobile(maxWidth = 768) {
  const query = `(max-width: ${maxWidth}px)`;
  const read = () =>
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia(query).matches
      : false;

  const [isMobile, setIsMobile] = useState(read);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e) => setIsMobile(e.matches);
    setIsMobile(mql.matches);
    if (mql.addEventListener) mql.addEventListener('change', handler);
    else mql.addListener(handler);
    return () => {
      if (mql.removeEventListener) mql.removeEventListener('change', handler);
      else mql.removeListener(handler);
    };
  }, [query]);

  return isMobile;
}
