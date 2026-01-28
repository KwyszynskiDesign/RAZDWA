import { View } from "../types";
import { quoteUlotkiDwustronne } from "../../categories/ulotki-cyfrowe-dwustronne";
import { formatPLN } from "../../core/money";

export const UlotkiDwustronneView: View = {
  id: "ulotki-cyfrowe-dwustronne",
  name: "Ulotki - Cyfrowe Dwustronne",
  mount(container, ctx) {
    container.innerHTML = `
      <h2>Ulotki - Cyfrowe Dwustronne</h2>
      <div class="form">
        <div class="row">
          <label for="u-format">Format:</label>
          <select id="u-format">
            <option value="A6">A6 (105x148)</option>
            <option value="A5">A5 (148 x 210)</option>
            <option value="DL">DL (99 x 210)</option>
          </select>
        </div>

        <div class="row">
          <label for="u-qty">Ilość (szt):</label>
          <select id="u-qty">
            <option value="10">10 szt</option>
            <option value="20">20 szt</option>
            <option value="30">30 szt</option>
            <option value="40">40 szt</option>
            <option value="50">50 szt</option>
            <option value="60">60 szt</option>
            <option value="70">70 szt</option>
            <option value="80">80 szt</option>
            <option value="90">90 szt</option>
            <option value="100">100 szt</option>
            <option value="150">150 szt</option>
            <option value="200">200 szt</option>
            <option value="300">300 szt</option>
            <option value="400">400 szt</option>
            <option value="500">500 szt</option>
            <option value="700">700 szt</option>
            <option value="1000">1000 szt</option>
          </select>
        </div>

        <div class="actions">
          <button id="u-calculate" class="primary">Oblicz</button>
          <button id="u-add-to-cart" class="success" disabled>Dodaj do koszyka</button>
        </div>

        <div id="u-result-display" style="display: none; margin-top: 20px; padding: 14px; background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 12px;">
          <div style="display: flex; justify-content: space-between;">
            <span>Cena brutto:</span>
            <span id="u-total-price" style="font-size: 18px; font-weight: 950; color: #22c55e;">-</span>
          </div>
          <div id="u-express-hint" style="display: none; font-size: 0.8em; color: var(--ok); margin-top: 4px;">
            W tym dopłata EXPRESS +20%
          </div>
        </div>
      </div>
    `;

    const formatSelect = container.querySelector("#u-format") as HTMLSelectElement;
    const qtySelect = container.querySelector("#u-qty") as HTMLSelectElement;
    const calculateBtn = container.querySelector("#u-calculate") as HTMLButtonElement;
    const addToCartBtn = container.querySelector("#u-add-to-cart") as HTMLButtonElement;
    const resultDisplay = container.querySelector("#u-result-display") as HTMLElement;
    const totalPriceSpan = container.querySelector("#u-total-price") as HTMLElement;
    const expressHint = container.querySelector("#u-express-hint") as HTMLElement;

    let currentResult: any = null;
    let currentOptions: any = null;

    calculateBtn.onclick = () => {
      currentOptions = {
        format: formatSelect.value,
        qty: parseInt(qtySelect.value),
        express: ctx.expressMode
      };

      try {
        const result = quoteUlotkiDwustronne(currentOptions);
        currentResult = result;

        totalPriceSpan.innerText = formatPLN(result.totalPrice);
        expressHint.style.display = ctx.expressMode ? "block" : "none";
        resultDisplay.style.display = "block";
        addToCartBtn.disabled = false;

        ctx.updateLastCalculated(result.totalPrice, "Ulotki");
      } catch (err) {
        alert("Błąd: " + (err as Error).message);
      }
    };

    addToCartBtn.onclick = () => {
      if (currentResult && currentOptions) {
        const expressLabel = currentOptions.express ? ', EXPRESS' : '';

        ctx.cart.addItem({
          id: `ulotki-dwustronne-${Date.now()}`,
          category: "Ulotki",
          name: `Ulotki Dwustronne ${currentOptions.format}`,
          quantity: currentOptions.qty,
          unit: "szt",
          unitPrice: currentResult.totalPrice / currentOptions.qty,
          isExpress: currentOptions.express,
          totalPrice: currentResult.totalPrice,
          optionsHint: `${currentOptions.qty} szt, Dwustronne${expressLabel}`,
          payload: currentResult
        });
      }
    };
  }
};
