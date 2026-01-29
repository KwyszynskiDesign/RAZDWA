import { View, ViewContext } from "../types";
import { calculateBanner } from "../../categories/banner";
import { formatPLN } from "../../core/money";
import * as data from "../../../data/normalized/banner.json";

export const BannerView: View = {
  id: "banner",
  name: "Bannery",
  mount(container, ctx) {
    const tableData = data as any;
    const materials = tableData.materials;

    container.innerHTML = `
      <h2>Bannery</h2>
      <div class="form">
        <div class="row">
          <label for="b-material">Rodzaj:</label>
          <select id="b-material">
            ${materials.map((m: any) => `<option value="${m.id}">${m.name}</option>`).join("")}
          </select>
        </div>

        <div class="row">
          <label for="b-area">Powierzchnia (m2):</label>
          <input type="number" id="b-area" value="1" min="0.1" step="0.1">
        </div>

        <div class="row" style="display: flex; align-items: center; gap: 8px;">
          <input type="checkbox" id="b-oczkowanie" style="width: auto;">
          <label for="b-oczkowanie">Oczkowanie (+2.50 zł/m2)</label>
        </div>

        <div class="actions">
          <button id="b-calculate" class="primary">Oblicz</button>
          <button id="b-add-to-cart" class="success" disabled>Dodaj do koszyka</button>
        </div>

        <div id="b-result-display" style="display: none; margin-top: 20px; padding: 14px; background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 12px;">
          <div style="display: flex; justify-content: space-between;">
            <span>Cena za m2:</span>
            <span id="b-unit-price" style="font-weight: 900;">-</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="font-weight: 800;">Cena całkowita:</span>
            <span id="b-total-price" style="font-size: 18px; font-weight: 950; color: #22c55e;">-</span>
          </div>
          <div id="b-express-hint" style="display: none; font-size: 0.8em; color: var(--ok); margin-top: 4px;">
            W tym dopłata EXPRESS +20%
          </div>
        </div>
      </div>
    `;

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
        expressHint.style.display = ctx.expressMode ? "block" : "none";
        resultDisplay.style.display = "block";
        addToCartBtn.disabled = false;

        ctx.updateLastCalculated(result.totalPrice, "Banner");
      } catch (err) {
        alert("Błąd: " + (err as Error).message);
      }
    };

    addToCartBtn.onclick = () => {
      if (currentResult && currentOptions) {
        const matName = materials.find((m: any) => m.id === currentOptions.material).name;
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
