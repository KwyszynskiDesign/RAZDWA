// app.js – inicjalizacja wszystkich 17 kategorii kalkulatora RAZDWA
// Importuje każdą kategorię i uruchamia jej init() po załadowaniu DOM.

import { init as initCadUpload }        from './categories/cad-upload.js';
import { init as initDrukA4A3Skan }     from './categories/druk-a4-a3-skan.js';
import { init as initDrukCad }          from './categories/druk-cad.js';
import { init as initDyplomy }          from './categories/dyplomy.js';
import { init as initPlakaty }          from './categories/plakaty.js';
import { init as initBanner }           from './categories/banner.js';
import { init as initFoliaSzroniona }   from './categories/folia-szroniona.js';
import { init as initLaminowanie }      from './categories/laminowanie.js';
import { init as initRollUp }           from './categories/roll-up.js';
import { init as initSolwentPlakaty }   from './categories/solwent-plakaty.js';
import { init as initUlotki }           from './categories/ulotki-cyfrowe.js';
import { init as initUploadKalkulator } from './categories/upload-kalkulator.js';
import { init as initUstawienia }       from './categories/ustawienia.js';
import { init as initVouchery }         from './categories/vouchery.js';
import { init as initWizytowki }        from './categories/wizytowki-druk-cyfrowy.js';
import { init as initWlepki }           from './categories/wlepki-naklejki.js';
import { init as initZaproszenia }      from './categories/zaproszenia-kreda.js';



/** Mapa id kategorii → funkcja inicjalizująca */
const CATEGORY_INITS = {
  'cad-upload':              initCadUpload,
  'druk-a4-a3-skan':         initDrukA4A3Skan,
  'druk-cad':                initDrukCad,
  'dyplomy':                 initDyplomy,
  'plakaty':                 initPlakaty,
  'banner':                  initBanner,
  'folia-szroniona':         initFoliaSzroniona,
  'laminowanie':             initLaminowanie,
  'roll-up':                 initRollUp,
  'solwent-plakaty':         initSolwentPlakaty,
  'ulotki-cyfrowe':          initUlotki,
  'upload-kalkulator':       initUploadKalkulator,
  'ustawienia':              initUstawienia,
  'vouchery':                initVouchery,
  'wizytowki-druk-cyfrowy':  initWizytowki,
  'wlepki-naklejki':         initWlepki,
  'zaproszenia-kreda':       initZaproszenia,
};

/**
 * Uruchom inicjalizację dla podanej kategorii (jeśli jest zarejestrowana).
 * @param {string} categoryId
 */
export function initCategory(categoryId) {
  const fn = CATEGORY_INITS[categoryId];
  if (fn) fn();
}

/**
 * Uruchom inicjalizację wszystkich kategorii których DOM-elementy
 * są aktualnie obecne na stronie.
 */
export function initAll() {
  for (const [id, fn] of Object.entries(CATEGORY_INITS)) {
    try {
      fn();
    } catch (err) {
      // Nie przerywaj inicjalizacji pozostałych kategorii
    }
  }
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

function collectInputParams(scope) {
  const params = [];
  const inputs = scope.querySelectorAll('input[type="number"], input[type="text"], select');
  
  inputs.forEach(input => {
    if (input.type === 'checkbox' || input.type === 'radio') return;
    const label = scope.querySelector(`label[for="${input.id}"]`);
    let labelText = label ? label.textContent.trim() : input.id;
    if (labelText.length > 50) labelText = labelText.substring(0, 50) + '...';
    
    const value = input.type === 'number' ? (input.value || '0') : 
                  (input.selectedOptions && input.selectedOptions[0] ? input.selectedOptions[0].text : input.value);
    
    if (value && value !== '0') {
      params.push(`${labelText}: <strong>${value}</strong>`);
    }
  });
  
  // Checkboxes
  const checkboxes = scope.querySelectorAll('input[type="checkbox"]:checked');
  checkboxes.forEach(cb => {
    const label = scope.querySelector(`label[for="${cb.id}"]`);
    const labelText = label ? label.textContent.trim() : cb.id;
    params.push(`✓ ${labelText}`);
  });
  
  // Radio buttons
  const radios = scope.querySelectorAll('input[type="radio"]:checked');
  radios.forEach(radio => {
    const label = radio.closest('label');
    if (label) {
      const span = label.querySelector('span');
      const text = span ? span.textContent.trim() : label.textContent.trim();
      params.push(`Rodzaj: <strong>${text}</strong>`);
    }
  });
  
  return params;
}

function collectMonitorText(scope) {
  const areas = scope.querySelectorAll(
    '.result-display, .result-area, [id$="result-display"], #ekranObliczen, #d-result-display, #lam-calc-breakdown'
  );
  const parts = [];
  areas.forEach(el => {
    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden') return;
    const text = el.textContent ? el.textContent.trim() : '';
    if (text) parts.push(text);
  });
  return parts;
}

function attachMonitor(categoryRoot) {
  const monitor = createCalcMonitor();
  categoryRoot.appendChild(monitor);

  const body = monitor.querySelector('.calc-monitor-body');
  const update = () => {
    const params = collectInputParams(categoryRoot);
    const results = collectMonitorText(categoryRoot);
    if (!body) return;
    
    let html = '';
    
    if (params.length > 0) {
      html += '<div class="calc-monitor-section"><div class="calc-monitor-section-title">📋 Parametry:</div>';
      html += params.map(p => `<div class="calc-monitor-param">${p}</div>`).join('');
      html += '</div>';
    }
    
    if (results.length > 0) {
      html += '<div class="calc-monitor-section"><div class="calc-monitor-section-title">💰 Wyniki:</div>';
      html += results.map(r => `<div class="calc-monitor-block">${r.replace(/\n+/g, '<br>')}</div>`).join('');
      html += '</div>';
    }
    
    if (html === '') {
      body.textContent = 'Brak obliczeń';
    } else {
      body.innerHTML = html;
    }
  };

  update();

  const observer = new MutationObserver(update);
  observer.observe(categoryRoot, { subtree: true, childList: true, characterData: true, attributes: true });
}

async function loadCategory(hash) {
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

  try {
    const resp = await fetch(`categories/${id}.html`);
    if (loadingSpinner) loadingSpinner.style.display = 'none';
    if (resp.ok) {
      const div = document.createElement('div');
      div.innerHTML = await resp.text();
      container.appendChild(div);
      attachMonitor(div);
      initCategory(id);
    } else {
      const err = document.createElement('div');
      err.style.cssText = 'padding:20px;color:#f55;';
      err.textContent = `Brak szablonu: ${id}.html (${resp.status})`;
      container.appendChild(err);
    }
  } catch (err) {
    if (loadingSpinner) loadingSpinner.style.display = 'none';
    const errEl = document.createElement('div');
    errEl.style.cssText = 'padding:20px;color:#f55;';
    errEl.textContent = `Błąd sieci: ${err.message}`;
    container.appendChild(errEl);
  }
}

// Automatyczna inicjalizacja po załadowaniu DOM
document.addEventListener('DOMContentLoaded', () => {
  // Initialize basket/calculator core
  const core = new KalkulatorCore();
  window.kalkulatorCore = core;

  Promise.allSettled(
    Object.entries(CATEGORY_INITS).map(([id, fn]) =>
      Promise.resolve().then(() => fn()).then(() => id)
    )
  ).then(() => {});

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
      const namePart = (d.name || cat).toLowerCase().replace(/[^\w]+/g, '-');
      const id = namePart.slice(0, 60);
      this.addItem({ id, price: d.totalPrice || 0, name: d.name || cat, cat });
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
