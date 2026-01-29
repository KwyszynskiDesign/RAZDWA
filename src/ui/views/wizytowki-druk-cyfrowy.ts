import { View } from "../types";
import { quoteWizytowki } from "../../categories/wizytowki-druk-cyfrowy";
import { formatPLN } from "../../core/money";

export const WizytowkiView: View = {
  id: "wizytowki-druk-cyfrowy",
  name: "Wizytówki - druk cyfrowy",
  mount(container, ctx) {
    container.innerHTML = `
      <h2>Wizytówki - druk cyfrowy</h2>
      <div class="form">
        <div class="row">
          <label for="w-format">Format:</label>
          <select id="w-format">
            <option value="85x55">85x55 mm</option>
            <option value="90x50">90x50 mm</option>
          </select>
        </div>

        <div class="row">
          <label for="w-folia">Foliowanie:</label>
          <select id="w-folia">
            <option value="none">Bez foliowania</option>
            <option value="matt_gloss">Folia mat / błysk</option>
          </select>
        </div>

        <div class="row">
          <label for="w-qty">Ilość (szt):</label>
          <select id="w-qty">
            <option value="50">50 szt</option>
            <option value="100">100 szt</option>
            <option value="150">150 szt</option>
            <option value="200">200 szt</option>
            <option value="250">250 szt</option>
            <option value="300">300 szt</option>
            <option value="400">400 szt</option>
            <option value="500">500 szt</option>
            <option value="1000">1000 szt</option>
          </select>
        </div>

        <div class="actions">
          <button id="w-calculate" class="primary">Oblicz</button>
          <button id="w-add-to-cart" class="success" disabled>Dodaj do koszyka</button>
        </div>

        <div id="w-result-display" style="display: none; margin-top: 20px; padding: 14px; background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 12px;">
          <div style="display: flex; justify-content: space-between;">
            <span>Cena brutto:</span>
            <span id="w-total-price" style="font-size: 18px; font-weight: 950; color: #22c55e;">-</span>
          </div>
          <div id="w-express-hint" style="display: none; font-size: 0.8em; color: var(--ok); margin-top: 4px;">
            W tym dopłata EXPRESS +20%
          </div>
        </div>
      </div>
    `;

    const formatSelect = container.querySelector("#w-format") as HTMLSelectElement;
    const foliaSelect = container.querySelector("#w-folia") as HTMLSelectElement;
    const qtySelect = container.querySelector("#w-qty") as HTMLSelectElement;
    const calculateBtn = container.querySelector("#w-calculate") as HTMLButtonElement;
    const addToCartBtn = container.querySelector("#w-add-to-cart") as HTMLButtonElement;
    const resultDisplay = container.querySelector("#w-result-display") as HTMLElement;
    const totalPriceSpan = container.querySelector("#w-total-price") as HTMLElement;
    const expressHint = container.querySelector("#w-express-hint") as HTMLElement;

    let currentResult: any = null;
    let currentOptions: any = null;

    calculateBtn.onclick = () => {
      currentOptions = {
        format: formatSelect.value,
        folia: foliaSelect.value,
        qty: parseInt(qtySelect.value),
        express: ctx.expressMode
      };

      try {
        const result = quoteWizytowki(currentOptions);
        currentResult = result;

        totalPriceSpan.innerText = formatPLN(result.totalPrice);
        expressHint.style.display = ctx.expressMode ? "block" : "none";
        resultDisplay.style.display = "block";
        addToCartBtn.disabled = false;

        ctx.updateLastCalculated(result.totalPrice, "Wizytówki");
      } catch (err) {
        alert("Błąd: " + (err as Error).message);
      }
    };

    addToCartBtn.onclick = () => {
      if (currentResult && currentOptions) {
        const foliaLabel = currentOptions.folia === 'none' ? 'Bez folii' : 'Folia';
        const expressLabel = currentOptions.express ? ', EXPRESS' : '';

        ctx.cart.addItem({
          id: `wizytowki-${Date.now()}`,
          category: "Wizytówki",
          name: `Wizytówki ${currentOptions.format}`,
          quantity: currentOptions.qty,
          unit: "szt",
          unitPrice: currentResult.totalPrice / currentOptions.qty,
          isExpress: currentOptions.express,
          totalPrice: currentResult.totalPrice,
          optionsHint: `${currentOptions.qty} szt, ${foliaLabel}${expressLabel}`,
          payload: currentResult
        });
      }
    };
  }
};
