import { View } from "../types";
import { quoteVouchery } from "../../categories/vouchery";
import { formatPLN } from "../../core/money";

export const VoucheryView: View = {
  id: "vouchery",
  name: "Vouchery",
  mount(container, ctx) {
    container.innerHTML = `
      <h2>Vouchery A4</h2>
      <div class="form">
        <div class="row">
          <label for="v-qty">Ilość (szt):</label>
          <input type="number" id="v-qty" value="1" min="1" max="30" step="1">
          <div class="hint">Zakres 1-30 szt.</div>
        </div>

        <div class="row">
          <label>Zadruk:</label>
          <div class="radio-group" style="display: flex; gap: 20px; margin-top: 8px;">
            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
              <input type="radio" name="v-sides" value="single" checked> Jednostronne
            </label>
            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
              <input type="radio" name="v-sides" value="double"> Dwustronne
            </label>
          </div>
        </div>

        <div class="row">
          <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
            <input type="checkbox" id="v-satin"> Papier satynowy (+12%)
          </label>
        </div>

        <div class="actions">
          <button id="v-calculate" class="primary">Oblicz</button>
          <button id="v-add-to-cart" class="success" disabled>Dodaj do listy</button>
        </div>

        <div id="v-result-display" style="display: none; margin-top: 20px; padding: 14px; background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 12px;">
          <div style="display: flex; justify-content: space-between;">
            <span>Cena bazowa:</span>
            <span id="v-base-price" style="font-weight: 900;">-</span>
          </div>
          <div id="v-modifiers-row" style="display: none; justify-content: space-between; font-size: 0.9em; opacity: 0.8;">
            <span>Dopłaty:</span>
            <span id="v-modifiers-total">-</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-top: 8px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 8px;">
            <span style="font-weight: 800;">Cena całkowita:</span>
            <span id="v-total-price" style="font-size: 18px; font-weight: 950; color: #22c55e;">-</span>
          </div>
        </div>
      </div>
    `;

    const qtyInput = container.querySelector("#v-qty") as HTMLInputElement;
    const satinCheck = container.querySelector("#v-satin") as HTMLInputElement;
    const calculateBtn = container.querySelector("#v-calculate") as HTMLButtonElement;
    const addToCartBtn = container.querySelector("#v-add-to-cart") as HTMLButtonElement;
    const resultDisplay = container.querySelector("#v-result-display") as HTMLElement;
    const basePriceSpan = container.querySelector("#v-base-price") as HTMLElement;
    const modifiersRow = container.querySelector("#v-modifiers-row") as HTMLElement;
    const modifiersTotalSpan = container.querySelector("#v-modifiers-total") as HTMLElement;
    const totalPriceSpan = container.querySelector("#v-total-price") as HTMLElement;

    let currentResult: any = null;
    let currentOptions: any = null;

    calculateBtn.onclick = () => {
      const sidesInput = container.querySelector('input[name="v-sides"]:checked') as HTMLInputElement;
      const sides = (sidesInput ? sidesInput.value : 'single') as 'single' | 'double';

      currentOptions = {
        qty: parseInt(qtyInput.value),
        sides,
        satin: satinCheck.checked,
        express: ctx.expressMode
      };

      try {
        const result = quoteVouchery(currentOptions);
        currentResult = result;

        basePriceSpan.innerText = formatPLN(result.basePrice);

        if (result.modifiersTotal > 0) {
          modifiersRow.style.display = "flex";
          modifiersTotalSpan.innerText = "+" + formatPLN(result.modifiersTotal);
        } else {
          modifiersRow.style.display = "none";
        }

        totalPriceSpan.innerText = formatPLN(result.totalPrice);
        resultDisplay.style.display = "block";
        addToCartBtn.disabled = false;

        ctx.updateLastCalculated(result.totalPrice, "Vouchery");
      } catch (err) {
        alert("Błąd: " + (err as Error).message);
      }
    };

    addToCartBtn.onclick = () => {
      if (currentResult && currentOptions) {
        const sidesLabel = currentOptions.sides === 'single' ? 'Jednostronne' : 'Dwustronne';
        const satinLabel = currentOptions.satin ? ', Satyna' : '';
        const expressLabel = currentOptions.express ? ', EXPRESS' : '';

        ctx.cart.addItem({
          id: `vouchery-${Date.now()}`,
          category: "Vouchery",
          name: `Vouchery A4 ${sidesLabel}`,
          quantity: currentOptions.qty,
          unit: "szt",
          unitPrice: currentResult.totalPrice / currentOptions.qty,
          isExpress: currentOptions.express,
          totalPrice: currentResult.totalPrice,
          optionsHint: `${currentOptions.qty} szt${satinLabel}${expressLabel}`,
          payload: currentResult
        });
      }
    };
  }
};
