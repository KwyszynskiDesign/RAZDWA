import { View, ViewContext } from "../types";
import { quoteWizytowki } from "../../categories/wizytowki-druk-cyfrowy";
import { formatPLN } from "../../core/money";

const VAT = 1.23;
const SATIN_MULTIPLIER = 1.12;

export const WizytowkiView: View = {
  id: "wizytowki-druk-cyfrowy",
  name: "Wizytówki - druk cyfrowy",
  async mount(container, ctx) {
    try {
      const response = await fetch("categories/wizytowki-druk-cyfrowy.html");
      if (!response.ok) throw new Error("Failed to load template");
      container.innerHTML = await response.text();

      this.initLogic(container, ctx);
    } catch (err) {
      container.innerHTML = `<div class="error">Błąd ładowania: ${err}</div>`;
    }
  },

  initLogic(container: HTMLElement, ctx: ViewContext) {
    const familySelect = container.querySelector("#w-family") as HTMLSelectElement;
    const standardOpts = container.querySelector("#standard-options") as HTMLElement;
    const deluxeOpts = container.querySelector("#deluxe-options") as HTMLElement;

    const finishSelect = container.querySelector("#w-finish") as HTMLSelectElement;
    const sizeSelect = container.querySelector("#w-size") as HTMLSelectElement;
    const lamSelect = container.querySelector("#w-lam") as HTMLSelectElement;
    const deluxeOptSelect = container.querySelector("#w-deluxe-opt") as HTMLSelectElement;
    const paperSelect = container.querySelector("#w-paper") as HTMLSelectElement;

    const qtyInput = container.querySelector("#w-qty") as HTMLInputElement;
    const calculateBtn = container.querySelector("#w-calculate") as HTMLButtonElement;
    const addToCartBtn = container.querySelector("#w-add-to-cart") as HTMLButtonElement;
    const resultDisplay = container.querySelector("#w-result-display") as HTMLElement;
    const nettoSpan = container.querySelector("#w-netto-price") as HTMLElement;
    const totalPriceSpan = container.querySelector("#w-total-price") as HTMLElement;
    const billedQtyHint = container.querySelector("#w-billed-qty-hint") as HTMLElement;
    const tierHint = container.querySelector("#w-tier-hint") as HTMLElement;
    const expressHint = container.querySelector("#w-express-hint") as HTMLElement;
    const satinHint = container.querySelector("#w-satin-hint") as HTMLElement;

    familySelect.onchange = () => {
        const isDeluxe = familySelect.value === 'deluxe';
        standardOpts.style.display = isDeluxe ? 'none' : 'block';
        deluxeOpts.style.display = isDeluxe ? 'block' : 'none';
    };

    let currentResult: any = null;
    let currentOptions: any = null;

    calculateBtn.onclick = () => {
      const paperVal = paperSelect.value;
      const isSatin = paperVal.startsWith("satyna");

      currentOptions = {
        family: familySelect.value,
        finish: finishSelect.value,
        format: sizeSelect.value,
        folia: lamSelect.value === 'lam' ? 'matt_gloss' : 'none',
        deluxeOpt: deluxeOptSelect.value,
        qty: parseInt(qtyInput.value),
        express: ctx.expressMode
      };

      try {
        const result = quoteWizytowki(currentOptions);
        const nettoPrice = isSatin ? parseFloat((result.totalPrice * SATIN_MULTIPLIER).toFixed(2)) : result.totalPrice;
        const bruttoPrice = parseFloat((nettoPrice * VAT).toFixed(2));
        currentResult = { ...result, nettoPrice, bruttoPrice, isSatin };

        nettoSpan.innerText = formatPLN(nettoPrice);
        totalPriceSpan.innerText = formatPLN(bruttoPrice);
        billedQtyHint.innerText = `Rozliczono za: ${result.qtyBilled} szt.`;
        if (tierHint) tierHint.innerText = `Dla ${result.qtyBilled} szt użyto ceny ${(result.totalPrice).toFixed(2)} zł (papier: ${paperVal.replace("_", " ")})`;
        if (expressHint) expressHint.style.display = ctx.expressMode ? "block" : "none";
        if (satinHint) satinHint.style.display = isSatin ? "block" : "none";
        resultDisplay.style.display = "block";
        addToCartBtn.disabled = false;

        ctx.updateLastCalculated(bruttoPrice, "Wizytówki");
      } catch (err) {
        alert("Błąd: " + (err as Error).message);
      }
    };

    addToCartBtn.onclick = () => {
      if (currentResult && currentOptions) {
        const name = currentOptions.family === 'deluxe' ? 'Wizytówki DELUXE' : 'Wizytówki Standard';
        const expressLabel = currentOptions.express ? ', EXPRESS' : '';
        const satinLabel = currentResult.isSatin ? ', SATYNA' : '';
        const paperVal = paperSelect.value;

        ctx.cart.addItem({
          id: `wizytowki-${Date.now()}`,
          category: "Wizytówki",
          name: name,
          quantity: currentResult.qtyBilled,
          unit: "szt",
          unitPrice: currentResult.bruttoPrice / currentResult.qtyBilled,
          isExpress: currentOptions.express,
          totalPrice: currentResult.bruttoPrice,
          optionsHint: `${currentOptions.qty} szt (rozliczono ${currentResult.qtyBilled})${satinLabel}${expressLabel}, ${paperVal.replace("_", " ")}`,
          payload: currentResult
        });
      }
    };
  }
};
