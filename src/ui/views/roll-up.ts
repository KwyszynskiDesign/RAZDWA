import { View, ViewContext } from "../types";
import { calculateRollUp, RollUpOptions } from "../../categories/roll-up";
import { formatPLN } from "../../core/money";

export const RollUpView: View = {
  id: "roll-up",
  name: "Roll-up",
  async mount(container, ctx) {
    const response = await fetch("categories/roll-up.html");
    container.innerHTML = await response.text();

    const typeSel = container.querySelector("#rollUpType") as HTMLSelectElement;
    const formatSel = container.querySelector("#rollUpFormat") as HTMLSelectElement;
    const qtyInput = container.querySelector("#rollUpQty") as HTMLInputElement;
    const calcBtn = container.querySelector("#calcBtn") as HTMLButtonElement;
    const addToCartBtn = container.querySelector("#addToCartBtn") as HTMLButtonElement;
    const resultArea = container.querySelector("#rollUpResult") as HTMLElement;

    const calculate = () => {
      const options: RollUpOptions = {
        format: formatSel.value,
        qty: parseInt(qtyInput.value) || 1,
        isReplacement: typeSel.value === "replacement",
        express: ctx.expressMode
      };

      const result = calculateRollUp(options);

      resultArea.style.display = "block";
      (container.querySelector("#resUnitPrice") as HTMLElement).textContent = formatPLN(result.totalPrice / options.qty);
      (container.querySelector("#resTotalPrice") as HTMLElement).textContent = formatPLN(result.totalPrice);
      (container.querySelector("#resExpressHint") as HTMLElement).style.display = options.express ? "block" : "none";

      ctx.updateLastCalculated(result.totalPrice, "Roll-up");
      return { options, result };
    };

    calcBtn.addEventListener("click", () => calculate());

    addToCartBtn.addEventListener("click", () => {
      const { options, result } = calculate();

      ctx.cart.addItem({
        id: `rollup-${Date.now()}`,
        category: "Roll-up",
        name: `${options.isReplacement ? 'Wymiana wkładu' : 'Roll-up Komplet'} ${options.format}`,
        quantity: options.qty,
        unit: "szt",
        unitPrice: result.totalPrice / options.qty,
        isExpress: options.express,
        totalPrice: result.totalPrice,
        optionsHint: `${options.format}, ${options.qty} szt`,
        payload: options
      });
    });

    // Initial calculation
    calculate();
  }
};
