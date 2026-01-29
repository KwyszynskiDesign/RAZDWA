import { View, ViewContext } from "../types";
import { quoteUlotkiDwustronne } from "../../categories/ulotki-cyfrowe-dwustronne";
import { formatPLN } from "../../core/money";

export const UlotkiDwustronneView: View = {
  id: "ulotki-cyfrowe-dwustronne",
  name: "Ulotki - Cyfrowe Dwustronne",
  async mount(container, ctx) {
    try {
      const response = await fetch("categories/ulotki-cyfrowe-dwustronne.html");
      if (!response.ok) throw new Error("Failed to load template");
      container.innerHTML = await response.text();

      this.initLogic(container, ctx);
    } catch (err) {
      container.innerHTML = `<div class="error">Błąd ładowania: ${err}</div>`;
    }
  },

  initLogic(container: HTMLElement, ctx: ViewContext) {
    const formatSelect = container.querySelector("#u-format") as HTMLSelectElement;
    const qtySelect = container.querySelector("#u-qty") as HTMLSelectElement;
    const calculateBtn = container.querySelector("#u-calculate") as HTMLButtonElement;
    const addToCartBtn = container.querySelector("#u-add-to-cart") as HTMLButtonElement;
    const resultDisplay = container.querySelector("#u-result-display") as HTMLElement;
    const totalPriceSpan = container.querySelector("#u-total-price") as HTMLElement;
    const expressHint = container.querySelector("#u-express-hint") as HTMLElement;

    let currentResult: any = null;
    let currentOptions: any = null;

    calculateBtn.onclick = () => {
      currentOptions = {
        format: formatSelect.value,
        qty: parseInt(qtySelect.value),
        express: ctx.expressMode
      };

      try {
        const result = quoteUlotkiDwustronne(currentOptions);
        currentResult = result;

        totalPriceSpan.innerText = formatPLN(result.totalPrice);
        if (expressHint) expressHint.style.display = ctx.expressMode ? "block" : "none";
        resultDisplay.style.display = "block";
        addToCartBtn.disabled = false;

        ctx.updateLastCalculated(result.totalPrice, "Ulotki");
      } catch (err) {
        alert("Błąd: " + (err as Error).message);
      }
    };

    addToCartBtn.onclick = () => {
      if (currentResult && currentOptions) {
        const expressLabel = currentOptions.express ? ', EXPRESS' : '';

        ctx.cart.addItem({
          id: `ulotki-dwustronne-${Date.now()}`,
          category: "Ulotki",
          name: `Ulotki Dwustronne ${currentOptions.format}`,
          quantity: currentOptions.qty,
          unit: "szt",
          unitPrice: currentResult.totalPrice / currentOptions.qty,
          isExpress: currentOptions.express,
          totalPrice: currentResult.totalPrice,
          optionsHint: `${currentOptions.qty} szt, Dwustronne${expressLabel}`,
          payload: currentResult
        });
      }
    };
  }
};
