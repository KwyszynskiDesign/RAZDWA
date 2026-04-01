import { View, ViewContext } from "../types";
import { autoCalc } from "../autoCalc";
import { calculateDyplomy, DyplomyOptions } from "../../categories/dyplomy";
import { formatPLN } from "../../core/money";
import { resolveStoredPrice } from "../../core/compat";

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
    const addToCartBtn = container.querySelector("#addToCartBtn") as HTMLButtonElement;
    const resultArea = container.querySelector("#dypResult") as HTMLElement;
    const breakdownBox = container.querySelector("#dypBreakdown") as HTMLElement;
    const breakdownLines = container.querySelector("#dypBreakdownLines") as HTMLElement;

    const satinRate = resolveStoredPrice("modifier-satyna", 0.12);
    const modiglianiRate = resolveStoredPrice("modifier-modigliani", 0.20);
    const expressRate = resolveStoredPrice("modifier-express", 0.20);

    const calculate = () => {
      if (!qtyInput?.value || parseInt(qtyInput.value) <= 0) {
        resultArea.style.display = 'none';
        breakdownBox.style.display = 'none';
        addToCartBtn.disabled = true;
        return;
      }
      const paperVal = paperSel.value;
      const isSatin = paperVal.startsWith("satyna");
      const isModigliani = paperVal === "modigliani";
      const usesSatinBase = isSatin || isModigliani;
      const options: DyplomyOptions = {
        format: (formatSel.value === "A5" ? "A5" : "A4"),
        qty: parseInt(qtyInput.value),
        sides: parseInt(sidesSel.value) || 1,
        isSatin,
        isModigliani,
        express: ctx.expressMode
      };

      const result = calculateDyplomy(options);
      const totalPrice = result.totalPrice;

      let satinAmount = 0;
      let modiglianiAmount = 0;
      if (options.isModigliani) {
        satinAmount = parseFloat((result.basePrice * satinRate).toFixed(2));
        modiglianiAmount = parseFloat(((result.basePrice + satinAmount) * modiglianiRate).toFixed(2));
      } else if (options.isSatin) {
        satinAmount = parseFloat((result.basePrice * satinRate).toFixed(2));
      }
      const expressAmount = options.express ? parseFloat((result.basePrice * expressRate).toFixed(2)) : 0;

      const breakdown = [
        `<div><strong>Parametry:</strong> ${options.qty} szt, ${options.format}, ${options.sides === 1 ? "jednostronne" : "dwustronne"}</div>`,
        `<div><strong>Cena z tabeli:</strong> ${formatPLN(result.basePrice)}</div>`,
      ];

      if (options.isModigliani) {
        breakdown.push(`<div><strong>Satyna:</strong> ${Math.round(satinRate * 100)}% × ${formatPLN(result.basePrice)} = ${formatPLN(satinAmount)}</div>`);
        breakdown.push(`<div><strong>Modigliani:</strong> ${Math.round(modiglianiRate * 100)}% × (${formatPLN(result.basePrice)} + ${formatPLN(satinAmount)}) = ${formatPLN(modiglianiAmount)}</div>`);
      } else if (options.isSatin) {
        breakdown.push(`<div><strong>Satyna:</strong> ${Math.round(satinRate * 100)}% × ${formatPLN(result.basePrice)} = ${formatPLN(satinAmount)}</div>`);
      } else {
        breakdown.push(`<div><strong>Papier:</strong> Kreda (bez dopłaty) = ${formatPLN(0)}</div>`);
      }

      if (options.express) {
        breakdown.push(`<div><strong>EXPRESS:</strong> ${Math.round(expressRate * 100)}% × ${formatPLN(result.basePrice)} = ${formatPLN(expressAmount)}</div>`);
      } else {
        breakdown.push(`<div><strong>EXPRESS:</strong> nie wybrano = ${formatPLN(0)}</div>`);
      }

      breakdown.push(`<div style="padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.08);"><strong>Razem:</strong> ${formatPLN(result.basePrice)} + ${formatPLN(satinAmount + modiglianiAmount)} + ${formatPLN(expressAmount)} = <strong>${formatPLN(result.totalPrice)}</strong></div>`);
      breakdownLines.innerHTML = breakdown.join("");
      breakdownBox.style.display = "block";

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

    autoCalc({ root: container, calc: calculate });

    addToCartBtn.addEventListener("click", () => {
      const { options, result } = calculate();

      const dpv = paperSel.value;
      const dPaperLabel = dpv === 'modigliani'
        ? 'Modigliani'
        : dpv.startsWith('satyna_')
        ? `Satyna ${dpv.slice(7)}g`
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
  }
};
