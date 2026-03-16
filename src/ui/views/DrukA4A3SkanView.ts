import { View, ViewContext } from "../types";
import { calculateDrukA4A3Skan } from "../../categories/druk-a4-a3-skan";
import { formatPLN } from "../../core/money";
import categories from "../../../data/categories.json";

export const DrukA4A3SkanView: View = {
  id: "druk-a4-a3",
  name: "Druk A4/A3 + skan",
  async mount(container, ctx) {
    try {
      const response = await fetch("categories/druk-a4-a3-skan.html");
      if (!response.ok) throw new Error("Failed to load template");
      container.innerHTML = await response.text();

      this.initLogic(container, ctx);
    addToCartBtn.onclick = () => {
      if (!currentResult || !currentOptions) return;

      const printQty = Math.max(0, Number(currentOptions.printQty) || 0);
      const scanQty = Math.max(0, Number(currentOptions.scanQty) || 0);
      const hasPrint = printQty > 0;
      const hasScan = currentOptions.scanType !== 'none' && scanQty > 0;

      if (!hasPrint && !hasScan) {
        alert("Podaj ilość druku lub skanowania przed dodaniem do listy.");
        return;
      }

      const totalPrice = parseFloat(Number(currentResult.totalPrice || 0).toFixed(2));
      const quantity = hasPrint ? printQty : scanQty;
      const modeLabel = currentOptions.mode === 'bw' ? 'CZ-B' : 'KOLOR';
      const scanLabel = currentOptions.scanType === 'auto' ? 'auto' : 'ręczny';

      const details: string[] = [];
      if (hasPrint) details.push(`druk ${printQty} str. ${currentOptions.format.toUpperCase()} (${modeLabel})`);
      if (currentOptions.surcharge && currentOptions.surchargeQty > 0) {
        details.push(`zadruk >25%: ${currentOptions.surchargeQty} str.`);
      }
      if (hasScan) details.push(`skan ${scanLabel}: ${scanQty} str.`);
      if (currentOptions.email) details.push("wysyłka e-mail");
      if (ctx.expressMode) details.push("EXPRESS");

      const itemNameParts: string[] = [];
      if (hasPrint) itemNameParts.push(`${currentOptions.format.toUpperCase()} ${modeLabel}`);
      if (hasScan) itemNameParts.push(`Skan ${scanLabel}`);

      ctx.cart.addItem({
        id: `druk-a4-a3-${Date.now()}`,
        category: "Druk A4/A3 + skan",
        name: itemNameParts.join(" + ") || "Druk A4/A3 + skan",
        quantity,
        unit: hasPrint ? "str." : "skan",
        unitPrice: quantity > 0 ? parseFloat((totalPrice / quantity).toFixed(2)) : totalPrice,
        isExpress: ctx.expressMode,
        totalPrice,
        optionsHint: details.join(", "),
        payload: {
          mode: currentOptions.mode,
          format: currentOptions.format,
          printQty,
          scanType: currentOptions.scanType,
          scanQty,
          surcharge: !!currentOptions.surcharge,
          surchargeQty: Number(currentOptions.surchargeQty) || 0,
          email: !!currentOptions.email,
          express: !!ctx.expressMode,
          breakdown: {
            totalPrintPrice: currentResult.totalPrintPrice,
            totalScanPrice: currentResult.totalScanPrice,
            surchargePrice: currentResult.surchargePrice,
            emailPrice: currentResult.emailPrice,
            totalPrice
          }
        }
      });
    };
        surcharge,
        surchargeQty,
        scanType: scanTypeSelect.value,
        scanQty: parseInt(scanQtyInput.value) || 0,
        express: ctx.expressMode
      };

      try {
        const result = calculateDrukA4A3Skan(currentOptions, pricing);
        currentResult = result;

        const unitPrint = container.querySelector("#d-unit-print-price") as HTMLElement | null;
        const totalPrint = container.querySelector("#d-total-print-price") as HTMLElement | null;
        const totalScan = container.querySelector("#d-total-scan-price") as HTMLElement | null;
        const emailPrice = container.querySelector("#d-email-price") as HTMLElement | null;
        const surchargePrice = container.querySelector("#d-surcharge-price") as HTMLElement | null;
        const scanRow = container.querySelector("#d-scan-row") as HTMLElement | null;
        const emailRow = container.querySelector("#d-email-row") as HTMLElement | null;
        const surchargeRow = container.querySelector("#d-surcharge-row") as HTMLElement | null;

        if (unitPrint) unitPrint.innerText = formatPLN(result.unitPrintPrice);
        if (totalPrint) totalPrint.innerText = formatPLN(result.totalPrintPrice);
        if (scanRow) scanRow.style.display = result.totalScanPrice > 0 ? "" : "none";
        if (totalScan) totalScan.innerText = formatPLN(result.totalScanPrice);
        if (emailRow) emailRow.style.display = result.emailPrice > 0 ? "" : "none";
        if (emailPrice) emailPrice.innerText = formatPLN(result.emailPrice);
        if (surchargeRow) surchargeRow.style.display = result.surchargePrice > 0 ? "" : "none";
        if (surchargePrice) surchargePrice.innerText = formatPLN(result.surchargePrice);

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
