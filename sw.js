var CACHE_VERSION = 'razdwa-v202605120712';

self.addEventListener('install', function (event) {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames
          .filter(function (name) { return name !== CACHE_VERSION; })
          .map(function (name) { return caches.delete(name); })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function (event) {
  var request = event.request;
  if (!request || request.method !== 'GET' || !request.url || request.url.indexOf('http') !== 0) {
    return;
  }

  var url;
  try {
    url = new URL(request.url);
  } catch (error) {
    return;
  }

  if (url.pathname.endsWith('.html') || url.pathname === '/' || url.pathname.endsWith('/RAZDWA/')) {
    event.respondWith(fetch(request));
    return;
  }

  if (url.pathname.endsWith('.js') || url.pathname.endsWith('.css')) {
    event.respondWith(
      fetch(request).then(function (response) {
        var clone = response.clone();
        caches.open(CACHE_VERSION).then(function (cache) {
          cache.put(request, clone).catch(function () {});
        });
        return response;
      }).catch(function () {
        return caches.match(request);
      })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(function (cached) {
      if (cached) return cached;
      return fetch(request).then(function (response) {
        var clone = response.clone();
        caches.open(CACHE_VERSION).then(function (cache) {
          cache.put(request, clone).catch(function () {});
        });
        return response;
      });
    })
  );
});
