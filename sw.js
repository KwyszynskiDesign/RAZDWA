/**
 * RAZDWA Service Worker v2
 * Features:
 * - Automatic CACHE_VERSION injection via prebuild script
 * - Install: skip precaching (avoid fetch errors), use on-demand caching
 * - Activate: cleanup of old caches, immediate control claim
 * - Fetch: NetworkFirst (HTML), CacheFirst (static)
 */

var CACHE_VERSION = 'razdwa-v202606021745'; // Injected by prebuild script

/**
 * Install Event: Skip precaching - use on-demand caching instead
 */
self.addEventListener('install', function (event) {
  event.waitUntil(
    Promise.resolve()
      .then(function () {
        return self.skipWaiting(); // Activate immediately
      })
  );
});

/**
 * Activate Event: Cleanup old caches and claim clients immediately
 */
self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches
      .keys()
      .then(function (cacheNames) {
        return Promise.all(
          cacheNames
            .filter(function (name) {
              return name !== CACHE_VERSION;
            })
            .map(function (name) {
              console.log('Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(function () {
        return self.clients.claim();
      })
  );
});

/**
 * Fetch Event: Different strategies by resource type
 * - HTML: NetworkFirst (freshness > offline)
 * - Static (CSS, JS, images): CacheFirst (performance)
 */
self.addEventListener('fetch', function (event) {
  var request = event.request;

  if (
    !request ||
    request.method !== 'GET' ||
    !request.url ||
    request.url.indexOf('http') !== 0
  ) {
    return;
  }

  var url;
  try {
    url = new URL(request.url);
  } catch (error) {
    return;
  }

  if (request.url.indexOf('script.google.com') !== -1 || request.url.indexOf('getPrices') !== -1) {
    event.respondWith(fetch(event.request));
    return;
  }

  if (
    url.pathname.endsWith('.html') ||
    url.pathname === '/' ||
    url.pathname.endsWith('/RAZDWA/') ||
    url.pathname.endsWith('/app.js')
  ) {
    event.respondWith(
      fetch(request)
        .then(function (response) {
          if (response && response.status === 200) {
            var clone = response.clone();
            caches.open(CACHE_VERSION).then(function (cache) {
              cache.put(request, clone).catch(function () {});
            });
          }
          return response;
        })
        .catch(function () {
          return caches.match(request).catch(function () {
            return new Response('Offline - no cached version available', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
        })
    );
    return;
  }

  if (
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.jpeg') ||
    url.pathname.endsWith('.gif') ||
    url.pathname.endsWith('.webp') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.woff') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.ttf') ||
    url.pathname.endsWith('.eot')
  ) {
    event.respondWith(
      caches
        .match(request)
        .then(function (cached) {
          if (cached) {
            return cached;
          }
          return fetch(request)
            .then(function (response) {
              if (response && response.status === 200) {
                var clone = response.clone();
                caches.open(CACHE_VERSION).then(function (cache) {
                  cache.put(request, clone).catch(function () {});
                });
              }
              return response;
            })
            .catch(function () {
              return caches.match(request);
            });
        })
    );
    return;
  }

  event.respondWith(
    fetch(request)
      .then(function (response) {
        if (response && response.status === 200) {
          var clone = response.clone();
          caches.open(CACHE_VERSION).then(function (cache) {
            cache.put(request, clone).catch(function () {});
          });
        }
        return response;
      })
      .catch(function () {
        return caches.match(request);
      })
  );
});