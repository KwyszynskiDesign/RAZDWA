import { View, ViewContext } from "../types";
import { calculateZaproszeniaKreda, ZaproszeniaKredaOptions } from "../../categories/zaproszenia-kreda";
import { formatPLN } from "../../core/money";

const VAT = 1.23;

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
    const paperSel = container.querySelector("#zapPaper") as HTMLSelectElement;
    const calcBtn = container.querySelector("#calcBtn") as HTMLButtonElement;
    const addToCartBtn = container.querySelector("#addToCartBtn") as HTMLButtonElement;
    const resultArea = container.querySelector("#zapResult") as HTMLElement;

    const calculate = () => {
      const paperVal = paperSel.value;
      const isSatin = paperVal.startsWith("satyna");
      const options: ZaproszeniaKredaOptions = {
        format: formatSel.value,
        qty: parseInt(qtyInput.value) || 10,
        sides: parseInt(sidesSel.value) || 1,
        isFolded: foldedCheck.checked,
        isSatin,
        express: ctx.expressMode
      };

      const result = calculateZaproszeniaKreda(options);
      const brutto = parseFloat((result.totalPrice * VAT).toFixed(2));

      resultArea.style.display = "block";
      (container.querySelector("#resNettoPrice") as HTMLElement).textContent = formatPLN(result.totalPrice);
      (container.querySelector("#resUnitPrice") as HTMLElement).textContent = formatPLN(result.totalPrice / options.qty);
      (container.querySelector("#resTotalPrice") as HTMLElement).textContent = formatPLN(brutto);
      const tierHintEl = container.querySelector("#resTierHint") as HTMLElement;
      if (tierHintEl) {
        tierHintEl.textContent = `Dla ${options.qty} szt użyto ceny ${result.basePrice.toFixed(2)} zł (papier: ${paperVal.replace("_", " ")})`;
      }
      (container.querySelector("#resExpressHint") as HTMLElement).style.display = options.express ? "block" : "none";
      (container.querySelector("#resSatinHint") as HTMLElement).style.display = options.isSatin ? "block" : "none";

      ctx.updateLastCalculated(brutto, "Zaproszenia");
      return { options, result };
    };

    calcBtn.addEventListener("click", () => calculate());

    addToCartBtn.addEventListener("click", () => {
      const { options, result } = calculate();
      const brutto = parseFloat((result.totalPrice * VAT).toFixed(2));

      ctx.cart.addItem({
        id: `zap-${Date.now()}`,
        category: "Zaproszenia Kreda",
        name: `Zaproszenia ${options.format} ${options.sides === 1 ? '1-str' : '2-str'}${options.isFolded ? ' składane' : ''}`,
        quantity: options.qty,
        unit: "szt",
        unitPrice: brutto / options.qty,
        isExpress: options.express,
        totalPrice: brutto,
        optionsHint: `${options.qty} szt, ${paperSel.value.replace("_", " ")}`,
        payload: options
      });
    });

    // Initial calculation
    calculate();
  }
};
