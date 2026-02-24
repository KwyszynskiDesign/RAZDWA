import { View, ViewContext } from "../types";
import { calculateSolwentPlakaty } from "../../categories/solwent-plakaty";
import { formatPLN } from "../../core/money";
import _config from "../../../config/prices.json";

const data: any = _config.solwentPlakaty;

export const SolwentPlakatyView: View = {
  id: "solwent-plakaty",
  name: "Solwent - Plakaty",
  async mount(container, ctx) {
    try {
      const response = await fetch("categories/solwent-plakaty.html");
      if (!response.ok) throw new Error("Failed to load template");
      container.innerHTML = await response.text();

      const tableData = data as any;
      const materials = tableData.materials;
      const materialSelect = container.querySelector("#material") as HTMLSelectElement;
      materialSelect.innerHTML = materials.map((m: any) => `<option value="${m.name}">${m.name}</option>`).join("");

      this.initLogic(container, ctx);
    } catch (err) {
      container.innerHTML = `<div class="error">Błąd ładowania: ${err}</div>`;
    }
  },

  initLogic(container: HTMLElement, ctx: ViewContext) {
    const materialSelect = container.querySelector("#material") as HTMLSelectElement;
    const areaInput = container.querySelector("#area") as HTMLInputElement;
    const calculateBtn = container.querySelector("#calculate") as HTMLButtonElement;
    const addToCartBtn = container.querySelector("#add-to-cart") as HTMLButtonElement;
    const resultDisplay = container.querySelector("#result-display") as HTMLElement;
    const unitPriceSpan = container.querySelector("#unit-price") as HTMLElement;
    const totalPriceSpan = container.querySelector("#total-price") as HTMLElement;
    const expressHint = container.querySelector("#express-hint") as HTMLElement;

    let currentResult: any = null;

    calculateBtn.onclick = () => {
      const input = {
        material: materialSelect.value,
        areaM2: parseFloat(areaInput.value),
        express: ctx.expressMode
      };

      try {
        const result = calculateSolwentPlakaty(input);
        currentResult = result;

        unitPriceSpan.innerText = formatPLN(result.tierPrice);
        totalPriceSpan.innerText = formatPLN(result.totalPrice);
        if (expressHint) expressHint.style.display = ctx.expressMode ? "block" : "none";
        resultDisplay.style.display = "block";
        addToCartBtn.disabled = false;

        ctx.updateLastCalculated(result.totalPrice, "Solwent - Plakaty");
      } catch (err) {
        alert("Błąd: " + (err as Error).message);
      }
    };

    addToCartBtn.onclick = () => {
      if (currentResult) {
        ctx.cart.addItem({
          id: `solwent-${Date.now()}`,
          category: "Solwent - Plakaty",
          name: materialSelect.value,
          quantity: parseFloat(areaInput.value),
          unit: "m2",
          unitPrice: currentResult.tierPrice,
          isExpress: ctx.expressMode,
          totalPrice: currentResult.totalPrice,
          optionsHint: `${areaInput.value}m2${ctx.expressMode ? ", EXPRESS" : ""}`,
          payload: currentResult
        });
      }
    };
  }
};
