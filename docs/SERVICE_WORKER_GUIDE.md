## Workbox Alternative: CDN-Based Service Worker (Optional Enhancement)

### Overview
Instead of maintaining a custom `sw.js`, you can use **Google Workbox** served from CDN. Workbox automatically:
- Generates hash-based cache busting for all files
- Precaches assets during install
- Handles cleanup of old caches
- Provides smart routing strategies (NetworkFirst, CacheFirst, etc.)
- No build step required (CDN delivery)

### Why Consider Workbox?

| Feature | Custom sw.js | Workbox CDN |
|---------|--------------|------------|
| Automatic file hashing | ✓ Manual via script | ✓ Automatic |
| Version management | ✓ Timestamp script | ✓ Hash-based |
| Precaching | ✓ Manual array | ✓ Auto-generated manifest |
| Routing strategies | ✓ Manual code | ✓ Built-in helpers |
| CDN delivery | ✗ Self-hosted | ✓ Google CDN |
| Build complexity | ~ Medium | ✓ Minimal |

### Implementation (CDN-Based, No Install)

**1. Update `index.html` (or other entry HTML):**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>RAZDWA Kalkulator</title>
  <!-- ... other tags ... -->
</head>
<body>
  <div id="viewContainer"></div>

  <!-- Load Workbox from Google CDN -->
  <script src="https://storage.googleapis.com/workbox-cdn/releases/7.1.0/workbox-sw.js"></script>
  
  <!-- Configure Workbox routing -->
  <script>
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/workbox-config.js').catch(err => {
        console.warn('SW registration failed:', err);
      });
    }
  </script>

  <!-- Main app script -->
  <script src="/docs/assets/app.js"></script>
</body>
</html>
```

**2. Create `/workbox-config.js`:**

```javascript
/**
 * Workbox Service Worker Configuration
 * Handles precaching, routing, and cache strategies
 */

// Set up cache names
workbox.core.setCacheNameDetails({
  prefix: 'razdwa',
  suffix: 'v1'
});

// Precache strategy: HTML files get NetworkFirst
workbox.routing.registerRoute(
  ({ request }) => request.mode === 'navigate',
  new workbox.strategies.NetworkFirst({
    cacheName: 'html-cache',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxAgeSeconds: 24 * 60 * 60 // 1 day
      })
    ]
  })
);

// Cache static assets (CSS, JS, images) with CacheFirst
workbox.routing.registerRoute(
  ({ request }) =>
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'image',
  new workbox.strategies.CacheFirst({
    cacheName: 'static-assets',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
      }),
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [0, 200]
      })
    ]
  })
);

// Cache fonts with CacheFirst (longest TTL)
workbox.routing.registerRoute(
  ({ request }) => request.destination === 'font',
  new workbox.strategies.CacheFirst({
    cacheName: 'fonts',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 30,
        maxAgeSeconds: 60 * 24 * 60 * 60 // 60 days
      })
    ]
  })
);

// Cleanup old caches on activation
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => !name.startsWith('razdwa-'))
          .map(name => {
            console.log('Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
});

// Claim clients immediately on activation
self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

console.log('Workbox Service Worker loaded');
```

**3. (Optional) Use Workbox CLI for Manifest Generation:**

If you want Workbox to auto-generate a precache manifest based on `docs/` directory:

```bash
npm install -g @workbox/cli
```

Run once (or in prebuild script):
```bash
workbox generateSW --config-path=workbox-config-cli.js
```

**Example `workbox-config-cli.js`:**
```javascript
module.exports = {
  globDirectory: 'docs/',
  globPatterns: [
    '**/*.{js,css,html,png,jpg,jpeg,gif,svg,woff,woff2,ttf,eot}'
  ],
  swDest: 'sw.js',
  clientsClaim: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'external-api',
        expiration: {
          maxAgeSeconds: 24 * 60 * 60
        }
      }
    }
  ]
};
```

### Comparison: Current Approach vs. Workbox

**Current (Custom sw.js + prebuild script):**
- ✓ Full control, minimal dependencies
- ✓ Works offline-first with fallbacks
- ✓ Timestamp-based versioning
- ⚠ Manual file list management
- ⚠ Need to update `PRECACHE_FILES` manually

**Workbox CDN:**
- ✓ Automatic hash-based cache busting
- ✓ Built-in strategies and plugins
- ✓ Auto-generates manifest (optional)
- ✓ Google-maintained, battle-tested
- ⚠ Extra HTTP request for Workbox library (~15KB gzipped)
- ⚠ Dependency on Google CDN

### Recommendation

**Stick with Custom sw.js if:**
- You want minimal external dependencies
- GitHub Pages only (simple setup)
- You prefer explicit control over caching

**Switch to Workbox if:**
- You want zero-maintenance cache busting (hashes)
- You need advanced routing features (regex patterns, custom handlers)
- You're comfortable with CDN delivery
- You want professional-grade PWA setup

---

### Next Steps

1. **Current solution is production-ready** – timestamp-based versioning via prebuild script covers 95% of use cases
2. **Run tests:**
   ```bash
   npm run test
   npm run build
   npm run dev
   ```
3. **Monitor cache behavior:**
   - Open DevTools → Application → Service Workers
   - Check "Update on reload" while developing
   - Unregister SW and clear storage when testing new versions

4. **(Optional) Add Workbox later** if you want automated hash-based cache busting without manual timestamps
