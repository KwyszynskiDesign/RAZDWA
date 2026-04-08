import { View, ViewContext } from "../types";
import { autoCalc } from "../autoCalc";
import { calculateWycinanieFolii, WycinanieFoliiOptions } from "../../categories/wycinanie-folii";
import { formatPLN } from "../../core/money";
import { getPrice } from "../../services/priceService";
import { resolveStoredPrice } from "../../core/compat";

export const WycinanieFoliiView: View = {
  id: "wycinanie-folii",
  name: "Wycinanie z folii",
  async mount(container, ctx) {
    try {
      const response = await fetch("categories/wycinanie-folii.html");
      if (!response.ok) throw new Error("Failed to load template");
      container.innerHTML = await response.text();
      this.initLogic?.(container, ctx);
    } catch (err) {
      container.innerHTML = `<div class="error">Błąd ładowania: ${err}</div>`;
    }
  },

  initLogic(container: HTMLElement, ctx: ViewContext) {
    const data = getPrice("wycinanieFolii") as any;
    const defaultPrices = getPrice("defaultPrices") as any;
    const widthInput = container.querySelector("#wf-width") as HTMLInputElement;
    const heightInput = container.querySelector("#wf-height") as HTMLInputElement;
    const colorInput = container.querySelector("#wf-color") as HTMLInputElement;
    const goldCheck = container.querySelector("#wf-gold") as HTMLInputElement;
    const silverCheck = container.querySelector("#wf-silver") as HTMLInputElement;
    const customCheck = container.querySelector("#wf-custom") as HTMLInputElement;
    const foilTypeCheckboxes = container.querySelectorAll(".wf-foil-type") as NodeListOf<HTMLInputElement>;
    const addBtn = container.querySelector("#wf-add-to-cart") as HTMLButtonElement;

    const resultEl = container.querySelector("#wf-result") as HTMLElement;
    const breakdownDisplay = container.querySelector("#wf-breakdown-display") as HTMLElement | null;
    const breakdownLines = container.querySelector("#wf-breakdown-lines") as HTMLElement | null;
    const areaEl = container.querySelector("#wf-area") as HTMLElement;
    const unitEl = container.querySelector("#wf-unit") as HTMLElement;
    const totalEl = container.querySelector("#wf-total") as HTMLElement;
    const expressEl = container.querySelector("#wf-express") as HTMLElement;

    const ensureLegend = () => {
      let legend = container.querySelector<HTMLElement>("#wf-dynamic-legend");
      if (!legend) {
        legend = document.createElement("div");
        legend.id = "wf-dynamic-legend";
        legend.className = "card";
        legend.style.marginTop = "16px";
        const anchor = container.querySelector("#wf-breakdown-display") as HTMLElement | null;
        (anchor ?? resultEl).insertAdjacentElement("afterend", legend);
      }

      const rows = (data?.variants ?? []).map((variant: any) => {
        const keyAbove = `wycinanie-folii-${variant.id}`;
        const keyBelow = `wycinanie-folii-${variant.id}-ponizej`;
        const aboveDefault = variant?.rates?.aboveOrEqual1m2 ?? (variant.id === "zloto-srebro" ? 150 : 125);
        const belowDefault = variant?.rates?.below1m2 ?? (variant.id === "zloto-srebro" ? 220 : 200);
        const above = defaultPrices?.[keyAbove] ?? aboveDefault;
        const below = defaultPrices?.[keyBelow] ?? belowDefault;

        return `<tr><td>${variant.name}</td><td>&lt; 1 m²: ${formatPLN(below)}</td><td>≥ 1 m²: ${formatPLN(above)}</td></tr>`;
      }).join("");

      const minRule = (data?.rules ?? []).find((r: any) => r.type === "minimum" && r.unit === "pln")?.value ?? 30;

      legend.innerHTML = `
        <table><tr><th>Wariant</th><th>Stawka poniżej 1 m²</th><th>Stawka od 1 m²</th></tr>${rows}</table>
        <div class="hint" style="margin-top:8px;">Minimalna kwota: ${formatPLN(minRule)}, EXPRESS: +${Math.round(resolveStoredPrice("modifier-express", 0.2) * 100)}%</div>
      `;
    };

    ensureLegend();

    let currentOptions: (WycinanieFoliiOptions & { color?: string }) | null = null;
    let currentResult: any = null;

    // Single-choice for foil type
    const enforceSingleChoiceFoilType = () => {
      foilTypeCheckboxes.forEach((checkbox) => {
        checkbox.addEventListener("change", () => {
          if (!checkbox.checked) return;
          foilTypeCheckboxes.forEach((other) => {
            if (other !== checkbox) other.checked = false;
          });
        });
      });
    };
    enforceSingleChoiceFoilType();

    const getSelectedColor = (): string | undefined => {
      if (goldCheck.checked) return "złota";
      if (silverCheck.checked) return "srebrna";
      if (customCheck.checked) {
        const custom = (colorInput?.value || "").trim();
        return custom || undefined;
      }
      return undefined;
    };

    const calculate = () => {
      const color = getSelectedColor();
      
      if (!color) {
        throw new Error("Wybierz kolor: złota, srebrna lub wpisz inny kolor.");
      }

      const variantId: WycinanieFoliiOptions["variantId"] =
        goldCheck.checked || silverCheck.checked ? "zloto-srebro" : "kolorowa";

      const options: WycinanieFoliiOptions = {
        variantId,
        widthMm: parseInt(widthInput.value) || 0,
        heightMm: parseInt(heightInput.value) || 0,
        express: ctx.expressMode
      };

      const result = calculateWycinanieFolii(options);
      const areaM2 = (options.widthMm * options.heightMm) / 1_000_000;
      const basePrice = Number(result.basePrice || 0);
      const expressValue = Number(result.modifiersTotal || 0);
      const minRule = (data?.rules ?? []).find((r: any) => r.type === "minimum" && r.unit === "pln")?.value ?? 30;
      const appliedRate = areaM2 < 1
        ? (defaultPrices?.[`wycinanie-folii-${variantId}-ponizej`] ?? (variantId === "zloto-srebro" ? 220 : 200))
        : (defaultPrices?.[`wycinanie-folii-${variantId}`] ?? (variantId === "zloto-srebro" ? 150 : 125));
      const colorLabel = color ?? "-";

      areaEl.innerText = `${areaM2.toFixed(2)} m2`;
      unitEl.innerText = formatPLN(result.tierPrice);
      totalEl.innerText = formatPLN(result.totalPrice);
      expressEl.style.display = options.express ? "block" : "none";
      resultEl.style.display = "block";
      if (breakdownDisplay && breakdownLines) {
        const lines: string[] = [
          `<div><strong>Parametry:</strong> ${options.widthMm} × ${options.heightMm} mm, kolor: ${colorLabel}</div>`,
          `<div><strong>Powierzchnia:</strong> ${areaM2.toFixed(4)} m²</div>`,
          `<div><strong>Stawka:</strong> ${formatPLN(appliedRate)} / m² (${areaM2 < 1 ? "poniżej 1 m²" : "od 1 m²"})</div>`,
          `<div><strong>Cena bazowa:</strong> ${areaM2.toFixed(4)} × ${formatPLN(appliedRate)} = ${formatPLN(basePrice)}</div>`
        ];

        if (basePrice < minRule) {
          lines.push(`<div><strong>Minimalna kwota:</strong> podniesiono do ${formatPLN(minRule)}</div>`);
        }

        if (options.express) {
          lines.push(`<div><strong>EXPRESS:</strong> +20% = ${formatPLN(expressValue)}</div>`);
        }

        lines.push(`<div style="padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.08);"><strong>Razem:</strong> ${formatPLN(result.totalPrice)}</div>`);
        breakdownLines.innerHTML = lines.join("");
        breakdownDisplay.style.display = "block";
      }
      addBtn.disabled = false;

      currentOptions = {
        ...options,
        color: color
      };
      currentResult = result;
      ctx.updateLastCalculated(result.totalPrice, "Wycinanie z folii");
    };

    autoCalc({ root: container, calc: calculate });

    addBtn.onclick = () => {
      if (!currentOptions || !currentResult) return;

      const foilName = (currentOptions.color ? `Folia ${currentOptions.color}` : "Wycinanie z folii");
      const areaM2 = (currentOptions.widthMm * currentOptions.heightMm) / 1_000_000;
      const colorHint = currentOptions.color ? `, kolor: ${currentOptions.color}` : "";

      ctx.cart.addItem({
        id: `wycinanie-${Date.now()}`,
        category: "Wycinanie z folii",
        name: foilName,
        quantity: areaM2,
        unit: "m2",
        unitPrice: currentResult.tierPrice,
        isExpress: currentOptions.express,
        totalPrice: currentResult.totalPrice,
        optionsHint: `${currentOptions.widthMm}x${currentOptions.heightMm} mm, ${areaM2.toFixed(2)} m2${colorHint}${currentOptions.express ? ", EXPRESS" : ""}`,
        payload: {
          ...currentOptions,
          ...currentResult
        }
      });
    };


  }
};
