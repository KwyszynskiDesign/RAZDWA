import { View, ViewContext } from "../types";
import { calculateBanner } from "../../categories/banner";
import { formatPLN } from "../../core/money";

export const BannerView: View = {
  id: "banner",
  name: "Bannery",
  async mount(container, ctx) {
    try {
      const response = await fetch("categories/banner.html");
      if (!response.ok) throw new Error("Failed to load template");
      container.innerHTML = await response.text();

      this.initLogic(container, ctx);
    } catch (err) {
      container.innerHTML = `<div class="error">Błąd ładowania: ${err}</div>`;
    }
  },

  initLogic(container: HTMLElement, ctx: ViewContext) {
    const materialSelect = container.querySelector("#b-material") as HTMLSelectElement;
    const areaInput = container.querySelector("#b-area") as HTMLInputElement;
    const oczkowanieCheckbox = container.querySelector("#b-oczkowanie") as HTMLInputElement;
    const calculateBtn = container.querySelector("#b-calculate") as HTMLButtonElement;
    const addToCartBtn = container.querySelector("#b-add-to-cart") as HTMLButtonElement;
    const resultDisplay = container.querySelector("#b-result-display") as HTMLElement;
    const unitPriceSpan = container.querySelector("#b-unit-price") as HTMLElement;
    const totalPriceSpan = container.querySelector("#b-total-price") as HTMLElement;
    const expressHint = container.querySelector("#b-express-hint") as HTMLElement;

    let currentResult: any = null;
    let currentOptions: any = null;

    calculateBtn.onclick = () => {
      currentOptions = {
        material: materialSelect.value,
        areaM2: parseFloat(areaInput.value),
        oczkowanie: oczkowanieCheckbox.checked,
        express: ctx.expressMode
      };

      try {
        const result = calculateBanner(currentOptions);
        currentResult = result;

        unitPriceSpan.innerText = formatPLN(result.tierPrice);
        totalPriceSpan.innerText = formatPLN(result.totalPrice);
        if (expressHint) expressHint.style.display = ctx.expressMode ? "block" : "none";
        resultDisplay.style.display = "block";
        addToCartBtn.disabled = false;

        ctx.updateLastCalculated(result.totalPrice, "Banner");
      } catch (err) {
        alert("Błąd: " + (err as Error).message);
      }
    };

    addToCartBtn.onclick = () => {
      if (currentResult && currentOptions) {
        const matName = materialSelect.options[materialSelect.selectedIndex].text;
        const opts = [
            `${currentOptions.areaM2} m2`,
            currentOptions.oczkowanie ? "z oczkowaniem" : "bez oczkowania",
            currentOptions.express ? "EXPRESS" : ""
        ].filter(Boolean).join(", ");

        ctx.cart.addItem({
          id: `banner-${Date.now()}`,
          category: "Bannery",
          name: matName,
          quantity: currentOptions.areaM2,
          unit: "m2",
          unitPrice: currentResult.tierPrice,
          isExpress: currentOptions.express,
          totalPrice: currentResult.totalPrice,
          optionsHint: opts,
          payload: currentResult
        });
      }
    };
  }
};
