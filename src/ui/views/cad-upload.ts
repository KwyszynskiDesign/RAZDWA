import { View, ViewContext } from "../types";
import {
  detectFormatFromDimensions,
  updateCadFileEntry,
  CadUploadFileEntry,
} from "../../categories/cad-upload";
import { formatPLN } from "../../core/money";
import { CAD_PRICE } from "../../core/compat";

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

    if (!dropZone || !fileInput || !tableBody) {
      console.error("❌ CAD Upload: Missing required elements");
      return;
    }

    // State
    let files: CadUploadFileEntry[] = [];
    let isColor = (modeSelect?.value || "color") === "color";
    let dpi = 300;
    let nextId = 1;
    let grandTotalColorVariant = 0;
    let grandTotalBwVariant = 0;

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
      console.log("🟢 renderFiles called, files count:", files.length);
      
      if (!tableBody) return;

      if (files.length === 0) {
        tableBody.innerHTML = "";
        if (summaryPanel) summaryPanel.style.display = "none";
        if (resultsContainer) resultsContainer.style.display = "none";
        return;
      }

      if (resultsContainer) resultsContainer.style.display = "block";

      console.log("🟢 Rendering files to table");
      tableBody.innerHTML = files
        .map((file) => {
          const surcharge = calcSurchargeMultiplier();
          const adjustedPrint = file.printPrice * surcharge;
          const pricePerPage = file.pageCount > 0 ? adjustedPrint / file.pageCount : adjustedPrint;
          const rowTotal = adjustedPrint + file.foldingPrice + file.scanPrice;
          console.log(`🟢 File ${file.name}: printPrice=${file.printPrice}, adjusted=${adjustedPrint}, total=${rowTotal}`);
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
          <td>${file.mode === "color" ? "🎨 Kolor" : "⚫ Cz-B"}</td>
          <td><strong>${formatLabel(file.format)} / ${file.pageCount}</strong></td>
          <td>${file.widthMm?.toFixed(0) || "—"} × ${file.heightMm?.toFixed(0) || "—"} mm</td>
          <td>${pricePerPage.toFixed(2)} zł</td>
          <td><strong>${rowTotal.toFixed(2)} zł</strong></td>
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
      
      // Obliczamy dwa warianty cenowe dla WSZYSTKICH plików:
      // 1. Jakby wszystko było kolorowe
      // 2. Jakby wszystko było czarno-białe
      
      // Wariant 1: wszystkie pliki jako KOLOR
      let totalPrintColorVariant = 0;
      let totalFoldingColorVariant = 0;
      let totalScanColorVariant = 0;

      const calculateVariantPrint = (file: CadUploadFileEntry, mode: "color" | "bw"): number => {
        if (file.isFormatowy) {
          return (CAD_PRICE[mode]?.formatowe?.[file.format] || 0) * file.pageCount;
        }

        const mbPrice = CAD_PRICE[mode]?.mb?.[file.format];
        if (typeof mbPrice === "number" && mbPrice > 0) {
          const lengthMeters = Math.max(file.widthMm, file.heightMm) / 1000;
          return lengthMeters * mbPrice * file.pageCount;
        }

        // Fallback zgodny z dotychczasową logiką (cm * 0.08)
        const longerSideCm = Math.max(file.widthMm, file.heightMm) / 10;
        return longerSideCm * 0.08 * file.pageCount;
      };
      
      for (const file of files) {
        totalPrintColorVariant += calculateVariantPrint(file, "color");
        totalFoldingColorVariant += file.foldingPrice;
        totalScanColorVariant += file.scanPrice;
      }
      totalPrintColorVariant *= surcharge;
      
      // Wariant 2: wszystkie pliki jako CZARNO-BIAŁE
      let totalPrintBwVariant = 0;
      let totalFoldingBwVariant = 0;
      let totalScanBwVariant = 0;
      
      for (const file of files) {
        totalPrintBwVariant += calculateVariantPrint(file, "bw");
        totalFoldingBwVariant += file.foldingPrice;
        totalScanBwVariant += file.scanPrice;
      }
      totalPrintBwVariant *= surcharge;
      
      const emailFee = optEmail?.checked ? 1 : 0;
      
      // Zapisz do zmiennych globalnych dla event listenerów
      grandTotalColorVariant = totalPrintColorVariant + totalFoldingColorVariant + totalScanColorVariant + emailFee;
      grandTotalBwVariant = totalPrintBwVariant + totalFoldingBwVariant + totalScanBwVariant + emailFee;
      const grandTotalPrice = grandTotalColorVariant + grandTotalBwVariant;

      const totalColorEl = container.querySelector<HTMLElement>("#results-total-color");
      const totalBwEl = container.querySelector<HTMLElement>("#results-total-bw");
      
      if (totalColorEl) {
        totalColorEl.textContent = formatPLN(grandTotalColorVariant);
        const colorRow = totalColorEl.closest('tr') as HTMLElement;
        if (colorRow) colorRow.style.display = files.length > 0 ? '' : 'none';
      }
      if (totalBwEl) {
        totalBwEl.textContent = formatPLN(grandTotalBwVariant);
        const bwRow = totalBwEl.closest('tr') as HTMLElement;
        if (bwRow) bwRow.style.display = files.length > 0 ? '' : 'none';
      }

      const selectColorPrice = container.querySelector<HTMLElement>("#selectColorPrice");
      const selectBwPrice = container.querySelector<HTMLElement>("#selectBwPrice");
      const selectColorBtn = container.querySelector<HTMLButtonElement>("#selectColor");
      const selectBwBtn = container.querySelector<HTMLButtonElement>("#selectBw");
      
      if (selectColorPrice) selectColorPrice.textContent = formatPLN(grandTotalColorVariant);
      if (selectBwPrice) selectBwPrice.textContent = formatPLN(grandTotalBwVariant);
      
      // Zawsze pokazuj obie opcje jeśli są jakieś pliki
      if (selectColorBtn) selectColorBtn.style.display = files.length > 0 ? '' : 'none';
      if (selectBwBtn) selectBwBtn.style.display = files.length > 0 ? '' : 'none';

      summaryGrid.innerHTML = `
        ${files.length > 0 ? `
        <div class="summary-item">
          <span>⚫ Czarno-biały (${files.length} plik${files.length !== 1 ? 'i/ów' : ''}):</span>
          <span><strong>${formatPLN(totalPrintBwVariant)}</strong></span>
        </div>
        <div class="summary-item">
          <span>🎨 Kolor (${files.length} plik${files.length !== 1 ? 'i/ów' : ''}):</span>
          <span><strong>${formatPLN(totalPrintColorVariant)}</strong></span>
        </div>` : ''}
        ${totalFoldingColorVariant > 0 ? `
        <div class="summary-item">
          <span>Składanie:</span>
          <span>${formatPLN(totalFoldingColorVariant)}</span>
        </div>` : ''}
        ${totalScanColorVariant > 0 ? `
        <div class="summary-item">
          <span>Skanowanie:</span>
          <span>${formatPLN(totalScanColorVariant)}</span>
        </div>` : ''}
        ${emailFee > 0 ? `
        <div class="summary-item">
          <span>Email:</span>
          <span>${formatPLN(emailFee)}</span>
        </div>` : ''}
        <div class="summary-item" style="border-top: 2px solid #e0e0e0; margin-top: 8px; padding-top: 8px;">
          <span><strong>🎨 RAZEM KOLOR:</strong></span>
          <span><strong>${formatPLN(grandTotalColorVariant)}</strong></span>
        </div>
        <div class="summary-item">
          <span><strong>⚫ RAZEM CZARNO-BIAŁY:</strong></span>
          <span><strong>${formatPLN(grandTotalBwVariant)}</strong></span>
        </div>
      `;

      if (grandTotal) {
        grandTotal.textContent = formatPLN(grandTotalPrice);
      }

      summaryPanel.style.display = files.length > 0 ? "block" : "none";
    }

    async function addFiles(fileList: FileList): Promise<void> {
      console.log("🔵 CAD UPLOAD: addFiles called with", fileList.length, "plików");
      console.log("🔵 Current isColor mode:", isColor);

      const promises = Array.from(fileList).map(async (file) => {
        console.log("🔵 Processing file:", file.name);
        const fileEntry = await updateCadFileEntry(file, isColor);
        console.log("🔵 File entry result:", fileEntry);
        fileEntry.id = nextId++;
        return fileEntry;
      });

      const newFiles = await Promise.all(promises);
      console.log("🔵 All files processed:", newFiles.length);
      files.push(...newFiles);
      console.log("🔵 Total files in state:", files.length);
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

    // Add to cart buttons (Color and BW)
    const selectColorBtn = container.querySelector<HTMLButtonElement>("#selectColor");
    const selectBwBtn = container.querySelector<HTMLButtonElement>("#selectBw");
    
    const handleCartButton = (btn: HTMLButtonElement | null, mode: 'color' | 'bw') => {
      if (!btn) return;
      
      btn.addEventListener("click", () => {
        if (files.length === 0) {
          alert("Nie dodano żadnych plików do wyceny");
          return;
        }

        const grandTotalPrice = mode === "color" ? grandTotalColorVariant : grandTotalBwVariant;
        const totalFolding = files.reduce((sum, f) => sum + f.foldingPrice, 0);
        const totalScan = files.reduce((sum, f) => sum + f.scanPrice, 0);

        const modeLabel = mode === 'color' ? "KOLOR" : "CZ-B";
        const opts = [
          `${files.length} plik${files.length !== 1 ? "i/ów" : ""}`,
          modeLabel,
          totalFolding > 0 ? "ze składaniem" : "",
          totalScan > 0 ? "ze skanowaniem" : ""
        ].filter(Boolean).join(", ");

        ctx.cart.addItem({
          id: `cad-upload-${mode}-${Date.now()}`,
          category: "CAD Upload",
          name: `Wydruk CAD (${files.length} plik${files.length !== 1 ? "i/ów" : ""}) - ${modeLabel}`,
          quantity: files.length,
          unit: "plik",
          unitPrice: grandTotalPrice / files.length,
          isExpress: ctx.expressMode,
          totalPrice: grandTotalPrice,
          optionsHint: opts,
          payload: { files, mode, price: grandTotalPrice }
        });

        ctx.updateLastCalculated(grandTotalPrice, "CAD Upload");
      });
    };
    
    handleCartButton(selectColorBtn, 'color');
    handleCartButton(selectBwBtn, 'bw');

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
