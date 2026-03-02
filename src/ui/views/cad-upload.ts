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
    const dropZone = container.querySelector<HTMLElement>("#cadDropZone") ||
                     container.querySelector<HTMLElement>("#uploadZone");
    const fileInput = container.querySelector<HTMLInputElement>("#cadFileInput") ||
                     container.querySelector<HTMLInputElement>("#fileInput");
    const dpiInput = container.querySelector<HTMLInputElement>("#dpiInput");
    const modeSelect = container.querySelector<HTMLSelectElement>("#cadMode");
    const optFill = container.querySelector<HTMLInputElement>("#optZapelnienie");
    const optScale = container.querySelector<HTMLInputElement>("#optPowieksz");
    const optEmail = container.querySelector<HTMLInputElement>("#optEmail");
    const colorToggle = container.querySelector<HTMLElement>("#colorToggle") ||
                       container.querySelector<HTMLElement>("#cadColorToggle");
    const colorSwitch = container.querySelector<HTMLElement>("#colorSwitch");
    const resultsContainer = container.querySelector<HTMLElement>("#results-container");
    const tableBody = container.querySelector<HTMLElement>("#results-body") ||
                     container.querySelector<HTMLElement>("#filesTableBody") ||
                     container.querySelector<HTMLElement>("#cadTableBody");
    const summaryPanel = container.querySelector<HTMLElement>("#summaryPanel") ||
                        container.querySelector<HTMLElement>("#cadSummary");
    const summaryGrid = container.querySelector<HTMLElement>("#summaryGrid");
    const grandTotal = container.querySelector<HTMLElement>("#grandTotal");
    const clearBtn = container.querySelector<HTMLButtonElement>("#clearBtn");
    const addToCartBtn = container.querySelector<HTMLButtonElement>("#cadAddToCart");

    if (!dropZone || !fileInput || !tableBody) {
      console.error("❌ CAD Upload: Missing required elements");
      return;
    }

    // State
    let files: CadUploadFileEntry[] = [];
    let isColor = (modeSelect?.value || "color") === "color";
    let dpi = 300;
    let nextId = 1;

    // Helpers
    function pxToMm(px: number): number {
      return px * (25.4 / dpi);
    }

    function getMode(): 'bw' | 'color' {
      return isColor ? 'color' : 'bw';
    }

    function formatLabel(fmt: string): string {
      if (fmt === "A0p") return "A0+";
      if (fmt === "R1067") return "Rolka 1067";
      return fmt;
    }

    function calcSurchargeMultiplier(): number {
      let m = 1;
      if (optFill?.checked) m += 0.5;
      if (optScale?.checked) m += 0.5;
      return m;
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
        if (resultsContainer) resultsContainer.style.display = "none";
        return;
      }

      if (resultsContainer) resultsContainer.style.display = "block";

      tableBody.innerHTML = files
        .map((file) => {
          const surcharge = calcSurchargeMultiplier();
          const adjustedPrint = file.printPrice * surcharge;
          const rowTotal = adjustedPrint + file.foldingPrice + file.scanPrice;
          return `
        <tr data-file-id="${file.id}">
          <td>${file.id}</td>
          <td>${file.isFormatowy ? "—" : "MB"}</td>
          <td>
            <input type="checkbox" class="scan-check" ${file.scanning ? "checked" : ""} />
          </td>
          <td>
            <input type="checkbox" class="fold-check" ${file.folding ? "checked" : ""} />
          </td>
          <td><strong>${escapeHtml(file.name)}</strong></td>
          <td>${getMode() === "color" ? "Kolor" : "Czarno-biały"}</td>
          <td><strong>${formatLabel(file.format)} / 1</strong></td>
          <td>${file.widthMm?.toFixed(1) || "—"} × ${file.heightMm?.toFixed(1) || "—"}</td>
          <td>${(adjustedPrint || 0).toFixed(2)}</td>
          <td><strong>${(rowTotal || 0).toFixed(2)} zł</strong></td>
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

      const surcharge = calcSurchargeMultiplier();
      const totalPrint = files.reduce((sum, f) => sum + (f.printPrice * surcharge), 0);
      const totalFolding = files.reduce((sum, f) => sum + f.foldingPrice, 0);
      const totalScan = files.reduce((sum, f) => sum + f.scanPrice, 0);
      const emailFee = optEmail?.checked ? 1 : 0;
      const grandTotalPrice = totalPrint + totalFolding + totalScan + emailFee;

      const totalColorEl = container.querySelector<HTMLElement>("#results-total-color");
      const totalBwEl = container.querySelector<HTMLElement>("#results-total-bw");
      if (totalColorEl) totalColorEl.textContent = isColor ? formatPLN(grandTotalPrice) : formatPLN(0);
      if (totalBwEl) totalBwEl.textContent = isColor ? formatPLN(0) : formatPLN(grandTotalPrice);

      const selectColorPrice = container.querySelector<HTMLElement>("#selectColorPrice");
      const selectBwPrice = container.querySelector<HTMLElement>("#selectBwPrice");
      if (selectColorPrice) selectColorPrice.textContent = isColor ? formatPLN(grandTotalPrice) : formatPLN(0);
      if (selectBwPrice) selectBwPrice.textContent = isColor ? formatPLN(0) : formatPLN(grandTotalPrice);

      // Show/hide add to cart button
      if (addToCartBtn) {
        addToCartBtn.style.display = files.length > 0 ? "inline-block" : "none";
      }

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
          <span>Email:</span>
          <span>${formatPLN(emailFee)}</span>
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
      console.log("CAD FILES:", fileList.length, "plików");

      const promises = Array.from(fileList).map(async (file) => {
        console.log("Processing file:", file.name);
        const fileEntry = await updateCadFileEntry(file, isColor);
        fileEntry.id = nextId++;
        return fileEntry;
      });

      const newFiles = await Promise.all(promises);
      files.push(...newFiles);
      renderFiles();
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

    if (modeSelect) {
      modeSelect.addEventListener("change", (e) => {
        isColor = ((e.target as HTMLSelectElement).value || "color") === "color";
        files = files.map(recalculateFile);
        renderFiles();
      });
    }

    [optFill, optScale, optEmail].forEach((el) => {
      el?.addEventListener("change", () => renderFiles());
    });

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

    // Add to cart button
    if (addToCartBtn) {
      addToCartBtn.addEventListener("click", () => {
        if (files.length === 0) {
          alert("Nie dodano żadnych plików do wyceny");
          return;
        }

        const surcharge = calcSurchargeMultiplier();
        const totalPrint = files.reduce((sum, f) => sum + (f.printPrice * surcharge), 0);
        const totalFolding = files.reduce((sum, f) => sum + f.foldingPrice, 0);
        const totalScan = files.reduce((sum, f) => sum + f.scanPrice, 0);
        const emailFee = optEmail?.checked ? 1 : 0;
        const grandTotalPrice = totalPrint + totalFolding + totalScan + emailFee;

        const modeLabel = isColor ? "KOLOR" : "CZ-B";
        const opts = [
          `${files.length} plik${files.length !== 1 ? "i/ów" : ""}`,
          modeLabel,
          totalFolding > 0 ? "ze składaniem" : "",
          totalScan > 0 ? "ze skanowaniem" : ""
        ].filter(Boolean).join(", ");

        ctx.cart.addItem({
          id: `cad-upload-${Date.now()}`,
          category: "CAD Upload",
          name: `Wydruk wielkoformatowy (${files.length} plik${files.length !== 1 ? "i/ów" : ""})`,
          quantity: files.length,
          unit: "plik",
          unitPrice: grandTotalPrice / files.length,
          isExpress: ctx.expressMode,
          totalPrice: grandTotalPrice,
          optionsHint: opts,
          payload: { files, totalPrint, totalFolding, totalScan }
        });

        ctx.updateLastCalculated(grandTotalPrice, "CAD Upload");
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
