import { View, ViewContext } from "../types";
import { calculateSolwentPlakaty } from "../../categories/solwent-plakaty";
import { formatPLN } from "../../core/money";

export class SolwentPlakatyView implements View {
  mount(el: HTMLElement, ctx: ViewContext): void {
    el.innerHTML = `
      <div class="view-header" style="margin-bottom: 20px;">
        <h2>Solwent - Plakaty</h2>
      </div>
      <div class="form">
        <div class="row">
          <label for="material">Materiał:</label>
          <div class="control">
            <select id="material">
              <option value="Papier 200g połysk">Papier 200g połysk</option>
              <option value="Papier 115g matowy">Papier 115g matowy</option>
              <option value="Blockout 200g satyna">Blockout 200g satyna</option>
            </select>
          </div>
        </div>

        <div class="row">
          <label for="area">Powierzchnia (m2):</label>
          <div class="control">
            <input type="number" id="area" value="1" min="0.1" step="0.1">
            <div class="hint">MINIMALKA 1m2!</div>
          </div>
        </div>

        <div class="row">
          <label>Opcje dodatkowe:</label>
          <div class="control">
            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
              <input type="checkbox" id="express" style="width: auto;"> <span>EXPRESS (+20%)</span>
            </label>
          </div>
        </div>

        <div class="actions">
          <button id="calculate" class="primary">Oblicz</button>
          <button id="add-to-cart" class="success" disabled>Dodaj do listy</button>
        </div>

        <div id="result-display" style="display: none; margin-top: 20px; padding: 14px; background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px;">
            <span style="font-size: 13px; color: #dbe6ff;">Cena jednostkowa:</span>
            <span id="unit-price" style="font-weight: 900;">-</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: baseline;">
            <span style="font-size: 14px; font-weight: 800; color: #fff;">Cena całkowita:</span>
            <span id="total-price" style="font-size: 18px; font-weight: 950; color: #22c55e;">-</span>
          </div>
        </div>
      </div>
    `;

    const materialSelect = el.querySelector("#material") as HTMLSelectElement;
    const areaInput = el.querySelector("#area") as HTMLInputElement;
    const expressCheckbox = el.querySelector("#express") as HTMLInputElement;
    const calculateBtn = el.querySelector("#calculate") as HTMLButtonElement;
    const addToCartBtn = el.querySelector("#add-to-cart") as HTMLButtonElement;
    const resultDisplay = el.querySelector("#result-display") as HTMLElement;
    const unitPriceSpan = el.querySelector("#unit-price") as HTMLElement;
    const totalPriceSpan = el.querySelector("#total-price") as HTMLElement;

    let currentResult: any = null;

    const performCalculation = () => {
      const input = {
        material: materialSelect.value,
        areaM2: parseFloat(areaInput.value),
        express: expressCheckbox.checked
      };

      try {
        const result = calculateSolwentPlakaty(input);
        currentResult = result;

        unitPriceSpan.innerText = formatPLN(result.tierPrice);
        totalPriceSpan.innerText = formatPLN(result.totalPrice);
        resultDisplay.style.display = "block";
        addToCartBtn.disabled = false;

        ctx.updateLastCalculated(result.totalPrice);
      } catch (err) {
        console.error("Błąd obliczeń:", err);
      }
    };

    calculateBtn.addEventListener("click", () => {
      performCalculation();
    });

    addToCartBtn.addEventListener("click", () => {
      if (currentResult) {
        ctx.addToCart({
          id: `solwent-${Date.now()}`,
          title: "Solwent - Plakaty",
          description: `${materialSelect.value}, ${areaInput.value}m2${expressCheckbox.checked ? " [EXPRESS]" : ""}`,
          quantity: 1,
          unitPrice: currentResult.totalPrice,
          totalPrice: currentResult.totalPrice
        });
      }
    });
  }
}
