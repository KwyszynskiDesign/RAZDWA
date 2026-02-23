import { View, ViewContext } from "../types";
import { quoteVouchery } from "../../categories/vouchery";
import { formatPLN } from "../../core/money";

const VAT = 1.23;

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
    const paperSelect = container.querySelector("#v-paper") as HTMLSelectElement;
    const calculateBtn = container.querySelector("#v-calculate") as HTMLButtonElement;
    const addToCartBtn = container.querySelector("#v-add-to-cart") as HTMLButtonElement;
    const resultDisplay = container.querySelector("#v-result-display") as HTMLElement;
    const basePriceSpan = container.querySelector("#v-base-price") as HTMLElement;
    const modifiersRow = container.querySelector("#v-modifiers-row") as HTMLElement;
    const modifiersTotalSpan = container.querySelector("#v-modifiers-total") as HTMLElement;
    const nettoPriceSpan = container.querySelector("#v-netto-price") as HTMLElement;
    const totalPriceSpan = container.querySelector("#v-total-price") as HTMLElement;
    const tierHint = container.querySelector("#v-tier-hint") as HTMLElement;
    const expressHint = container.querySelector("#v-express-hint") as HTMLElement;
    const satinHint = container.querySelector("#v-satin-hint") as HTMLElement;

    let currentResult: any = null;
    let currentOptions: any = null;

    calculateBtn.onclick = () => {
      const sidesInput = container.querySelector('input[name="v-sides"]:checked') as HTMLInputElement;
      const sides = (sidesInput ? sidesInput.value : 'single') as 'single' | 'double';
      const paperVal = paperSelect.value;
      const isSatin = paperVal.startsWith("satyna");

      currentOptions = {
        qty: parseInt(qtyInput.value),
        sides,
        satin: isSatin,
        express: ctx.expressMode
      };

      try {
        const result = quoteVouchery(currentOptions);
        const bruttoPrice = parseFloat((result.totalPrice * VAT).toFixed(2));
        currentResult = { ...result, bruttoPrice, isSatin };

        basePriceSpan.innerText = formatPLN(result.basePrice);

        if (result.modifiersTotal > 0) {
          modifiersRow.style.display = "flex";
          modifiersTotalSpan.innerText = "+" + formatPLN(result.modifiersTotal);
        } else {
          modifiersRow.style.display = "none";
        }

        if (nettoPriceSpan) nettoPriceSpan.innerText = formatPLN(result.totalPrice);
        totalPriceSpan.innerText = formatPLN(bruttoPrice);
        if (tierHint) tierHint.innerText = `Dla ${currentOptions.qty} szt cena bazowa: ${result.basePrice.toFixed(2)} zł (papier: ${paperVal.replace("_", " ")})`;
        if (expressHint) expressHint.style.display = ctx.expressMode ? "block" : "none";
        if (satinHint) satinHint.style.display = isSatin ? "block" : "none";
        resultDisplay.style.display = "block";
        addToCartBtn.disabled = false;

        ctx.updateLastCalculated(bruttoPrice, "Vouchery");
      } catch (err) {
        alert("Błąd: " + (err as Error).message);
      }
    };

    addToCartBtn.onclick = () => {
      if (currentResult && currentOptions) {
        const sidesLabel = currentOptions.sides === 'single' ? 'Jednostronne' : 'Dwustronne';
        const satinLabel = currentResult.isSatin ? ', Satyna' : '';
        const expressLabel = currentOptions.express ? ', EXPRESS' : '';
        const paperVal = paperSelect.value;

        ctx.cart.addItem({
          id: `vouchery-${Date.now()}`,
          category: "Vouchery",
          name: `Vouchery A4 ${sidesLabel}`,
          quantity: currentOptions.qty,
          unit: "szt",
          unitPrice: currentResult.bruttoPrice / currentOptions.qty,
          isExpress: currentOptions.express,
          totalPrice: currentResult.bruttoPrice,
          optionsHint: `${currentOptions.qty} szt${satinLabel}${expressLabel}, ${paperVal.replace("_", " ")}`,
          payload: currentResult
        });
      }
    };
  }
};
