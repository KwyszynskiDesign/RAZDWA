import { View, ViewContext } from "../types";
import { calculateWlepki, WlepkiCalculation } from "../../categories/wlepki-naklejki";
import { formatPLN } from "../../core/money";
import _config from "../../../config/prices.json";

const data: any = _config.wlepkiNaklejki;

export const WlepkiView: View = {
  id: "wlepki-naklejki",
  name: "Wlepki / Naklejki",
  async mount(container, ctx) {
    const tableData = data as any;

    try {
      const response = await fetch("categories/wlepki-naklejki.html");
      if (!response.ok) throw new Error("Failed to load template");
      container.innerHTML = await response.text();
    } catch (err) {
      container.innerHTML = `<div class="error">Błąd ładowania szablonu: ${err}</div>`;
      return;
    }

    const groupSelect = container.querySelector("#wlepki-group") as HTMLSelectElement;
    const areaInput = container.querySelector("#wlepki-area") as HTMLInputElement;
    const calcBtn = container.querySelector("#btn-calculate") as HTMLButtonElement;
    const addBtn = container.querySelector("#btn-add-to-cart") as HTMLButtonElement;
    const resultDiv = container.querySelector("#wlepki-result") as HTMLElement;
    const unitPriceEl = container.querySelector("#unit-price") as HTMLElement;
    const totalPriceEl = container.querySelector("#total-price") as HTMLElement;

    let currentResult: any = null;
    let currentInput: WlepkiCalculation | null = null;

    const calculate = () => {
      const modCheckboxes = container.querySelectorAll(".wlepki-mod:checked") as NodeListOf<HTMLInputElement>;
      const modifiers = Array.from(modCheckboxes).map(cb => cb.value);

      currentInput = {
        groupId: groupSelect.value,
        area: parseFloat(areaInput.value) || 0,
        express: ctx.expressMode,
        modifiers
      };

      try {
        const result = calculateWlepki(currentInput);
        currentResult = result;

        unitPriceEl.textContent = formatPLN(result.tierPrice);
        totalPriceEl.textContent = formatPLN(result.totalPrice);
        resultDiv.style.display = "block";
        addBtn.disabled = false;

        ctx.updateLastCalculated(result.totalPrice, "Wlepki");
      } catch (err) {
        alert("Błąd: " + (err as Error).message);
      }
    };

    calcBtn.addEventListener("click", calculate);

    addBtn.addEventListener("click", () => {
      if (!currentResult || !currentInput) return;

      const group = tableData.groups.find((g: any) => g.id === currentInput!.groupId);

      const modsLabel = currentInput.modifiers.map(mId => {
        const m = tableData.modifiers.find((mod: any) => mod.id === mId);
        return m ? m.name : mId;
      });

      if (currentInput.express) modsLabel.unshift("EXPRESS (+20%)");

      ctx.cart.addItem({
        id: `wlepki-${Date.now()}`,
        category: "Wlepki / Naklejki",
        name: group?.title || "Wlepki",
        quantity: currentInput.area,
        unit: "m2",
        unitPrice: currentResult.tierPrice,
        isExpress: !!currentInput.express,
        totalPrice: currentResult.totalPrice,
        optionsHint: modsLabel.join(", ") || "Standard",
        payload: currentResult
      });
    });
  }
};
