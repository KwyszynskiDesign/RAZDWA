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
      console.warn(`[RAZDWA] initCategory(${id}) error:`, err);
    }
  }
}

// Automatyczna inicjalizacja po załadowaniu DOM
document.addEventListener('DOMContentLoaded', initAll);
