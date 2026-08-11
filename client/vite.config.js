import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const HERE = dirname(fileURLToPath(import.meta.url));

/* Launch: midday WAT, Friday 14 August 2026. Must match LAUNCH_AT in
   src/components/common/LaunchGate.jsx — the cover and the link preview should
   never disagree about whether the site is live.

   The explicit +01:00 matters as much here as it does there, for a different
   reason: this one is evaluated on whatever machine runs the build. A release
   cut from a CI runner on UTC, or by anyone working outside Nigeria, would
   otherwise flip the preview at their local noon rather than Lagos's. */
const LAUNCH_AT = new Date('2026-08-14T12:00:00+01:00');

/**
 * Puts the launch date into the link preview until the site is live, then takes
 * it out again by itself.
 *
 * The ask was for the preview to "show the countdown". It cannot, and it is
 * worth being plain about why rather than shipping something that looks broken:
 * WhatsApp, LinkedIn and X fetch these tags once and cache the result for days.
 * A preview built around "3 days to go" would still say three days on the day
 * itself, and would still say it a week after launch. So the card states the
 * **date**, which is true whenever it is read, and which is what a reader
 * actually needs in order to turn up.
 *
 * The expiry is the point of doing this in the build rather than by hand. The
 * live site has already spent six weeks serving a stale build and this document
 * set has already shipped a cover page dated two months late — "remember to
 * change it back on Friday" is not a plan. After midday on the 14th this rewrite
 * simply stops happening.
 */
function launchPreview() {
  return {
    name: 'niqs-launch-preview',
    transformIndexHtml(html) {
      if (Date.now() >= LAUNCH_AT.getTime()) return html;

      const when = LAUNCH_AT.toLocaleDateString('en-NG', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      });
      const title = `Our new website goes live ${when} — NIQS`;
      const description =
        'The Nigerian Institute of Quantity Surveyors is putting the finishing '
        + `touches to its new home online. Launching ${when}.`;

      let out = html
        .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${title}$2`)
        .replace(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${title}$2`)
        .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${description}$2`)
        .replace(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${description}$2`);

      /* Drop a purpose-made launch card in at public/og-launch.jpg (1200x630) and
         it is used automatically; until it exists the standard card is kept,
         because a missing og:image is worse than a generic one — some clients
         fall back to whatever image they can scrape off the page. */
      if (existsSync(resolve(HERE, 'public/og-launch.jpg'))) {
        out = out.replace(/(og-image\.jpg)/g, 'og-launch.jpg');
      }
      return out;
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), launchPreview()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        /**
         * Pin the framework into its own chunk so it keeps a stable hash across
         * deploys. Application code changes on nearly every deploy; React and the
         * router almost never do. Left in the entry chunk they would be
         * re-downloaded every release for no reason.
         *
         * Everything else is left to Rollup, which derives shared chunks from the
         * actual import graph — better than anything hand-maintained here.
         */
        manualChunks(id) {
          if (!id.includes('node_modules')) return;

          // Matched on the package-directory boundary. A bare `includes('react')`
          // would also swallow react-dom, react-router, react-icons and
          // react-hot-toast, which belong in their own chunks.
          if (/[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) {
            return 'vendor-react';
          }
          if (/[\\/]node_modules[\\/]react-router(-dom)?[\\/]/.test(id)) {
            return 'vendor-router';
          }
        },
      },
    },
    // The default 500 kB warning fires on the admin FlyerStudio chunk, which is
    // legitimately large (jspdf + html2canvas + jszip) and loads only for
    // authenticated admins. Raised so a real regression in the entry chunk is
    // not lost behind an expected warning.
    chunkSizeWarningLimit: 800,
  },
});
