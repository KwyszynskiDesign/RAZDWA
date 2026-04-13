import { View, ViewContext } from "../types";
import { autoCalc } from "../autoCalc";
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

      this.initLogic?.(container, ctx);
    } catch (err) {
      container.innerHTML = `<div class="error">Błąd ładowania: ${err}</div>`;
    }
  },

  initLogic(container: HTMLElement, ctx: ViewContext) {
    const serviceSelect = container.querySelector("#fs-service") as HTMLSelectElement;
    const widthInput = container.querySelector("#fs-width") as HTMLInputElement;
    const heightInput = container.querySelector("#fs-height") as HTMLInputElement;
    const addToCartBtn = container.querySelector("#fs-add-to-cart") as HTMLButtonElement;
    const resultDisplay = container.querySelector("#fs-result-display") as HTMLElement;
    const breakdownDisplay = container.querySelector("#fs-breakdown-display") as HTMLElement;
    const normalResult = container.querySelector("#fs-normal-result") as HTMLElement;
    const customQuote = container.querySelector("#fs-custom-quote") as HTMLElement;
    const areaValSpan = container.querySelector("#fs-area-val") as HTMLElement;
    const unitPriceSpan = container.querySelector("#fs-unit-price") as HTMLElement;
    const totalPriceSpan = container.querySelector("#fs-total-price") as HTMLElement;
    const expressHint = container.querySelector("#fs-express-hint") as HTMLElement;

    let currentResult: any = null;
    let currentOptions: any = null;

    const performCalculation = () => {
      if (!serviceSelect.value) {
        resultDisplay.style.display = "none";
        if (breakdownDisplay) breakdownDisplay.style.display = "none";
        addToCartBtn.disabled = true;
        return;
      }
      currentOptions = {
        serviceId: serviceSelect.value,
        widthMm: parseInt(widthInput.value) || 0,
        heightMm: parseInt(heightInput.value) || 0,
        express: ctx.expressMode
      };

      const result = calculateFoliaSzroniona(currentOptions);
      currentResult = result;

      if (result.isCustom) {
          normalResult.style.display = "none";
          customQuote.style.display = "block";
          addToCartBtn.disabled = true;
        ctx.updateLastCalculated(0, "Folia szroniona / OWV (wycena ind.)");
      } else {
          normalResult.style.display = "block";
          customQuote.style.display = "none";
          const areaM2 = (currentOptions.widthMm * currentOptions.heightMm) / 1000000;
          if (areaValSpan) areaValSpan.innerText = `${areaM2.toFixed(2)} m2${result.effectiveQuantity > areaM2 ? ' (min. 1m2)' : ''}`;
          if (unitPriceSpan) unitPriceSpan.innerText = formatPLN(result.tierPrice);
          if (totalPriceSpan) totalPriceSpan.innerText = formatPLN(result.totalPrice);
          addToCartBtn.disabled = false;
          ctx.updateLastCalculated(result.totalPrice, "Folia szroniona / OWV");
      }

      if (expressHint) expressHint.style.display = ctx.expressMode ? "block" : "none";
      resultDisplay.style.display = "block";
      if (breakdownDisplay) breakdownDisplay.style.display = "block";
    };

    autoCalc({ root: container, calc: performCalculation });

    addToCartBtn.onclick = () => {
      if (currentResult && currentOptions) {
        const serviceName = serviceSelect.options[serviceSelect.selectedIndex].text;
        const isOWV = currentOptions.serviceId.includes("owv");
        const areaM2 = (currentOptions.widthMm * currentOptions.heightMm) / 1000000;
        const opts = [
            `${currentOptions.widthMm}x${currentOptions.heightMm} mm`,
            `${areaM2.toFixed(2)} m2`,
            ctx.expressMode ? "EXPRESS" : ""
        ].filter(Boolean).join(", ");

        ctx.cart.addItem({
          id: `fs-${Date.now()}`,
          category: isOWV ? "Folia OWV" : "Folia szroniona",
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
