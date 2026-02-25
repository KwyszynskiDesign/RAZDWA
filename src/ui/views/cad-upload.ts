import { View, ViewContext } from "../types";
import {
  detectFormatFromDimensions,
  updateCadFileEntry,
  CadUploadFileEntry,
} from "../../categories/cad-upload";
import { formatPLN } from "../../core/money";

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
    // DOM elements
    const dropZone = container.querySelector<HTMLElement>("#uploadZone");
    const fileInput = container.querySelector<HTMLInputElement>("#cadFileInput") ||
                     container.querySelector<HTMLInputElement>("#fileInput");
    const dpiInput = container.querySelector<HTMLInputElement>("#dpiInput");
    const colorToggle = container.querySelector<HTMLElement>("#colorToggle") ||
                       container.querySelector<HTMLElement>("#cadColorToggle");
    const colorSwitch = container.querySelector<HTMLElement>("#colorSwitch");
    const tableBody = container.querySelector<HTMLElement>("#filesTableBody") ||
                     container.querySelector<HTMLElement>("#cadTableBody");
    const summaryPanel = container.querySelector<HTMLElement>("#summaryPanel") ||
                        container.querySelector<HTMLElement>("#cadSummary");
    const summaryGrid = container.querySelector<HTMLElement>("#summaryGrid");
    const grandTotal = container.querySelector<HTMLElement>("#grandTotal");
    const clearBtn = container.querySelector<HTMLButtonElement>("#clearBtn");

    if (!dropZone || !fileInput || !tableBody) return;

    // State
    let files: CadUploadFileEntry[] = [];
    let isColor = false;
    let dpi = 300;
    let nextId = 1;

    // Helpers
    function pxToMm(px: number): number {
      return px * (25.4 / dpi);
    }

    function getMode(): 'bw' | 'color' {
      return isColor ? 'color' : 'bw';
    }

    function recalculateFile(file: CadUploadFileEntry): CadUploadFileEntry {
      return updateCadFileEntry(
        {
          id: file.id,
          name: file.name,
          widthPx: file.widthPx,
          heightPx: file.heightPx,
          widthMm: pxToMm(file.widthPx),
          heightMm: pxToMm(file.heightPx),
          format: file.format,
          isFormatowy: file.isFormatowy,
          isStandardWidth: file.isStandardWidth,
          folding: file.folding,
          scanning: file.scanning,
        },
        getMode()
      );
    }

    function renderFiles(): void {
      if (!tableBody) return;

      if (files.length === 0) {
        tableBody.innerHTML = "";
        if (summaryPanel) summaryPanel.style.display = "none";
        return;
      }

      tableBody.innerHTML = files
        .map((file) => {
          const row = { ...file, price: file.totalPrice };
          return `
        <tr data-file-id="${file.id}">
          <td><strong>${escapeHtml(file.name)}</strong></td>
          <td>${file.widthPx} × ${file.heightPx}</td>
          <td>${row.widthMm?.toFixed(1) || "—"} × ${row.heightMm?.toFixed(1) || "—"} cm</td>
          <td><strong>${file.format}</strong></td>
          <td>${file.isFormatowy ? "Formatowy" : "Metr-bieżący"}</td>
          <td>
            <input type="checkbox" class="fold-check" ${file.folding ? "checked" : ""} />
          </td>
          <td>
            <input type="checkbox" class="scan-check" ${file.scanning ? "checked" : ""} />
          </td>
          <td><strong>Cena: ${row.price?.toFixed(2) || "0,00"} zł</strong></td>
        </tr>
      `;
        })
        .join("");

      // Attach event listeners
      tableBody.querySelectorAll(".fold-check").forEach((el, idx) => {
        (el as HTMLInputElement).addEventListener("change", (e) => {
          files[idx].folding = (e.target as HTMLInputElement).checked;
          files[idx] = recalculateFile(files[idx]);
          renderFiles();
          renderSummary();
        });
      });

      tableBody.querySelectorAll(".scan-check").forEach((el, idx) => {
        (el as HTMLInputElement).addEventListener("change", (e) => {
          files[idx].scanning = (e.target as HTMLInputElement).checked;
          files[idx] = recalculateFile(files[idx]);
          renderFiles();
          renderSummary();
        });
      });

      renderSummary();
    }

    function renderSummary(): void {
      if (!summaryPanel || !summaryGrid) return;

      const totalPrint = files.reduce((sum, f) => sum + f.printPrice, 0);
      const totalFolding = files.reduce((sum, f) => sum + f.foldingPrice, 0);
      const totalScan = files.reduce((sum, f) => sum + f.scanPrice, 0);
      const grandTotalPrice = totalPrint + totalFolding + totalScan;

      summaryGrid.innerHTML = `
        <div class="summary-item">
          <span>Wydruki (${files.length} plik${files.length !== 1 ? "i/ów" : ""}):</span>
          <span>${formatPLN(totalPrint)}</span>
        </div>
        <div class="summary-item">
          <span>Składanie:</span>
          <span>${formatPLN(totalFolding)}</span>
        </div>
        <div class="summary-item">
          <span>Skanowanie:</span>
          <span>${formatPLN(totalScan)}</span>
        </div>
        <div class="summary-item">
          <span><strong>RAZEM:</strong></span>
          <span><strong>${formatPLN(grandTotalPrice)}</strong></span>
        </div>
      `;

      if (grandTotal) {
        grandTotal.textContent = formatPLN(grandTotalPrice);
      }

      summaryPanel.style.display = files.length > 0 ? "block" : "none";
    }

    async function addFiles(fileList: FileList): Promise<void> {
      console.log("CAD FILES:", fileList);

      for (const file of Array.from(fileList)) {
        console.log("Processing file:", file);

        const fileEntry = await updateCadFileEntry(file);
        fileEntry.id = nextId++;
        files.push(fileEntry);
        renderFiles();
      }
    }

    // Event listeners
    if (dropZone) {
      dropZone.addEventListener("click", () => fileInput.click());

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
        console.log("*** CAD UPLOAD HANDLER FIRED ***", e.dataTransfer?.files?.length || 0);
        e.preventDefault();
        dropZone.classList.remove("drag-over");
        void addFiles(e.dataTransfer!.files);
      });
    }

    fileInput.addEventListener("change", (e) => {
      console.log("*** CAD UPLOAD HANDLER FIRED ***", (e.target as HTMLInputElement).files?.length || 0);
      const targetFiles = (e.target as HTMLInputElement).files;
      void addFiles(targetFiles!);
    });

    // Color mode toggle
    if (colorToggle) {
      colorToggle.addEventListener("click", () => {
        isColor = !isColor;
        colorSwitch?.classList.toggle("active", isColor);
        files = files.map(recalculateFile);
        renderFiles();
      });
    }

    // DPI change
    if (dpiInput) {
      dpiInput.addEventListener("change", (e) => {
        dpi = parseInt((e.target as HTMLInputElement).value) || 300;
        files = files.map((f) => {
          f.widthMm = pxToMm(f.widthPx);
          f.heightMm = pxToMm(f.heightPx);
          const fmt = detectFormatFromDimensions(f.widthMm, f.heightMm);
          f.format = fmt.format;
          f.isFormatowy = fmt.isFormatowy;
          f.isStandardWidth = fmt.isStandardWidth;
          return recalculateFile(f);
        });
        renderFiles();
      });
    }

    // Clear button
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        files = [];
        fileInput.value = "";
        renderFiles();
      });
    }

    // Initial render
    renderFiles();
  },

  unmount() {
    // Cleanup if needed
  },
};

function escapeHtml(str: string): string {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
