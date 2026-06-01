(function () {
  var APP_VERSION = '202606011641';
  var STORAGE_KEY = 'appVersion';
  var stored = localStorage.getItem(STORAGE_KEY);

  if (stored === APP_VERSION) return;

  localStorage.setItem(STORAGE_KEY, APP_VERSION);

  if (stored === null) return;

  var cleared = false;

  function reload() {
    if (cleared) window.location.reload(true);
  }

  function clearAndReload() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(function (regs) {
        return Promise.all(regs.map(function (r) { return r.unregister(); }));
      }).then(function () {
        if ('caches' in window) {
          return caches.keys().then(function (names) {
            return Promise.all(names.map(function (n) { return caches.delete(n); }));
          });
        }
      }).then(function () {
        cleared = true;
        reload();
      });
    } else if ('caches' in window) {
      caches.keys().then(function (names) {
        return Promise.all(names.map(function (n) { return caches.delete(n); }));
      }).then(function () {
        cleared = true;
        reload();
      });
    } else {
      cleared = true;
      reload();
    }
  }

  clearAndReload();
})();
