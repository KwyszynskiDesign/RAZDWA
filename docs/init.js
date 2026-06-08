(function () {
  var metaVer = document.querySelector('meta[name="app-version"]');
  window.APP_VERSION = metaVer ? metaVer.getAttribute('content') : '';

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function (regs) {
      regs.forEach(function (reg) {
        var scriptURL = (reg.active && reg.active.scriptURL) || (reg.installing && reg.installing.scriptURL) || '';
        if (!scriptURL.includes('sw.js')) reg.unregister();
      });
    });

    window.addEventListener('load', function () {
      navigator.serviceWorker.register('./sw.js');

      navigator.serviceWorker.addEventListener('controllerchange', function () {
        var ver = window.APP_VERSION || 'unknown';
        if (sessionStorage.getItem('sw_reloaded') !== ver) {
          sessionStorage.setItem('sw_reloaded', ver);
          window.location.reload();
        }
      });
    });
  }

  function initMobileTabs() {
    var tabs = document.querySelectorAll('.mobile-tab');
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        tabs.forEach(function (t) { t.classList.remove('active'); });
        tab.classList.add('active');
        document.querySelectorAll('.app-grid .left-col, .app-grid .right-col')
          .forEach(function (col) { col.classList.remove('tab-active'); });
        var target = document.querySelector('.app-grid .' + tab.dataset.target);
        if (target) target.classList.add('tab-active');
      });
    });
    var leftCol = document.querySelector('.app-grid .left-col');
    if (leftCol) leftCol.classList.add('tab-active');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileTabs);
  } else {
    initMobileTabs();
  }
})();
