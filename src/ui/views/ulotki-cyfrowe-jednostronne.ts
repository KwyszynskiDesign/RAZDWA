import { View, ViewContext } from "../types";
import { quoteJednostronne } from "../../categories/ulotki-cyfrowe-jednostronne";
import { formatPLN } from "../../core/money";

export const UlotkiJednostronneView: View = {
  id: "ulotki-cyfrowe-jednostronne",
  name: "Ulotki – cyfrowe",
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
    const qtyInput = container.querySelector("#uj-qty-input") as HTMLInputElement;
    const addToCartBtn = container.querySelector("#uj-add-to-cart") as HTMLButtonElement;
    const resultDisplay = container.querySelector("#uj-result-display") as HTMLElement;
    const totalPriceSpan = container.querySelector("#uj-total-price") as HTMLElement;
    const unitPriceSpan = container.querySelector("#uj-unit-price") as HTMLElement;
    const displayQtySpan = container.querySelector("#uj-display-qty") as HTMLElement;
    const expressHint = container.querySelector("#uj-express-hint") as HTMLElement;
    const individualQuote = container.querySelector("#uj-individual-quote") as HTMLElement;

    let currentResult: any = null;
    let currentOptions: any = null;

    const calculate = () => {
      const mode = (container.querySelector('input[name="uj-mode"]:checked') as HTMLInputElement).value as "jednostronne" | "dwustronne";
      const qty = parseInt(qtyInput.value) || 0;
      const format = formatSelect.value;

      if (qty > 1000) {
        resultDisplay.style.display = "none";
        individualQuote.style.display = "block";
        addToCartBtn.disabled = true;
        return;
      }

      if (qty < 1) {
        resultDisplay.style.display = "none";
        individualQuote.style.display = "none";
        addToCartBtn.disabled = true;
        return;
      }

      individualQuote.style.display = "none";

      currentOptions = {
        mode,
        format,
        qty,
        express: ctx.expressMode
      };

      try {
        const result = quoteJednostronne(currentOptions);
        currentResult = result;

        displayQtySpan.innerText = `${qty} szt`;
        unitPriceSpan.innerText = formatPLN(result.totalPrice / qty);
        totalPriceSpan.innerText = formatPLN(result.totalPrice);

        if (expressHint) expressHint.style.display = ctx.expressMode ? "block" : "none";
        resultDisplay.style.display = "block";
        addToCartBtn.disabled = false;

        ctx.updateLastCalculated(result.totalPrice, "Ulotki");
      } catch (err) {
        console.error(err);
        resultDisplay.style.display = "none";
        addToCartBtn.disabled = true;
      }
    };

    // Event listeners
    container.querySelectorAll('input[name="uj-mode"]').forEach(radio => {
      radio.addEventListener('change', calculate);
    });
    formatSelect.onchange = calculate;
    qtyInput.oninput = calculate;

    addToCartBtn.onclick = () => {
      if (currentResult && currentOptions) {
        const expressLabel = currentOptions.express ? ', EXPRESS' : '';
        const modeLabel = currentOptions.mode === 'dwustronne' ? 'Dwustronne' : 'Jednostronne';

        ctx.cart.addItem({
          id: `ulotki-cyfrowe-${Date.now()}`,
          category: "Ulotki",
          name: `Ulotki ${modeLabel} ${currentOptions.format}`,
          quantity: currentOptions.qty,
          unit: "szt",
          unitPrice: currentResult.totalPrice / currentOptions.qty,
          isExpress: currentOptions.express,
          totalPrice: currentResult.totalPrice,
          optionsHint: `${currentOptions.qty} szt, ${modeLabel}${expressLabel}`,
          payload: currentResult
        });
      }
    };

    // Initial calculation
    calculate();
  }
};
