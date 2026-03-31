import { View, ViewContext } from "../types";
import { quoteWizytowki } from "../../categories/wizytowki-druk-cyfrowy";
import { formatPLN } from "../../core/money";
import { resolveStoredPrice } from "../../core/compat";
import { VIPERPRINT_URL } from "../../core/external-links";

const SATIN_MULTIPLIER = 1.12;

export const WizytowkiView: View = {
  id: "wizytowki-druk-cyfrowy",
  name: "Wizytówki - druk cyfrowy",
  async mount(container, ctx) {
    try {
      const response = await fetch("categories/wizytowki-druk-cyfrowy.html");
      if (!response.ok) throw new Error("Failed to load template");
      container.innerHTML = await response.text();
      this.initLogic?.(container, ctx);
    } catch (err) {
      container.innerHTML = `<div class="error">Błąd ładowania: ${err}</div>`;
    }
  },

  initLogic(container: HTMLElement, ctx: ViewContext) {
    const familySelect = container.querySelector("#w-family") as HTMLSelectElement;
    const calculationSection = container.querySelector("#w-calculation-section") as HTMLElement;
    const standardOpts = container.querySelector("#standard-options") as HTMLElement;
    const deluxeOpts = container.querySelector("#deluxe-options") as HTMLElement;

    const finishSelect = container.querySelector("#w-finish") as HTMLSelectElement;
    const sizeSelect = container.querySelector("#w-size") as HTMLSelectElement;
    const lamSelect = container.querySelector("#w-lam") as HTMLSelectElement;
    const paperSelect = container.querySelector("#w-paper") as HTMLSelectElement;

    const qtyInput = container.querySelector("#w-qty") as HTMLInputElement;
    const calculateBtn = container.querySelector("#w-calculate") as HTMLButtonElement;
    const addToCartBtn = container.querySelector("#w-add-to-cart") as HTMLButtonElement;
    const resultDisplay = container.querySelector("#w-result-display") as HTMLElement;
    const totalPriceSpan = container.querySelector("#w-total-price") as HTMLElement;
    const breakdownDisplay = container.querySelector("#w-breakdown-display") as HTMLElement;
    const breakdownLines = container.querySelector("#w-breakdown-lines") as HTMLElement;
    const unitPriceSpan = container.querySelector("#w-unit-price") as HTMLElement | null;
    const billedQtyHint = container.querySelector("#w-billed-qty-hint") as HTMLElement;
    const tierHint = container.querySelector("#w-tier-hint") as HTMLElement;
    const expressHint = container.querySelector("#w-express-hint") as HTMLElement;
    const satinHint = container.querySelector("#w-satin-hint") as HTMLElement;
    const standardActions = container.querySelector("#w-standard-actions") as HTMLElement;
    const externalRedirect = container.querySelector("#w-external-redirect") as HTMLElement;
    const goExternalBtn = container.querySelector("#w-go-external") as HTMLButtonElement;

    const requiresExternalRedirect = () => {
      const family = familySelect.value;
      return family === "softtouch" || family === "delux" || family === "deluxe";
    };

    const syncRedirectMode = () => {
      const isExternal = requiresExternalRedirect();

      if (calculationSection) calculationSection.style.display = isExternal ? "none" : "block";
      standardOpts.style.display = "block";
      deluxeOpts.style.display = "none";

      if (standardActions) standardActions.style.display = isExternal ? "none" : "flex";
      if (externalRedirect) externalRedirect.style.display = isExternal ? "block" : "none";

      if (isExternal) {
        resultDisplay.style.display = "none";
        breakdownDisplay.style.display = "none";
        addToCartBtn.disabled = true;
        currentResult = null;
        currentOptions = null;
      }
    };

    familySelect.onchange = syncRedirectMode;
    goExternalBtn.onclick = () => window.open(VIPERPRINT_URL, "_blank", "noopener,noreferrer");

    let currentResult: any = null;
    let currentOptions: any = null;

    const satinRate = resolveStoredPrice("modifier-satyna", 0.12);
    const expressRate = resolveStoredPrice("modifier-express", 0.20);

    const renderBreakdown = (result: any, options: any, isSatin: boolean) => {
      const basePrice = result.basePrice;
      const satinAmount = isSatin ? parseFloat((basePrice * satinRate).toFixed(2)) : 0;
      const expressAmount = options.express ? parseFloat((basePrice * expressRate).toFixed(2)) : 0;

      const lines = [
        `<div><strong>Nakład podany:</strong> ${options.qty} szt</div>`,
        `<div><strong>Próg rozliczeniowy:</strong> ${result.qtyBilled} szt</div>`,
        `<div><strong>Cena z cennika (próg):</strong> ${formatPLN(basePrice)}</div>`,
      ];

      lines.push(
        isSatin
          ? `<div><strong>Satyna:</strong> ${Math.round(satinRate * 100)}% × ${formatPLN(basePrice)} = ${formatPLN(satinAmount)}</div>`
          : `<div><strong>Papier:</strong> Kreda (bez dopłaty) = ${formatPLN(0)}</div>`
      );

      lines.push(
        options.express
          ? `<div><strong>EXPRESS:</strong> ${Math.round(expressRate * 100)}% × ${formatPLN(basePrice)} = ${formatPLN(expressAmount)}</div>`
          : `<div><strong>EXPRESS:</strong> nie wybrano = ${formatPLN(0)}</div>`
      );

      lines.push(`<div style="padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.08);"><strong>Razem:</strong> ${formatPLN(basePrice)} + ${formatPLN(satinAmount)} + ${formatPLN(expressAmount)} = <strong>${formatPLN(result.totalPrice)}</strong></div>`);
      breakdownLines.innerHTML = lines.join("");
      breakdownDisplay.style.display = "block";
    };

    calculateBtn.onclick = () => {
      if (requiresExternalRedirect()) return;

      const isSatin = paperSelect.value.startsWith("satyna");
      currentOptions = {
        family: "standard",
        finish: finishSelect.value,
        format: sizeSelect.value,
        folia: lamSelect.value === "lam" ? "matt_gloss" : "none",
        qty: parseInt(qtyInput.value, 10),
        express: ctx.expressMode,
      };

      try {
        const result = quoteWizytowki(currentOptions);
        const totalPrice = isSatin ? parseFloat((result.totalPrice * SATIN_MULTIPLIER).toFixed(2)) : result.totalPrice;
        currentResult = { ...result, totalPrice };

        if (totalPriceSpan) totalPriceSpan.innerText = formatPLN(totalPrice);
        if (unitPriceSpan) unitPriceSpan.innerText = formatPLN(totalPrice / currentOptions.qty);
        if (billedQtyHint) billedQtyHint.innerText = `Rozliczono za: ${result.qtyBilled} szt.`;
        if (tierHint) tierHint.innerText = `Dla ${result.qtyBilled} szt użyto ceny bazowej ${result.basePrice.toFixed(2)} zł`;
        if (expressHint) expressHint.style.display = ctx.expressMode ? "block" : "none";
        if (satinHint) satinHint.style.display = isSatin ? "block" : "none";

        renderBreakdown(currentResult, currentOptions, isSatin);
        resultDisplay.style.display = "block";
        addToCartBtn.disabled = false;
        ctx.updateLastCalculated(totalPrice, "Wizytówki");
      } catch (err) {
        alert("Błąd: " + (err as Error).message);
      }
    };

    addToCartBtn.onclick = () => {
      if (requiresExternalRedirect() || !currentResult || !currentOptions) return;

      const pv = paperSelect.value;
      const paperLabel = pv.startsWith("satyna_") ? `Satyna ${pv.slice(7)}g` : `Kreda ${pv.slice(6)}g`;
      const parts: string[] = [`${currentOptions.qty} szt`, `${sizeSelect.value} mm`];
      const finishText = finishSelect.options[finishSelect.selectedIndex]?.text;
      if (finishText) parts.push(finishText);
      if (currentOptions.folia !== "none") parts.push("Foliowane");
      parts.push(paperLabel);
      if (currentOptions.express) parts.push("EXPRESS (+20%)");

      ctx.cart.addItem({
        id: `wizytowki-${Date.now()}`,
        category: "Wizytówki",
        name: "Wizytówki Standard",
        quantity: currentOptions.qty,
        unit: "szt",
        unitPrice: currentResult.totalPrice / currentOptions.qty,
        isExpress: currentOptions.express,
        totalPrice: currentResult.totalPrice,
        optionsHint: parts.join(", "),
        payload: currentResult,
      });
    };

    syncRedirectMode();
  },
};
