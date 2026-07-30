import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
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
