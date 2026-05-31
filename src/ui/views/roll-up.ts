import { View, ViewContext } from "../types";
import { autoCalc } from "../autoCalc";
import { calculateRollUp, RollUpOptions } from "../../categories/roll-up";
import { formatPLN } from "../../core/money";
import { getPrice } from "../../services/priceService";
import { resolveStoredPrice } from "../../core/compat";

type BreakdownRow = {
  label: string;
  value: string;
  separatorTop?: boolean;
  strongValue?: boolean;
};

function renderBreakdownRows(target: HTMLElement, rows: BreakdownRow[]): void {
  while (target.children.length > 1) target.removeChild(target.lastChild!);
  Object.assign(target.style, { gap: '8px', fontSize: '14px', lineHeight: '1.45', color: '#334155' });

  for (const row of rows) {
    const line = document.createElement("div");
    if (row.separatorTop) {
      line.style.paddingTop = "8px";
      line.style.borderTop = "1px solid #e2e8f0";
    }

    const strong = document.createElement("strong");
    strong.textContent = `${row.label}:`;
    line.appendChild(strong);
    line.appendChild(document.createTextNode(" "));

    if (row.strongValue) {
      const valueStrong = document.createElement("strong");
      valueStrong.textContent = row.value;
      line.appendChild(valueStrong);
    } else {
      line.appendChild(document.createTextNode(row.value));
    }

    target.appendChild(line);
  }
}

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
    const legendNote = container.querySelector("#rollup-legend-note") as HTMLElement | null;

    const legendTierEls: Record<string, HTMLElement | null> = {
      "85x200-1-5": container.querySelector("#rollup-legend-85x200-1-5"),
      "85x200-6-10": container.querySelector("#rollup-legend-85x200-6-10"),
      "100x200-1-5": container.querySelector("#rollup-legend-100x200-1-5"),
      "100x200-6-10": container.querySelector("#rollup-legend-100x200-6-10"),
      "120x200-1-5": container.querySelector("#rollup-legend-120x200-1-5"),
      "120x200-6-10": container.querySelector("#rollup-legend-120x200-6-10"),
      "150x200-1-5": container.querySelector("#rollup-legend-150x200-1-5"),
      "150x200-6-10": container.querySelector("#rollup-legend-150x200-6-10"),
    };

    const expressRate = resolveStoredPrice("modifier-express", 0.20);

    const updateLegend = () => {
      const formats: Array<"85x200" | "100x200" | "120x200" | "150x200"> = ["85x200", "100x200", "120x200", "150x200"];
      for (const format of formats) {
        const formatData = rollUpData?.formats?.[format];
        if (!formatData?.tiers) continue;
        for (const tier of formatData.tiers as Array<{ min: number; max: number | null; price: number }>) {
          const suffix = tier.max == null ? `${tier.min}+` : `${tier.min}-${tier.max}`;
          const value = resolveStoredPrice(`rollup-${format}-${suffix}`, tier.price);
          const el = legendTierEls[`${format}-${suffix}`];
          if (el) el.innerText = formatPLN(value);
        }
      }

      const replacementLabor = resolveStoredPrice("rollup-wymiana-labor", rollUpData?.replacement?.labor ?? 50);
      const replacementM2 = resolveStoredPrice("rollup-wymiana-m2", rollUpData?.replacement?.print_per_m2 ?? 80);

      if (legendNote) {
        legendNote.innerText = `* Wymiana wkładu: ${formatPLN(replacementLabor)} + ${formatPLN(replacementM2)}/m² wydruku (blockout z czarnym środkiem).`;
      }
    };

    updateLegend();

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

      const breakdown: BreakdownRow[] = [
        { label: "Parametry", value: `${options.format}, ${options.qty} szt, ${options.isReplacement ? "wymiana wkładu" : "komplet"}` },
      ];

      if (options.isReplacement) {
        const fmt = rollUpData.formats[options.format];
        const areaM2 = parseFloat((fmt.width * fmt.height).toFixed(4));
        const labor = resolveStoredPrice("rollup-wymiana-labor", rollUpData.replacement.labor);
        const perM2 = resolveStoredPrice("rollup-wymiana-m2", rollUpData.replacement.print_per_m2);
        breakdown.push({ label: "Wymiana wkładu - praca", value: formatPLN(labor) });
        breakdown.push({ label: "Wymiana wkładu - wydruk", value: `${areaM2} m² × ${formatPLN(perM2)} = ${formatPLN(areaM2 * perM2)}` });
        breakdown.push({ label: "Cena za szt", value: formatPLN(result.totalPrice / options.qty) });
      } else {
        breakdown.push({ label: "Cena za szt", value: formatPLN(unitBase) });
      }

      breakdown.push({ label: "Razem", value: formatPLN(result.totalPrice), separatorTop: true, strongValue: true });
      renderBreakdownRows(breakdownBox, breakdown);
      breakdownBox.style.display = 'grid';

      resultArea.style.display = "block";
      (container.querySelector("#resUnitPrice") as HTMLElement).textContent = formatPLN(result.totalPrice / options.qty);
      (container.querySelector("#resTotalPrice") as HTMLElement).textContent = formatPLN(result.totalPrice);

      addToCartBtn.disabled = false;
      ctx.updateLastCalculated(result.totalPrice, "Roll-up");
    };

    autoCalc({ root: container, calc: calculate });

    ctx?.on?.("prices-updated", () => {
      updateLegend();
      calculate();
    });

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
