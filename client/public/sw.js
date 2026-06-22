/* lifeline service worker — minimal, deploy-safe.
   - api calls: never cached (always network)
   - navigations: network-first, fall back to the cached shell when offline
   - hashed assets: cache-first (content-hashed, so safe forever) */
const VERSION = 'lifeline-v1';
const BASE = new URL('./', self.location).pathname; // e.g. "/ll/" or "/"
const SHELL = BASE + 'index.html';

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(VERSION).then((cache) => cache.addAll([BASE, SHELL]).catch(() => {}))
  );
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
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.includes('/api/')) return; // live data only

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
