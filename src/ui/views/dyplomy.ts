import { View, ViewContext } from "../types";
import { autoCalc } from "../autoCalc";
import { calculateDyplomy, DyplomyOptions } from "../../categories/dyplomy";
import { formatPLN } from "../../core/money";
import { resolveStoredPrice } from "../../core/compat";
import { getPrice } from "../../services/priceService";

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
    const legendRows = container.querySelector("#dyp-legend-rows") as HTMLElement | null;

    const updateLegend = () => {
      if (!legendRows) return;
      const tiers = (getPrice("dyplomy") as Array<{ qty: number; price: number }> | undefined) ?? [];
      legendRows.innerHTML = tiers
        .map((tier) => {
          const price = resolveStoredPrice(`dyplomy-qty-${tier.qty}`, tier.price);
          return `<tr><td>${tier.qty} szt</td><td>${formatPLN(price)}</td></tr>`;
        })
        .join("");
    };

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
      const tierPrice = Number((result as any).tierPrice ?? result.basePrice);
      const singleSidedDiscountRate = Number((result as any).singleSidedDiscountRate ?? 0);
      const singleSidedDiscountAmount = Number((result as any).singleSidedDiscountAmount ?? 0);

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
        `<div><strong>Parametry:</strong> ${options.qty} szt, ${options.sides === 1 ? "jednostronne" : "dwustronne"}, format ${options.format} (bez wpływu na cenę)</div>`,
        `<div><strong>Cena z tabeli (dwustronne):</strong> ${formatPLN(tierPrice)}</div>`,
      ];

      if (singleSidedDiscountRate > 0) {
        breakdown.push(`<div><strong>Rabat jednostronne:</strong> ${Math.round(singleSidedDiscountRate * 100)}% × ${formatPLN(tierPrice)} = -${formatPLN(singleSidedDiscountAmount)} (od 6 szt.)</div>`);
      }

      breakdown.push(`<div><strong>Cena bazowa po rabacie:</strong> ${formatPLN(result.basePrice)}</div>`);

      if (options.isModigliani) {
        breakdown.push(`<div><strong>Satyna:</strong> ${Math.round(satinRate * 100)}% × ${formatPLN(result.basePrice)} = ${formatPLN(satinAmount)}</div>`);
        breakdown.push(`<div><strong>Modigliani:</strong> ${Math.round(modiglianiRate * 100)}% × (${formatPLN(result.basePrice)} + ${formatPLN(satinAmount)}) = ${formatPLN(modiglianiAmount)}</div>`);
      } else if (options.isSatin) {
        breakdown.push(`<div><strong>Satyna:</strong> ${Math.round(satinRate * 100)}% × ${formatPLN(result.basePrice)} = ${formatPLN(satinAmount)}</div>`);
      }

      if (options.express) {
        breakdown.push(`<div><strong>EXPRESS:</strong> ${Math.round(expressRate * 100)}% × ${formatPLN(result.basePrice)} = ${formatPLN(expressAmount)}</div>`);
      }

      breakdown.push(`<div style="padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.08);"><strong>Razem:</strong> ${formatPLN(result.basePrice)} + ${formatPLN(satinAmount + modiglianiAmount)} + ${formatPLN(expressAmount)} = <strong>${formatPLN(result.totalPrice)}</strong></div>`);
      breakdownLines.innerHTML = breakdown.join("");
      breakdownBox.style.display = "block";

      resultArea.style.display = "block";
      addToCartBtn.disabled = false;
      (container.querySelector("#resUnitPrice") as HTMLElement).textContent = formatPLN(totalPrice / options.qty);
      (container.querySelector("#resTotalPrice") as HTMLElement).textContent = formatPLN(totalPrice);
      const tierHintEl = container.querySelector("#resTierHint") as HTMLElement;
      if (tierHintEl) {
        const sideLabel = options.sides === 1 ? "jednostronne" : "dwustronne";
        const discountHint = singleSidedDiscountRate > 0
          ? `; rabat jednostronne -${Math.round(singleSidedDiscountRate * 100)}% = -${singleSidedDiscountAmount.toFixed(2)} zł`
          : "";
        tierHintEl.textContent = `Dla ${options.qty} szt użyto ceny tabeli ${tierPrice.toFixed(2)} zł (${sideLabel}${discountHint}; format ${options.format} nie wpływa na cenę; papier: ${paperVal.replace("_", " ")})`;
      }
      const discountHintEl = container.querySelector("#resDiscountHint") as HTMLElement;
      if (discountHintEl) {
        discountHintEl.textContent = singleSidedDiscountRate > 0
          ? `Zastosowano rabat jednostronne: -${Math.round(singleSidedDiscountRate * 100)}% (−${formatPLN(singleSidedDiscountAmount)})`
          : "";
        discountHintEl.style.display = singleSidedDiscountRate > 0 ? "block" : "none";
      }
      (container.querySelector("#resExpressHint") as HTMLElement).style.display = options.express ? "block" : "none";
      (container.querySelector("#resSatinHint") as HTMLElement).style.display = usesSatinBase ? "block" : "none";
      (container.querySelector("#resModiglianiHint") as HTMLElement).style.display = options.isModigliani ? "block" : "none";

      ctx.updateLastCalculated(totalPrice, `Dyplomy ${options.format}`);
      return { options, result };
    };

    autoCalc({ root: container, calc: calculate });
    updateLegend();

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
