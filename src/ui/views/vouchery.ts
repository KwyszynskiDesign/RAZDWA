import { View, ViewContext } from "../types";
import { quoteVouchery } from "../../categories/vouchery";
import { formatPLN } from "../../core/money";

export const VoucheryView: View = {
  id: "vouchery",
  name: "Vouchery",
  async mount(container, ctx) {
    try {
      const response = await fetch("categories/vouchery.html");
      if (!response.ok) throw new Error("Failed to load template");
      container.innerHTML = await response.text();

      this.initLogic(container, ctx);
    } catch (err) {
      container.innerHTML = `<div class="error">Błąd ładowania: ${err}</div>`;
    }
  },

  initLogic(container: HTMLElement, ctx: ViewContext) {
    const qtyInput = container.querySelector("#v-qty") as HTMLInputElement;
    const satinCheck = container.querySelector("#v-satin") as HTMLInputElement;
    const calculateBtn = container.querySelector("#v-calculate") as HTMLButtonElement;
    const addToCartBtn = container.querySelector("#v-add-to-cart") as HTMLButtonElement;
    const resultDisplay = container.querySelector("#v-result-display") as HTMLElement;
    const basePriceSpan = container.querySelector("#v-base-price") as HTMLElement;
    const modifiersRow = container.querySelector("#v-modifiers-row") as HTMLElement;
    const modifiersTotalSpan = container.querySelector("#v-modifiers-total") as HTMLElement;
    const totalPriceSpan = container.querySelector("#v-total-price") as HTMLElement;

    let currentResult: any = null;
    let currentOptions: any = null;

    calculateBtn.onclick = () => {
      const sidesInput = container.querySelector('input[name="v-sides"]:checked') as HTMLInputElement;
      const sides = (sidesInput ? sidesInput.value : 'single') as 'single' | 'double';

      currentOptions = {
        qty: parseInt(qtyInput.value),
        sides,
        satin: satinCheck.checked,
        express: ctx.expressMode
      };

      try {
        const result = quoteVouchery(currentOptions);
        currentResult = result;

        basePriceSpan.innerText = formatPLN(result.basePrice);

        if (result.modifiersTotal > 0) {
          modifiersRow.style.display = "flex";
          modifiersTotalSpan.innerText = "+" + formatPLN(result.modifiersTotal);
        } else {
          modifiersRow.style.display = "none";
        }

        totalPriceSpan.innerText = formatPLN(result.totalPrice);
        resultDisplay.style.display = "block";
        addToCartBtn.disabled = false;

        ctx.updateLastCalculated(result.totalPrice, "Vouchery");
      } catch (err) {
        alert("Błąd: " + (err as Error).message);
      }
    };

    addToCartBtn.onclick = () => {
      if (currentResult && currentOptions) {
        const sidesLabel = currentOptions.sides === 'single' ? 'Jednostronne' : 'Dwustronne';
        const satinLabel = currentOptions.satin ? ', Satyna' : '';
        const expressLabel = currentOptions.express ? ', EXPRESS' : '';

        ctx.cart.addItem({
          id: `vouchery-${Date.now()}`,
          category: "Vouchery",
          name: `Vouchery A4 ${sidesLabel}`,
          quantity: currentOptions.qty,
          unit: "szt",
          unitPrice: currentResult.totalPrice / currentOptions.qty,
          isExpress: currentOptions.express,
          totalPrice: currentResult.totalPrice,
          optionsHint: `${currentOptions.qty} szt${satinLabel}${expressLabel}`,
          payload: currentResult
        });
      }
    };
  }
};
