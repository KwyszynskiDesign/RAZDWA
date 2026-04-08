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
    const legendTitle = container.querySelector("#u-legend-title") as HTMLElement | null;
    const legendTbody = container.querySelector("#u-table-legend tbody") as HTMLElement | null;
    const dynamicLegendNote = container.querySelector("#u-dynamic-legend-note") as HTMLElement | null;

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
      const sides = getSelectedSides();
      const paperVal = paperSelect.value;
      const isSatin = paperVal.startsWith("satyna");
      const factor = isSatin ? SATIN_MULTIPLIER : 1;
      const formatOrder: Array<"A5" | "A6" | "DL"> = ["A5", "A6", "DL"];
      const sidePrefix = sides === "dwustronne" ? "dwu" : "jed";
      const sidePath = sides === "dwustronne" ? "ulotkiDwustronne" : "ulotkiJednostronne";

      const priceByFormatByQty: Record<string, Record<number, number>> = {};
      const qtySet = new Set<number>();

      formatOrder.forEach((format) => {
        const tiers = (getPrice(`${sidePath}.formats.${format}.tiers`) as any[]) ?? [];
        const map: Record<number, number> = {};
        tiers.forEach((tier: any) => {
          const base = resolveStoredPrice(`ulotki-${sidePrefix}-${format.toLowerCase()}-${tier.min}`, tier.price);
          const final = parseFloat((base * factor).toFixed(2));
          map[Number(tier.min)] = final;
          qtySet.add(Number(tier.min));
        });
        priceByFormatByQty[format] = map;
      });

      const qtyList = Array.from(qtySet).sort((a, b) => a - b);

      if (legendTbody) {
        legendTbody.innerHTML = qtyList.map((qty) => {
          const a5 = priceByFormatByQty.A5?.[qty];
          const a6 = priceByFormatByQty.A6?.[qty];
          const dl = priceByFormatByQty.DL?.[qty];
          return `<tr><td>${qty}</td><td>${typeof a5 === "number" ? formatPLN(a5) : "-"}</td><td>${typeof a6 === "number" ? formatPLN(a6) : "-"}</td><td>${typeof dl === "number" ? formatPLN(dl) : "-"}</td></tr>`;
        }).join("");
      }

      if (legendTitle) {
        legendTitle.innerText = `CENNIK ULOTEK ${sides === "dwustronne" ? "DWUSTRONNYCH" : "JEDNOSTRONNYCH"}`;
      }

      if (dynamicLegendNote) {
        dynamicLegendNote.innerText = `Papier: ${isSatin ? "satyna" : "kreda"}. Satyna +${Math.round((SATIN_MULTIPLIER - 1) * 100)}%, EXPRESS +${Math.round(resolveStoredPrice("modifier-express", 0.2) * 100)}%.`;
      }
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
