import { View, ViewContext } from "../types";
import { calculateDyplomy, DyplomyOptions } from "../../categories/dyplomy";
import { formatPLN } from "../../core/money";

export const DyplomyView: View = {
  id: "dyplomy",
  name: "Dyplomy",
  async mount(container, ctx) {
    const response = await fetch("categories/dyplomy.html");
    container.innerHTML = await response.text();

    const sidesSel = container.querySelector("#dypSides") as HTMLSelectElement;
    const qtyInput = container.querySelector("#dypQty") as HTMLInputElement;
    const satinCheck = container.querySelector("#dypSatin") as HTMLInputElement;
    const calcBtn = container.querySelector("#calcBtn") as HTMLButtonElement;
    const addToCartBtn = container.querySelector("#addToCartBtn") as HTMLButtonElement;
    const resultArea = container.querySelector("#dypResult") as HTMLElement;

    const calculate = () => {
      const options: DyplomyOptions = {
        qty: parseInt(qtyInput.value) || 1,
        sides: parseInt(sidesSel.value) || 1,
        isSatin: satinCheck.checked,
        express: ctx.expressMode
      };

      const result = calculateDyplomy(options);

      resultArea.style.display = "block";
      (container.querySelector("#resUnitPrice") as HTMLElement).textContent = formatPLN(result.totalPrice / options.qty);
      (container.querySelector("#resTotalPrice") as HTMLElement).textContent = formatPLN(result.totalPrice);
      (container.querySelector("#resDiscountHint") as HTMLElement).style.display = result.appliedModifiers.includes("bulk-discount") ? "block" : "none";
      (container.querySelector("#resExpressHint") as HTMLElement).style.display = options.express ? "block" : "none";
      (container.querySelector("#resSatinHint") as HTMLElement).style.display = options.isSatin ? "block" : "none";

      ctx.updateLastCalculated(result.totalPrice, "Dyplomy");
      return { options, result };
    };

    calcBtn.addEventListener("click", () => calculate());

    addToCartBtn.addEventListener("click", () => {
      const { options, result } = calculate();

      ctx.cart.addItem({
        id: `dyp-${Date.now()}`,
        category: "Dyplomy",
        name: `Dyplomy DL ${options.sides === 1 ? '1-str' : '2-str'}`,
        quantity: options.qty,
        unit: "szt",
        unitPrice: result.totalPrice / options.qty,
        isExpress: options.express,
        totalPrice: result.totalPrice,
        optionsHint: `${options.qty} szt, ${options.isSatin ? 'Satyna' : 'Kreda'}`,
        payload: options
      });
    });

    // Initial calculation
    calculate();
  }
};
