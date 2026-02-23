// cad-upload.js – kalkulator uploadowania plików CAD z pełnym cennikiem
// LEGACY JS (nie TypeScript) – docs/js/categories/cad-upload.js

// ─── CENNIKI ────────────────────────────────────────────────────────────────
const CENN_KOLOR    = { 'A0+': 26,   'A0': 24,   'A1': 12,   'A2': 8.5,  'A3': 5.3  };
const CENN_CZB      = { 'A0+': 13,   'A0': 12.5, 'A1': 6,    'A2': 4,    'A3': 2.5  };
const CENN_KOLOR_MB = { 'A0+': 21,   'A0': 20,   'A1': 14.5, 'A2': 13.9, 'A3': 12,   'rolka1067': 30   };
const CENN_CZB_MB   = { 'A0+': 10,   'A0': 9,    'A1': 5,    'A2': 4.5,  'A3': 3.5,  'rolka1067': 12.5 };
const SKLAD_CENY    = { 'A0+': 4,    'A0': 3,    'A1': 2,    'A2': 1.5,  'A3': 1,    'A3-poprzeczne': 0.7, 'nieformat': 2.5 };

// Bazowe długości formatów (mm) – granica formatowy/nieformatowy
const BASE_LENGTHS  = { 'A0+': 1292, 'A0': 1189, 'A1': 841, 'A2': 594, 'A3': 420 };
const SCAN_PER_CM   = 0.08;
const MAX_FILES_SOFT = 50;

let _nextId = 1;

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function fmtPLN(v) {
  return v.toFixed(2).replace('.', ',') + ' zł';
}

function debounce(fn, ms) {
  let t;
  return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
}

// ─── WYKRYWANIE FORMATU ──────────────────────────────────────────────────────
function detectFormat(wMm, hMm) {
  const shorter = Math.min(wMm, hMm);
  if (shorter >= 1189) return 'A0+';
  if (shorter >= 841)  return 'A0';
  if (shorter >= 594)  return 'A1';
  if (shorter >= 420)  return 'A2';
  if (shorter >= 297)  return 'A3';
  return 'nieformatowy';
}

// ─── OBLICZENIE CENY DRUKU JEDNEGO PLIKU ───────────────────────────────────
function obliczPlik(entry, mode) {
  const { wMm, hMm, qty } = entry;
  if (!wMm || !hMm || wMm <= 0 || hMm <= 0) return 0;

  const fmt    = detectFormat(wMm, hMm);
  const longer = Math.max(wMm, hMm);
  let unitPrice;

  if (fmt === 'nieformatowy') {
    // Minimum: cena mb A3
    const mb = mode === 'color' ? CENN_KOLOR_MB['A3'] : CENN_CZB_MB['A3'];
    unitPrice = longer / 1000 * mb;
  } else {
    const baseLen = BASE_LENGTHS[fmt];
    if (Math.abs(longer - baseLen) <= 5) {
      // Format standardowy → cena formatowa
      unitPrice = mode === 'color' ? CENN_KOLOR[fmt] : CENN_CZB[fmt];
    } else {
      // Nieformatowy → długość(m) × cena mb najbliższego formatu
      const table = mode === 'color' ? CENN_KOLOR_MB : CENN_CZB_MB;
      const mb = table[fmt] ?? table['A3'];
      unitPrice = longer / 1000 * mb;
    }
  }

  return unitPrice * qty;
}

// ─── SKŁADANIE ──────────────────────────────────────────────────────────────
function updateSkladanie() {
  let total = 0;
  document.querySelectorAll('.sklad-qty').forEach(input => {
    const qty  = parseInt(input.value, 10) || 0;
    const fmt  = input.dataset.format || 'nieformat';
    if (qty > 0) {
      const cena = SKLAD_CENY[fmt] !== undefined ? SKLAD_CENY[fmt] : SKLAD_CENY['nieformat'];
      total += qty * cena;
    }
  });
  return total;
}

// ─── SKANOWANIE ─────────────────────────────────────────────────────────────
function updateSkan() {
  const el = document.getElementById('skanCm');
  return (parseFloat(el?.value || 0) || 0) * SCAN_PER_CM;
}

// ─── INIT ────────────────────────────────────────────────────────────────────
export function init() {
  const dropZone    = document.getElementById('cadDropZone');
  if (!dropZone) return;

  const fileInput   = document.getElementById('cadFileInput');
  const fileListEl  = document.getElementById('cadFileList');
  const summaryEl   = document.getElementById('cadSummary');
  const fileCountEl = document.getElementById('cadFileCount');
  const totalEl     = document.getElementById('cadTotal');
  const warningEl   = document.getElementById('cadWarning');
  const przeliczBtn = document.getElementById('cadPrzelicz');
  const tableBody   = document.getElementById('cadTableBody');
  const grandTotalEl = document.getElementById('grandTotal');
  const modeEl      = document.getElementById('cadMode');
  const optZapEl    = document.getElementById('optZapelnienie');
  const optPowEl    = document.getElementById('optPowieksz');
  const optEmailEl  = document.getElementById('optEmail');

  let files = []; // [{ id, name, sizeMB, qty, wMm, hMm, skladanieQty, blob }]

  // ── Drop zone ──────────────────────────────────────────────────────────────
  dropZone.addEventListener('click', () => fileInput.click());
  dropZone.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') fileInput.click();
  });
  dropZone.addEventListener('dragenter', e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
  dropZone.addEventListener('dragover',  e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
  dropZone.addEventListener('dragleave', e => {
    if (!dropZone.contains(e.relatedTarget)) dropZone.classList.remove('drag-over');
  });
  dropZone.addEventListener('drop', e => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    addFiles(e.dataTransfer.files);
  });

  fileInput.addEventListener('change', e => { addFiles(e.target.files); fileInput.value = ''; });

  document.getElementById('clearBtn')?.addEventListener('click', () => {
    files = [];
    renderFileList();
  });

  przeliczBtn?.addEventListener('click', () => recalculateAll());

  // ── Global options triggers (.cad-options) ──────────────────────────────────
  const debouncedRecalc = debounce(recalculateAll, 200);
  [modeEl, optZapEl, optPowEl, optEmailEl].forEach(el => el?.addEventListener('change', debouncedRecalc));
  document.getElementById('skanCm')?.addEventListener('input', debouncedRecalc);

  // ── File list event delegation ──────────────────────────────────────────────
  if (fileListEl) {
    fileListEl.addEventListener('click', e => {
      const delBtn = e.target.closest('[data-delete]');
      if (delBtn) { deleteFile(delBtn.dataset.delete); return; }

      const detectBtn = e.target.closest('[data-detect]');
      if (detectBtn) {
        const entry = files.find(f => String(f.id) === detectBtn.dataset.detect);
        if (entry?.blob) autoDetectDims(entry);
      }
    });

    fileListEl.addEventListener('input', e => {
      const el = e.target;
      const byId = id => files.find(f => String(f.id) === id);

      if (el.classList.contains('cad-qty-input') && el.dataset.qtyid) {
        const entry = byId(el.dataset.qtyid);
        if (!entry) return;
        const v = parseInt(el.value, 10);
        if (isNaN(v) || v < 1) { el.value = entry.qty; return; }
        entry.qty = Math.min(999, v);
      } else if (el.classList.contains('cad-w-input')) {
        const entry = byId(el.dataset.dimid);
        if (entry) {
          entry.wMm = Math.max(0, parseFloat(el.value) || 0);
          updateSkladFormat(entry);
        }
      } else if (el.classList.contains('cad-h-input')) {
        const entry = byId(el.dataset.dimid);
        if (entry) {
          entry.hMm = Math.max(0, parseFloat(el.value) || 0);
          updateSkladFormat(entry);
        }
      } else if (el.classList.contains('sklad-qty')) {
        const entry = byId(el.dataset.skladid);
        if (entry) entry.skladanieQty = Math.max(0, parseInt(el.value, 10) || 0);
      }
      debouncedRecalc();
    });
  }

  // Aktualizuj data-format na sklad-qty po zmianie wymiarów
  function updateSkladFormat(entry) {
    const fmt = (entry.wMm > 0 && entry.hMm > 0) ? detectFormat(entry.wMm, entry.hMm) : '';
    const skladFmt = (!fmt || fmt === 'nieformatowy') ? 'nieformat' : fmt;
    const skladEl = fileListEl?.querySelector(`.sklad-qty[data-skladid="${entry.id}"]`);
    if (skladEl) {
      skladEl.dataset.format = skladFmt;
      // Odśwież badge formatu
      const badge = fileListEl?.querySelector(`.cad-format-badge[data-badgeid="${entry.id}"]`);
      if (badge) badge.textContent = fmt || '';
    }
  }

  // ── File management ──────────────────────────────────────────────────────────
  function addFiles(fileList) {
    for (const f of fileList) {
      const entry = {
        id: _nextId++,
        name: f.name,
        sizeMB: (f.size / (1024 * 1024)).toFixed(2),
        qty: 1,
        wMm: 0,
        hMm: 0,
        skladanieQty: 0,
        blob: f,
      };
      files.push(entry);
      if (f.type.startsWith('image/')) autoDetectDims(entry);
    }
    if (warningEl) warningEl.style.display = files.length > MAX_FILES_SOFT ? '' : 'none';
    renderFileList();
  }

  function deleteFile(id) {
    files = files.filter(f => String(f.id) !== String(id));
    if (warningEl) warningEl.style.display = files.length > MAX_FILES_SOFT ? '' : 'none';
    renderFileList();
  }

  async function autoDetectDims(entry) {
    if (!entry.blob?.type?.startsWith('image/')) return;
    try {
      const { wMm, hMm } = await new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(entry.blob);
        img.onload  = () => {
          URL.revokeObjectURL(url);
          // Zakładamy 300 DPI: px / 300 [inch] × 25,4 [mm/inch] = mm
          resolve({
            wMm: Math.round(img.naturalWidth  / 300 * 25.4),
            hMm: Math.round(img.naturalHeight / 300 * 25.4),
          });
        };
        img.onerror = () => { URL.revokeObjectURL(url); reject(); };
        img.src = url;
      });
      entry.wMm = wMm;
      entry.hMm = hMm;
      const wEl = fileListEl?.querySelector(`.cad-w-input[data-dimid="${entry.id}"]`);
      const hEl = fileListEl?.querySelector(`.cad-h-input[data-dimid="${entry.id}"]`);
      if (wEl) wEl.value = wMm;
      if (hEl) hEl.value = hMm;
      updateSkladFormat(entry);
      recalculateAll();
    } catch (err) { console.warn('Nie udało się wykryć wymiarów obrazu:', err); }
  }

  // ── Rendering ──────────────────────────────────────────────────────────────
  function renderFileList() {
    if (!fileListEl) return;
    if (files.length === 0) {
      fileListEl.innerHTML = '';
      if (summaryEl)     summaryEl.style.display  = 'none';
      if (tableBody)     tableBody.innerHTML       = '';
      if (grandTotalEl)  grandTotalEl.textContent  = '0,00 zł';
      dispatchPrice(0);
      return;
    }
    if (summaryEl) summaryEl.style.display = '';

    fileListEl.innerHTML = files.map(f => {
      const fmt      = (f.wMm > 0 && f.hMm > 0) ? detectFormat(f.wMm, f.hMm) : '';
      const skladFmt = (!fmt || fmt === 'nieformatowy') ? 'nieformat' : fmt;
      return `
        <div class="cad-file-item" data-fileid="${f.id}">
          <button class="cad-delete-x" data-delete="${f.id}"
                  aria-label="Usuń ${escHtml(f.name)}" title="Usuń plik">✕</button>
          <span class="cad-file-name" title="${escHtml(f.name)}">${escHtml(f.name)}</span>
          <span class="cad-file-size">${f.sizeMB} MB</span>
          <label class="cad-qty-label">
            W(mm):
            <input type="number" class="cad-qty-input cad-w-input" data-dimid="${f.id}"
                   value="${f.wMm || ''}" min="1" placeholder="szer." style="width:72px;"
                   aria-label="Szerokość mm dla ${escHtml(f.name)}" />
          </label>
          <label class="cad-qty-label">
            H(mm):
            <input type="number" class="cad-qty-input cad-h-input" data-dimid="${f.id}"
                   value="${f.hMm || ''}" min="1" placeholder="wys." style="width:72px;"
                   aria-label="Wysokość mm dla ${escHtml(f.name)}" />
          </label>
          ${f.blob?.type?.startsWith('image/') ? `<button class="cad-detect-btn" data-detect="${f.id}" title="Wykryj wymiary z obrazu" aria-label="Wykryj wymiary obrazu ${escHtml(f.name)}">🔍</button>` : ''}
          ${fmt ? `<span class="cad-format-badge" data-badgeid="${f.id}">${escHtml(fmt)}</span>` : ''}
          <label class="cad-qty-label">
            Kop.:
            <input type="number" class="cad-qty-input" data-qtyid="${f.id}"
                   value="${f.qty}" min="1" max="999"
                   aria-label="Ilość kopii dla ${escHtml(f.name)}" />
          </label>
          <label class="cad-qty-label">
            Skład.:
            <input type="number" class="sklad-qty cad-qty-input" data-skladid="${f.id}" data-format="${escHtml(skladFmt)}"
                   value="${f.skladanieQty}" min="0" max="999" style="width:56px;"
                   aria-label="Ilość składań dla ${escHtml(f.name)}" />
          </label>
        </div>
      `;
    }).join('');

    recalculateAll();
  }

  // ── Główna kalkulacja ─────────────────────────────────────────────────────
  function recalculateAll() {
    const mode = modeEl?.value || 'color';
    let multiplier = 1;
    if (optZapEl?.checked)  multiplier += 0.5;
    if (optPowEl?.checked)  multiplier += 0.5;
    const emailAddon = optEmailEl?.checked ? 1 : 0;

    const skanTotal  = updateSkan();
    const skladTotal = updateSkladanie();

    const rows = files.map(f => {
      const drukCena = obliczPlik(f, mode) * multiplier;
      const fmt      = (f.wMm > 0 && f.hMm > 0) ? detectFormat(f.wMm, f.hMm) : '';
      const rozmiar  = fmt ? `${fmt} (${f.wMm}×${f.hMm} mm)` : '—';
      return { name: f.name, rozmiar, drukCena };
    });

    const drukTotal  = rows.reduce((s, r) => s + r.drukCena, 0);
    const grandTotal = drukTotal + skladTotal + skanTotal + emailAddon;

    // Render tabeli podsumowania
    if (tableBody) {
      if (rows.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-secondary)">Brak plików</td></tr>';
      } else {
        let html = rows.map(r => `
          <tr>
            <td>${escHtml(r.name)}<br><small style="color:var(--text-secondary)">${r.rozmiar}</small></td>
            <td>${r.drukCena > 0 ? fmtPLN(r.drukCena) : '—'}</td>
            <td>—</td>
            <td>—</td>
            <td><strong>${r.drukCena > 0 ? fmtPLN(r.drukCena) : '—'}</strong></td>
          </tr>
        `).join('');
        if (skladTotal > 0) {
          html += `<tr><td>📐 Składanie</td><td>—</td><td>${fmtPLN(skladTotal)}</td><td>—</td><td>${fmtPLN(skladTotal)}</td></tr>`;
        }
        if (skanTotal > 0) {
          const cm = parseFloat(document.getElementById('skanCm')?.value || 0);
          html += `<tr><td>🖨 Skan (${cm} cm)</td><td>—</td><td>—</td><td>${fmtPLN(skanTotal)}</td><td>${fmtPLN(skanTotal)}</td></tr>`;
        }
        if (emailAddon > 0) {
          html += `<tr><td>📧 Email</td><td>—</td><td>—</td><td>—</td><td>1,00 zł</td></tr>`;
        }
        tableBody.innerHTML = html;
      }
    }

    if (grandTotalEl) grandTotalEl.textContent = fmtPLN(grandTotal);
    if (totalEl)      totalEl.textContent       = fmtPLN(grandTotal);
    if (fileCountEl)  fileCountEl.textContent   = files.length;

    dispatchPrice(grandTotal);
  }

  // ── Dispatch price do globalnego systemu ──────────────────────────────────
  function dispatchPrice(total) {
    const n = files.length;
    if (n === 0) {
      window.dispatchEvent(new CustomEvent('priceRemove', { detail: { id: 'cad-upload' } }));
    } else {
      window.dispatchEvent(new CustomEvent('priceUpdate', {
        detail: {
          id:    'cad-upload',
          price: total,
          name:  `${n} plik${n === 1 ? '' : n < 5 ? 'i' : 'ów'}`,
          cat:   'CAD Upload',
        },
      }));
    }
  }
}

export function destroy() { /* no global listeners to remove */ }
