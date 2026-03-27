import { View, ViewContext } from "../types";
import {
  detectFormatFromDimensions,
  updateCadFileEntry,
  CadUploadFileEntry,
} from "../../categories/cad-upload";
import { formatPLN } from "../../core/money";
import { CAD_PRICE } from "../../core/compat";

const MAX_CAD_FILES = 50;
const CAD_UPLOAD_CONCURRENCY = 4;

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
    const foldAllCheck = container.querySelector<HTMLInputElement>("#foldAllCheck");
    const scanAllCheck = container.querySelector<HTMLInputElement>("#scanAllCheck");
    const warningEl = container.querySelector<HTMLElement>("#cadWarning");
    const statusEl = container.querySelector<HTMLElement>("#cadUploadStatus");
    const calculationsList = container.querySelector<HTMLElement>("#obliczeniaLista");

    if (!dropZone || !fileInput || !tableBody) {
      console.error("❌ CAD Upload: Missing required elements");
      return;
    }

    // State
    let files: CadUploadFileEntry[] = [];
    let isColor = (modeSelect?.value || "color") === "color";
    let dpi = 300;
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
      if (fmt === "A1p") return "A1+";
      if (fmt === "R1067") return "Rolka 1067";
      return fmt;
    }

    function wrapFileName(name: string, chunkSize = 10): string {
      const chunks: string[] = [];
      for (let i = 0; i < name.length; i += chunkSize) {
        chunks.push(escapeHtml(name.slice(i, i + chunkSize)));
      }
      return chunks.join("<wbr>");
    }

    function calcSurchargeMultiplier(): number {
      let m = 1;
      if (optFill?.checked) m += 0.5;
      if (optScale?.checked) m += 0.5;
      return m;
    }

    function showStatus(message: string, isWarning = false): void {
      if (!statusEl) return;
      statusEl.textContent = message;
      statusEl.style.display = message ? "block" : "none";
      statusEl.style.background = isWarning ? "#fff3cd" : "#e8f5e9";
      statusEl.style.border = isWarning ? "2px solid #ffc107" : "2px solid #4caf50";
      statusEl.style.color = isWarning ? "#856404" : "#1b5e20";
    }

    function syncSequentialIds(): void {
      files = files.map((file, index) => ({ ...file, id: index + 1 }));
    }

    function getAllowedFiles(fileList: FileList): File[] {
      const remainingSlots = Math.max(0, MAX_CAD_FILES - files.length);
      if (warningEl) {
        warningEl.style.display = files.length >= MAX_CAD_FILES ? "block" : "none";
      }

      if (remainingSlots <= 0) {
        showStatus(`Można dodać maksymalnie ${MAX_CAD_FILES} plików.`, true);
        return [];
      }

      const incoming = Array.from(fileList);
      const accepted = incoming.slice(0, remainingSlots);
      const skipped = incoming.length - accepted.length;

      if (skipped > 0) {
        showStatus(`Dodano ${accepted.length} plików. Pominięto ${skipped} (limit ${MAX_CAD_FILES}).`, true);
      } else {
        showStatus("");
      }

      return accepted;
    }

    async function mapWithConcurrency<T, U>(
      items: T[],
      concurrency: number,
      worker: (item: T, index: number) => Promise<U>
    ): Promise<U[]> {
      if (items.length === 0) return [];
      const results: U[] = new Array(items.length);
      let nextIndex = 0;

      const runWorker = async () => {
        while (nextIndex < items.length) {
          const current = nextIndex++;
          results[current] = await worker(items[current], current);
        }
      };

      const workers = Array.from(
        { length: Math.min(concurrency, items.length) },
        () => runWorker()
      );

      await Promise.all(workers);
      return results;
    }

    function calculateVariantPrint(file: CadUploadFileEntry, mode: "color" | "bw"): number {
      if (file.isFormatowy) {
        return (CAD_PRICE[mode]?.formatowe?.[file.format] || 0) * file.pageCount;
      }

      const mbPrice = CAD_PRICE[mode]?.mb?.[file.format];
      if (typeof mbPrice === "number" && mbPrice > 0) {
        const lengthMeters = Math.max(file.widthMm, file.heightMm) / 1000;
        return lengthMeters * mbPrice * file.pageCount;
      }

      // Fallback zgodny z legacy
      const longerSideCm = Math.max(file.widthMm, file.heightMm) / 10;
      return longerSideCm * 0.08 * file.pageCount;
    }

    function calculateRowTotal(file: CadUploadFileEntry, mode: "color" | "bw", surcharge: number): number {
      const print = calculateVariantPrint(file, mode) * surcharge;
      return print + file.foldingPrice + file.scanPrice;
    }

    function renderCalculations(): void {
      if (!calculationsList) return;

      if (files.length === 0) {
        calculationsList.innerHTML = `
          <div class="obliczenie-item">
            <strong>Brak plików</strong>
            <div class="obliczenie-text">Dodaj pliki, aby zobaczyć szczegóły kalkulacji.</div>
          </div>
        `;
        return;
      }

      const surcharge = calcSurchargeMultiplier();
      const surchargePct = Math.round((surcharge - 1) * 100);

      calculationsList.innerHTML = files
        .map((file) => {
          const lengthMeters = Math.max(file.widthMm, file.heightMm) / 1000;
          const isMb = !file.isFormatowy;

          const colorUnit = file.isFormatowy
            ? (CAD_PRICE.color?.formatowe?.[file.format] || 0)
            : (CAD_PRICE.color?.mb?.[file.format] || 0);
          const bwUnit = file.isFormatowy
            ? (CAD_PRICE.bw?.formatowe?.[file.format] || 0)
            : (CAD_PRICE.bw?.mb?.[file.format] || 0);

          const colorPrintBase = calculateVariantPrint(file, "color");
          const bwPrintBase = calculateVariantPrint(file, "bw");
          const colorPrintAfterSurcharge = colorPrintBase * surcharge;
          const bwPrintAfterSurcharge = bwPrintBase * surcharge;

          const rowColor = colorPrintAfterSurcharge + file.foldingPrice + file.scanPrice;
          const rowBw = bwPrintAfterSurcharge + file.foldingPrice + file.scanPrice;

          const methodText = isMb
            ? `MB: ${lengthMeters.toFixed(3)} m × stawka × ${file.pageCount} str.`
            : `Formatowe: stawka × ${file.pageCount} str.`;

          const surchargeText = surchargePct > 0
            ? `, dopłata opcji +${surchargePct}%`
            : "";

          return `
            <div class="obliczenie-item">
              <strong>${file.id}. ${escapeHtml(file.name)}</strong>
              <div class="obliczenie-text">
                Format: ${escapeHtml(formatLabel(file.format))} (${Math.round(file.widthMm)}mm×${Math.round(file.heightMm)}mm), ${file.pageCount} str.<br/>
                Metoda: ${methodText}${surchargeText}
              </div>
              <div class="obliczenie-text">
                🎨 Kolor: ${isMb ? `${lengthMeters.toFixed(3)} × ${colorUnit.toFixed(2)} × ${file.pageCount}` : `${colorUnit.toFixed(2)} × ${file.pageCount}`} = ${formatPLN(colorPrintBase)} → po opcjach ${formatPLN(colorPrintAfterSurcharge)}
              </div>
              <div class="obliczenie-text">
                ⚫ Czarny: ${isMb ? `${lengthMeters.toFixed(3)} × ${bwUnit.toFixed(2)} × ${file.pageCount}` : `${bwUnit.toFixed(2)} × ${file.pageCount}`} = ${formatPLN(bwPrintBase)} → po opcjach ${formatPLN(bwPrintAfterSurcharge)}
              </div>
              <div class="obliczenie-text">
                Dodatki: składanie ${formatPLN(file.foldingPrice)}, skan ${formatPLN(file.scanPrice)}
              </div>
              <div class="obliczenie-cena">
                🎨 ${formatPLN(rowColor)} &nbsp;|&nbsp; ⚫ ${formatPLN(rowBw)}
              </div>
            </div>
          `;
        })
        .join("");
    }

    function formatSizeLabel(file: CadUploadFileEntry): string {
      const w = Number.isFinite(file.widthMm) ? Math.round(file.widthMm) : 0;
      const h = Number.isFinite(file.heightMm) ? Math.round(file.heightMm) : 0;
      const pages = Math.max(1, file.pageCount || 1);
      return `${formatLabel(file.format)}|${w}mm×${h}mm|${pages}`;
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
          pageCount: file.pageCount,
          mode: getMode(),
          folding: file.folding,
          scanning: file.scanning,
        },
        getMode()
      );
    }

    function syncHeaderChecks(): void {
      const foldCount = files.filter((file) => file.folding).length;
      const scanCount = files.filter((file) => file.scanning).length;
      const hasFiles = files.length > 0;

      if (foldAllCheck) {
        foldAllCheck.disabled = !hasFiles;
        foldAllCheck.checked = hasFiles && foldCount === files.length;
        foldAllCheck.indeterminate = hasFiles && foldCount > 0 && foldCount < files.length;
      }

      if (scanAllCheck) {
        scanAllCheck.disabled = !hasFiles;
        scanAllCheck.checked = hasFiles && scanCount === files.length;
        scanAllCheck.indeterminate = hasFiles && scanCount > 0 && scanCount < files.length;
      }
    }

    function renderFiles(): void {
      if (!tableBody) return;

      if (files.length === 0) {
        tableBody.innerHTML = "";
        if (summaryPanel) summaryPanel.style.display = "none";
        if (resultsContainer) resultsContainer.style.display = "none";
        syncHeaderChecks();
        return;
      }

      if (resultsContainer) resultsContainer.style.display = "block";
      const surcharge = calcSurchargeMultiplier();
      tableBody.innerHTML = files
        .map((file) => {
          const rowColor = calculateRowTotal(file, "color", surcharge);
          const rowBw = calculateRowTotal(file, "bw", surcharge);
          const [paperFormat, dims, pagesRaw] = formatSizeLabel(file).split("|");
          const pages = Number(pagesRaw || "1");

          return `
        <tr data-file-id="${file.id}">
          <td class="col-lp">${file.id}</td>
          <td class="col-name" style="word-break: break-word; overflow-wrap: anywhere; white-space: normal;">
            <strong>${escapeHtml(file.name)}</strong>
          </td>
          <td class="col-size">
            <div class="cad-size-main">${escapeHtml(paperFormat || "—")}</div>
            <div class="cad-size-dims">${escapeHtml(dims || "0mm×0mm")}</div>
            <div class="cad-size-pages">Ilość stron: ${Number.isFinite(pages) ? pages : 1}</div>
          </td>
          <td class="col-fold">
            <input type="checkbox" class="fold-check" data-action="fold" ${file.folding ? "checked" : ""} />
          </td>
          <td class="col-scan">
            <input type="checkbox" class="scan-check" data-action="scan" ${file.scanning ? "checked" : ""} />
          </td>
          <td class="col-price">
            <div class="cad-price-cell">
              <div class="cad-price-line"><span>🎨 Kolor</span><strong>${formatPLN(rowColor)}</strong></div>
              <div class="cad-price-line"><span>⚫ Cz-B</span><strong>${formatPLN(rowBw)}</strong></div>
            </div>
          </td>
          <td class="col-remove">
            <button type="button" class="cad-delete-x" data-action="delete" aria-label="Usuń plik">×</button>
          </td>
        </tr>
      `;
        })
        .join("");

      renderSummary();
      renderCalculations();
      syncHeaderChecks();
    }

    function renderSummary(): void {
      const surcharge = calcSurchargeMultiplier();
      
      let totalPrintColorVariant = 0;
      let totalFoldingColorVariant = 0;
      let totalScanColorVariant = 0;
      
      for (const file of files) {
        totalPrintColorVariant += calculateVariantPrint(file, "color");
        totalFoldingColorVariant += file.foldingPrice;
        totalScanColorVariant += file.scanPrice;
      }
      totalPrintColorVariant *= surcharge;
      
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
      
      grandTotalColorVariant = totalPrintColorVariant + totalFoldingColorVariant + totalScanColorVariant + emailFee;
      grandTotalBwVariant = totalPrintBwVariant + totalFoldingBwVariant + totalScanBwVariant + emailFee;

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
      
      if (selectColorBtn) selectColorBtn.style.display = files.length > 0 ? '' : 'none';
      if (selectBwBtn) selectBwBtn.style.display = files.length > 0 ? '' : 'none';

      if (summaryGrid) {
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
      }

      if (grandTotal) {
        grandTotal.textContent = formatPLN(getMode() === "color" ? grandTotalColorVariant : grandTotalBwVariant);
      }

      if (summaryPanel) {
        summaryPanel.style.display = files.length > 0 ? "block" : "none";
      }
    }

    async function addFiles(fileList: FileList): Promise<void> {
      const acceptedFiles = getAllowedFiles(fileList);
      if (acceptedFiles.length === 0) {
        return;
      }

      showStatus(`Przetwarzanie ${acceptedFiles.length} plików...`);

      const newFiles = await mapWithConcurrency(
        acceptedFiles,
        CAD_UPLOAD_CONCURRENCY,
        async (file, index) => {
          const entry = await updateCadFileEntry(file, isColor);
          showStatus(`Przetwarzanie: ${index + 1}/${acceptedFiles.length}`);
          return entry;
        }
      );

      const validFiles = newFiles
        .filter((file) => !!file && file.pageCount > 0)
        .map((file) => ({ ...file, mode: getMode() }));

      files.push(...validFiles);
      syncSequentialIds();

      if (warningEl) {
        warningEl.style.display = files.length > MAX_CAD_FILES ? "block" : "none";
      }

      showStatus(`Dodano ${validFiles.length} plików. Łącznie: ${files.length}/${MAX_CAD_FILES}.`);
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
        e.preventDefault();
        dropZone.classList.remove("drag-over");
        const dropped = e.dataTransfer?.files;
        if (dropped && dropped.length > 0) {
          void addFiles(dropped);
        }
      });
    }

    fileInput.addEventListener("change", (e) => {
      const targetFiles = (e.target as HTMLInputElement).files;
      if (targetFiles && targetFiles.length > 0) {
        void addFiles(targetFiles);
      }
      (e.target as HTMLInputElement).value = "";
    });

    // Event delegation dla dużej liczby rekordów
    tableBody.addEventListener("change", (event) => {
      const target = event.target as HTMLInputElement;
      const row = target.closest("tr[data-file-id]") as HTMLElement | null;
      if (!row) return;

      const id = Number(row.dataset.fileId || "0");
      const index = files.findIndex((f) => f.id === id);
      if (index < 0) return;

      if (target.dataset.action === "fold") {
        files[index].folding = target.checked;
        files[index] = recalculateFile(files[index]);
        renderFiles();
      }

      if (target.dataset.action === "scan") {
        files[index].scanning = target.checked;
        files[index] = recalculateFile(files[index]);
        renderFiles();
      }
    });

    tableBody.addEventListener("click", (event) => {
      const target = event.target as HTMLElement;
      if (target.dataset.action !== "delete") return;

      const row = target.closest("tr[data-file-id]") as HTMLElement | null;
      if (!row) return;

      const id = Number(row.dataset.fileId || "0");
      files = files.filter((f) => f.id !== id);
      syncSequentialIds();
      renderFiles();
    });

    foldAllCheck?.addEventListener("change", () => {
      const checked = foldAllCheck.checked;
      files = files.map((file) => recalculateFile({ ...file, folding: checked }));
      renderFiles();
    });

    scanAllCheck?.addEventListener("change", () => {
      const checked = scanAllCheck.checked;
      files = files.map((file) => recalculateFile({ ...file, scanning: checked }));
      renderFiles();
    });

    if (modeSelect) {
      modeSelect.addEventListener("change", (e) => {
        isColor = ((e.target as HTMLSelectElement).value || "color") === "color";
        colorSwitch?.classList.toggle("active", isColor);
        files = files.map(recalculateFile);
        renderFiles();
      });
    }

    if (colorToggle) {
      colorToggle.addEventListener("click", () => {
        isColor = !isColor;
        colorSwitch?.classList.toggle("active", isColor);
        if (modeSelect) {
          modeSelect.value = isColor ? "color" : "bw";
        }
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
          const fmt = detectFormatFromDimensions(f.widthMm, f.heightMm, true);
          f.format = fmt.format;
          f.isFormatowy = fmt.isFormatowy;
          f.isStandardWidth = fmt.isStandardWidth;
          f.mode = getMode();
          return recalculateFile(f);
        });
        renderFiles();
      });
    }

    // Add to cart buttons (Color and BW)
    const selectColorBtn = container.querySelector<HTMLButtonElement>("#selectColor");
    const selectBwBtn = container.querySelector<HTMLButtonElement>("#selectBw");
    const submitBtn = container.querySelector<HTMLButtonElement>("#submitBtn");
    
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

        const snapshotFiles = files.map((f) => ({ ...f }));

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
          payload: { files: snapshotFiles, mode, price: grandTotalPrice }
        });

        ctx.updateLastCalculated(grandTotalPrice, "CAD Upload");
      });
    };
    
    handleCartButton(selectColorBtn, 'color');
    handleCartButton(selectBwBtn, 'bw');

    if (submitBtn) {
      submitBtn.addEventListener("click", () => {
        if (files.length === 0) {
          alert("Nie dodano żadnych plików do wyceny");
          return;
        }

        const selectedMode = (modeSelect?.value || (isColor ? "color" : "bw")) as "color" | "bw";
        if (selectedMode === "color") {
          selectColorBtn?.click();
        } else {
          selectBwBtn?.click();
        }
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
