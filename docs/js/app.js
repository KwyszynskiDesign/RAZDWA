// app.js – router i lazy loading kategorii kalkulatora RAZDWA

import priceManager from './price-manager.js';

// Zainicjalizuj price manager na start
await priceManager.init();

/** Mapa id kategorii → ścieżka modułu (lazy import) */
const CATEGORY_MODULES = {
  'cad-upload':              './categories/cad-upload.js',
  'druk-a4-a3':              './categories/druk-a4-a3-skan.js',
  'druk-a4-a3-skan':         './categories/druk-a4-a3-skan.js', // alias backward compatibility
  'druk-cad':                './categories/druk-cad.js',
  'dyplomy':                 './categories/dyplomy.js',
  'plakaty':                 './categories/plakaty.js',
  'banner':                  './categories/banner.js',
  'folia-szroniona':         './categories/folia-szroniona.js',
  'laminowanie':             './categories/laminowanie.js',
  'roll-up':                 './categories/roll-up.js',
  'solwent-plakaty':         './categories/solwent-plakaty.js',
  'ulotki-cyfrowe':          './categories/ulotki-cyfrowe.js',
  'upload-kalkulator':       './categories/upload-kalkulator.js',
  'ustawienia':              './categories/ustawienia.js',
  'vouchery':                './categories/vouchery.js',
  'wizytowki-druk-cyfrowy':  './categories/wizytowki-druk-cyfrowy.js',
  'wlepki-naklejki':         './categories/wlepki-naklejki.js',
  'zaproszenia-kreda':       './categories/zaproszenia-kreda.js',
};

const CATEGORY_INIT_CACHE = new Map();

/**
 * Uruchom inicjalizację dla podanej kategorii (jeśli jest zarejestrowana).
 * @param {string} categoryId
 */
export async function initCategory(categoryId) {
  const modulePath = CATEGORY_MODULES[categoryId];
  if (!modulePath) return;

  try {
    let initFn = CATEGORY_INIT_CACHE.get(categoryId);
    if (!initFn) {
      const mod = await import(modulePath);
      initFn = typeof mod?.init === 'function' ? mod.init : null;
      CATEGORY_INIT_CACHE.set(categoryId, initFn);
    }
    if (initFn) initFn();
  } catch (err) {
    console.error(`Błąd init kategorii ${categoryId}:`, err);
  }
}

/**
 * Uruchom inicjalizację wszystkich kategorii których DOM-elementy
 * są aktualnie obecne na stronie.
 */
export function initAll() {
  // Pozostawione dla kompatybilności - inicjalizacja sekwencyjna lazy
  return Promise.all(Object.keys(CATEGORY_MODULES).map(id => initCategory(id)));
}

// ─── SPA ROUTER ───────────────────────────────────────────────────────────────
/**
 * Załaduj szablon HTML kategorii do #viewContainer i uruchom jej init().
 * @param {string} hash  np. '#/plakaty' lub 'plakaty'
 */
function createCalcMonitor() {
  const box = document.createElement('div');
  box.className = 'calc-monitor';
  box.innerHTML = `
    <div class="calc-monitor-title">Monitorek obliczeń</div>
    <div class="calc-monitor-body">Brak obliczeń</div>
  `;
  return box;
}

function attachMonitor(categoryRoot) {
  const monitor = createCalcMonitor();
  categoryRoot.appendChild(monitor);
  // Note: Monitor updates are handled by the global document listener below
}

// Global monitor update listener (set up once, not per-category)
let monitorSetup = false;
let pendingMonitorUpdate = null;

function setupGlobalMonitorListener() {
  if (monitorSetup) return;
  monitorSetup = true;

  document.addEventListener('calcMonitorUpdate', (event) => {
    const detail = event.detail || {};
    
    // Store for asynchronous rendering - don't block the click handler
    pendingMonitorUpdate = detail;
    
    // Schedule rendering for next frame to avoid blocking calculations
    requestAnimationFrame(() => {
      if (!pendingMonitorUpdate) return;
      
      const monitor = document.querySelector('.calc-monitor');
      if (!monitor) return;
      
      const body = monitor.querySelector('.calc-monitor-body');
      if (!body) return;

      const detail = pendingMonitorUpdate;
      let html = '';

      // Parameters section
      if (detail.params && Object.keys(detail.params).length > 0) {
        html += '<div class="calc-monitor-section"><div class="calc-monitor-section-title">📋 Parametry:</div>';
        for (const [key, value] of Object.entries(detail.params)) {
          if (value !== null && value !== undefined && value !== '') {
            html += `<div class="calc-monitor-param">${key}: <strong>${value}</strong></div>`;
          }
        }
        html += '</div>';
      }

      // Results section
      if (detail.results && detail.results.length > 0) {
        html += '<div class="calc-monitor-section"><div class="calc-monitor-section-title">💰 Wyniki:</div>';
        html += detail.results.map(r => `<div class="calc-monitor-block">${r.replace(/\n+/g, '<br>')}</div>`).join('');
        html += '</div>';
      }

      if (html === '') {
        body.textContent = 'Brak obliczeń';
      } else {
        body.innerHTML = html;
      }
      
      pendingMonitorUpdate = null;
    });
  });
}

// Set up the global listener once
setupGlobalMonitorListener();

let loadRequestSeq = 0;

async function loadCategory(hash) {
  const requestId = ++loadRequestSeq;
  const id = hash.replace(/^#?\//, '');
  const container = document.getElementById('viewContainer');
  if (!container) return;

  const emptyState = document.getElementById('emptyState');
  const loadingSpinner = document.getElementById('loadingSpinner');

  if (!id) {
    if (emptyState) emptyState.style.display = 'block';
    if (loadingSpinner) loadingSpinner.style.display = 'none';
    // Remove previously loaded category content (keep emptyState + loadingSpinner)
    Array.from(container.children).forEach(el => {
      if (el.id !== 'emptyState' && el.id !== 'loadingSpinner') el.remove();
    });
    return;
  }

  if (emptyState) emptyState.style.display = 'none';
  if (loadingSpinner) loadingSpinner.style.display = 'block';
  // Remove previously loaded category content
  Array.from(container.children).forEach(el => {
    if (el.id !== 'emptyState' && el.id !== 'loadingSpinner') el.remove();
  });

  let timeoutId;
  try {
    const controller = new AbortController();
    timeoutId = setTimeout(() => controller.abort(), 12000);
    const resp = await fetch(`categories/${id}.html`, { signal: controller.signal });
    if (requestId !== loadRequestSeq) return;
    if (loadingSpinner) loadingSpinner.style.display = 'none';
    if (resp.ok) {
      const div = document.createElement('div');
      div.innerHTML = await resp.text();
      if (requestId !== loadRequestSeq) return;
      container.appendChild(div);
      attachMonitor(div);
      await initCategory(id);
    } else {
      const err = document.createElement('div');
      err.style.cssText = 'padding:20px;color:#f55;';
      err.textContent = `Brak szablonu: ${id}.html (${resp.status})`;
      container.appendChild(err);
    }
  } catch (err) {
    if (requestId !== loadRequestSeq) return;
    if (loadingSpinner) loadingSpinner.style.display = 'none';
    const errEl = document.createElement('div');
    errEl.style.cssText = 'padding:20px;color:#f55;';
    errEl.textContent = err?.name === 'AbortError'
      ? 'Przekroczono czas ładowania kategorii (12s). Spróbuj ponownie.'
      : `Błąd sieci: ${err.message}`;
    container.appendChild(errEl);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

// Automatyczna inicjalizacja po załadowaniu DOM
document.addEventListener('DOMContentLoaded', () => {
  // Initialize basket/calculator core
  const core = new KalkulatorCore();
  window.kalkulatorCore = core;

  // SPA router: załaduj kategorię z hash przy starcie
  if (window.location.hash) loadCategory(window.location.hash);

  // Live tile search filter
  const searchInput = document.getElementById('categorySearch');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const query = searchInput.value.trim().toLowerCase();
      document.querySelectorAll('.tile-grid .tile').forEach(tile => {
        const label = tile.querySelector('.tile-title')?.textContent?.toLowerCase() ?? '';
        tile.style.display = (!query || label.includes(query)) ? '' : 'none';
      });
    });
  }
});

window.addEventListener('hashchange', () => loadCategory(window.location.hash));

// ─── KALKULATOR CORE ──────────────────────────────────────────────────────────
class KalkulatorCore {
  constructor() {
    this._storageKey = 'razdwa-basket-v1';
    this._items = this._load();
    this._express = false;
    this._render();
    this._bindUI();
    this._listen();
  }

  _load() {
    try {
      return JSON.parse(localStorage.getItem(this._storageKey) || '[]');
    } catch (e) {
      return [];
    }
  }

  _save() {
    try {
      localStorage.setItem(this._storageKey, JSON.stringify(this._items));
    } catch (e) { /* ignore */ }
  }

  _fmt(val) {
    return val.toFixed(2).replace('.', ',') + ' zł';
  }

  _esc(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  addItem(detail) {
    const { id, price, name, cat } = detail;
    if (!id || price == null) return;
    const existing = this._items.findIndex(i => i.id === id);
    const item = { id, price: Number(price), name: name || id, cat: cat || '' };
    if (existing >= 0) {
      this._items[existing] = item;
    } else {
      this._items.push(item);
    }
    this._save();
    this._render();
  }

  removeItem(id) {
    this._items = this._items.filter(i => i.id !== id);
    this._save();
    this._render();
  }

  clear() {
    this._items = [];
    this._save();
    this._render();
  }

  _getTotal() {
    const mult = this._express ? 1.2 : 1;
    return this._items.reduce((s, i) => s + i.price * mult, 0);
  }

  _render() {
    const listEl = document.getElementById('basketList');
    const totalEl = document.getElementById('basketTotal');
    const debugEl = document.getElementById('basketDebug');

    if (listEl) {
      if (this._items.length === 0) {
        listEl.innerHTML = '<div class="basketItem"><div class="basketTitle">Brak pozycji</div><div class="basketMeta">Kliknij „Dodaj", aby zbudować listę.</div></div>';
      } else {
        const mult = this._express ? 1.2 : 1;
        listEl.innerHTML = this._items.map(item => `
          <div class="basketItem">
            <div style="min-width:0;">
              <div class="basketTitle">${this._esc(item.cat ? item.cat + ': ' : '')}${this._esc(item.name)}</div>
              <div class="basketMeta">${this._express ? '⚡ EXPRESS (+20%)' : ''}</div>
            </div>
            <div style="display:flex;gap:10px;align-items:center;">
              <div class="basketPrice">${this._fmt(item.price * mult)}</div>
              <button class="iconBtn" data-remove="${this._esc(item.id)}" title="Usuń">🗑️</button>
            </div>
          </div>`).join('');
        listEl.querySelectorAll('[data-remove]').forEach(btn => {
          btn.addEventListener('click', () => this.removeItem(btn.dataset.remove));
        });
      }
    }

    if (totalEl) totalEl.textContent = this._fmt(this._getTotal());
    if (debugEl) debugEl.textContent = JSON.stringify(this._items, null, 2);
  }

  _bindUI() {
    document.getElementById('clearBtn')?.addEventListener('click', () => this.clear());

    document.getElementById('globalExpress')?.addEventListener('change', (e) => {
      this._express = e.target.checked;
      const orderSummary = document.getElementById('orderSummary');
      if (orderSummary) orderSummary.classList.toggle('is-express', this._express);
      this._render();
    });

    document.getElementById('copyBtn')?.addEventListener('click', () => {
      const lines = this._items.map(i => {
        const mult = this._express ? 1.2 : 1;
        return `${i.cat ? i.cat + ': ' : ''}${i.name} – ${this._fmt(i.price * mult)}`;
      });
      lines.push('Suma: ' + this._fmt(this._getTotal()));
      navigator.clipboard?.writeText(lines.join('\n')).catch(() => {});
    });

    document.getElementById('sendBtn')?.addEventListener('click', () => {
      if (this._items.length === 0) { alert('Lista jest pusta!'); return; }
      const name = document.getElementById('custName')?.value || 'Anonim';
      const phone = document.getElementById('custPhone')?.value || '-';
      const email = document.getElementById('custEmail')?.value || '-';
      const priority = document.getElementById('custPriority')?.value || '-';
      const date = new Date().toISOString().slice(0, 10);
      const mult = this._express ? 1.2 : 1;
      const header = ['Kategoria', 'Nazwa', 'Cena', 'Express', 'Klient', 'Telefon', 'Email', 'Priorytet'].join('\t');
      const rows = this._items.map(i =>
        [i.cat, i.name, this._fmt(i.price * mult), this._express ? 'TAK' : 'NIE', name, phone, email, priority].join('\t')
      );
      const csv = [header, ...rows].join('\n');
      const blob = new Blob([csv], { type: 'text/tab-separated-values;charset=utf-8;' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `Zamowienie_${name.replace(/\s+/g, '_')}_${date}.tsv`;
      a.click();
      URL.revokeObjectURL(a.href);
    });
  }

  _listen() {
    window.addEventListener('priceUpdate', (e) => {
      const d = e.detail || {};
      this.addItem(d);
      const currentPriceEl = document.getElementById('currentPrice');
      const currentHintEl = document.getElementById('currentHint');
      const mult = this._express ? 1.2 : 1;
      if (currentPriceEl) currentPriceEl.textContent = this._fmt((d.price || 0) * mult);
      if (currentHintEl) currentHintEl.textContent = d.name ? `(${d.name})` : '';
    });
    window.addEventListener('priceRemove', (e) => {
      const d = e.detail || {};
      if (d.id) this.removeItem(d.id);
    });
    document.addEventListener('razdwa:addToCart', (e) => {
      const d = e.detail || {};
      const cat = d.category || 'Inne';
      const name = d.name || cat;
      const namePart = name.toLowerCase().replace(/[^\w]+/g, '-');
      const timestamp = Date.now();
      const id = `${namePart.slice(0, 40)}-${timestamp}`;
      this.addItem({ id, price: d.totalPrice || 0, name: name, cat });
    });
  }
}

// ─── GLOBALNE API ─────────────────────────────────────────────────────────────
window.openUstawienia = () => loadCategory('#/ustawienia');
window.clearSearch = () => {
  const searchInput = document.getElementById('categorySearch');
  if (searchInput) {
    searchInput.value = '';
    searchInput.dispatchEvent(new Event('input'));
  }
};
window.scrollToTopTiles = () => {
  const grid = document.querySelector('.category-sticky');
  if (grid) {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    grid.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
  }
};
window.kalkulator = {
  openUstawienia: () => loadCategory('#/ustawienia'),
  refreshAll: initAll,
};
