import { View, ViewContext } from "../types";
import { calculateDrukA4A3Skan } from "../../categories/druk-a4-a3-skan";
import { formatPLN } from "../../core/money";
import categories from "../../../data/categories.json";

export const DrukA4A3SkanView: View = {
  id: "druk-a4-a3",
  name: "Druk A4/A3 + skan",
  async mount(container, ctx) {
    try {
      const response = await fetch("categories/druk-a4-a3.html");
      if (!response.ok) throw new Error("Failed to load template");
      container.innerHTML = await response.text();

      this.initLogic(container, ctx);
    } catch (err) {
      container.innerHTML = `<div class="error">Błąd ładowania: ${err}</div>`;
    }
  },

  initLogic(container: HTMLElement, ctx: ViewContext) {
    const pricing = categories.find(c => c.id === "druk-a4-a3")?.pricing;
    if (!pricing) return;

    const modeSelect = container.querySelector("#d-mode") as HTMLSelectElement;
    const formatSelect = container.querySelector("#d-format") as HTMLSelectElement;
    const printQtyInput = container.querySelector("#d-print-qty") as HTMLInputElement;
    const emailCheck = container.querySelector("#d-email") as HTMLInputElement;
    const surchargeCheck = container.querySelector("#d-surcharge") as HTMLInputElement;
    const surchargeQtyInput = container.querySelector("#d-surcharge-qty") as HTMLInputElement;
    const surchargeQtyRow = container.querySelector("#surcharge-qty-row") as HTMLElement;
    const scanTypeSelect = container.querySelector("#d-scan-type") as HTMLSelectElement;
    const scanQtyInput = container.querySelector("#d-scan-qty") as HTMLInputElement;
    const scanQtyRow = container.querySelector("#scan-qty-row") as HTMLElement;

    const calculateBtn = container.querySelector("#d-calculate") as HTMLButtonElement;
    const addToCartBtn = container.querySelector("#d-add-to-cart") as HTMLButtonElement;
    const resultDisplay = container.querySelector("#d-result-display") as HTMLElement;
    const totalPriceSpan = container.querySelector("#d-total-price") as HTMLElement;
    const expressHint = container.querySelector("#d-express-hint") as HTMLElement;

    surchargeCheck.onchange = () => {
      surchargeQtyRow.style.display = surchargeCheck.checked ? "flex" : "none";
    };

    scanTypeSelect.onchange = () => {
      scanQtyRow.style.display = scanTypeSelect.value !== "none" ? "flex" : "none";
    };

    let currentResult: any = null;
    let currentOptions: any = null;

    calculateBtn.onclick = () => {
      currentOptions = {
        mode: modeSelect.value,
        format: formatSelect.value,
        printQty: parseInt(printQtyInput.value) || 0,
        email: emailCheck.checked,
        surcharge: surchargeCheck.checked,
        surchargeQty: parseInt(surchargeQtyInput.value) || 0,
        scanType: scanTypeSelect.value,
        scanQty: parseInt(scanQtyInput.value) || 0,
        express: ctx.expressMode
      };

      try {
        const result = calculateDrukA4A3Skan(currentOptions, pricing);
        currentResult = result;

        totalPriceSpan.innerText = formatPLN(result.totalPrice);
        if (expressHint) expressHint.style.display = ctx.expressMode ? "block" : "none";
        resultDisplay.style.display = "block";
        addToCartBtn.disabled = false;

        ctx.updateLastCalculated(result.totalPrice, "Druk A4/A3 + skan");
      } catch (err) {
        alert("Błąd: " + (err as Error).message);
      }
    };

    addToCartBtn.onclick = () => {
      if (currentResult && currentOptions) {
        const timestamp = Date.now();
        const expressFactor = ctx.expressMode ? 1.2 : 1;

        // 1. Główny produkt: Druk + Skan
        if (currentOptions.printQty > 0 || (currentOptions.scanQty > 0 && currentOptions.scanType !== 'none')) {
          const details = [];
          if (currentOptions.printQty > 0) {
            details.push(`${currentOptions.printQty} str. ${currentOptions.format.toUpperCase()} (${currentOptions.mode === 'bw' ? 'CZ-B' : 'KOLOR'})`);
          }
          if (currentOptions.scanQty > 0 && currentOptions.scanType !== 'none') {
            details.push(`Skan ${currentOptions.scanType}: ${currentOptions.scanQty} str.`);
          }
          if (ctx.expressMode) details.push("EXPRESS");

          const mainPrice = (currentResult.totalPrintPrice + currentResult.totalScanPrice) * expressFactor;

          ctx.cart.addItem({
            id: `druk-${timestamp}-main`,
            category: "Druk A4/A3 + skan",
            name: `${currentOptions.format.toUpperCase()} ${currentOptions.mode === 'bw' ? 'CZ-B' : 'KOLOR'}`,
            quantity: currentOptions.printQty || currentOptions.scanQty,
            unit: currentOptions.printQty > 0 ? "str." : "skan",
            unitPrice: mainPrice / (currentOptions.printQty || currentOptions.scanQty),
            isExpress: ctx.expressMode,
            totalPrice: parseFloat(mainPrice.toFixed(2)),
            optionsHint: details.join(", "),
            payload: { ...currentResult, type: 'main' }
          });
        }

        // 2. Osobny produkt: Wysyłka e-mail
        if (currentOptions.email) {
          const emailPrice = currentResult.emailPrice * expressFactor;
          ctx.cart.addItem({
            id: `email-${timestamp}-email`,
            category: "Druk A4/A3 + skan",
            name: "Wysyłka e-mail",
            quantity: 1,
            unit: "szt.",
            unitPrice: emailPrice,
            isExpress: ctx.expressMode,
            totalPrice: parseFloat(emailPrice.toFixed(2)),
            optionsHint: ctx.expressMode ? "EXPRESS" : "",
            payload: { price: emailPrice, type: 'email' }
          });
        }

        // 3. Osobny produkt: Dopłata za zadruk >25%
        if (currentOptions.surcharge && currentOptions.surchargeQty > 0) {
          const surchargePrice = currentResult.surchargePrice * expressFactor;
          ctx.cart.addItem({
            id: `surcharge-${timestamp}-surcharge`,
            category: "Druk A4/A3 + skan",
            name: "Zadruk >25% - dopłata",
            quantity: currentOptions.surchargeQty,
            unit: "str.",
            unitPrice: surchargePrice / currentOptions.surchargeQty,
            isExpress: ctx.expressMode,
            totalPrice: parseFloat(surchargePrice.toFixed(2)),
            optionsHint: `${currentOptions.surchargeQty} str. (+50%), ${ctx.expressMode ? "EXPRESS" : ""}`,
            payload: { price: surchargePrice, type: 'surcharge' }
          });
        }
      }
    };
  }
};
