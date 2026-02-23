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

console.log('🚀 Modular JS init...');

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
      console.warn(`[RAZDWA] initCategory(${id}) error:`, err);
    }
  }
}

// ─── SPA ROUTER ───────────────────────────────────────────────────────────────
/**
 * Załaduj szablon HTML kategorii do #viewContainer i uruchom jej init().
 * @param {string} hash  np. '#/plakaty' lub 'plakaty'
 */
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
      initCategory(id);
      console.log(`[RAZDWA] ✅ Loaded: ${id}`);
    } else {
      const err = document.createElement('div');
      err.style.cssText = 'padding:20px;color:#f55;';
      err.textContent = `Brak szablonu: ${id}.html (${resp.status})`;
      container.appendChild(err);
      console.warn(`[RAZDWA] ❌ Template not found: ${id}.html`);
    }
  } catch (err) {
    if (loadingSpinner) loadingSpinner.style.display = 'none';
    const errEl = document.createElement('div');
    errEl.style.cssText = 'padding:20px;color:#f55;';
    errEl.textContent = `Błąd sieci: ${err.message}`;
    container.appendChild(errEl);
    console.error(`[RAZDWA] ❌ Network error loading ${id}:`, err);
  }
}

// Automatyczna inicjalizacja po załadowaniu DOM
document.addEventListener('DOMContentLoaded', () => {
  const total = Object.keys(CATEGORY_INITS).length;
  Promise.allSettled(
    Object.entries(CATEGORY_INITS).map(([id, fn]) =>
      Promise.resolve().then(() => fn()).then(() => id)
    )
  ).then(results => {
    const failed = results.filter(r => r.status === 'rejected');
    failed.forEach(r => console.warn(`[RAZDWA] initCategory(${r.reason?.id ?? '?'}) error:`, r.reason?.err ?? r.reason));
    console.log(`[RAZDWA] ✅ ${total - failed.length}/${total} categories initialized`);
  });

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
