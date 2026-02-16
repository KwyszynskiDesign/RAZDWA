import { View, ViewContext } from "../types";
import { calculateDrukCAD } from "../../categories/druk-cad";
import { formatPLN } from "../../core/money";
import categories from "../../../data/categories.json";

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
    const catData = categories.find(c => c.id === "druk-cad") as any;
    if (!catData) return;

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

    const updateUI = () => {
      const format = formatSelect.value;
      const mode = modeSelect.value;
      const baseLen = catData.format_prices[mode][format].length;
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
        const result = calculateDrukCAD(currentOptions, catData);
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
      }
    };
  }
};
