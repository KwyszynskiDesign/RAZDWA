import { View, ViewContext } from "../types";
import { quoteJednostronne } from "../../categories/ulotki-cyfrowe-jednostronne";
import { formatPLN } from "../../core/money";

export const UlotkiJednostronneView: View = {
  id: "ulotki-cyfrowe-jednostronne",
  name: "Ulotki – cyfrowe jednostronne",
  async mount(container, ctx) {
    try {
      const response = await fetch("categories/ulotki-cyfrowe-jednostronne.html");
      if (!response.ok) throw new Error("Failed to load template");
      container.innerHTML = await response.text();

      this.initLogic(container, ctx);
    } catch (err) {
      container.innerHTML = `<div class="error">Błąd ładowania: ${err}</div>`;
    }
  },

  initLogic(container: HTMLElement, ctx: ViewContext) {
    const formatSelect = container.querySelector("#uj-format") as HTMLSelectElement;
    const qtySelect = container.querySelector("#uj-qty") as HTMLSelectElement;
    const calculateBtn = container.querySelector("#uj-calculate") as HTMLButtonElement;
    const addToCartBtn = container.querySelector("#uj-add-to-cart") as HTMLButtonElement;
    const resultDisplay = container.querySelector("#uj-result-display") as HTMLElement;
    const totalPriceSpan = container.querySelector("#uj-total-price") as HTMLElement;
    const expressHint = container.querySelector("#uj-express-hint") as HTMLElement;

    let currentResult: any = null;
    let currentOptions: any = null;

    calculateBtn.onclick = () => {
      currentOptions = {
        format: formatSelect.value,
        qty: parseInt(qtySelect.value),
        express: ctx.expressMode
      };

      try {
        const result = quoteJednostronne(currentOptions);
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
          id: `ulotki-jednostronne-${Date.now()}`,
          category: "Ulotki",
          name: `Ulotki Jednostronne ${currentOptions.format}`,
          quantity: currentOptions.qty,
          unit: "szt",
          unitPrice: currentResult.totalPrice / currentOptions.qty,
          isExpress: currentOptions.express,
          totalPrice: currentResult.totalPrice,
          optionsHint: `${currentOptions.qty} szt, Jednostronne${expressLabel}`,
          payload: currentResult
        });
      }
    };
  }
};
