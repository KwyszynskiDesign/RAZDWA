import { View, ViewContext } from "../types";
import { quoteVouchery } from "../../categories/vouchery";
import { formatPLN } from "../../core/money";
import { resolveStoredPrice } from "../../core/compat";

export const VoucheryView: View = {
  id: "vouchery",
  name: "Vouchery",
  async mount(container, ctx) {
    try {
      const response = await fetch("categories/vouchery.html");
      if (!response.ok) throw new Error("Failed to load template");
      container.innerHTML = await response.text();

      this.initLogic(container, ctx);
    } catch (err) {
      container.innerHTML = `<div class="error">Błąd ładowania: ${err}</div>`;
    }
  },

  initLogic(container: HTMLElement, ctx: ViewContext) {
    const qtyInput = container.querySelector("#v-qty") as HTMLInputElement;
    const paperSelect = container.querySelector("#v-paper") as HTMLSelectElement;
    const calculateBtn = container.querySelector("#v-calculate") as HTMLButtonElement;
    const addToCartBtn = container.querySelector("#v-add-to-cart") as HTMLButtonElement;
    const resultDisplay = container.querySelector("#v-result-display") as HTMLElement;
    const basePriceSpan = container.querySelector("#v-base-price") as HTMLElement;
    const modifiersRow = container.querySelector("#v-modifiers-row") as HTMLElement;
    const modifiersTotalSpan = container.querySelector("#v-modifiers-total") as HTMLElement;
    const totalPriceSpan = container.querySelector("#v-total-price") as HTMLElement;
    const breakdownDisplay = container.querySelector("#v-breakdown-display") as HTMLElement;
    const breakdownLines = container.querySelector("#v-breakdown-lines") as HTMLElement;
    const tierHint = container.querySelector("#v-tier-hint") as HTMLElement;
    const expressHint = container.querySelector("#v-express-hint") as HTMLElement;
    const satinHint = container.querySelector("#v-satin-hint") as HTMLElement;
    const modiglianiHint = container.querySelector("#v-modigliani-hint") as HTMLElement;

    let currentResult: any = null;
    let currentOptions: any = null;

    const satinRate = resolveStoredPrice("modifier-satyna", 0.12);
    const modiglianiRate = resolveStoredPrice("modifier-modigliani", 0.20);
    const expressRate = resolveStoredPrice("modifier-express", 0.20);

    const renderBreakdown = (result: any, options: any) => {
      const materialLabel = options.sides === "single" ? "jednostronny" : "dwustronny";
      const basePrice = result.basePrice;

      let satinAmount = 0;
      let modiglianiAmount = 0;

      if (options.modigliani) {
        satinAmount = parseFloat((basePrice * satinRate).toFixed(2));
        const satinSubtotal = basePrice + satinAmount;
        modiglianiAmount = parseFloat((satinSubtotal * modiglianiRate).toFixed(2));
      } else if (options.satin) {
        satinAmount = parseFloat((basePrice * satinRate).toFixed(2));
      }

      const expressAmount = options.express ? parseFloat((basePrice * expressRate).toFixed(2)) : 0;
      const materialTotal = parseFloat((satinAmount + modiglianiAmount).toFixed(2));

      const lines = [
        `<div><strong>Nakład i typ:</strong> ${options.qty} szt, ${materialLabel}</div>`,
        `<div><strong>Cena z tabeli:</strong> ${formatPLN(basePrice)}</div>`,
      ];

      if (options.modigliani) {
        lines.push(`<div><strong>Satyna:</strong> ${Math.round(satinRate * 100)}% × ${formatPLN(basePrice)} = ${formatPLN(satinAmount)}</div>`);
        lines.push(`<div><strong>Modigliani:</strong> ${Math.round(modiglianiRate * 100)}% × (${formatPLN(basePrice)} + ${formatPLN(satinAmount)}) = ${formatPLN(modiglianiAmount)}</div>`);
      } else if (options.satin) {
        lines.push(`<div><strong>Satyna:</strong> ${Math.round(satinRate * 100)}% × ${formatPLN(basePrice)} = ${formatPLN(satinAmount)}</div>`);
      } else {
        lines.push(`<div><strong>Papier:</strong> Kreda (bez dopłaty) = ${formatPLN(0)}</div>`);
      }

      if (options.express) {
        lines.push(`<div><strong>EXPRESS:</strong> ${Math.round(expressRate * 100)}% × ${formatPLN(basePrice)} = ${formatPLN(expressAmount)}</div>`);
      } else {
        lines.push(`<div><strong>EXPRESS:</strong> nie wybrano = ${formatPLN(0)}</div>`);
      }

      lines.push(`<div style="padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.08);"><strong>Razem:</strong> ${formatPLN(basePrice)} + ${formatPLN(materialTotal)} + ${formatPLN(expressAmount)} = <strong>${formatPLN(result.totalPrice)}</strong></div>`);

      breakdownLines.innerHTML = lines.join("");
      breakdownDisplay.style.display = "block";
    };

    const performCalculation = (): boolean => {
      const sidesInput = container.querySelector('input[name="v-sides"]:checked') as HTMLInputElement;
      const sides = (sidesInput ? sidesInput.value : 'single') as 'single' | 'double';
      const paperVal = paperSelect.value;
      const isSatin = paperVal.startsWith("satyna");
      const isModigliani = paperVal === "modigliani";
      const usesSatinBase = isSatin || isModigliani;

      currentOptions = {
        qty: parseInt(qtyInput.value),
        sides,
        paper: paperVal,
        satin: isSatin,
        modigliani: isModigliani,
        express: ctx.expressMode
      };

      try {
        const result = quoteVouchery(currentOptions);
        const totalPrice = result.totalPrice;
        currentResult = { ...result, totalPrice, usesSatinBase, isModigliani };

        basePriceSpan.innerText = formatPLN(result.basePrice);

        if (result.modifiersTotal > 0) {
          modifiersRow.style.display = "flex";
          modifiersTotalSpan.innerText = "+" + formatPLN(result.modifiersTotal);
        } else {
          modifiersRow.style.display = "none";
        }

        totalPriceSpan.innerText = formatPLN(totalPrice);
        if (tierHint) tierHint.innerText = `Dla ${currentOptions.qty} szt cena bazowa: ${result.basePrice.toFixed(2)} zł (papier: ${paperVal.replace("_", " ")})`;
        if (expressHint) expressHint.style.display = ctx.expressMode ? "block" : "none";
        if (satinHint) satinHint.style.display = usesSatinBase ? "block" : "none";
        if (modiglianiHint) modiglianiHint.style.display = isModigliani ? "block" : "none";
        renderBreakdown(currentResult, currentOptions);
        resultDisplay.style.display = "block";
        addToCartBtn.disabled = false;

        ctx.updateLastCalculated(totalPrice, "Vouchery");
        return true;
      } catch (err) {
        alert("Błąd: " + (err as Error).message);
        return false;
      }
    };

    calculateBtn.onclick = () => {
      performCalculation();
    };

    addToCartBtn.onclick = () => {
      if (!performCalculation()) return;
      if (currentResult && currentOptions) {
        const pv = currentOptions.paper;
        const paperLabel = pv === 'modigliani'
          ? 'Modigliani'
          : pv.startsWith('satyna_')
            ? `Satyna ${pv.slice(7)}g (+12%)`
            : `Kreda ${pv.slice(6)}g`;
        const sidesLabel = currentOptions.sides === 'single' ? 'Jednostronne' : 'Dwustronne';
        const parts: string[] = [`${currentOptions.qty} szt`, sidesLabel, paperLabel];
        if (currentOptions.express) parts.push('EXPRESS (+20%)');

        ctx.cart.addItem({
          id: `vouchery-${Date.now()}`,
          category: "Vouchery",
          name: 'Vouchery A4',
          quantity: currentOptions.qty,
          unit: "szt",
          unitPrice: currentResult.totalPrice / currentOptions.qty,
          isExpress: currentOptions.express,
          totalPrice: currentResult.totalPrice,
          optionsHint: parts.join(', '),
          payload: currentResult
        });
      }
    };
  }
};
