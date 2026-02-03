import { View, ViewContext } from "../types";
import { quoteWizytowki } from "../../categories/wizytowki-druk-cyfrowy";
import { formatPLN } from "../../core/money";

export const WizytowkiView: View = {
  id: "wizytowki-druk-cyfrowy",
  name: "Wizytówki - druk cyfrowy",
  mount(container, ctx) {
    container.innerHTML = `
      <div class="category-view">
        <div class="view-header">
            <h2>Wizytówki - druk cyfrowy</h2>
        </div>

        <div class="calculator-form card">
            <div class="form-group">
                <label for="w-family">Rodzaj:</label>
                <select id="w-family" class="form-control">
                    <option value="standard">Standard</option>
                    <option value="deluxe">DELUXE</option>
                </select>
            </div>

            <div id="standard-options">
                <div class="form-group">
                    <label for="w-finish">Wykończenie:</label>
                    <select id="w-finish" class="form-control">
                        <option value="mat">Mat</option>
                        <option value="blysk">Błysk</option>
                        <option value="softtouch">SoftTouch</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="w-size">Rozmiar:</label>
                    <select id="w-size" class="form-control">
                        <option value="85x55">85x55 mm</option>
                        <option value="90x50">90x50 mm</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="w-lam">Foliowanie:</label>
                    <select id="w-lam" class="form-control">
                        <option value="noLam">Bez foliowania</option>
                        <option value="lam">Foliowane</option>
                    </select>
                </div>
            </div>

            <div id="deluxe-options" style="display: none;">
                <div class="form-group">
                    <label for="w-deluxe-opt">Opcja DELUXE:</label>
                    <select id="w-deluxe-opt" class="form-control">
                        <option value="uv3d_softtouch">UV 3D + SoftTouch</option>
                        <option value="uv3d_gold_softtouch">UV 3D + Złocenie + SoftTouch</option>
                    </select>
                </div>
            </div>

            <div class="form-group">
                <label for="w-qty">Ilość (szt):</label>
                <input type="number" id="w-qty" class="form-control" value="100" min="1">
                <div class="hint">Zaokrąglamy w górę do najbliższego progu.</div>
            </div>

            <div class="form-actions">
                <button id="w-calculate" class="btn btn-primary">Oblicz</button>
                <button id="w-add-to-cart" class="btn btn-success" disabled>Dodaj do koszyka</button>
            </div>
        </div>

        <div id="w-result-display" class="result-display card" style="display: none;">
            <div class="result-row">
                <span>Cena brutto:</span>
                <span id="w-total-price" class="price-value">-</span>
            </div>
            <div id="w-billed-qty-hint" class="hint"></div>
            <div id="w-express-hint" class="express-hint" style="display: none;">
                W tym dopłata EXPRESS +20%
            </div>
        </div>
      </div>
    `;

    this.initLogic(container, ctx);
  },

  initLogic(container: HTMLElement, ctx: ViewContext) {
    const familySelect = container.querySelector("#w-family") as HTMLSelectElement;
    const standardOpts = container.querySelector("#standard-options") as HTMLElement;
    const deluxeOpts = container.querySelector("#deluxe-options") as HTMLElement;

    const finishSelect = container.querySelector("#w-finish") as HTMLSelectElement;
    const sizeSelect = container.querySelector("#w-size") as HTMLSelectElement;
    const lamSelect = container.querySelector("#w-lam") as HTMLSelectElement;
    const deluxeOptSelect = container.querySelector("#w-deluxe-opt") as HTMLSelectElement;

    const qtyInput = container.querySelector("#w-qty") as HTMLInputElement;
    const calculateBtn = container.querySelector("#w-calculate") as HTMLButtonElement;
    const addToCartBtn = container.querySelector("#w-add-to-cart") as HTMLButtonElement;
    const resultDisplay = container.querySelector("#w-result-display") as HTMLElement;
    const totalPriceSpan = container.querySelector("#w-total-price") as HTMLElement;
    const billedQtyHint = container.querySelector("#w-billed-qty-hint") as HTMLElement;
    const expressHint = container.querySelector("#w-express-hint") as HTMLElement;

    familySelect.onchange = () => {
        const isDeluxe = familySelect.value === 'deluxe';
        standardOpts.style.display = isDeluxe ? 'none' : 'block';
        deluxeOpts.style.display = isDeluxe ? 'block' : 'none';
    };

    let currentResult: any = null;
    let currentOptions: any = null;

    calculateBtn.onclick = () => {
      currentOptions = {
        family: familySelect.value,
        finish: finishSelect.value,
        format: sizeSelect.value,
        folia: lamSelect.value === 'lam' ? 'matt_gloss' : 'none',
        deluxeOpt: deluxeOptSelect.value,
        qty: parseInt(qtyInput.value),
        express: ctx.expressMode
      };

      try {
        const result = quoteWizytowki(currentOptions);
        currentResult = result;

        totalPriceSpan.innerText = formatPLN(result.totalPrice);
        billedQtyHint.innerText = `Rozliczono za: ${result.qtyBilled} szt.`;
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
        const name = currentOptions.family === 'deluxe' ? 'Wizytówki DELUXE' : 'Wizytówki Standard';
        const expressLabel = currentOptions.express ? ', EXPRESS' : '';

        ctx.cart.addItem({
          id: `wizytowki-${Date.now()}`,
          category: "Wizytówki",
          name: name,
          quantity: currentResult.qtyBilled,
          unit: "szt",
          unitPrice: currentResult.totalPrice / currentResult.qtyBilled,
          isExpress: currentOptions.express,
          totalPrice: currentResult.totalPrice,
          optionsHint: `${currentOptions.qty} szt (rozliczono ${currentResult.qtyBilled})${expressLabel}`,
          payload: currentResult
        });
      }
    };
  }
};
