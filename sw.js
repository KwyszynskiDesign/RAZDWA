const CACHE_NAME = 'razdwa-v1';
const ASSETS = [
  './',
  './index.html',
  './assets/styles.css',
  './assets/app.js',
  './data/categories.json',
  './categories/banner.html',
  './categories/wlepki-naklejki.html',
  './categories/ulotki-cyfrowe-dwustronne.html',
  './categories/ulotki-cyfrowe-jednostronne.html',
  './categories/roll-up.html',
  './categories/wizytowki-druk-cyfrowy.html',
  'https://cdn.sheetjs.com/xlsx-latest/package/dist/xlsx.full.min.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
