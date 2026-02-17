const CACHE_VERSION = 'razdwa-v4';

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
  const url = new URL(event.request.url);

  // NEVER cache HTML - always fetch fresh
  if (url.pathname.endsWith('.html') || url.pathname === '/' || url.pathname.endsWith('/RAZDWA/')) {
    return event.respondWith(fetch(event.request));
  }

  // Cache other assets normally
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).then(networkResponse => {
        // Only cache successful responses
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_VERSION).then(cache => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      });
    })
  );
});
