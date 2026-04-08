import { View, ViewContext } from "../types";
import { autoCalc } from "../autoCalc";
import { calculateRollUp, RollUpOptions } from "../../categories/roll-up";
import { formatPLN } from "../../core/money";
import { getPrice } from "../../services/priceService";
import { resolveStoredPrice } from "../../core/compat";

const rollUpData: any = getPrice("rollUp");

export const RollUpView: View = {
  id: "roll-up",
  name: "Roll-up",
  async mount(container, ctx) {
    const response = await fetch("categories/roll-up.html");
    container.innerHTML = await response.text();

    const typeSel = container.querySelector("#rollUpType") as HTMLSelectElement;
    const formatSel = container.querySelector("#rollUpFormat") as HTMLSelectElement;
    const qtyInput = container.querySelector("#rollUpQty") as HTMLInputElement;
    const addToCartBtn = container.querySelector("#addToCartBtn") as HTMLButtonElement;
    const resultArea = container.querySelector("#rollUpResult") as HTMLElement;
    const breakdownBox = container.querySelector("#rollUpBreakdown") as HTMLElement;
    const breakdownLines = container.querySelector("#rollUpBreakdownLines") as HTMLElement;

    const expressRate = resolveStoredPrice("modifier-express", 0.20);

    const ensureLegend = () => {
      let legend = container.querySelector<HTMLElement>("#rollup-dynamic-legend");
      if (!legend) {
        legend = document.createElement("div");
        legend.id = "rollup-dynamic-legend";
        legend.className = "card";
        legend.style.marginTop = "16px";
        const anchor = container.querySelector("#rollUpBreakdown") as HTMLElement | null;
        (anchor ?? resultArea).insertAdjacentElement("afterend", legend);
      }

      const fullRows = Object.entries(rollUpData?.formats ?? {}).map(([format, formatData]: [string, any]) => {
        const tiers = (formatData.tiers ?? []).map((tier: any) => {
          const suffix = tier.max == null ? `${tier.min}+` : `${tier.min}-${tier.max}`;
          const price = resolveStoredPrice(`rollup-${format}-${suffix}`, tier.price);
          const range = tier.max == null ? `${tier.min}+ szt` : `${tier.min}-${tier.max} szt`;
          return `<div>${range}: ${formatPLN(price)}</div>`;
        }).join("");
        return `<tr><td>${format}</td><td>${tiers}</td></tr>`;
      }).join("");

      const replacementLabor = resolveStoredPrice("rollup-wymiana-labor", rollUpData?.replacement?.labor ?? 50);
      const replacementM2 = resolveStoredPrice("rollup-wymiana-m2", rollUpData?.replacement?.print_per_m2 ?? 80);

      legend.innerHTML = `
        <h3 style="margin:0 0 10px; font-size:16px;">Legenda cen (dynamiczna)</h3>
        <h4 style="margin:10px 0 6px;">Roll-up komplet</h4>
        <table><tr><th>Format</th><th>Progi cenowe</th></tr>${fullRows}</table>
        <h4 style="margin:10px 0 6px;">Wymiana wkładu</h4>
        <div>Wydruk: ${formatPLN(replacementM2)} / m²</div>
        <div>Robocizna: ${formatPLN(replacementLabor)} / szt.</div>
        <div class="hint" style="margin-top:8px;">EXPRESS: +${Math.round(expressRate * 100)}%</div>
      `;
    };

    ensureLegend();

    let currentOptions: RollUpOptions | null = null;
    let currentResult: ReturnType<typeof calculateRollUp> | null = null;

    addToCartBtn.disabled = true;

    const calculate = () => {
      if (!typeSel.value || !formatSel.value) {
        resultArea.style.display = "none";
        breakdownBox.style.display = "none";
        addToCartBtn.disabled = true;
        return;
      }
      if (!qtyInput.value) {
        resultArea.style.display = "none";
        breakdownBox.style.display = "none";
        addToCartBtn.disabled = true;
        return;
      }
      const options: RollUpOptions = {
        format: formatSel.value,
        qty: parseInt(qtyInput.value) || 1,
        isReplacement: typeSel.value === "replacement",
        express: ctx.expressMode
      };

      const result = calculateRollUp(options);
      currentOptions = options;
      currentResult = result;

      const unitBase = parseFloat((result.basePrice / options.qty).toFixed(2));
      const expressAmount = options.express ? parseFloat((result.basePrice * expressRate).toFixed(2)) : 0;

      const breakdown: string[] = [
        `<div><strong>Parametry:</strong> ${options.format}, ${options.qty} szt, ${options.isReplacement ? "wymiana wkładu" : "komplet"}</div>`,
      ];

      if (options.isReplacement) {
        const fmt = rollUpData.formats[options.format];
        const areaM2 = parseFloat((fmt.width * fmt.height).toFixed(4));
        const labor = resolveStoredPrice("rollup-wymiana-labor", rollUpData.replacement.labor);
        const perM2 = resolveStoredPrice("rollup-wymiana-m2", rollUpData.replacement.print_per_m2);
        breakdown.push(`<div><strong>Wydruk wkładu:</strong> ${areaM2} m² × ${formatPLN(perM2)} = ${formatPLN(areaM2 * perM2)}</div>`);
        breakdown.push(`<div><strong>Robocizna:</strong> ${formatPLN(labor)} / szt</div>`);
        breakdown.push(`<div><strong>Cena bazowa:</strong> ${options.qty} × (${formatPLN(areaM2 * perM2)} + ${formatPLN(labor)}) = ${formatPLN(result.basePrice)}</div>`);
      } else {
        breakdown.push(`<div><strong>Cena bazowa:</strong> ${options.qty} × ${formatPLN(unitBase)} = ${formatPLN(result.basePrice)}</div>`);
      }

      if (options.express) {
        breakdown.push(`<div><strong>EXPRESS:</strong> ${Math.round(expressRate * 100)}% × ${formatPLN(result.basePrice)} = ${formatPLN(expressAmount)}</div>`);
      }

      breakdown.push(`<div style="padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.08);"><strong>Razem:</strong> ${formatPLN(result.basePrice)} + ${formatPLN(expressAmount)} = <strong>${formatPLN(result.totalPrice)}</strong></div>`);
      breakdownLines.innerHTML = breakdown.join("");
      breakdownBox.style.display = "block";

      resultArea.style.display = "block";
      (container.querySelector("#resUnitPrice") as HTMLElement).textContent = formatPLN(result.totalPrice / options.qty);
      (container.querySelector("#resTotalPrice") as HTMLElement).textContent = formatPLN(result.totalPrice);
      (container.querySelector("#resExpressHint") as HTMLElement).style.display = options.express ? "block" : "none";

      addToCartBtn.disabled = false;
      ctx.updateLastCalculated(result.totalPrice, "Roll-up");
    };

    autoCalc({ root: container, calc: calculate });

    addToCartBtn.addEventListener("click", () => {
      if (!currentOptions || !currentResult) return;

      ctx.cart.addItem({
        id: `rollup-${Date.now()}`,
        category: "Roll-up",
        name: `${currentOptions.isReplacement ? 'Wymiana wkładu' : 'Roll-up Komplet'} ${currentOptions.format}`,
        quantity: currentOptions.qty,
        unit: "szt",
        unitPrice: currentResult.totalPrice / currentOptions.qty,
        isExpress: currentOptions.express,
        totalPrice: currentResult.totalPrice,
        optionsHint: `${currentOptions.format}, ${currentOptions.qty} szt`,
        payload: currentOptions
      });
    });
  }
};
