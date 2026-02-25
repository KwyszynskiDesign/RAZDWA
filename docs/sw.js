const CACHE_VERSION = 'razdwa-v5';

self.addEventListener('install', (e) => {
  self.skipWaiting(); // Force new SW to activate immediately
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_VERSION)
          .map(name => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Only handle http/https requests
  if (!request.url.startsWith('http')) {
    return;
  }

  const url = new URL(request.url);

  // NEVER cache HTML - always fetch fresh
  if (url.pathname.endsWith('.html') || url.pathname === '/' || url.pathname.endsWith('/RAZDWA/')) {
    return event.respondWith(fetch(request));
  }

  // Cache other assets normally
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(response => {
        const clone = response.clone();
        caches.open(CACHE_VERSION).then(cache => {
          const u = new URL(request.url);
          if (u.protocol !== 'http:' && u.protocol !== 'https:') return;
          cache.put(request, clone);
        });
        return response;
      });
    })
  );
});
