import { View, ViewContext } from "../types";
import { calculateSolwentPlakaty } from "../../categories/solwent-plakaty";
import { formatPLN } from "../../core/money";

export const SolwentPlakatyView: View = {
  id: "solwent-plakaty",
  name: "Solwent - Plakaty",
  mount(container, ctx) {
    container.innerHTML = `
      <h2>Solwent - Plakaty</h2>
      <div class="form">
        <div class="row">
          <label for="material">Materiał:</label>
          <select id="material">
            <option value="Papier 200g połysk">Papier 200g połysk</option>
            <option value="Papier 115g matowy">Papier 115g matowy</option>
            <option value="Blockout 200g satyna">Blockout 200g satyna</option>
          </select>
        </div>

        <div class="row">
          <label for="area">Powierzchnia (m2):</label>
          <input type="number" id="area" value="1" min="0.1" step="0.1">
          <div class="hint">MINIMALKA 1m2!</div>
        </div>

        <div class="actions">
          <button id="calculate" class="primary">Oblicz</button>
          <button id="add-to-cart" class="success" disabled>Dodaj do listy</button>
        </div>

        <div id="result-display" style="display: none; margin-top: 20px; padding: 14px; background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 12px;">
          <div style="display: flex; justify-content: space-between;">
            <span>Cena jednostkowa:</span>
            <span id="unit-price" style="font-weight: 900;">-</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="font-weight: 800;">Cena całkowita:</span>
            <span id="total-price" style="font-size: 18px; font-weight: 950; color: #22c55e;">-</span>
          </div>
        </div>
      </div>
    `;

    const materialSelect = container.querySelector("#material") as HTMLSelectElement;
    const areaInput = container.querySelector("#area") as HTMLInputElement;
    const calculateBtn = container.querySelector("#calculate") as HTMLButtonElement;
    const addToCartBtn = container.querySelector("#add-to-cart") as HTMLButtonElement;
    const resultDisplay = container.querySelector("#result-display") as HTMLElement;
    const unitPriceSpan = container.querySelector("#unit-price") as HTMLElement;
    const totalPriceSpan = container.querySelector("#total-price") as HTMLElement;

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
