import { View, ViewContext } from "../types";
import { autoCalc } from "../autoCalc";
import { quoteUlotkiDwustronne } from "../../categories/ulotki-cyfrowe-dwustronne";
import { quoteJednostronne } from "../../categories/ulotki-cyfrowe-jednostronne";
import { formatPLN } from "../../core/money";
import { getPrice } from "../../services/priceService";
import { resolveStoredPrice } from "../../core/compat";

const SATIN_MULTIPLIER = 1.12;

export const UlotkiCyfroweView: View = {
  id: "ulotki-cyfrowe",
  name: "Ulotki cyfrowe",
  async mount(container, ctx) {
    try {
      const response = await fetch("categories/ulotki-cyfrowe.html");
      if (!response.ok) throw new Error("Failed to load template");
      container.innerHTML = await response.text();

      this.initLogic?.(container, ctx);
    } catch (err) {
      container.innerHTML = `<div class="error">Błąd ładowania: ${err}</div>`;
    }
  },

  initLogic(container: HTMLElement, ctx: ViewContext) {
    const formatSelect = container.querySelector("#u-format") as HTMLSelectElement;
    const qtySelect = container.querySelector("#u-qty") as HTMLSelectElement;
    const paperSelect = container.querySelector("#u-paper") as HTMLSelectElement;
    const addToCartBtn = container.querySelector("#u-add-to-cart") as HTMLButtonElement;
    const resultDisplay = container.querySelector("#u-result-display") as HTMLElement;
    const breakdownDisplay = container.querySelector("#u-breakdown-display") as HTMLElement;
    const breakdownLines = container.querySelector("#u-breakdown-lines") as HTMLElement;
    const totalPriceSpan = container.querySelector("#u-total-price") as HTMLElement;
    const unitPriceSpan = container.querySelector("#u-unit-price") as HTMLElement | null;
    const tierHint = container.querySelector("#u-tier-hint") as HTMLElement;
    const expressHint = container.querySelector("#u-express-hint") as HTMLElement;
    const satinHint = container.querySelector("#u-satin-hint") as HTMLElement;
    const sidesInputs = Array.from(container.querySelectorAll<HTMLInputElement>('input[name="sides"]'));
    const sideBySideLegendNote = container.querySelectorAll<HTMLElement>(".cennik-note");

    if (!formatSelect || !qtySelect || !paperSelect || !addToCartBtn || !resultDisplay || !totalPriceSpan) {
      container.innerHTML = `<div class="error">Błąd: brak elementów formularza ulotek.</div>`;
      return;
    }

    let currentResult: any = null;
    let currentOptions: any = null;

    const renderBreakdown = (result: any, options: any, paperVal: string) => {
      const basePrice = result.basePrice;
      const satinAmount = result.isSatin ? parseFloat((basePrice * 0.12).toFixed(2)) : 0;
      const expressAmount = options.express ? parseFloat((basePrice * 0.20).toFixed(2)) : 0;

      const lines = [
        `<div><strong>Parametry:</strong> ${options.qty} szt, ${options.format}, ${options.sides}</div>`,
        `<div><strong>Cena z tabeli:</strong> ${formatPLN(basePrice)}</div>`,
      ];

      if (result.isSatin) {
        lines.push(`<div><strong>Satyna:</strong> 12% × ${formatPLN(basePrice)} = ${formatPLN(satinAmount)}</div>`);
      } else {
        lines.push(`<div><strong>Papier:</strong> Kreda (bez dopłaty) = ${formatPLN(0)}</div>`);
      }

      if (options.express) {
        lines.push(`<div><strong>EXPRESS:</strong> 20% × ${formatPLN(basePrice)} = ${formatPLN(expressAmount)}</div>`);
      } else {
        lines.push(`<div><strong>EXPRESS:</strong> nie wybrano = ${formatPLN(0)}</div>`);
      }

      lines.push(`<div style="padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.08);"><strong>Razem:</strong> ${formatPLN(basePrice)} + ${formatPLN(satinAmount)} + ${formatPLN(expressAmount)} = <strong>${formatPLN(result.totalPrice)}</strong></div>`);

      breakdownLines.innerHTML = lines.join("");
      breakdownDisplay.style.display = "block";
    };

    const getSelectedSides = () => {
      const selected = sidesInputs.find(i => i.checked);
      return (selected?.value === "dwustronne" ? "dwustronne" : "jednostronne") as "jednostronne" | "dwustronne";
    };

    const populateTables = () => {
      const singleTbody = container.querySelector("#u-table-single tbody") as HTMLElement | null;
      const doubleTbody = container.querySelector("#u-table-double tbody") as HTMLElement | null;
      const format = (formatSelect.value || "A5") as "A6" | "A5" | "DL";
      const singleTiers = getPrice(`ulotkiJednostronne.formats.${format}.tiers`) as any[];
      const doubleTiers = getPrice(`ulotkiDwustronne.formats.${format}.tiers`) as any[];

      if (singleTbody) {
        singleTbody.innerHTML = (singleTiers ?? []).map((tier: any) => {
          const price = resolveStoredPrice(`ulotki-jed-${format.toLowerCase()}-${tier.min}`, tier.price);
          return `<tr><td>${tier.min}</td><td>${formatPLN(price)}</td></tr>`;
        }).join("");
      }

      if (doubleTbody) {
        doubleTbody.innerHTML = (doubleTiers ?? []).map((tier: any) => {
          const price = resolveStoredPrice(`ulotki-dwu-${format.toLowerCase()}-${tier.min}`, tier.price);
          return `<tr><td>${tier.min}</td><td>${formatPLN(price)}</td></tr>`;
        }).join("");
      }

      sideBySideLegendNote.forEach((note) => {
        note.innerText = `* Format legendy: ${format}. Satyna +${Math.round((SATIN_MULTIPLIER - 1) * 100)}%. EXPRESS +${Math.round(resolveStoredPrice("modifier-express", 0.2) * 100)}%.`;
      });
    };

    const performCalculation = () => {
      if (!formatSelect.value) {
        resultDisplay.style.display = "none";
        addToCartBtn.disabled = true;
        return;
      }
      if (!qtySelect.value) {
        resultDisplay.style.display = "none";
        addToCartBtn.disabled = true;
        return;
      }
      const sides = getSelectedSides();
      const paperVal = paperSelect.value;
      const isSatin = paperVal.startsWith("satyna");

      currentOptions = {
        format: formatSelect.value,
        qty: parseInt(qtySelect.value, 10),
        express: ctx.expressMode,
        sides
      };

      try {
        const result = sides === "dwustronne"
          ? quoteUlotkiDwustronne(currentOptions)
          : quoteJednostronne(currentOptions);

        const totalPrice = isSatin ? parseFloat((result.totalPrice * SATIN_MULTIPLIER).toFixed(2)) : result.totalPrice;
        currentResult = { ...result, totalPrice, isSatin };

        totalPriceSpan.innerText = formatPLN(totalPrice);
        if (unitPriceSpan) unitPriceSpan.innerText = formatPLN(totalPrice / currentOptions.qty);
        if (tierHint) tierHint.innerText = `${currentOptions.qty} szt, ${currentOptions.format}, ${paperVal.replace("_", " ")} — cena bazowa: ${result.totalPrice.toFixed(2)} zł`;
        if (expressHint) expressHint.style.display = ctx.expressMode ? "block" : "none";
        if (satinHint) satinHint.style.display = isSatin ? "block" : "none";
        renderBreakdown(currentResult, currentOptions, paperVal);
        resultDisplay.style.display = "block";
        addToCartBtn.disabled = false;

        ctx.updateLastCalculated(totalPrice, "Ulotki");
      } catch (err) {
        addToCartBtn.disabled = true;
        resultDisplay.style.display = "none";
      }
    };

    autoCalc({ root: container, calc: performCalculation });
    [formatSelect, qtySelect, paperSelect, ...sidesInputs].forEach((el) => {
      el.addEventListener("change", populateTables);
    });

    addToCartBtn.onclick = () => {
      if (currentResult && currentOptions) {
        const pv = paperSelect.value;
        const paperLabel = pv.startsWith('satyna_')
          ? `Satyna ${pv.slice(7)}g`
          : `Kreda ${pv.slice(6)}g`;
        const sidesLabel = currentOptions.sides === 'dwustronne' ? 'Dwustronne' : 'Jednostronne';
        const parts: string[] = [
          `${currentOptions.qty} szt`,
          currentOptions.format,
          sidesLabel,
          paperLabel
        ];
        if (currentOptions.express) parts.push('EXPRESS (+20%)');

        ctx.cart.addItem({
          id: `ulotki-${Date.now()}`,
          category: "Ulotki",
          name: `Ulotki ${currentOptions.format}`,
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

    populateTables();
  }
};
