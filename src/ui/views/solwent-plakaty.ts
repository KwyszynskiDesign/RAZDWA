import { View, ViewContext } from "../types";
import { autoCalc } from "../autoCalc";
import { calculateSolwentPlakaty } from "../../categories/solwent-plakaty";
import { formatPLN } from "../../core/money";
import { getPrice } from "../../services/priceService";

const data: any = getPrice("solwentPlakaty");

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
      materialSelect.innerHTML = '<option value="" disabled selected>— wybierz materiał —</option>' + materials.map((m: any) => `<option value="${m.name}">${m.name}</option>`).join("");

      this.initLogic?.(container, ctx);
    } catch (err) {
      container.innerHTML = `<div class="error">Błąd ładowania: ${err}</div>`;
    }
  },

  initLogic(container: HTMLElement, ctx: ViewContext) {
    const materialSelect = container.querySelector("#material") as HTMLSelectElement;
    const areaInput = container.querySelector("#area") as HTMLInputElement;
    const addToCartBtn = container.querySelector("#add-to-cart") as HTMLButtonElement;
    const resultDisplay = container.querySelector("#result-display") as HTMLElement;
    const unitPriceSpan = container.querySelector("#unit-price") as HTMLElement;
    const totalPriceSpan = container.querySelector("#total-price") as HTMLElement;
    const areaValSpan = container.querySelector("#area-val") as HTMLElement | null;
    const expressHint = container.querySelector("#express-hint") as HTMLElement;

    let currentResult: any = null;

    const performCalculation = () => {
      if (!materialSelect.value) {
        resultDisplay.style.display = "none";
        addToCartBtn.disabled = true;
        return;
      }
      const input = {
        material: materialSelect.value,
        areaM2: parseFloat(areaInput.value),
        express: ctx.expressMode
      };

      const result = calculateSolwentPlakaty(input);
      currentResult = result;

      unitPriceSpan.innerText = formatPLN(result.tierPrice);
      totalPriceSpan.innerText = formatPLN(result.totalPrice);
      if (areaValSpan) areaValSpan.innerText = `${input.areaM2} m²${result.effectiveQuantity > input.areaM2 ? " (min. 1 m²)" : ""}`;
      if (expressHint) expressHint.style.display = ctx.expressMode ? "block" : "none";
      resultDisplay.style.display = "block";
      addToCartBtn.disabled = false;

      ctx.updateLastCalculated(result.totalPrice, "Solwent - Plakaty");
    };

    autoCalc({ root: container, calc: performCalculation });

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
