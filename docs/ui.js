document.addEventListener('DOMContentLoaded', function () {
  var body = document.body;
  var sidebar = document.getElementById('categorySidebar');
  var sidebarToggle = document.getElementById('sidebarToggle');
  var sidebarBackdrop = document.getElementById('sidebarBackdrop');
  var searchInput = document.getElementById('sidebarCategorySearch');
  var sidebarScroll = document.querySelector('.category-sidebar-scroll');
  var navButtons = Array.from(document.querySelectorAll('.category-nav-button'));
  var groups = Array.from(document.querySelectorAll('.category-group'));

  var normalizeText = function (value) {
    return value.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  };

  var setSidebarState = function (isOpen) {
    body.classList.toggle('sidebar-open', isOpen);
    if (sidebarToggle) {
      sidebarToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    }
  };

  var closeSidebarIfMobile = function () {
    if (window.innerWidth < 768) {
      setSidebarState(false);
    }
  };

  var updateActiveCategory = function () {
    var currentHash = window.location.hash || '';
    navButtons.forEach(function (button) {
      button.classList.toggle('is-active', currentHash === button.getAttribute('href'));
    });
  };

  var filterCategories = function () {
    var query = normalizeText(searchInput ? searchInput.value.trim() : '');

    groups.forEach(function (group) {
      var buttons = Array.from(group.querySelectorAll('.category-nav-button'));
      var visibleCount = 0;

      buttons.forEach(function (button) {
        var matches = !query || normalizeText(button.textContent).includes(query);
        button.style.display = matches ? '' : 'none';
        if (matches) visibleCount += 1;
      });

      group.style.display = visibleCount > 0 ? '' : 'none';

      var divider = group.previousElementSibling;
      if (divider && divider.classList.contains('category-group-divider')) {
        divider.style.display = visibleCount > 0 ? '' : 'none';
      }
    });

    var visibleGroups = groups.filter(function (group) { return group.style.display !== 'none'; });
    visibleGroups.forEach(function (group, index) {
      var divider = group.previousElementSibling;
      if (divider && divider.classList.contains('category-group-divider')) {
        divider.style.display = index === 0 ? 'none' : '';
      }
    });
  };

  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', function () {
      var isOpen = !body.classList.contains('sidebar-open');
      setSidebarState(isOpen);
    });
  }

  if (sidebarBackdrop) {
    sidebarBackdrop.addEventListener('click', function () { setSidebarState(false); });
  }

  navButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      window.requestAnimationFrame(updateActiveCategory);
      closeSidebarIfMobile();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', filterCategories);
    searchInput.addEventListener('focus', function () {
      if (window.innerWidth < 768) {
        setSidebarState(true);
      }
    });
  }

  window.addEventListener('hashchange', updateActiveCategory);
  window.addEventListener('resize', function () {
    if (window.innerWidth >= 768) {
      setSidebarState(false);
    }
  });

  window.scrollToTopTiles = function () {
    if (window.innerWidth < 768) {
      setSidebarState(true);
    }
    if (sidebarScroll) {
      sidebarScroll.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (sidebar) {
      sidebar.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (searchInput) {
      searchInput.focus();
    }
  };

  var openCategoriesBtn = document.getElementById('btn-open-categories');
  if (openCategoriesBtn) {
    openCategoriesBtn.addEventListener('click', function () {
      if (typeof window.scrollToTopTiles === 'function') window.scrollToTopTiles();
    });
  }

  filterCategories();
  updateActiveCategory();
});

(function () {
  var VIEW_ID = 'viewContainer';

  var parsePLN = function (text) {
    var normalized = String(text || '')
      .replace(/\s+/g, '')
      .replace('zł', '')
      .replace(',', '.');
    var num = Number.parseFloat(normalized);
    return Number.isFinite(num) ? num : 0;
  };

  var formatPLN = function (value) {
    return String(Number(value || 0).toFixed(2)).replace('.', ',') + ' zł';
  };

  var isVisible = function (el) {
    if (!el) return false;
    var style = window.getComputedStyle(el);
    return style.display !== 'none' && style.visibility !== 'hidden';
  };

  var collectSummaryLines = function (panel) {
    var rows = panel.querySelectorAll('.result-row, .price-line, .lam-result-line, .summary-item, .special-row, .calc-line');
    var lines = [];

    rows.forEach(function (row) {
      if (!isVisible(row)) return;
      var texts = Array.from(row.querySelectorAll('span, strong, b'))
        .map(function (node) { return String(node.textContent || '').trim(); })
        .filter(Boolean);

      if (texts.length >= 2) {
        var label = texts[0].replace(/:$/, '');
        var value = texts[texts.length - 1];
        lines.push({ label: label, value: value });
        return;
      }

      var raw = String(row.textContent || '').replace(/\s+/g, ' ').trim();
      if (!raw) return;
      var split = raw.split(':');
      if (split.length >= 2) {
        lines.push({ label: split[0].trim(), value: split.slice(1).join(':').trim() });
      }
    });

    return lines;
  };

  var ensureAutoBreakdown = function (panel) {
    if (!(panel instanceof HTMLElement)) return;

    var parent = panel.parentElement;
    if (!parent) return;

    var hasNativeBreakdown = !!parent.querySelector('[id*="breakdown" i], [class*="breakdown" i]');
    if (hasNativeBreakdown) {
      var existingAuto = parent.querySelector('.auto-breakdown-card');
      if (existingAuto instanceof HTMLElement) existingAuto.remove();
      return;
    }

    var card = panel.nextElementSibling;
    if (!(card instanceof HTMLElement) || !card.classList.contains('auto-breakdown-card')) {
      card = document.createElement('div');
      card.className = 'result-display card auto-breakdown-card';
      card.style.marginTop = '16px';
      var h4 = document.createElement('h4');
      h4.style.cssText = 'margin:0 0 10px 0; font-size:15px;';
      h4.textContent = 'Szczegółowe rozbicie kalkulacji';
      var linesDiv = document.createElement('div');
      linesDiv.className = 'auto-breakdown-lines';
      card.appendChild(h4);
      card.appendChild(linesDiv);
      panel.insertAdjacentElement('afterend', card);
    }

    var linesHost = card.querySelector('.auto-breakdown-lines');
    if (!linesHost) return;

    var lines = collectSummaryLines(panel);
    if (!lines.length || !isVisible(panel)) {
      card.style.display = 'none';
      linesHost.textContent = '';
      return;
    }

    linesHost.textContent = '';
    lines.forEach(function (line) {
      var row = document.createElement('div');
      row.className = 'result-row';
      var labelSpan = document.createElement('span');
      labelSpan.textContent = line.label + ':';
      var valueSpan = document.createElement('span');
      valueSpan.className = 'price-unit';
      valueSpan.textContent = line.value;
      row.appendChild(labelSpan);
      row.appendChild(valueSpan);
      linesHost.appendChild(row);
    });

    var totalLine = lines.find(function (line) { return /suma|razem|total/i.test(line.label); });
    if (totalLine) {
      var totalRow = document.createElement('div');
      totalRow.className = 'result-row total';
      var totalLabel = document.createElement('span');
      totalLabel.textContent = 'Razem:';
      var totalValue = document.createElement('span');
      totalValue.className = 'price-value';
      totalValue.textContent = formatPLN(parsePLN(totalLine.value));
      totalRow.appendChild(totalLabel);
      totalRow.appendChild(totalValue);
      linesHost.appendChild(totalRow);
    }

    card.style.display = 'block';
  };

  var enhanceCurrentView = function () {
    var root = document.getElementById(VIEW_ID);
    if (!root) return;

    var resultPanels = root.querySelectorAll(
      '.result-display, [id$="result-display" i], [id$="Result"], .lam-result-box, .special-result, .cad-result-box'
    );

    resultPanels.forEach(function (panel) {
      ensureAutoBreakdown(panel);
      if (panel instanceof HTMLElement && !panel.dataset.autoBreakdownObserved) {
        var observer = new MutationObserver(function () { ensureAutoBreakdown(panel); });
        observer.observe(panel, { childList: true, subtree: true, characterData: true, attributes: true });
        panel.dataset.autoBreakdownObserved = 'true';
      }
    });
  };

  var start = function () {
    var root = document.getElementById(VIEW_ID);
    if (!root) return;

    var routeObserver = new MutationObserver(function () {
      routeObserver.disconnect();
      enhanceCurrentView();
      routeObserver.observe(root, { childList: true, subtree: true });
    });
    routeObserver.observe(root, { childList: true, subtree: true });

    enhanceCurrentView();
    document.addEventListener('razdwa:addToCart', function () { setTimeout(enhanceCurrentView, 0); });
    window.addEventListener('hashchange', function () { setTimeout(enhanceCurrentView, 30); });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
