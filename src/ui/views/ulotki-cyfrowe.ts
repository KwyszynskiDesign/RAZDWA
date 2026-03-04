import { View, ViewContext } from "../types";
import { quoteUlotkiDwustronne } from "../../categories/ulotki-cyfrowe-dwustronne";
import { quoteJednostronne } from "../../categories/ulotki-cyfrowe-jednostronne";
import { formatPLN } from "../../core/money";

const VAT = 1.23;
const SATIN_MULTIPLIER = 1.12;

export const UlotkiCyfroweView: View = {
  id: "ulotki-cyfrowe",
  name: "Ulotki cyfrowe",
  async mount(container, ctx) {
    try {
      const response = await fetch("categories/ulotki-cyfrowe.html");
      if (!response.ok) throw new Error("Failed to load template");
      container.innerHTML = await response.text();

      this.initLogic(container, ctx);
    } catch (err) {
      container.innerHTML = `<div class="error">Błąd ładowania: ${err}</div>`;
    }
  },

  initLogic(container: HTMLElement, ctx: ViewContext) {
    const formatSelect = container.querySelector("#u-format") as HTMLSelectElement;
    const qtySelect = container.querySelector("#u-qty") as HTMLSelectElement;
    const paperSelect = container.querySelector("#u-paper") as HTMLSelectElement;
    const calculateBtn = container.querySelector("#u-calculate") as HTMLButtonElement;
    const addToCartBtn = container.querySelector("#u-add-to-cart") as HTMLButtonElement;
    const resultDisplay = container.querySelector("#u-result-display") as HTMLElement;
    const nettoSpan = container.querySelector("#u-netto-price") as HTMLElement;
    const totalPriceSpan = container.querySelector("#u-total-price") as HTMLElement;
    const tierHint = container.querySelector("#u-tier-hint") as HTMLElement;
    const expressHint = container.querySelector("#u-express-hint") as HTMLElement;
    const satinHint = container.querySelector("#u-satin-hint") as HTMLElement;
    const sidesInputs = Array.from(container.querySelectorAll<HTMLInputElement>('input[name="sides"]'));

    if (!formatSelect || !qtySelect || !paperSelect || !calculateBtn || !addToCartBtn || !resultDisplay || !nettoSpan || !totalPriceSpan) {
      container.innerHTML = `<div class="error">Błąd: brak elementów formularza ulotek.</div>`;
      return;
    }

    let currentResult: any = null;
    let currentOptions: any = null;

    const getSelectedSides = () => {
      const selected = sidesInputs.find(i => i.checked);
      return (selected?.value === "dwustronne" ? "dwustronne" : "jednostronne") as "jednostronne" | "dwustronne";
    };

    const populateTables = () => {
      const singleTbody = container.querySelector("#u-table-single tbody") as HTMLElement | null;
      const doubleTbody = container.querySelector("#u-table-double tbody") as HTMLElement | null;
      const qtyValues = Array.from(qtySelect.options)
        .map(o => parseInt(o.value, 10))
        .filter(v => !isNaN(v));

      if (singleTbody) {
        singleTbody.innerHTML = qtyValues.map(qty => {
          const res = quoteJednostronne({ format: "A5", qty, express: false });
          const brutto = parseFloat((res.totalPrice * VAT).toFixed(2));
          return `<tr><td>${qty}</td><td>${formatPLN(res.totalPrice)}</td><td>${formatPLN(brutto)}</td></tr>`;
        }).join("");
      }

      if (doubleTbody) {
        doubleTbody.innerHTML = qtyValues.map(qty => {
          const res = quoteUlotkiDwustronne({ format: "A5", qty, express: false });
          const brutto = parseFloat((res.totalPrice * VAT).toFixed(2));
          return `<tr><td>${qty}</td><td>${formatPLN(res.totalPrice)}</td><td>${formatPLN(brutto)}</td></tr>`;
        }).join("");
      }
    };

    const performCalculation = () => {
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

        const nettoPrice = isSatin ? parseFloat((result.totalPrice * SATIN_MULTIPLIER).toFixed(2)) : result.totalPrice;
        const bruttoPrice = parseFloat((nettoPrice * VAT).toFixed(2));
        currentResult = { ...result, nettoPrice, bruttoPrice, isSatin };

        nettoSpan.innerText = formatPLN(nettoPrice);
        totalPriceSpan.innerText = formatPLN(bruttoPrice);
        if (tierHint) tierHint.innerText = `Dla ${currentOptions.qty} szt użyto ceny ${result.totalPrice.toFixed(2)} zł netto (papier: ${paperVal.replace("_", " ")})`;
        if (expressHint) expressHint.style.display = ctx.expressMode ? "block" : "none";
        if (satinHint) satinHint.style.display = isSatin ? "block" : "none";
        resultDisplay.style.display = "block";
        addToCartBtn.disabled = false;

        ctx.updateLastCalculated(bruttoPrice, "Ulotki");
      } catch (err) {
        addToCartBtn.disabled = true;
        resultDisplay.style.display = "none";
        alert("Błąd: " + (err as Error).message);
      }
    };

    calculateBtn.onclick = performCalculation;

    addToCartBtn.onclick = () => {
      if (currentResult && currentOptions) {
        const expressLabel = currentOptions.express ? ', EXPRESS' : '';
        const satinLabel = currentResult.isSatin ? ', SATYNA' : '';
        const sidesLabel = currentOptions.sides === 'dwustronne' ? 'Dwustronne' : 'Jednostronne';
        const paperVal = paperSelect.value;

        ctx.cart.addItem({
          id: `ulotki-${Date.now()}`,
          category: "Ulotki",
          name: `Ulotki ${sidesLabel} ${currentOptions.format}`,
          quantity: currentOptions.qty,
          unit: "szt",
          unitPrice: currentResult.bruttoPrice / currentOptions.qty,
          isExpress: currentOptions.express,
          totalPrice: currentResult.bruttoPrice,
          optionsHint: `${currentOptions.qty} szt, ${sidesLabel}${satinLabel}${expressLabel}, ${paperVal.replace("_", " ")}`,
          payload: currentResult
        });
      }
    };

    [formatSelect, qtySelect, paperSelect].forEach(el => {
      el.addEventListener("change", performCalculation);
    });
    sidesInputs.forEach(input => input.addEventListener("change", performCalculation));

    populateTables();
    performCalculation();
  }
};
