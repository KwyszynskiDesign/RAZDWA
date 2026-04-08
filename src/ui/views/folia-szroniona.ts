import { View, ViewContext } from "../types";
import { autoCalc } from "../autoCalc";
import { calculateFoliaSzroniona } from "../../categories/folia-szroniona";
import { formatPLN } from "../../core/money";
import { getPrice } from "../../services/priceService";
import { resolveStoredPrice } from "../../core/compat";

export const FoliaSzronionaView: View = {
  id: "folia-szroniona",
  name: "Folia szroniona",
  async mount(container, ctx) {
    try {
      const response = await fetch("categories/folia-szroniona.html");
      if (!response.ok) throw new Error("Failed to load template");
      container.innerHTML = await response.text();

      this.initLogic?.(container, ctx);
    } catch (err) {
      container.innerHTML = `<div class="error">Błąd ładowania: ${err}</div>`;
    }
  },

  initLogic(container: HTMLElement, ctx: ViewContext) {
    const data = getPrice("foliaSzroniona") as any;
    const serviceSelect = container.querySelector("#fs-service") as HTMLSelectElement;
    const widthInput = container.querySelector("#fs-width") as HTMLInputElement;
    const heightInput = container.querySelector("#fs-height") as HTMLInputElement;
    const addToCartBtn = container.querySelector("#fs-add-to-cart") as HTMLButtonElement;
    const resultDisplay = container.querySelector("#fs-result-display") as HTMLElement;
    const normalResult = container.querySelector("#fs-normal-result") as HTMLElement;
    const customQuote = container.querySelector("#fs-custom-quote") as HTMLElement;
    const areaValSpan = container.querySelector("#fs-area-val") as HTMLElement;
    const unitPriceSpan = container.querySelector("#fs-unit-price") as HTMLElement;
    const totalPriceSpan = container.querySelector("#fs-total-price") as HTMLElement;
    const expressHint = container.querySelector("#fs-express-hint") as HTMLElement;

    const ensureLegend = () => {
      let legend = container.querySelector<HTMLElement>("#fs-dynamic-legend");
      if (!legend) {
        legend = document.createElement("div");
        legend.id = "fs-dynamic-legend";
        legend.className = "card";
        legend.style.marginTop = "16px";
        const anchor = container.querySelector("#fs-breakdown-display") as HTMLElement | null;
        (anchor ?? resultDisplay).insertAdjacentElement("afterend", legend);
      }

      const materialsHtml = (data?.materials ?? []).map((material: any) => {
        const rows = (material.tiers ?? []).map((tier: any) => {
          const suffix = tier.max == null ? `${tier.min}+` : `${tier.min}-${tier.max}`;
          const key = `folia-szroniona-${material.storageId ?? material.id}-${suffix}`;
          const price = resolveStoredPrice(key, tier.price);
          const range = tier.max == null ? `${tier.min}+ m²` : `${tier.min}-${tier.max} m²`;
          return `<tr><td>${range}</td><td>${formatPLN(price)}</td></tr>`;
        }).join("");

        return `<h4 style="margin:10px 0 6px;">${material.name}</h4><table><tr><th>Zakres</th><th>Cena</th></tr>${rows}</table>`;
      }).join("");

      legend.innerHTML = `
        ${materialsHtml}
        <div class="hint" style="margin-top:8px;">Minimalne rozliczenie: 1 m², EXPRESS: +${Math.round(resolveStoredPrice("modifier-express", 0.2) * 100)}%</div>
      `;
    };

    ensureLegend();

    let currentResult: any = null;
    let currentOptions: any = null;

    const performCalculation = () => {
      if (!serviceSelect.value) {
        resultDisplay.style.display = "none";
        addToCartBtn.disabled = true;
        return;
      }
      currentOptions = {
        serviceId: serviceSelect.value,
        widthMm: parseInt(widthInput.value) || 0,
        heightMm: parseInt(heightInput.value) || 0,
        express: ctx.expressMode
      };

      const result = calculateFoliaSzroniona(currentOptions);
      currentResult = result;

      if (result.isCustom) {
          normalResult.style.display = "none";
          customQuote.style.display = "block";
          addToCartBtn.disabled = true;
        ctx.updateLastCalculated(0, "Folia szroniona / OWV (wycena ind.)");
      } else {
          normalResult.style.display = "block";
          customQuote.style.display = "none";
          const areaM2 = (currentOptions.widthMm * currentOptions.heightMm) / 1000000;
          if (areaValSpan) areaValSpan.innerText = `${areaM2.toFixed(2)} m2${result.effectiveQuantity > areaM2 ? ' (min. 1m2)' : ''}`;
          if (unitPriceSpan) unitPriceSpan.innerText = formatPLN(result.tierPrice);
          if (totalPriceSpan) totalPriceSpan.innerText = formatPLN(result.totalPrice);
          addToCartBtn.disabled = false;
          ctx.updateLastCalculated(result.totalPrice, "Folia szroniona / OWV");
      }

      if (expressHint) expressHint.style.display = ctx.expressMode ? "block" : "none";
      resultDisplay.style.display = "block";
    };

    autoCalc({ root: container, calc: performCalculation });

    addToCartBtn.onclick = () => {
      if (currentResult && currentOptions) {
        const serviceName = serviceSelect.options[serviceSelect.selectedIndex].text;
        const isOWV = currentOptions.serviceId.includes("owv");
        const areaM2 = (currentOptions.widthMm * currentOptions.heightMm) / 1000000;
        const opts = [
            `${currentOptions.widthMm}x${currentOptions.heightMm} mm`,
            `${areaM2.toFixed(2)} m2`,
            ctx.expressMode ? "EXPRESS" : ""
        ].filter(Boolean).join(", ");

        ctx.cart.addItem({
          id: `fs-${Date.now()}`,
          category: isOWV ? "Folia OWV" : "Folia szroniona",
          name: serviceName,
          quantity: areaM2,
          unit: "m2",
          unitPrice: currentResult.tierPrice,
          isExpress: ctx.expressMode,
          totalPrice: currentResult.totalPrice,
          optionsHint: opts,
          payload: currentResult
        });
      }
    };
  }
};
