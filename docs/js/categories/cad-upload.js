// cad-upload.js – kalkulator uploadowania plików CAD (cad-upload.html)
import { drukCad, modifiers } from '../prices.js';
import { pxToMm, formatPLN } from '../utils/common.js';

const STANDARD_WIDTHS = [297, 420, 594, 841, 914, 1067];
const TOLERANCE = 5; // mm

/** Znajdź najbliższą standardową szerokość */
function findClosestWidth(width) {
  return STANDARD_WIDTHS.reduce((prev, curr) =>
    Math.abs(curr - width) < Math.abs(prev - width) ? curr : prev
  );
}

/** Sprawdź czy szerokość jest standardowa */
function isStandardWidth(width) {
  return STANDARD_WIDTHS.includes(Math.round(width));
}

/** Mapowanie szerokości mm → klucz formatu */
const WIDTH_TO_FORMAT = { 297: 'A3', 420: 'A2', 594: 'A1', 841: 'A0', 914: 'A0+' };

/** Wykryj format na podstawie wymiarów (mm) */
function detectFormat(widthMm, heightMm) {
  const w = Math.round(widthMm);
  const h = Math.round(heightMm);
  const [minDim, maxDim] = w < h ? [w, h] : [h, w];

  if (!isStandardWidth(minDim)) {
    return { format: `${minDim}mm`, isFormatowy: false, isStandardWidth: false, widthCategory: findClosestWidth(minDim) };
  }

  const formatName = WIDTH_TO_FORMAT[minDim];
  if (formatName) {
    const stdLength = drukCad.baseLengthMm[formatName];
    if (stdLength !== undefined) {
      return {
        format: formatName,
        isFormatowy: Math.abs(maxDim - stdLength) <= TOLERANCE,
        isStandardWidth: true,
        widthCategory: minDim,
        actualLength: maxDim,
        standardLength: stdLength,
      };
    }
  }

  return { format: `${minDim}×${maxDim}`, isFormatowy: false, isStandardWidth: true, widthCategory: minDim };
}

/** Oblicz cenę wydruku jednego pliku */
function calcPrintPrice(fileData, isColor) {
  const mode = isColor ? 'color' : 'bw';
  const { format, isFormatowy, widthCategory } = fileData.formatInfo;

  if (isFormatowy) {
    return drukCad.formatowe[mode][format] || 0;
  }
  const pricePerMb = drukCad.metrBiezacy[mode][widthCategory] || 0;
  return pricePerMb * (fileData.heightMm / 1000);
}

/** Oblicz cenę składania jednego pliku */
function calcFoldingPrice(fileData) {
  if (!fileData.folding) return 0;
  if (fileData.formatInfo.isFormatowy) {
    return drukCad.skladanie[fileData.formatInfo.format] || 0;
  }
  const areaM2 = (fileData.widthMm / 1000) * (fileData.heightMm / 1000);
  return drukCad.skladanie['nieformatowe'] !== undefined
    ? drukCad.skladanie['nieformatowe'] * areaM2
    : 2.5 * areaM2;
}

/** Oblicz cenę skanowania jednego pliku */
function calcScanPrice(fileData) {
  if (!fileData.scanning) return 0;
  return drukCad.skanowanie * Math.max(fileData.widthMm, fileData.heightMm);
}

export function init() {
  const uploadZone = document.getElementById('uploadZone');
  if (!uploadZone) return; // template not loaded

  const fileInput       = document.getElementById('fileInput');
  const dpiInput        = document.getElementById('dpiInput');
  const colorToggle     = document.getElementById('colorToggle');
  const colorSwitch     = document.getElementById('colorSwitch');
  const rollsSummary    = document.getElementById('rollsSummary');
  const rollsList       = document.getElementById('rollsList');
  const suggestedRoll   = document.getElementById('suggestedRoll');
  const warningAlert    = document.getElementById('warningAlert');
  const warningCount    = document.getElementById('warningCount');
  const warningDetails  = document.getElementById('warningDetails');
  const filesTableWrapper = document.getElementById('filesTableWrapper');
  const filesTableBody  = document.getElementById('filesTableBody');
  const summaryPanel    = document.getElementById('summaryPanel');
  const summaryGrid     = document.getElementById('summaryGrid');
  const clearBtn        = document.getElementById('clearBtn');

  let filesData = [];
  let isColor = false;
  let dpi = 300;

  // ── Event listeners ──────────────────────────────────────────────────────
  uploadZone.addEventListener('click', () => fileInput.click());
  uploadZone.addEventListener('dragover', (e) => { e.preventDefault(); uploadZone.classList.add('drag-over'); });
  uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('drag-over'));
  uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.classList.remove('drag-over');
    handleFiles(e.dataTransfer.files);
  });
  fileInput.addEventListener('change', (e) => handleFiles(e.target.files));

  colorToggle.addEventListener('click', () => {
    isColor = !isColor;
    colorSwitch.classList.toggle('active');
    if (filesData.length > 0) recalculateAll();
  });

  dpiInput.addEventListener('change', (e) => {
    dpi = parseInt(e.target.value) || 300;
    if (filesData.length > 0) recalculateAll();
  });

  clearBtn.addEventListener('click', () => {
    filesData = [];
    fileInput.value = '';
    updateDisplay();
  });

  if (warningAlert && warningDetails) {
    warningAlert.addEventListener('click', () => warningDetails.classList.toggle('expanded'));
  }

  // ── File handling ─────────────────────────────────────────────────────────
  function handleFiles(files) {
    for (const file of files) {
      if (file.name.match(/\.(dwg|dxf)$/i)) {
        const mockW = 2480 + Math.random() * 1000;
        const mockH = 1754 + Math.random() * 1000;
        const wMm = pxToMm(mockW, dpi);
        const hMm = pxToMm(mockH, dpi);
        filesData.push({
          id: Date.now() + Math.random(),
          name: file.name,
          widthPx: mockW, heightPx: mockH,
          widthMm: wMm, heightMm: hMm,
          formatInfo: detectFormat(wMm, hMm),
          folding: false, scanning: false,
        });
        updateDisplay();
      } else {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const img = new Image();
          img.onload = () => {
            const wMm = pxToMm(img.width, dpi);
            const hMm = pxToMm(img.height, dpi);
            filesData.push({
              id: Date.now() + Math.random(),
              name: file.name,
              widthPx: img.width, heightPx: img.height,
              widthMm: wMm, heightMm: hMm,
              formatInfo: detectFormat(wMm, hMm),
              folding: false, scanning: false,
            });
            updateDisplay();
          };
          img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
      }
    }
  }

  function recalculateAll() {
    filesData = filesData.map(f => {
      const wMm = pxToMm(f.widthPx, dpi);
      const hMm = pxToMm(f.heightPx, dpi);
      return { ...f, widthMm: wMm, heightMm: hMm, formatInfo: detectFormat(wMm, hMm) };
    });
    updateDisplay();
  }

  // ── Display ───────────────────────────────────────────────────────────────
  function updateDisplay() {
    if (filesData.length === 0) {
      rollsSummary.classList.add('hidden');
      filesTableWrapper.classList.add('hidden');
      summaryPanel.classList.add('hidden');
      return;
    }
    rollsSummary.classList.remove('hidden');
    filesTableWrapper.classList.remove('hidden');
    summaryPanel.classList.remove('hidden');
    displayRollsSummary();
    displayFilesTable();
    displaySummary();
  }

  function displayRollsSummary() {
    const rollCounts = {};
    const nonStd = [];

    filesData.forEach(f => {
      if (!f.formatInfo.isStandardWidth) {
        nonStd.push(f);
      } else {
        rollCounts[f.formatInfo.widthCategory] = (rollCounts[f.formatInfo.widthCategory] || 0) + 1;
      }
    });

    rollsList.innerHTML = Object.entries(rollCounts)
      .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
      .map(([w, cnt]) => `<div class="roll-item"><span>Rolka ${w}mm</span><span class="roll-count">${cnt} plik${cnt > 1 ? 'i/ów' : ''}</span></div>`)
      .join('');

    const maxWidth = Math.max(...Object.keys(rollCounts).map(Number));
    if (isFinite(maxWidth)) {
      suggestedRoll.innerHTML = `<strong>→ Sugerowana rolka: ${maxWidth}mm (pokryje wszystkie standardowe pliki)</strong>`;
    }

    if (nonStd.length > 0) {
      warningAlert.classList.add('show');
      warningCount.textContent = `${nonStd.length} plik${nonStd.length > 1 ? 'i/ów' : ''}`;
      warningDetails.innerHTML = nonStd.map(f =>
        `<div>• ${f.name}: ${Math.round(f.widthMm)} × ${Math.round(f.heightMm)}mm (niestandardowa szerokość)</div>`
      ).join('');
    } else {
      warningAlert.classList.remove('show');
    }
  }

  function displayFilesTable() {
    filesTableBody.innerHTML = filesData.map(f => {
      const print   = calcPrintPrice(f, isColor);
      const folding = calcFoldingPrice(f);
      const scan    = calcScanPrice(f);
      const total   = print + folding + scan;
      const { format, isFormatowy, isStandardWidth: stdW } = f.formatInfo;
      const badge = !stdW
        ? '<span class="badge badge-warning">⚠️ Niestandardowa szerokość</span>'
        : isFormatowy
          ? '<span class="badge badge-formatowy">Formatowy</span>'
          : '<span class="badge badge-nieformatowy">Nieformatowy [MB]</span>';

      return `<tr>
        <td><strong>${f.name}</strong></td>
        <td>${Math.round(f.widthPx)} × ${Math.round(f.heightPx)}</td>
        <td>${Math.round(f.widthMm)} × ${Math.round(f.heightMm)} mm</td>
        <td><strong>${format}</strong></td>
        <td>${badge}</td>
        <td class="checkbox-cell"><input type="checkbox" ${f.folding ? 'checked' : ''} data-fold="${f.id}"></td>
        <td class="checkbox-cell"><input type="checkbox" ${f.scanning ? 'checked' : ''} data-scan="${f.id}"></td>
        <td><strong>${formatPLN(total)}</strong></td>
      </tr>`;
    }).join('');

    filesTableBody.querySelectorAll('input[data-fold]').forEach(cb =>
      cb.addEventListener('change', () => {
        const f = filesData.find(x => String(x.id) === cb.dataset.fold);
        if (f) { f.folding = cb.checked; updateDisplay(); }
      })
    );
    filesTableBody.querySelectorAll('input[data-scan]').forEach(cb =>
      cb.addEventListener('change', () => {
        const f = filesData.find(x => String(x.id) === cb.dataset.scan);
        if (f) { f.scanning = cb.checked; updateDisplay(); }
      })
    );
  }

  function displaySummary() {
    let totalPrint = 0, totalFolding = 0, totalScan = 0;
    filesData.forEach(f => {
      totalPrint   += calcPrintPrice(f, isColor);
      totalFolding += calcFoldingPrice(f);
      totalScan    += calcScanPrice(f);
    });
    const total = totalPrint + totalFolding + totalScan;
    const n = filesData.length;
    summaryGrid.innerHTML = `
      <div class="summary-item"><span>Wydruki (${n} plik${n > 1 ? 'i/ów' : ''}):</span><span>${formatPLN(totalPrint)}</span></div>
      <div class="summary-item"><span>Składanie:</span><span>${formatPLN(totalFolding)}</span></div>
      <div class="summary-item"><span>Skanowanie:</span><span>${formatPLN(totalScan)}</span></div>
      <div class="summary-item"><span>RAZEM:</span><span>${formatPLN(total)}</span></div>`;
  }

  // ── CAD Ops section ───────────────────────────────────────────────────────
  const opsItems = [];
  const opsListEl    = document.getElementById('opsList');
  const opsListItems = document.getElementById('opsListItems');
  const opsTotalEl   = document.getElementById('opsTotal');

  function updateOpsList() {
    if (!opsListEl) return;
    if (opsItems.length === 0) { opsListEl.classList.add('hidden'); return; }
    opsListEl.classList.remove('hidden');
    opsListItems.innerHTML = opsItems.map((item, i) => `
      <div class="ops-item" style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.1)">
        <span>${item.label}</span>
        <span>${formatPLN(item.price)}</span>
        <button data-remove-ops="${i}" style="background:none;border:none;color:#ef4444;cursor:pointer;font-size:16px;">✕</button>
      </div>`).join('');
    opsTotalEl.textContent = formatPLN(opsItems.reduce((s, x) => s + x.price, 0));
  }

  if (opsListItems) {
    opsListItems.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-remove-ops]');
      if (btn) {
        const idx = parseInt(btn.getAttribute('data-remove-ops') || '-1');
        if (idx >= 0) { opsItems.splice(idx, 1); updateOpsList(); }
      }
    });
  }

  const foldAddBtn = document.getElementById('fold-add');
  if (foldAddBtn) {
    foldAddBtn.addEventListener('click', () => {
      const format = document.getElementById('fold-format').value;
      const qty = parseInt(document.getElementById('fold-qty').value) || 1;
      const unitPrice = drukCad.skladanie[format] || 0;
      opsItems.push({ label: `Składanie ${format} × ${qty} szt`, price: unitPrice * qty });
      updateOpsList();
    });
  }

  const wfScanAddBtn = document.getElementById('wf-scan-add');
  if (wfScanAddBtn) {
    wfScanAddBtn.addEventListener('click', () => {
      const mm  = parseFloat(document.getElementById('wf-scan-mm').value) || 0;
      const qty = parseInt(document.getElementById('wf-scan-qty').value) || 1;
      if (mm <= 0) { alert('Podaj długość w mm'); return; }
      opsItems.push({ label: `Skan wielkoformat ${mm}mm × ${qty} szt`, price: drukCad.skanowanie * mm * qty });
      updateOpsList();
    });
  }
}

export function destroy() { /* no global listeners to remove */ }
