import { View, ViewContext } from "../types";
import { calculateZaproszeniaKreda, ZaproszeniaKredaOptions } from "../../categories/zaproszenia-kreda";
import { formatPLN } from "../../core/money";

export const ZaproszeniaKredaView: View = {
  id: "zaproszenia-kreda",
  name: "Zaproszenia KREDA",
  async mount(container, ctx) {
    const response = await fetch("categories/zaproszenia-kreda.html");
    container.innerHTML = await response.text();

    const formatSel = container.querySelector("#zapFormat") as HTMLSelectElement;
    const sidesSel = container.querySelector("#zapSides") as HTMLSelectElement;
    const foldedCheck = container.querySelector("#zapFolded") as HTMLInputElement;
    const qtyInput = container.querySelector("#zapQty") as HTMLInputElement;
    const gramSel = container.querySelector("#zapGramature") as HTMLSelectElement;
    const finishSel = container.querySelector("#zapFinish") as HTMLSelectElement;
    const calcBtn = container.querySelector("#calcBtn") as HTMLButtonElement;
    const addToCartBtn = container.querySelector("#addToCartBtn") as HTMLButtonElement;
    const resultArea = container.querySelector("#zapResult") as HTMLElement;

    const calculate = () => {
      const options: ZaproszeniaKredaOptions = {
        format: formatSel.value,
        qty: parseInt(qtyInput.value) || 10,
        sides: parseInt(sidesSel.value) || 1,
        isFolded: foldedCheck.checked,
        gramMod: parseFloat(gramSel.value),
        finishMod: parseFloat(finishSel.value),
        express: ctx.expressMode
      };

      const result = calculateZaproszeniaKreda(options);

      resultArea.style.display = "block";
      (container.querySelector("#resUnitPrice") as HTMLElement).textContent = formatPLN(result.totalPrice / options.qty);
      (container.querySelector("#resTotalPrice") as HTMLElement).textContent = formatPLN(result.totalPrice);
      (container.querySelector("#resExpressHint") as HTMLElement).style.display = options.express ? "block" : "none";
      (container.querySelector("#resFinishHint") as HTMLElement).style.display = options.finishMod > 1 ? "block" : "none";

      ctx.updateLastCalculated(result.totalPrice, "Zaproszenia");
      return { options, result };
    };

    calcBtn.addEventListener("click", () => calculate());

    addToCartBtn.addEventListener("click", () => {
      const { options, result } = calculate();

      ctx.cart.addItem({
        id: `zap-${Date.now()}`,
        category: "Zaproszenia Kreda",
        name: `Zaproszenia ${options.format} ${options.sides === 1 ? '1-str' : '2-str'}${options.isFolded ? ' składane' : ''}`,
        quantity: options.qty,
        unit: "szt",
        unitPrice: result.totalPrice / options.qty,
        isExpress: options.express,
        totalPrice: result.totalPrice,
        optionsHint: `${options.qty} szt, ${gramSel.options[gramSel.selectedIndex].text}, ${finishSel.options[finishSel.selectedIndex].text}`,
        payload: options
      });
    });

    // Initial calculation
    calculate();
  }
};
