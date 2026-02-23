import { View, ViewContext } from "../types";
import { PRICE_PER_FILE } from "../../categories/cad-upload";
import { formatPLN } from "../../core/money";

const MAX_FILES_SOFT = 50;

interface FileEntry {
  id: number;
  name: string;
  sizeMB: string;
  qty: number;
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

    let nextId = 1;
    let files: FileEntry[] = [];

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
      const row = input.closest<HTMLElement>(".cad-file-item");
      const priceEl = row?.querySelector<HTMLElement>(".cad-file-price");
      if (priceEl) priceEl.textContent = formatPLN(entry.qty * PRICE_PER_FILE);
      debouncedUpdate();
    });

    // ── File management ───────────────────────────────────────────────────────
    function addFiles(fileList: FileList): void {
      for (const f of Array.from(fileList)) {
        files.push({
          id: nextId++,
          name: f.name,
          sizeMB: (f.size / (1024 * 1024)).toFixed(2),
          qty: 1,
        });
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
        updateSummary();
        return;
      }
      if (summaryEl) summaryEl.style.display = "";

      fileListEl.innerHTML = files
        .map(
          (f) => `
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
          <span class="cad-file-price">${formatPLN(f.qty * PRICE_PER_FILE)}</span>
        </div>
      `
        )
        .join("");

      updateSummary();
    }

    // ── Price calculation & cart update ───────────────────────────────────────
    function updateSummary(): void {
      const total = files.reduce((s, f) => s + f.qty * PRICE_PER_FILE, 0);
      const n = files.length;

      if (totalEl) totalEl.textContent = formatPLN(total);
      if (fileCountEl) fileCountEl.textContent = String(n);

      if (n > 0) {
        ctx.updateLastCalculated(total, "CAD Upload");
        ctx.cart.addItem({
          id: "cad-upload",
          category: "CAD Upload",
          name: `${n} plik${n === 1 ? "" : n < 5 ? "i" : "ów"}`,
          quantity: n,
          unit: "szt",
          unitPrice: PRICE_PER_FILE,
          totalPrice: total,
          optionsHint: `${n} plików × ${formatPLN(PRICE_PER_FILE)}/szt`,
          payload: { files: files.map((f) => ({ name: f.name, qty: f.qty })), totalPrice: total },
        });
      }
    }
  },
};
