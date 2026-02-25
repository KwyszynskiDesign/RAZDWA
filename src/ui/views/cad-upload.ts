import { View, ViewContext } from "../types";
import { calculatePriceFromDimensions, detectFormatFromDimensions } from "../../categories/cad-upload";
import { formatPLN } from "../../core/money";

const MAX_FILES_SOFT = 50;
/** 300 DPI: 1 px = 25.4/300 mm */
const PX_TO_MM = 25.4 / 300;

interface FileEntry {
  id: number;
  name: string;
  sizeMB: string;
  qty: number;
  widthPx: number;
  heightPx: number;
  widthMm: number;
  heightMm: number;
}

function escHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function debounce<T extends (...args: unknown[]) => void>(fn: T, delay: number): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export const CadUploadView: View = {
  id: "cad-upload",
  name: "CAD Upload plików",

  async mount(container: HTMLElement, ctx: ViewContext) {
    try {
      const response = await fetch("categories/cad-upload.html");
      if (!response.ok) throw new Error("Failed to load template");
      container.innerHTML = await response.text();
      this.initLogic(container, ctx);
    } catch (err) {
      container.innerHTML = `<div class="error">Błąd ładowania: ${err}</div>`;
    }
  },

  initLogic(container: HTMLElement, ctx: ViewContext) {
    const dropZone = container.querySelector<HTMLElement>("#cadDropZone");
    if (!dropZone) return;

    const fileInput = container.querySelector<HTMLInputElement>("#cadFileInput")!;
    const fileListEl = container.querySelector<HTMLElement>("#cadFileList")!;
    const summaryEl = container.querySelector<HTMLElement>("#cadSummary")!;
    const fileCountEl = container.querySelector<HTMLElement>("#cadFileCount")!;
    const totalEl = container.querySelector<HTMLElement>("#cadTotal")!;
    const warningEl = container.querySelector<HTMLElement>("#cadWarning")!;
    const przeliczBtn = container.querySelector<HTMLButtonElement>("#cadPrzelicz")!;
    const tableBody = container.querySelector<HTMLElement>("#cadTableBody");
    const grandTotalEl = container.querySelector<HTMLElement>("#grandTotal");
    const modeEl = container.querySelector<HTMLSelectElement>("#cadMode");

    let nextId = 1;
    let files: FileEntry[] = [];

    function getMode(): 'bw' | 'color' {
      return modeEl?.value === 'bw' ? 'bw' : 'color';
    }

    function detectImageDimensions(file: File, entry: FileEntry): void {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        entry.widthPx = img.naturalWidth;
        entry.heightPx = img.naturalHeight;
        entry.widthMm = Math.round(img.naturalWidth * PX_TO_MM);
        entry.heightMm = Math.round(img.naturalHeight * PX_TO_MM);
        renderFileList();
      };
      img.onerror = () => URL.revokeObjectURL(url);
      img.src = url;
    }

    // ── Drop zone events ──────────────────────────────────────────────────────
    dropZone.addEventListener("click", () => fileInput.click());
    dropZone.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") fileInput.click();
    });
    dropZone.addEventListener("dragenter", (e) => {
      e.preventDefault();
      dropZone.classList.add("drag-over");
    });
    dropZone.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropZone.classList.add("drag-over");
    });
    dropZone.addEventListener("dragleave", (e) => {
      if (!dropZone.contains(e.relatedTarget as Node)) {
        dropZone.classList.remove("drag-over");
      }
    });
    dropZone.addEventListener("drop", (e) => {
      e.preventDefault();
      dropZone.classList.remove("drag-over");
      if (e.dataTransfer?.files) addFiles(e.dataTransfer.files);
    });

    fileInput.addEventListener("change", (e) => {
      const input = e.target as HTMLInputElement;
      if (input.files) addFiles(input.files);
      input.value = "";
    });

    // Mode change recalculates prices
    modeEl?.addEventListener("change", () => renderFileList());

    // Przelicz button re-dispatches the current total
    przeliczBtn?.addEventListener("click", () => updateSummary());

    // ── Event delegation for file list ────────────────────────────────────────
    const debouncedUpdate = debounce(updateSummary, 300);

    fileListEl.addEventListener("click", (e) => {
      const btn = (e.target as HTMLElement).closest<HTMLElement>("[data-delete]");
      if (btn?.dataset.delete) deleteFile(Number(btn.dataset.delete));
    });

    fileListEl.addEventListener("input", (e) => {
      const input = (e.target as HTMLElement).closest<HTMLInputElement>(".cad-qty-input");
      if (!input) return;
      const entry = files.find((f) => String(f.id) === input.dataset.qtyid);
      if (!entry) return;
      const parsed = parseInt(input.value, 10);
      if (isNaN(parsed) || parsed < 1) {
        input.value = String(entry.qty);
        return;
      }
      entry.qty = Math.min(999, parsed);
      const mode = getMode();
      const price = (entry.widthMm > 0 && entry.heightMm > 0)
        ? calculatePriceFromDimensions(entry.widthMm, entry.heightMm, mode, entry.qty)
        : 0;
      const row = input.closest<HTMLElement>(".cad-file-item");
      const priceEl = row?.querySelector<HTMLElement>(".cad-file-price");
      if (priceEl) priceEl.textContent = price > 0 ? formatPLN(price) : "—";
      debouncedUpdate();
    });

    // ── File management ───────────────────────────────────────────────────────
    function addFiles(fileList: FileList): void {
      for (const f of Array.from(fileList)) {
        const entry: FileEntry = {
          id: nextId++,
          name: f.name,
          sizeMB: (f.size / (1024 * 1024)).toFixed(2),
          qty: 1,
          widthPx: 0,
          heightPx: 0,
          widthMm: 0,
          heightMm: 0,
        };
        files.push(entry);
        if (f.type.startsWith("image/")) {
          detectImageDimensions(f, entry);
        }
      }
      if (warningEl) warningEl.style.display = files.length > MAX_FILES_SOFT ? "" : "none";
      renderFileList();
    }

    function deleteFile(id: number): void {
      files = files.filter((f) => f.id !== id);
      if (warningEl) warningEl.style.display = files.length > MAX_FILES_SOFT ? "" : "none";
      renderFileList();
    }

    // ── Rendering ─────────────────────────────────────────────────────────────
    function renderFileList(): void {
      if (files.length === 0) {
        fileListEl.innerHTML = "";
        if (summaryEl) summaryEl.style.display = "none";
        if (tableBody) tableBody.innerHTML = "";
        if (grandTotalEl) grandTotalEl.textContent = "0,00 zł";
        return;
      }
      if (summaryEl) summaryEl.style.display = "";

      const mode = getMode();
      fileListEl.innerHTML = files
        .map((f) => {
          const fmt = (f.widthMm > 0 && f.heightMm > 0)
            ? detectFormatFromDimensions(f.widthMm, f.heightMm)
            : "";
          const dimsLabel = (f.widthMm > 0 && f.heightMm > 0)
            ? `${f.widthPx}×${f.heightPx} px / ${f.widthMm}×${f.heightMm} mm`
            : (f.widthPx === 0 && f.name.match(/\.(jpg|jpeg|png|tif|tiff)$/i) ? "⏳ wykrywanie…" : "—");
          const price = (f.widthMm > 0 && f.heightMm > 0)
            ? calculatePriceFromDimensions(f.widthMm, f.heightMm, mode, f.qty)
            : 0;
          return `
        <div class="cad-file-item" data-fileid="${f.id}">
          <button class="cad-delete-x" data-delete="${f.id}"
                  aria-label="Usuń ${escHtml(f.name)}" title="Usuń plik">✕</button>
          <span class="cad-file-name" title="${escHtml(f.name)}">${escHtml(f.name)}</span>
          <span class="cad-file-size">${f.sizeMB} MB</span>
          <span style="color:var(--text-secondary,#666);font-size:0.85rem;white-space:nowrap">${escHtml(dimsLabel)}</span>
          ${fmt ? `<span class="cad-format-badge">${escHtml(fmt)}</span>` : ""}
          <label class="cad-qty-label">
            Kop.:
            <input type="number" class="cad-qty-input" data-qtyid="${f.id}"
                   value="${f.qty}" min="1" max="999"
                   aria-label="Ilość kopii dla ${escHtml(f.name)}" />
          </label>
          <span class="cad-file-price">${price > 0 ? formatPLN(price) : "—"}</span>
        </div>
      `;
        })
        .join("");

      updateSummary();
    }

    // ── Price calculation & cart update ───────────────────────────────────────
    function updateSummary(): void {
      const mode = getMode();
      let total = 0;
      const rows: string[] = [];

      for (const f of files) {
        const price = (f.widthMm > 0 && f.heightMm > 0)
          ? calculatePriceFromDimensions(f.widthMm, f.heightMm, mode, f.qty)
          : 0;
        total += price;
        const fmt = (f.widthMm > 0 && f.heightMm > 0)
          ? detectFormatFromDimensions(f.widthMm, f.heightMm)
          : "—";
        const rozmiar = (f.widthMm > 0 && f.heightMm > 0)
          ? `${fmt} (${f.widthMm}×${f.heightMm} mm)`
          : "—";
        rows.push(`
          <tr>
            <td>${escHtml(f.name)}<br><small style="color:var(--text-secondary,#666)">${rozmiar}</small></td>
            <td>${price > 0 ? formatPLN(price) : "—"}</td>
            <td>—</td>
            <td>—</td>
            <td><strong>${price > 0 ? formatPLN(price) : "—"}</strong></td>
          </tr>
        `);
      }

      if (tableBody) {
        tableBody.innerHTML = rows.length > 0
          ? rows.join("")
          : '<tr><td colspan="5" style="text-align:center;color:var(--text-secondary,#666)">Brak plików</td></tr>';
      }
      if (grandTotalEl) grandTotalEl.textContent = formatPLN(total);
      if (totalEl) totalEl.textContent = formatPLN(total);

      const n = files.length;
      if (fileCountEl) fileCountEl.textContent = String(n);

      if (n > 0) {
        ctx.updateLastCalculated(total, "CAD Upload");
        ctx.cart.addItem({
          id: "cad-upload",
          category: "CAD Upload",
          name: `${n} plik${n === 1 ? "" : n < 5 ? "i" : "ów"}`,
          quantity: n,
          unit: "szt",
          unitPrice: total / n,
          totalPrice: total,
          optionsHint: `${n} plików, tryb: ${mode === 'color' ? 'kolor' : 'czarno-białe'}`,
          payload: { files: files.map((f) => ({ name: f.name, qty: f.qty, widthMm: f.widthMm, heightMm: f.heightMm })), totalPrice: total },
        });
      }
    }
  },
};
