import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// When the app is hosted under a sub-path (e.g. rahulc.xyz/ll) set BASE_PATH=/ll
// at build time. Everything — asset URLs, the router basename, API calls and the
// session cookie — is derived from this single value. Empty ⇒ served at root.
const slug = (process.env.BASE_PATH ?? '').replace(/^\/+|\/+$/g, '');
const base = slug ? `/${slug}/` : '/';

// Dev: proxy /api to the Fastify server so the browser sees one origin
// (cookies work, no CORS). Prod: Fastify serves the built dist directly.
export default defineConfig({
  base,
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
  },
});
