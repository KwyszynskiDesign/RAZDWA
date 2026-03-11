import { View, ViewContext } from "../types";
import { quoteWizytowki } from "../../categories/wizytowki-druk-cyfrowy";
import { formatPLN } from "../../core/money";

const SATIN_MULTIPLIER = 1.12;

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
    const billedQtyHint = container.querySelector("#w-billed-qty-hint") as HTMLElement;
    const tierHint = container.querySelector("#w-tier-hint") as HTMLElement;
    const expressHint = container.querySelector("#w-express-hint") as HTMLElement;
    const satinHint = container.querySelector("#w-satin-hint") as HTMLElement;
    const calcQty = container.querySelector("#w-calc-qty") as HTMLElement;
    const calcSize = container.querySelector("#w-calc-size") as HTMLElement;
    const calcPaper = container.querySelector("#w-calc-paper") as HTMLElement;
    const calcBase = container.querySelector("#w-calc-base") as HTMLElement;
    const calcSurcharges = container.querySelector("#w-calc-surcharges") as HTMLElement;
    const calcFinal = container.querySelector("#w-calc-final") as HTMLElement;

    familySelect.onchange = () => {
        const isDeluxe = familySelect.value === 'deluxe';
        standardOpts.style.display = isDeluxe ? 'none' : 'block';
        deluxeOpts.style.display = isDeluxe ? 'block' : 'none';
    };

    let currentResult: any = null;
    let currentOptions: any = null;

    calculateBtn.onclick = () => {
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
        const paperLabel = paperVal.startsWith("satyna_")
          ? `Satyna ${paperVal.slice(7)}g (+12%)`
          : `Kreda ${paperVal.slice(6)}g`;
        const sizeLabel = currentOptions.family === "deluxe"
          ? "DELUXE"
          : `${sizeSelect.value} mm`;
        const surcharges = parseFloat((totalPrice - result.basePrice).toFixed(2));

        if (totalPriceSpan) totalPriceSpan.innerText = formatPLN(totalPrice);
        if (billedQtyHint) billedQtyHint.innerText = `Rozliczono za: ${result.qtyBilled} szt.`;
        if (tierHint) tierHint.innerText = `Dla ${result.qtyBilled} szt użyto ceny bazowej ${result.basePrice.toFixed(2)} zł`;
        if (expressHint) expressHint.style.display = ctx.expressMode ? "block" : "none";
        if (satinHint) satinHint.style.display = isSatin ? "block" : "none";
        if (calcQty) calcQty.innerText = `${currentOptions.qty} szt`;
        if (calcSize) calcSize.innerText = sizeLabel;
        if (calcPaper) calcPaper.innerText = paperLabel;
        if (calcBase) calcBase.innerText = formatPLN(result.basePrice);
        if (calcSurcharges) calcSurcharges.innerText = surcharges > 0 ? `+${formatPLN(surcharges)}` : "brak";
        if (calcFinal) calcFinal.innerText = formatPLN(totalPrice);
        resultDisplay.style.display = "block";
        addToCartBtn.disabled = false;

        ctx.updateLastCalculated(totalPrice, "Wizytówki");
      } catch (err) {
        alert("Błąd: " + (err as Error).message);
      }
    };

    addToCartBtn.onclick = () => {
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
  }
};
