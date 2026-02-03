import { View, ViewContext } from "../types";
import { quoteLaminowanie } from "../../categories/laminowanie";
import { formatPLN } from "../../core/money";

export const LaminowanieView: View = {
  id: "laminowanie",
  name: "Laminowanie",
  async mount(container, ctx) {
    try {
      const response = await fetch("categories/laminowanie.html");
      if (!response.ok) throw new Error("Failed to load template");
      container.innerHTML = await response.text();

      this.initLogic(container, ctx);
    } catch (err) {
      container.innerHTML = `<div class="error">Błąd ładowania: ${err}</div>`;
    }
  },

  initLogic(container: HTMLElement, ctx: ViewContext) {
    const formatSelect = container.querySelector("#lam-format") as HTMLSelectElement;
    const qtyInput = container.querySelector("#lam-qty") as HTMLInputElement;
    const calculateBtn = container.querySelector("#lam-calculate") as HTMLButtonElement;
    const addToCartBtn = container.querySelector("#lam-add-to-cart") as HTMLButtonElement;
    const resultDisplay = container.querySelector("#lam-result-display") as HTMLElement;
    const totalPriceSpan = container.querySelector("#lam-total-price") as HTMLElement;
    const expressHint = container.querySelector("#lam-express-hint") as HTMLElement;

    let currentResult: any = null;
    let currentOptions: any = null;

    const performCalculation = () => {
        const qty = parseInt(qtyInput.value);
        if (isNaN(qty) || qty <= 0) return;

        currentOptions = {
          format: formatSelect.value,
          qty: qty,
          express: ctx.expressMode
        };

        try {
          const result = quoteLaminowanie(currentOptions);
          currentResult = result;

          totalPriceSpan.innerText = formatPLN(result.totalPrice);
          if (expressHint) expressHint.style.display = ctx.expressMode ? "block" : "none";
          resultDisplay.style.display = "block";
          addToCartBtn.disabled = false;

          ctx.updateLastCalculated(result.totalPrice, "Laminowanie");
        } catch (err) {
          // If we are over the max qty, we might want to handle it
          console.error(err);
        }
    };

    calculateBtn.onclick = performCalculation;

    addToCartBtn.onclick = () => {
      if (currentResult && currentOptions) {
        const expressLabel = currentOptions.express ? ', EXPRESS' : '';

        ctx.cart.addItem({
          id: `laminowanie-${Date.now()}`,
          category: "Laminowanie",
          name: `Laminowanie ${currentOptions.format}`,
          quantity: currentOptions.qty,
          unit: "szt",
          unitPrice: currentResult.totalPrice / currentOptions.qty,
          isExpress: currentOptions.express,
          totalPrice: currentResult.totalPrice,
          optionsHint: `${currentOptions.qty} szt, Format ${currentOptions.format}${expressLabel}`,
          payload: currentResult
        });
      }
    };

    // Auto update on input change
    [formatSelect, qtyInput].forEach(el => {
        el.addEventListener('change', performCalculation);
    });
    qtyInput.addEventListener('input', performCalculation);
  }
};
