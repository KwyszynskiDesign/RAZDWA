/**
 * Ustawienia – Panel do edycji cen
 * - Wczytuje ceny z price-manager
 * - Pozwala edytować i zapisywać overrides
 * - Automatycznie przelicza kalkulatory
 */

import priceManager from '../price-manager.js';

export function init() {
  // Czekaj aż price-manager się załaduje
  if (!priceManager.prices || Object.keys(priceManager.prices).length === 0) {
    priceManager.init().then(() => setupUI());
  } else {
    setupUI();
  }
}

function setupUI() {
  const tbody = document.querySelector('#pricesTable tbody');
  const addBtn = document.getElementById('addPriceBtn');
  const saveBtn = document.getElementById('saveAllBtn');
  const resetBtn = document.getElementById('resetPricesBtn');
  const msgEl = document.getElementById('ustawienia-msg');

  if (!tbody) return;

  // Renderuj tabelę cen
  renderPricesTable();

  if (addBtn) {
    addBtn.addEventListener('click', () => {
      const newKey = prompt('Podaj ścieżkę ceny (np. "drukA4A3.print.bw.A4"):', '');
      if (newKey) {
        priceManager.setPrice(newKey, 0);
        renderPricesTable();
        showMessage('✅ Dodano nową pozycję', 'success');
      }
    });
  }

  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      // Ceny już są w localStorage, ale możemy odswiężyć kalkulatory
      window.dispatchEvent(new CustomEvent('razdwa:pricesUpdated'));
      showMessage('✅ Ceny zaktualizowane! Kalkulatory zostały odśwież one.', 'success');
      console.log('📢 Price update broadcast sent');
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('Czy na pewno chcesz przywrócić wszystkie ceny domyślne?')) {
        priceManager.resetPrices();
        renderPricesTable();
        window.dispatchEvent(new CustomEvent('razdwa:pricesUpdated'));
        showMessage('🔄 Ceny przywrócone do domyślnych', 'success');
      }
    });
  }

  // Nasłuchuj zmian cen z innych miejsc
  window.addEventListener('razdwa:priceChange', () => {
    renderPricesTable();
  });
}

function renderPricesTable() {
  const tbody = document.querySelector('#pricesTable tbody');
  if (!tbody) return;

  const state = priceManager.getState();
  const allKeys = new Set();

  // Zbierz wszystkie klucczy (z prices i overrides)
  const collectKeys = (obj, prefix = '') => {
    for (const [key, val] of Object.entries(obj)) {
      const path = prefix ? `${prefix}.${key}` : key;
      if (typeof val === 'object' && !Array.isArray(val)) {
        collectKeys(val, path);
      } else if (typeof val === 'number') {
        allKeys.add(path);
      } else if (Array.isArray(val)) {
        val.forEach((item, idx) => {
          if (typeof item === 'object' && 'unit' in item) {
            allKeys.add(`${path}[${idx}].unit`);
          }
        });
      }
    }
  };

  collectKeys(state.prices);

  // Renderuj wiersze
  const rows = Array.from(allKeys)
    .sort()
    .map(key => {
      const currentValue = priceManager.getPrice(key) ?? '—';
      const isOverride = key in state.overrides;

      return `
        <tr style="border-bottom: 1px solid var(--border); ${isOverride ? 'background:#f0fdf4;' : ''}">
          <td style="padding: 8px 10px; font-family: monospace; font-size: 12px;">
            ${key}
            ${isOverride ? '<span style="margin-left:8px; color:#16a34a; font-weight:600;">✓ zmienione</span>' : ''}
          </td>
          <td style="padding: 8px 10px;">
            <input type="number" 
              class="price-input" 
              data-key="${key}" 
              value="${currentValue}" 
              step="0.01" 
              style="width: 100px; padding: 6px; border: 1px solid var(--border); border-radius: 4px; font-size: 12px;" />
          </td>
          <td style="padding: 8px 10px; text-align: center;">
            <button class="price-reset-btn" data-key="${key}" style="padding: 4px 8px; background: #fee2e2; color: #991b1b; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
              ✕
            </button>
          </td>
        </tr>
      `;
    })
    .join('');

  tbody.innerHTML = rows;

  // Dodaj event listenery do input'ów
  document.querySelectorAll('.price-input').forEach(input => {
    input.addEventListener('change', (e) => {
      const key = e.target.dataset.key;
      const value = parseFloat(e.target.value);
      if (!isNaN(value)) {
        priceManager.setPrice(key, value);
        renderPricesTable();
      }
    });
  });

  // Dodaj event listenery do przycisków resetowania
  document.querySelectorAll('.price-reset-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const key = e.target.dataset.key;
      priceManager.resetPrices(key);
      renderPricesTable();
    });
  });
}

function showMessage(text, type = 'info') {
  const msgEl = document.getElementById('ustawienia-msg');
  if (!msgEl) return;

  msgEl.textContent = text;
  msgEl.style.display = '';

  if (type === 'success') {
    msgEl.style.background = '#dcfce7';
    msgEl.style.color = '#166534';
    msgEl.style.borderLeft = '4px solid #16a34a';
  } else if (type === 'error') {
    msgEl.style.background = '#fee2e2';
    msgEl.style.color = '#991b1b';
    msgEl.style.borderLeft = '4px solid #ef4444';
  }

  setTimeout(() => {
    msgEl.style.display = 'none';
  }, 3000);
}

export function destroy() {
  // cleanup
}


