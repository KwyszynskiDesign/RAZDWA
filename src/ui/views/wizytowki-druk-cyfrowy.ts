import { View, ViewContext } from "../types";
import { quoteWizytowki } from "../../categories/wizytowki-druk-cyfrowy";
import { formatPLN } from "../../core/money";
import { resolveStoredPrice } from "../../core/compat";

const SATIN_MULTIPLIER = 1.12;
const VIPERPRINT_URL = "https://www.viperprint.pl/?gad_source=1&gad_campaignid=21018362364&gbraid=0AAAAAD968vUsT1IYHnVYtLWCKF6brvsG5&gclid=Cj0KCQjw4PPNBhD8ARIsAMo-icws7E1EMoiecw063F64yWTCzjVQYAGv8B9VfaX9vnGa6MI9rM6KAh8aAncwEALw_wcB";

export const WizytowkiView: View = {
  id: "wizytowki-druk-cyfrowy",
  name: "Wizytówki - druk cyfrowy",
  async mount(container, ctx) {
    try {
      const response = await fetch("categories/wizytowki-druk-cyfrowy.html");
      if (!response.ok) throw new Error("Failed to load template");
      container.innerHTML = await response.text();

      this.initLogic(container, ctx);
    } catch (err) {
      container.innerHTML = `<div class="error">Błąd ładowania: ${err}</div>`;
    }
  },

  initLogic(container: HTMLElement, ctx: ViewContext) {
    const familySelect = container.querySelector("#w-family") as HTMLSelectElement;
    const standardOpts = container.querySelector("#standard-options") as HTMLElement;
    const deluxeOpts = container.querySelector("#deluxe-options") as HTMLElement;

    const finishSelect = container.querySelector("#w-finish") as HTMLSelectElement;
    const sizeSelect = container.querySelector("#w-size") as HTMLSelectElement;
    const lamSelect = container.querySelector("#w-lam") as HTMLSelectElement;
    const deluxeOptSelect = container.querySelector("#w-deluxe-opt") as HTMLSelectElement;
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

    const requiresExternalRedirect = () => familySelect.value === 'deluxe' || finishSelect.value === 'softtouch';

    const syncRedirectMode = () => {
      const isDeluxe = familySelect.value === 'deluxe';
      const isExternal = requiresExternalRedirect();

      standardOpts.style.display = isDeluxe ? 'none' : 'block';
      deluxeOpts.style.display = isDeluxe ? 'block' : 'none';

      standardActions.style.display = isExternal ? 'none' : 'flex';
      externalRedirect.style.display = isExternal ? 'block' : 'none';

      if (isExternal) {
        resultDisplay.style.display = 'none';
        breakdownDisplay.style.display = 'none';
        addToCartBtn.disabled = true;
        currentResult = null;
        currentOptions = null;
      }
    };

    familySelect.onchange = syncRedirectMode;
    finishSelect.onchange = syncRedirectMode;
    goExternalBtn.onclick = () => {
      window.open(VIPERPRINT_URL, '_blank', 'noopener,noreferrer');
    };

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

      if (isSatin) {
        lines.push(`<div><strong>Satyna:</strong> ${Math.round(satinRate * 100)}% × ${formatPLN(basePrice)} = ${formatPLN(satinAmount)}</div>`);
      } else {
        lines.push(`<div><strong>Papier:</strong> Kreda (bez dopłaty) = ${formatPLN(0)}</div>`);
      }

      if (options.express) {
        lines.push(`<div><strong>EXPRESS:</strong> ${Math.round(expressRate * 100)}% × ${formatPLN(basePrice)} = ${formatPLN(expressAmount)}</div>`);
      } else {
        lines.push(`<div><strong>EXPRESS:</strong> nie wybrano = ${formatPLN(0)}</div>`);
      }

      lines.push(`<div style="padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.08);"><strong>Razem:</strong> ${formatPLN(basePrice)} + ${formatPLN(satinAmount)} + ${formatPLN(expressAmount)} = <strong>${formatPLN(result.totalPrice)}</strong></div>`);

      breakdownLines.innerHTML = lines.join("");
      breakdownDisplay.style.display = "block";
    };

    calculateBtn.onclick = () => {
      if (requiresExternalRedirect()) {
        return;
      }

      const paperVal = paperSelect.value;
      const isSatin = paperVal.startsWith("satyna");

      currentOptions = {
        family: familySelect.value,
        finish: finishSelect.value,
        format: sizeSelect.value,
        folia: lamSelect.value === 'lam' ? 'matt_gloss' : 'none',
        deluxeOpt: deluxeOptSelect.value,
        qty: parseInt(qtyInput.value),
        express: ctx.expressMode
      };

      try {
        const result = quoteWizytowki(currentOptions);
        const totalPrice = isSatin ? parseFloat((result.totalPrice * SATIN_MULTIPLIER).toFixed(2)) : result.totalPrice;
        currentResult = { ...result, totalPrice, isSatin };

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
      if (requiresExternalRedirect()) {
        return;
      }

      if (currentResult && currentOptions) {
        const pv = paperSelect.value;
        const paperLabel = pv.startsWith('satyna_')
          ? `Satyna ${pv.slice(7)}g (+12%)`
          : `Kreda ${pv.slice(6)}g`;
        const isDeluxe = currentOptions.family === 'deluxe';
        const parts: string[] = [`${currentOptions.qty} szt`];
        if (!isDeluxe) {
          parts.push(`${sizeSelect.value} mm`);
          const finishText = finishSelect.options[finishSelect.selectedIndex]?.text;
          if (finishText) parts.push(finishText);
          if (currentOptions.folia !== 'none') parts.push('Foliowane');
        } else {
          const deluxeText = deluxeOptSelect.options[deluxeOptSelect.selectedIndex]?.text;
          if (deluxeText) parts.push(deluxeText);
        }
        parts.push(paperLabel);
        if (currentOptions.express) parts.push('EXPRESS (+20%)');

        ctx.cart.addItem({
          id: `wizytowki-${Date.now()}`,
          category: "Wizytówki",
          name: isDeluxe ? 'Wizytówki DELUXE' : 'Wizytówki Standard',
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

    syncRedirectMode();
  }
};
