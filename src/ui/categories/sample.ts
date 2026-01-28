import { View, ViewContext } from "../types";

export const SampleCategory: View = {
  id: "sample",
  name: "Sample Category",
  mount(container, ctx) {
    container.innerHTML = `
      <h2>Sample Category</h2>
      <p>Tryb Express: ${ctx.expressMode ? 'WŁĄCZONY' : 'WYŁĄCZONY'}</p>
      <div class="form">
        <div class="row">
          <label>Cena testowa</label>
          <input type="number" id="samplePrice" value="10">
        </div>
        <button id="addSample" class="success">Dodaj do koszyka</button>
      </div>
    `;

    const addBtn = container.querySelector("#addSample") as HTMLButtonElement;
    const priceInput = container.querySelector("#samplePrice") as HTMLInputElement;

    addBtn.onclick = () => {
      const price = parseFloat(priceInput.value);
      ctx.cart.addItem({
        id: `sample-${Date.now()}`,
        title: "Przedmiot testowy",
        description: `Cena: ${price}, Express: ${ctx.expressMode}`,
        quantity: 1,
        unitPrice: price,
        totalPrice: price,
        payload: { type: 'sample', price, express: ctx.expressMode }
      });
    };
  },
  unmount() {
    console.log("Unmounting Sample Category");
  }
};
