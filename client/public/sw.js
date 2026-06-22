/* lifeline service worker — installable + offline-capable.
   - GET /api: network-first, cache the 200, serve cache when offline (so the
     board + tasks render with last-synced data). owner board falls back to the
     cached public board when offline.
   - writes (POST/PUT/DELETE): network-only (correctly fail offline).
   - navigations: network-first, fall back to the cached shell offline.
   - hashed assets: cache-first (content-hashed, safe forever). */
const VERSION = 'lifeline-v2';
const BASE = new URL('./', self.location).pathname; // e.g. "/ll/" or "/"
const SHELL = BASE + 'index.html';
const PUBLIC_BOARD = BASE + 'api/public/board';

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(VERSION).then((cache) => cache.addAll([BASE, SHELL]).catch(() => {})));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return; // writes are network-only

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // --- API reads: network-first, cache 200, fall back to cache offline ---
  if (url.pathname.includes('/api/')) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(VERSION);
        try {
          const fresh = await fetch(req);
          if (fresh && fresh.status === 200) cache.put(req, fresh.clone());
          return fresh;
        } catch {
          const cached = await cache.match(req);
          if (cached) return cached;
          // offline + owner board never cached → show the public board instead
          if (url.pathname.endsWith('/api/board')) {
            const pub = await cache.match(url.origin + PUBLIC_BOARD);
            if (pub) return pub;
          }
          return Response.error();
        }
      })()
    );
    return;
  }

  // --- navigations: network-first → cached shell offline ---
  if (req.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(req);
          const cache = await caches.open(VERSION);
          cache.put(SHELL, fresh.clone());
          return fresh;
        } catch {
          const cache = await caches.open(VERSION);
          return (await cache.match(SHELL)) || (await cache.match(BASE)) || Response.error();
        }
      })()
    );
    return;
  }

  // --- hashed static assets: cache-first ---
  event.respondWith(
    (async () => {
      const cache = await caches.open(VERSION);
      const cached = await cache.match(req);
      if (cached) return cached;
      try {
        const fresh = await fetch(req);
        if (fresh && fresh.status === 200 && fresh.type === 'basic') cache.put(req, fresh.clone());
        return fresh;
      } catch {
        return cached || Response.error();
      }
    })()
  );
});
