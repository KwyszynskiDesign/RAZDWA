import { CategoryModule, CategoryContext } from "../ui/router";
import { calculatePrice } from "../core/pricing";
import { formatPLN } from "../core/money";
import plakatyData from "../../data/normalized/solwent-plakaty-200g.json";
import { PriceTable } from "../core/types";

export const plakatyCategory: CategoryModule = {
  id: "solwent-plakaty",
  name: "Solwent - Plakaty",
  mount: (container: HTMLElement, ctx: CategoryContext) => {
    const table = plakatyData as PriceTable;

    container.innerHTML = `
      <div class="category-view">
        <h2>${table.title}</h2>
        <div class="form" style="display: grid; gap: 15px;">
          <div class="row" style="display: flex; justify-content: space-between; align-items: center;">
            <label>Powierzchnia (m2)</label>
            <input type="number" id="plakatyQty" value="1" min="0.1" step="0.1" style="width: 100px;">
          </div>
          <div class="row" style="display: flex; align-items: center; gap: 10px;">
            <input type="checkbox" id="plakatyExpress" style="width: auto;">
            <label for="plakatyExpress">Tryb EXPRESS (+20%)</label>
          </div>

          <div class="divider"></div>

          <div class="summary-box" style="background: rgba(0,0,0,0.2); padding: 15px; border-radius: 10px;">
            <div style="display: flex; justify-content: space-between;">
              <span>Cena:</span>
              <strong id="plakatyResult">0,00 zł</strong>
            </div>
          </div>

          <div class="actions">
            <button id="addPlakatyBtn" class="primary" style="width: 100%;">Dodaj do zamówienia</button>
          </div>
        </div>
      </div>
    `;

    const qtyInput = container.querySelector("#plakatyQty") as HTMLInputElement;
    const expressCheck = container.querySelector("#plakatyExpress") as HTMLInputElement;
    const resultEl = container.querySelector("#plakatyResult") as HTMLElement;
    const addBtn = container.querySelector("#addPlakatyBtn") as HTMLButtonElement;

    function update() {
      const qty = parseFloat(qtyInput.value) || 0;
      const mods = expressCheck.checked ? ["EXPRESS"] : [];
      try {
        const res = calculatePrice(qty, table, mods);
        resultEl.textContent = formatPLN(res.totalPrice);
      } catch (e) {
        resultEl.textContent = "Błąd";
      }
    }

    qtyInput.addEventListener("input", update);
    expressCheck.addEventListener("change", update);

    addBtn.addEventListener("click", () => {
      const qty = parseFloat(qtyInput.value) || 0;
      const mods = expressCheck.checked ? ["EXPRESS"] : [];
      const res = calculatePrice(qty, table, mods);

      ctx.cart.addItem({
        categoryId: table.id,
        categoryName: table.title,
        details: { qty: `${qty} m2`, express: expressCheck.checked },
        price: res.totalPrice
      });
    });

    update();
  }
};
