import { View, ViewContext } from "../types";
import { quoteWizytowki } from "../../categories/wizytowki";
import { formatPLN } from "../../core/money";

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

    const qtyInput = container.querySelector("#w-qty") as HTMLInputElement;
    const calculateBtn = container.querySelector("#w-calculate") as HTMLButtonElement;
    const addToCartBtn = container.querySelector("#w-add-to-cart") as HTMLButtonElement;
    const resultDisplay = container.querySelector("#w-result-display") as HTMLElement;
    const totalPriceSpan = container.querySelector("#w-total-price") as HTMLElement;
    const billedQtyHint = container.querySelector("#w-billed-qty-hint") as HTMLElement;
    const expressHint = container.querySelector("#w-express-hint") as HTMLElement;

    familySelect.onchange = () => {
        const isDeluxe = familySelect.value === 'deluxe';
        standardOpts.style.display = isDeluxe ? 'none' : 'block';
        deluxeOpts.style.display = isDeluxe ? 'block' : 'none';
    };

    let currentResult: any = null;
    let currentOptions: any = null;

    calculateBtn.onclick = () => {
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
        currentResult = result;

        totalPriceSpan.innerText = formatPLN(result.totalPrice);
        billedQtyHint.innerText = `Rozliczono za: ${result.qtyBilled} szt.`;
        if (expressHint) expressHint.style.display = ctx.expressMode ? "block" : "none";
        resultDisplay.style.display = "block";
        addToCartBtn.disabled = false;

        ctx.updateLastCalculated(result.totalPrice, "Wizytówki");
      } catch (err) {
        alert("Błąd: " + (err as Error).message);
      }
    };

    addToCartBtn.onclick = () => {
      if (currentResult && currentOptions) {
        const name = currentOptions.family === 'deluxe' ? 'Wizytówki DELUXE' : 'Wizytówki Standard';
        const expressLabel = currentOptions.express ? ', EXPRESS' : '';

        ctx.cart.addItem({
          id: `wizytowki-${Date.now()}`,
          category: "Wizytówki",
          name: name,
          quantity: currentResult.qtyBilled,
          unit: "szt",
          unitPrice: currentResult.totalPrice / currentResult.qtyBilled,
          isExpress: currentOptions.express,
          totalPrice: currentResult.totalPrice,
          optionsHint: `${currentOptions.qty} szt (rozliczono ${currentResult.qtyBilled})${expressLabel}`,
          payload: currentResult
        });
      }
    };
  }
};
