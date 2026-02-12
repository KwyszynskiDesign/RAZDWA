const CACHE_VERSION = 'razdwa-v2';

self.addEventListener('install', (e) => {
  self.skipWaiting(); // Force new SW to activate immediately
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_VERSION)
           .map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  // Never cache HTML
  if (e.request.url.endsWith('.html') || e.request.url === self.location.origin + '/') {
    return e.respondWith(fetch(e.request));
  }

  // Cache everything else
  e.respondWith(
    caches.match(e.request).then(cached => {
      return cached || fetch(e.request).then(response => {
        return caches.open(CACHE_VERSION).then(cache => {
          cache.put(e.request, response.clone());
          return response;
        });
      });
    })
  );
});
