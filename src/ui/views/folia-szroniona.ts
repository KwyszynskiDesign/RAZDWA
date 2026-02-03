import { View, ViewContext } from "../types";
import { calculateFoliaSzroniona } from "../../categories/folia-szroniona";
import { formatPLN } from "../../core/money";

export const FoliaSzronionaView: View = {
  id: "folia-szroniona",
  name: "Folia szroniona",
  async mount(container, ctx) {
    try {
      const response = await fetch("categories/folia-szroniona.html");
      if (!response.ok) throw new Error("Failed to load template");
      container.innerHTML = await response.text();

      this.initLogic(container, ctx);
    } catch (err) {
      container.innerHTML = `<div class="error">Błąd ładowania: ${err}</div>`;
    }
  },

  initLogic(container: HTMLElement, ctx: ViewContext) {
    const serviceSelect = container.querySelector("#fs-service") as HTMLSelectElement;
    const widthInput = container.querySelector("#fs-width") as HTMLInputElement;
    const heightInput = container.querySelector("#fs-height") as HTMLInputElement;
    const calculateBtn = container.querySelector("#fs-calculate") as HTMLButtonElement;
    const addToCartBtn = container.querySelector("#fs-add-to-cart") as HTMLButtonElement;
    const resultDisplay = container.querySelector("#fs-result-display") as HTMLElement;
    const normalResult = container.querySelector("#fs-normal-result") as HTMLElement;
    const customQuote = container.querySelector("#fs-custom-quote") as HTMLElement;
    const areaValSpan = container.querySelector("#fs-area-val") as HTMLElement;
    const unitPriceSpan = container.querySelector("#fs-unit-price") as HTMLElement;
    const totalPriceSpan = container.querySelector("#fs-total-price") as HTMLElement;
    const expressHint = container.querySelector("#fs-express-hint") as HTMLElement;

    let currentResult: any = null;
    let currentOptions: any = null;

    calculateBtn.onclick = () => {
      currentOptions = {
        serviceId: serviceSelect.value,
        widthMm: parseInt(widthInput.value) || 0,
        heightMm: parseInt(heightInput.value) || 0,
        express: ctx.expressMode
      };

      try {
        const result = calculateFoliaSzroniona(currentOptions);
        currentResult = result;

        if (result.isCustom) {
            normalResult.style.display = "none";
            customQuote.style.display = "block";
            addToCartBtn.disabled = true;
            ctx.updateLastCalculated(0, "Folia szroniona (wycena ind.)");
        } else {
            normalResult.style.display = "block";
            customQuote.style.display = "none";
            const areaM2 = (currentOptions.widthMm * currentOptions.heightMm) / 1000000;
            areaValSpan.innerText = `${areaM2.toFixed(2)} m2${result.effectiveQuantity > areaM2 ? ' (min. 1m2)' : ''}`;
            unitPriceSpan.innerText = formatPLN(result.tierPrice);
            totalPriceSpan.innerText = formatPLN(result.totalPrice);
            addToCartBtn.disabled = false;
            ctx.updateLastCalculated(result.totalPrice, "Folia szroniona");
        }

        if (expressHint) expressHint.style.display = ctx.expressMode ? "block" : "none";
        resultDisplay.style.display = "block";

      } catch (err) {
        alert("Błąd: " + (err as Error).message);
      }
    };

    addToCartBtn.onclick = () => {
      if (currentResult && currentOptions) {
        const serviceName = serviceSelect.options[serviceSelect.selectedIndex].text;
        const areaM2 = (currentOptions.widthMm * currentOptions.heightMm) / 1000000;
        const opts = [
            `${currentOptions.widthMm}x${currentOptions.heightMm} mm`,
            `${areaM2.toFixed(2)} m2`,
            ctx.expressMode ? "EXPRESS" : ""
        ].filter(Boolean).join(", ");

        ctx.cart.addItem({
          id: `fs-${Date.now()}`,
          category: "Folia szroniona",
          name: serviceName,
          quantity: areaM2,
          unit: "m2",
          unitPrice: currentResult.tierPrice,
          isExpress: ctx.expressMode,
          totalPrice: currentResult.totalPrice,
          optionsHint: opts,
          payload: currentResult
        });
      }
    };
  }
};
