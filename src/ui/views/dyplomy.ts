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
    const gramSel = container.querySelector("#dypGramature") as HTMLSelectElement;
    const finishSel = container.querySelector("#dypFinish") as HTMLSelectElement;
    const calcBtn = container.querySelector("#calcBtn") as HTMLButtonElement;
    const addToCartBtn = container.querySelector("#addToCartBtn") as HTMLButtonElement;
    const resultArea = container.querySelector("#dypResult") as HTMLElement;

    const calculate = () => {
      const gramMod = parseFloat(gramSel?.value || "1.0");
      const finishMod = parseFloat(finishSel?.value || "1.0");

      const options: DyplomyOptions = {
        qty: parseInt(qtyInput.value) || 1,
        sides: parseInt(sidesSel.value) || 1,
        isSatin: false, // Legacy
        express: ctx.expressMode
      };

      const result = calculateDyplomy(options);
      // Manually apply new modifiers because calculateDyplomy is deprecated/legacy
      // Note: calculateDyplomy already applied express if it was in options
      // So we must be careful not to double-apply express.
      // But we changed the UI to apply gramature and finish.

      const basePrice = result.basePrice;
      let percentageSum = (gramMod - 1) + (finishMod - 1);
      if (options.express) percentageSum += 0.20;

      const finalPrice = basePrice * (1 + percentageSum);

      resultArea.style.display = "block";
      (container.querySelector("#resUnitPrice") as HTMLElement).textContent = formatPLN(finalPrice / options.qty);
      (container.querySelector("#resTotalPrice") as HTMLElement).textContent = formatPLN(finalPrice);
      (container.querySelector("#resExpressHint") as HTMLElement).style.display = options.express ? "block" : "none";
      (container.querySelector("#resFinishHint") as HTMLElement).style.display = finishMod > 1 ? "block" : "none";

      ctx.updateLastCalculated(finalPrice, "Dyplomy");
      return { options, result };
    };

    calcBtn.addEventListener("click", () => calculate());

    addToCartBtn.addEventListener("click", () => {
      const { options, result } = calculate();

      const gramMod = parseFloat(gramSel.value);
      const finishMod = parseFloat(finishSel.value);
      let percentageSum = (gramMod - 1) + (finishMod - 1);
      if (options.express) percentageSum += 0.20;
      const finalPrice = result.basePrice * (1 + percentageSum);

      ctx.cart.addItem({
        id: `dyp-${Date.now()}`,
        category: "Dyplomy",
        name: `Dyplomy DL ${options.sides === 1 ? '1-str' : '2-str'}`,
        quantity: options.qty,
        unit: "szt",
        unitPrice: finalPrice / options.qty,
        isExpress: options.express,
        totalPrice: finalPrice,
        optionsHint: `${options.qty} szt, ${gramSel.options[gramSel.selectedIndex].text}, ${finishSel.options[finishSel.selectedIndex].text}`,
        payload: options
      });
    });

    // Initial calculation
    calculate();
  }
};
