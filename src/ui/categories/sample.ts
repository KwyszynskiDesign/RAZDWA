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
        category: "Sample",
        name: "Przedmiot testowy",
        quantity: 1,
        unit: "szt",
        unitPrice: price,
        isExpress: ctx.expressMode,
        totalPrice: price,
        optionsHint: `Cena: ${price}, Express: ${ctx.expressMode}`,
        payload: { type: 'sample', price, express: ctx.expressMode }
      });
    };
  },
  unmount() {
    console.log("Unmounting Sample Category");
  }
};
