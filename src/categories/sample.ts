import { CategoryModule, CategoryContext } from "../ui/router";
import { formatPLN } from "../core/money";

export const sampleCategory: CategoryModule = {
  id: "sample",
  name: "Sample Category",
  mount: (container: HTMLElement, ctx: CategoryContext) => {
    container.innerHTML = `
      <div class="category-view">
        <h2>Przykładowa Kategoria</h2>
        <div class="form">
          <div class="row">
            <label>Ilość</label>
            <input type="number" id="sampleQty" value="1" min="1">
          </div>
          <div class="row">
            <label>Cena jednostkowa</label>
            <span>10,00 zł</span>
          </div>
          <div class="actions" style="margin-top: 20px;">
            <button id="addSampleBtn" class="primary">Dodaj do koszyka</button>
          </div>
        </div>
      </div>
    `;

    const addBtn = container.querySelector("#addSampleBtn");
    const qtyInput = container.querySelector("#sampleQty") as HTMLInputElement;

    addBtn?.addEventListener("click", () => {
      const qty = parseInt(qtyInput.value) || 1;
      const price = qty * 10;
      ctx.cart.addItem({
        categoryId: "sample",
        categoryName: "Sample Category",
        details: { qty },
        price: price
      });
      alert(`Dodano do koszyka: ${qty} szt. za ${formatPLN(price)}`);
    });
  },
  unmount: () => {
    // cleanup if needed
  }
};
