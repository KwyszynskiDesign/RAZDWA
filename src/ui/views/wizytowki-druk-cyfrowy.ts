import { View, ViewContext } from "../types";
import { quoteWizytowki } from "../../categories/wizytowki-druk-cyfrowy";
import { formatPLN } from "../../core/money";
import { resolveStoredPrice } from "../../core/compat";
import { autoCalc } from "../autoCalc";
import { getPrice } from "../../services/priceService";

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

      this.initLogic?.(container, ctx);
    } catch (err) {
      container.innerHTML = `<div class="error">Błąd ładowania: ${err}</div>`;
    }
  },

  initLogic(container: HTMLElement, ctx: ViewContext) {
    const familySelect = container.querySelector("#w-family") as HTMLSelectElement;
    const standardOpts = container.querySelector("#standard-options") as HTMLElement;
    const sizeSelect = container.querySelector("#w-size") as HTMLSelectElement;
    const lamSelect = container.querySelector("#w-lam") as HTMLSelectElement;
    const paperSelect = container.querySelector("#w-paper") as HTMLSelectElement;
    const paperGroup = container.querySelector("#w-paper-group") as HTMLElement | null;

    const qtyInput = container.querySelector("#w-qty") as HTMLInputElement;
    const addToCartBtn = container.querySelector("#w-add-to-cart") as HTMLButtonElement | null;
    const resultDisplay = container.querySelector("#w-result-display") as HTMLElement;
    const totalPriceSpan = container.querySelector("#w-total-price") as HTMLElement;
    const breakdownDisplay = container.querySelector("#w-breakdown-display") as HTMLElement;
    const breakdownLines = container.querySelector("#w-breakdown-lines") as HTMLElement;
    const unitPriceSpan = container.querySelector("#w-unit-price") as HTMLElement | null;
    const billedQtyHint = container.querySelector("#w-billed-qty-hint") as HTMLElement;
    const tierHint = container.querySelector("#w-tier-hint") as HTMLElement;
    const expressHint = container.querySelector("#w-express-hint") as HTMLElement;
    const satinHint = container.querySelector("#w-satin-hint") as HTMLElement;
    const externalRedirect = container.querySelector("#w-external-redirect") as HTMLElement;
    const viperprintSection = container.querySelector("#w-viperprint-section") as HTMLElement;
    const goExternalBtn = container.querySelector("#w-go-external") as HTMLButtonElement;
    const goExternalInlineBtn = container.querySelector("#w-go-external-inline") as HTMLButtonElement | null;
    const legendRows = container.querySelector("#w-legend-rows") as HTMLElement | null;
    const legendStandardEl = container.querySelector("#w-legend-standard") as HTMLElement | null;

    const updateLegend = () => {
      if (!legendRows) return;
      const biz = getPrice("wizytowki") as any;
      const table85none = biz?.cyfrowe?.standardPrices?.["85x55"]?.noLam ?? {};
      const qtyList = Object.keys(table85none)
        .map((k) => Number(k))
        .filter((n) => Number.isFinite(n))
        .sort((a, b) => a - b);

      legendRows.innerHTML = qtyList
        .map((qty) => {
          const p85none = resolveStoredPrice(`wizytowki-85x55-none-${qty}szt`, Number(table85none[String(qty)] ?? 0));
          const p85lam = resolveStoredPrice(`wizytowki-85x55-matt_gloss-${qty}szt`, Number(biz?.cyfrowe?.standardPrices?.["85x55"]?.lam?.[String(qty)] ?? 0));
          const p90none = resolveStoredPrice(`wizytowki-90x50-none-${qty}szt`, Number(biz?.cyfrowe?.standardPrices?.["90x50"]?.noLam?.[String(qty)] ?? 0));
          const p90lam = resolveStoredPrice(`wizytowki-90x50-matt_gloss-${qty}szt`, Number(biz?.cyfrowe?.standardPrices?.["90x50"]?.lam?.[String(qty)] ?? 0));
          return `<tr><td>${qty}</td><td>${formatPLN(p85none)}</td><td>${formatPLN(p85lam)}</td><td>${formatPLN(p90none)}</td><td>${formatPLN(p90lam)}</td></tr>`;
        })
        .join("");
    };

    const isExternal = () => familySelect?.value === 'softtouch' || familySelect?.value === 'deluxe';
    const shouldShowInlineRedirect = () => !isExternal() && lamSelect?.value === 'lam';

    const syncMode = () => {
      const external = isExternal();
      if (standardOpts) standardOpts.style.display = external ? 'none' : 'block';
      if (paperGroup) paperGroup.style.display = external ? 'none' : '';
      if (legendStandardEl) legendStandardEl.style.display = external ? 'none' : '';
      if (externalRedirect) externalRedirect.style.display = external ? 'block' : 'none';
      if (viperprintSection) viperprintSection.style.display = external ? 'block' : 'none';
      if (addToCartBtn) {
        addToCartBtn.style.display = external ? 'none' : '';
        addToCartBtn.disabled = true;
      }
      if (goExternalInlineBtn) {
        goExternalInlineBtn.style.display = 'none';
      }
      if (external) {
        if (resultDisplay) resultDisplay.style.display = 'none';
        if (breakdownDisplay) breakdownDisplay.style.display = 'none';
        currentResult = null;
        currentOptions = null;
      }
    };

    if (familySelect) familySelect.onchange = syncMode;
    if (lamSelect) lamSelect.onchange = syncMode;
    if (goExternalBtn) goExternalBtn.onclick = () => {
      window.open(VIPERPRINT_URL, '_blank', 'noopener,noreferrer');
    };
    if (goExternalInlineBtn) goExternalInlineBtn.onclick = () => {
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
      }

      if (options.express) {
        lines.push(`<div><strong>EXPRESS:</strong> ${Math.round(expressRate * 100)}% × ${formatPLN(basePrice)} = ${formatPLN(expressAmount)}</div>`);
      }

      lines.push(`<div style="padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.08);"><strong>Razem:</strong> ${formatPLN(basePrice)} + ${formatPLN(satinAmount)} + ${formatPLN(expressAmount)} = <strong>${formatPLN(result.totalPrice)}</strong></div>`);

      if (breakdownLines) breakdownLines.innerHTML = lines.join("");
      if (breakdownDisplay) breakdownDisplay.style.display = "block";
    };

    const calculate = () => {
      if (isExternal() || !familySelect?.value) {
        if (resultDisplay) resultDisplay.style.display = 'none';
        if (addToCartBtn) addToCartBtn.disabled = true;
        return;
      }
      if (!qtyInput?.value) {
        if (resultDisplay) resultDisplay.style.display = 'none';
        if (addToCartBtn) addToCartBtn.disabled = true;
        return;
      }

      const paperVal = paperSelect.value;
      const isSatin = paperVal.startsWith("satyna");

      currentOptions = {
        family: "standard",
        format: sizeSelect.value,
        folia: lamSelect.value === 'lam' ? 'matt_gloss' : 'none',
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
        if (resultDisplay) resultDisplay.style.display = "block";
        if (addToCartBtn) addToCartBtn.disabled = false;

        ctx.updateLastCalculated(totalPrice, "Wizytówki");
      } catch (err) {
        if (resultDisplay) resultDisplay.style.display = "none";
        if (addToCartBtn) addToCartBtn.disabled = true;
      }
    };

    autoCalc({ root: container, calc: calculate });
    updateLegend();

    if (addToCartBtn) {
      addToCartBtn.onclick = () => {
        if (isExternal()) return;
        if (currentResult && currentOptions) {
          const pv = paperSelect.value;
          const paperLabel = pv.startsWith('satyna_')
            ? `Satyna ${pv.slice(7)}g`
            : `Kreda ${pv.slice(6)}g`;
          const parts: string[] = [
            `${currentOptions.qty} szt`,
            `${sizeSelect.value} mm`,
            lamSelect.value === 'lam' ? 'Foliowane' : 'Bez foliowania',
            paperLabel
          ];
          if (currentOptions.express) parts.push('EXPRESS (+20%)');

          ctx.cart.addItem({
            id: `wizytowki-${Date.now()}`,
            category: "Wizytówki",
            name: 'Wizytówki Standard',
            quantity: currentOptions.qty,
            unit: "szt",
            unitPrice: parseFloat((currentResult.totalPrice / currentOptions.qty).toFixed(2)),
            isExpress: currentOptions.express,
            totalPrice: currentResult.totalPrice,
            optionsHint: parts.join(', '),
            payload: currentResult
          });
        }
      };
    }

    syncMode();
  }
};
