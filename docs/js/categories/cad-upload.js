// cad-upload.js – kalkulator uploadowania plików CAD (cad-upload.html)
const PRICE_PER_FILE = 5; // zł / plik
const MAX_FILES_SOFT = 50;

let _nextId = 1;

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function fmtPLN(amount) {
  return amount.toFixed(2).replace('.', ',') + ' zł';
}

function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

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

  let files = []; // [{ id, name, sizeMB, qty }]

  // ── Drop zone events ──────────────────────────────────────────────────────
  dropZone.addEventListener('click', () => fileInput.click());
  dropZone.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') fileInput.click();
  });
  dropZone.addEventListener('dragenter', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
  });
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
  });
  dropZone.addEventListener('dragleave', (e) => {
    if (!dropZone.contains(e.relatedTarget)) dropZone.classList.remove('drag-over');
  });
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    addFiles(e.dataTransfer.files);
  });

  fileInput.addEventListener('change', (e) => {
    addFiles(e.target.files);
    fileInput.value = '';
  });

  // Global clearBtn also clears local file list
  document.getElementById('clearBtn')?.addEventListener('click', () => {
    files = [];
    renderFileList();
  });

  // Przelicz button re-dispatches the current total
  przeliczBtn?.addEventListener('click', () => dispatchPrice());

  // ── Event delegation for file list (attach once) ──────────────────────────
  const debouncedDispatch = debounce(dispatchPrice, 300);

  if (fileListEl) {
    fileListEl.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-delete]');
      if (btn) deleteFile(btn.dataset.delete);
    });

    fileListEl.addEventListener('input', (e) => {
      const input = e.target.closest('.cad-qty-input');
      if (!input) return;
      const entry = files.find(file => String(file.id) === input.dataset.qtyid);
      if (!entry) return;
      const parsed = parseInt(input.value, 10);
      if (isNaN(parsed) || parsed < 1) {
        input.value = entry.qty;
        return;
      }
      entry.qty = Math.min(999, parsed);
      const row = input.closest('.cad-file-item');
      const priceEl = row?.querySelector('.cad-file-price');
      if (priceEl) priceEl.textContent = fmtPLN(entry.qty * PRICE_PER_FILE);
      debouncedDispatch();
    });
  }

  // ── File management ───────────────────────────────────────────────────────
  function addFiles(fileList) {
    for (const f of fileList) {
      files.push({
        id: _nextId++,
        name: f.name,
        sizeMB: (f.size / (1024 * 1024)).toFixed(2),
        qty: 1,
      });
    }
    if (warningEl) warningEl.style.display = files.length > MAX_FILES_SOFT ? '' : 'none';
    renderFileList();
  }

  function deleteFile(id) {
    files = files.filter(f => String(f.id) !== String(id));
    if (warningEl) warningEl.style.display = files.length > MAX_FILES_SOFT ? '' : 'none';
    renderFileList();
  }

  // ── Rendering ─────────────────────────────────────────────────────────────
  function renderFileList() {
    if (!fileListEl) return;
    if (files.length === 0) {
      fileListEl.innerHTML = '';
      if (summaryEl) summaryEl.style.display = 'none';
      dispatchPrice();
      return;
    }
    if (summaryEl) summaryEl.style.display = '';

    fileListEl.innerHTML = files.map(f => `
      <div class="cad-file-item" data-fileid="${f.id}">
        <button class="cad-delete-x" data-delete="${f.id}"
                aria-label="Usuń ${escHtml(f.name)}" title="Usuń plik">✕</button>
        <span class="cad-file-name" title="${escHtml(f.name)}">${escHtml(f.name)}</span>
        <span class="cad-file-size">${f.sizeMB} MB</span>
        <label class="cad-qty-label">
          Ilość:
          <input type="number" class="cad-qty-input" data-qtyid="${f.id}"
                 value="${f.qty}" min="1" max="999"
                 aria-label="Ilość dla ${escHtml(f.name)}" />
        </label>
        <span class="cad-file-price">${fmtPLN(f.qty * PRICE_PER_FILE)}</span>
      </div>
    `).join('');

    dispatchPrice();
  }

  // ── Price calculation & event dispatch ────────────────────────────────────
  function dispatchPrice() {
    const total = files.reduce((s, f) => s + f.qty * PRICE_PER_FILE, 0);
    const n = files.length;

    if (totalEl) totalEl.textContent = fmtPLN(total);
    if (fileCountEl) fileCountEl.textContent = n;

    if (n === 0) {
      window.dispatchEvent(new CustomEvent('priceRemove', { detail: { id: 'cad-upload' } }));
    } else {
      window.dispatchEvent(new CustomEvent('priceUpdate', {
        detail: {
          id: 'cad-upload',
          price: total,
          name: `${n} plik${n === 1 ? '' : n < 5 ? 'i' : 'ów'}`,
          cat: 'CAD Upload',
        },
      }));
    }
  }
}

export function destroy() { /* no global listeners to remove */ }
