import { CategoryModule, CategoryContext } from "../ui/router";

export const voucheryCategory: CategoryModule = {
  id: "vouchery",
  name: "Vouchery",
  mount: (container: HTMLElement, ctx: CategoryContext) => {
    container.innerHTML = `
      <div class="category-view">
        <h2>Vouchery</h2>
        <div class="form">
          <p>Kreda 200-350g, A4/DL</p>
          <div class="row">
            <label>Ilość (szt)</label>
            <input type="number" id="voucheryQty" value="1" min="1">
          </div>
          <div class="divider"></div>
          <p>Dla demonstracji: stała cena 25 zł/szt</p>
          <div class="actions">
            <button id="addVoucheryBtn" class="primary">Dodaj do koszyka</button>
          </div>
        </div>
      </div>
    `;

    container.querySelector("#addVoucheryBtn")?.addEventListener("click", () => {
      const qty = parseInt((container.querySelector("#voucheryQty") as HTMLInputElement).value) || 1;
      ctx.cart.addItem({
        categoryId: "vouchery",
        categoryName: "Vouchery",
        details: { qty },
        price: qty * 25
      });
    });
  }
};
