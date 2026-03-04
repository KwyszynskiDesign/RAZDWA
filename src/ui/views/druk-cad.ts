import { View, ViewContext } from "../types";
import { calculateDrukCAD } from "../../categories/druk-cad";
import { quoteCadFold, quoteCadWfScan } from "../../categories/cad-ops";
import { formatPLN } from "../../core/money";
import { getPrice } from "../../services/priceService";

export const DrukCADView: View = {
  id: "druk-cad",
  name: "Druk CAD wielkoformatowy",
  async mount(container, ctx) {
    try {
      const response = await fetch("categories/druk-cad.html");
      if (!response.ok) throw new Error("Failed to load template");
      container.innerHTML = await response.text();

      this.initLogic(container, ctx);
    } catch (err) {
      container.innerHTML = `<div class="error">Błąd ładowania: ${err}</div>`;
    }
  },

  initLogic(container: HTMLElement, ctx: ViewContext) {
    const data = getPrice("drukCAD");
    if (!data?.price || !data?.base) {
      container.innerHTML = `<div class="error">Błąd: brak danych cennika CAD</div>`;
      return;
    }

    const modeSelect = container.querySelector("#cad-mode") as HTMLSelectElement;
    const formatSelect = container.querySelector("#cad-format") as HTMLSelectElement;
    const lengthInput = container.querySelector("#cad-length") as HTMLInputElement;
    const qtySheetsInput = container.querySelector("#qty-sheets") as HTMLInputElement;
    const qtySheetsGroup = container.querySelector("#qty-sheets-group") as HTMLElement;
    const useBaseBtn = container.querySelector("#cad-use-base") as HTMLButtonElement;
    const baseInfo = container.querySelector("#cad-base-info") as HTMLElement;

    const calculateBtn = container.querySelector("#cad-calculate") as HTMLButtonElement;
    const addToCartBtn = container.querySelector("#cad-add-to-cart") as HTMLButtonElement;
    const resultDisplay = container.querySelector("#cad-result-display") as HTMLElement;
    const priceTypeSpan = container.querySelector("#cad-price-type") as HTMLElement;
    const totalPriceSpan = container.querySelector("#cad-total-price") as HTMLElement;
    const expressHint = container.querySelector("#cad-express-hint") as HTMLElement;

    const foldFormatSelect = container.querySelector("#cad-fold-format") as HTMLSelectElement | null;
    const foldQtyInput = container.querySelector("#cad-fold-qty") as HTMLInputElement | null;
    const foldAddBtn = container.querySelector("#cad-fold-add") as HTMLButtonElement | null;
    const wfScanCmInput = container.querySelector("#cad-wf-scan-cm") as HTMLInputElement | null;
    const wfScanQtyInput = container.querySelector("#cad-wf-scan-qty") as HTMLInputElement | null;
    const wfScanAddBtn = container.querySelector("#cad-wf-scan-add") as HTMLButtonElement | null;
    const cadOpsList = container.querySelector("#cad-ops-list") as HTMLElement | null;
    const cadOpsListItems = container.querySelector("#cad-ops-list-items") as HTMLElement | null;
    const cadOpsTotal = container.querySelector("#cad-ops-total") as HTMLElement | null;

    const cadOps: Array<{
      id: string;
      name: string;
      quantity: number;
      unit: string;
      unitPrice: number;
      totalPrice: number;
      optionsHint: string;
      payload: any;
    }> = [];

    const normalizeFoldFormat = (format: string): string => {
      if (format === "A0+") return "A0p";
      if (format === "A3-poprzeczne") return "A3L";
      return format;
    };

    const updateCadOpsSummary = () => {
      if (!cadOpsList || !cadOpsListItems || !cadOpsTotal) return;

      if (cadOps.length === 0) {
        cadOpsList.style.display = "none";
        cadOpsListItems.innerHTML = "";
        cadOpsTotal.innerText = formatPLN(0);
        return;
      }

      const total = cadOps.reduce((sum, op) => sum + op.totalPrice, 0);
      cadOpsList.style.display = "block";
      cadOpsListItems.innerHTML = cadOps
        .map(op => `<div>• ${op.name}: ${formatPLN(op.totalPrice)} (${op.optionsHint})</div>`)
        .join("");
      cadOpsTotal.innerText = formatPLN(total);
    };

    foldAddBtn?.addEventListener("click", () => {
      if (!foldFormatSelect || !foldQtyInput) return;
      const qty = parseInt(foldQtyInput.value, 10);
      if (isNaN(qty) || qty <= 0) return;

      try {
        const formatKey = normalizeFoldFormat(foldFormatSelect.value);
        const result = quoteCadFold({ format: formatKey, qty });
        const labelFmt = foldFormatSelect.value;
        cadOps.push({
          id: `cad-fold-${Date.now()}`,
          name: `Składanie (${labelFmt})`,
          quantity: qty,
          unit: "szt",
          unitPrice: result.unit,
          totalPrice: result.total,
          optionsHint: `${qty} szt.`,
          payload: result
        });
        updateCadOpsSummary();
      } catch (err) {
        alert((err as Error).message);
      }
    });

    wfScanAddBtn?.addEventListener("click", () => {
      if (!wfScanCmInput || !wfScanQtyInput) return;
      const cm = parseFloat(wfScanCmInput.value);
      const qty = parseInt(wfScanQtyInput.value, 10);
      if (isNaN(cm) || cm <= 0 || isNaN(qty) || qty <= 0) return;

      try {
        const mm = Math.round(cm * 10);
        const result = quoteCadWfScan({ lengthMm: mm, qty });
        cadOps.push({
          id: `cad-wf-scan-${Date.now()}`,
          name: "Skanowanie wielkoformatowe",
          quantity: qty,
          unit: "szt",
          unitPrice: result.unitPrice,
          totalPrice: result.total,
          optionsHint: `${qty} szt., ${cm} cm`,
          payload: result
        });
        updateCadOpsSummary();
      } catch (err) {
        alert((err as Error).message);
      }
    });

    const updateUI = () => {
      const format = formatSelect.value;
      const mode = modeSelect.value;
      const baseLen = data.base[format]?.l;
      baseInfo.innerText = `Wymiar bazowy: ${baseLen} mm`;

      const currentLen = parseInt(lengthInput.value) || 0;
      const isFormatowe = Math.abs(currentLen - baseLen) <= 0.5;
      qtySheetsGroup.style.display = isFormatowe ? "grid" : "none";

      return baseLen;
    };

    formatSelect.onchange = updateUI;
    modeSelect.onchange = updateUI;
    lengthInput.oninput = updateUI;

    useBaseBtn.onclick = () => {
      lengthInput.value = updateUI().toString();
      updateUI();
    };

    updateUI();

    let currentResult: any = null;
    let currentOptions: any = null;

    calculateBtn.onclick = () => {
      currentOptions = {
        mode: modeSelect.value,
        format: formatSelect.value,
        lengthMm: parseInt(lengthInput.value) || 0,
        qty: parseInt(qtySheetsInput.value) || 1,
        express: ctx.expressMode
      };

      try {
        const result = calculateDrukCAD(currentOptions, data);
        currentResult = result;

        priceTypeSpan.innerText = result.isMeter ? "Cena metrowa:" : "Cena formatowa:";
        totalPriceSpan.innerText = formatPLN(result.totalPrice);
        if (expressHint) expressHint.style.display = ctx.expressMode ? "block" : "none";
        resultDisplay.style.display = "block";
        addToCartBtn.disabled = false;

        ctx.updateLastCalculated(result.totalPrice, "Druk CAD");
      } catch (err) {
        alert("Błąd: " + (err as Error).message);
      }
    };

    addToCartBtn.onclick = () => {
      if (currentResult && currentOptions) {
        const qtyLabel = currentResult.isMeter ? "" : `${currentOptions.qty} szt, `;
        const opts = [
            `${currentOptions.format} (${currentOptions.mode === 'bw' ? 'CZ-B' : 'KOLOR'})`,
            `${qtyLabel}${currentOptions.lengthMm} mm`,
            ctx.expressMode ? "EXPRESS" : ""
        ].filter(Boolean).join(", ");

        ctx.cart.addItem({
          id: `cad-${Date.now()}`,
          category: "Druk CAD wielkoformatowy",
          name: `${currentOptions.format} ${currentOptions.mode === 'bw' ? 'CZ-B' : 'KOLOR'}`,
          quantity: currentOptions.lengthMm,
          unit: "mm",
          unitPrice: currentResult.basePrice / currentOptions.lengthMm,
          isExpress: ctx.expressMode,
          totalPrice: currentResult.totalPrice,
          optionsHint: opts,
          payload: currentResult
        });

        for (const op of cadOps) {
          ctx.cart.addItem({
            id: `${op.id}-${Date.now()}`,
            category: "CAD",
            name: op.name,
            quantity: op.quantity,
            unit: op.unit,
            unitPrice: op.unitPrice,
            isExpress: false,
            totalPrice: op.totalPrice,
            optionsHint: op.optionsHint,
            payload: op.payload
          });
        }

        if (cadOps.length > 0) {
          cadOps.splice(0, cadOps.length);
          updateCadOpsSummary();
        }
      }
    };
  }
};
