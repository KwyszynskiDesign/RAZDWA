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
    const formatSel = container.querySelector("#dypFormat") as HTMLSelectElement;
    const qtyInput = container.querySelector("#dypQty") as HTMLInputElement;
    const paperSel = container.querySelector("#dypPaper") as HTMLSelectElement;
    const calcBtn = container.querySelector("#calcBtn") as HTMLButtonElement;
    const addToCartBtn = container.querySelector("#addToCartBtn") as HTMLButtonElement;
    const resultArea = container.querySelector("#dypResult") as HTMLElement;

    const calculate = () => {
      const paperVal = paperSel.value;
      const isSatin = paperVal.startsWith("satyna");
      const isModigliani = paperVal === "modigliani";
      const usesSatinBase = isSatin || isModigliani;
      const options: DyplomyOptions = {
        format: (formatSel.value === "A5" ? "A5" : "A4"),
        qty: parseInt(qtyInput.value) || 1,
        sides: parseInt(sidesSel.value) || 1,
        isSatin,
        isModigliani,
        express: ctx.expressMode
      };

      const result = calculateDyplomy(options);
      const totalPrice = result.totalPrice;

      resultArea.style.display = "block";
      (container.querySelector("#resUnitPrice") as HTMLElement).textContent = formatPLN(totalPrice / options.qty);
      (container.querySelector("#resTotalPrice") as HTMLElement).textContent = formatPLN(totalPrice);
      const tierHintEl = container.querySelector("#resTierHint") as HTMLElement;
      if (tierHintEl) {
        tierHintEl.textContent = `Dla ${options.qty} szt użyto ceny ${result.basePrice.toFixed(2)} zł (format: ${options.format}, papier: ${paperVal.replace("_", " ")})`;
      }
      (container.querySelector("#resDiscountHint") as HTMLElement).style.display = result.appliedModifiers.includes("bulk-discount") ? "block" : "none";
      (container.querySelector("#resExpressHint") as HTMLElement).style.display = options.express ? "block" : "none";
      (container.querySelector("#resSatinHint") as HTMLElement).style.display = usesSatinBase ? "block" : "none";
      (container.querySelector("#resModiglianiHint") as HTMLElement).style.display = options.isModigliani ? "block" : "none";

      ctx.updateLastCalculated(totalPrice, `Dyplomy ${options.format}`);
      return { options, result };
    };

    calcBtn.addEventListener("click", () => calculate());

    addToCartBtn.addEventListener("click", () => {
      const { options, result } = calculate();

      const dpv = paperSel.value;
      const dPaperLabel = dpv === 'modigliani'
        ? 'Modigliani'
        : dpv.startsWith('satyna_')
        ? `Satyna ${dpv.slice(7)}g (+12%)`
        : `Kreda ${dpv.slice(6)}g`;

      ctx.cart.addItem({
        id: `dyp-${Date.now()}`,
        category: "Dyplomy",
        name: `Dyplomy ${options.format} ${options.sides === 1 ? '1-str' : '2-str'}`,
        quantity: options.qty,
        unit: "szt",
        unitPrice: result.totalPrice / options.qty,
        isExpress: options.express,
        totalPrice: result.totalPrice,
        optionsHint: [`${options.qty} szt`, `${options.format}`, dPaperLabel, ...(options.express ? ['EXPRESS (+20%)'] : [])].join(', '),
        payload: options
      });
    });

    // Initial calculation
    calculate();
  }
};
