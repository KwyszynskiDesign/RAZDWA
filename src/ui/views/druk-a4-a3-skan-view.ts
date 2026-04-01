import { View, ViewContext } from "../types";
import { autoCalc } from "../autoCalc";
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

      this.initLogic?.(container, ctx);
    } catch (err) {
      container.innerHTML = `<div class="error">Błąd ładowania: ${err}</div>`;
    }
  },

  initLogic(container: HTMLElement, ctx: ViewContext) {
    const pricing = categories.find(c => c.id === "druk-a4-a3-skan" || c.id === "druk-a4-a3")?.pricing;
    if (!pricing) return;

    const modeSelect = container.querySelector("#d-mode") as HTMLSelectElement;
    const formatSelect = container.querySelector("#d-format") as HTMLSelectElement;
    const printQtyInput = container.querySelector("#d-print-qty") as HTMLInputElement;
    const emailCheck = container.querySelector("#d-email") as HTMLInputElement;
    const labelStickerCheck = container.querySelector("#d-label-sticker") as HTMLInputElement | null;
    const sleeveCheck = container.querySelector("#d-sleeve") as HTMLInputElement | null;
    const sleeveQtyInput = container.querySelector("#d-sleeve-qty") as HTMLInputElement | null;
    const surchargeCheck = container.querySelector("#d-surcharge") as HTMLInputElement | null;
    const surchargeQtyInput = container.querySelector("#d-surcharge-qty") as HTMLInputElement;
    const surchargeQtyRow = container.querySelector("#surcharge-qty-row") as HTMLElement | null;
    const scanTypeSelect = container.querySelector("#d-scan-type") as HTMLSelectElement;
    const scanQtyInput = container.querySelector("#d-scan-qty") as HTMLInputElement;
    const scanQtyRow = container.querySelector("#scan-qty-row") as HTMLElement;

    const addToCartBtn = container.querySelector("#d-add-to-cart") as HTMLButtonElement;
    const resultDisplay = container.querySelector("#d-result-display") as HTMLElement;
    const totalPriceSpan = container.querySelector("#d-total-price") as HTMLElement;
    const expressHint = container.querySelector("#d-express-hint") as HTMLElement;

    container.querySelectorAll<HTMLElement>(".option-card").forEach(card => {
      const toggleCard = () => {
        const isChecked = card.dataset.checked === "true";
        card.dataset.checked = String(!isChecked);
        card.classList.toggle("checked", !isChecked);
        card.setAttribute("aria-checked", String(!isChecked));
        const checkbox = card.querySelector<HTMLInputElement>("input[type='checkbox']");
        if (checkbox) checkbox.checked = !isChecked;
        if (card.id === "d-surcharge-card" && surchargeQtyRow) {
          surchargeQtyRow.style.display = !isChecked ? "flex" : "none";
        }
      };

      card.addEventListener("click", toggleCard);
      card.addEventListener("keydown", (e: KeyboardEvent) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          toggleCard();
        }
      });
    });

    scanTypeSelect.onchange = () => {
      scanQtyRow.style.display = scanTypeSelect.value !== "none" ? "flex" : "none";
    };

    const updateSleeveQtyState = () => {
      if (!sleeveQtyInput || !sleeveCheck) return;
      sleeveQtyInput.disabled = !sleeveCheck.checked;
      if (!sleeveCheck.checked) {
        sleeveQtyInput.value = "0";
      } else if ((parseInt(sleeveQtyInput.value) || 0) <= 0) {
        sleeveQtyInput.value = "1";
      }
    };

    sleeveCheck?.addEventListener("change", updateSleeveQtyState);
    updateSleeveQtyState();

    let currentResult: any = null;
    let currentOptions: any = null;

    const performCalculation = () => {
      const printQty = parseInt(printQtyInput.value) || 0;
      const requestedSurchargeQty = parseInt(surchargeQtyInput.value) || 0;
      const surchargeQty = Math.min(Math.max(requestedSurchargeQty, 0), Math.max(printQty, 0));
      const requestedSleeveQty = Math.max(0, parseInt(sleeveQtyInput?.value || "0") || 0);
      const sleeveQty = (sleeveCheck?.checked ?? false) ? Math.max(1, requestedSleeveQty) : 0;
      const surcharge = (surchargeCheck ? surchargeCheck.checked : requestedSurchargeQty > 0) && printQty > 0 && surchargeQty > 0;

      currentOptions = {
        mode: modeSelect.value,
        format: formatSelect.value,
        printQty,
        email: emailCheck.checked,
        labelSticker: !!labelStickerCheck?.checked,
        sleeve: !!sleeveCheck?.checked,
        sleeveQty,
        surcharge,
        surchargeQty,
        scanType: scanTypeSelect.value,
        scanQty: parseInt(scanQtyInput.value) || 0,
        express: ctx.expressMode
      };

      const result = calculateDrukA4A3Skan(currentOptions, pricing);
      currentResult = result;

      const unitPrint = container.querySelector("#d-unit-print-price") as HTMLElement | null;
      const totalPrint = container.querySelector("#d-total-print-price") as HTMLElement | null;
      const totalScan = container.querySelector("#d-total-scan-price") as HTMLElement | null;
      const emailPrice = container.querySelector("#d-email-price") as HTMLElement | null;
      const stickerPrice = container.querySelector("#d-label-sticker-price") as HTMLElement | null;
      const surchargePrice = container.querySelector("#d-surcharge-price") as HTMLElement | null;
      const scanRow = container.querySelector("#d-scan-row") as HTMLElement | null;
      const emailRow = container.querySelector("#d-email-row") as HTMLElement | null;
      const stickerRow = container.querySelector("#d-label-sticker-row") as HTMLElement | null;
      const sleeveRow = container.querySelector("#d-sleeve-row") as HTMLElement | null;
      const sleevePriceEl = container.querySelector("#d-sleeve-price") as HTMLElement | null;
      const surchargeRow = container.querySelector("#d-surcharge-row") as HTMLElement | null;

      if (unitPrint) unitPrint.innerText = formatPLN(result.unitPrintPrice);
      if (totalPrint) totalPrint.innerText = formatPLN(result.totalPrintPrice);
      if (scanRow) scanRow.style.display = result.totalScanPrice > 0 ? "" : "none";
      if (totalScan) totalScan.innerText = formatPLN(result.totalScanPrice);
      if (emailRow) emailRow.style.display = result.emailPrice > 0 ? "" : "none";
      if (emailPrice) emailPrice.innerText = formatPLN(result.emailPrice);
      if (stickerRow) stickerRow.style.display = result.stickerPrice > 0 ? "" : "none";
      if (stickerPrice) stickerPrice.innerText = formatPLN(result.stickerPrice);
      if (sleeveRow) sleeveRow.style.display = result.sleevePrice > 0 ? "" : "none";
      if (sleevePriceEl) sleevePriceEl.innerText = formatPLN(result.sleevePrice);
      if (surchargeRow) surchargeRow.style.display = result.surchargePrice > 0 ? "" : "none";
      if (surchargePrice) surchargePrice.innerText = formatPLN(result.surchargePrice);

      totalPriceSpan.innerText = formatPLN(result.totalPrice);
      if (expressHint) expressHint.style.display = ctx.expressMode ? "block" : "none";
      resultDisplay.style.display = "block";
      addToCartBtn.disabled = false;

      ctx.updateLastCalculated(result.totalPrice, "Druk A4/A3 + skan");
    };

    autoCalc({ root: container, calc: performCalculation });

    addToCartBtn.onclick = () => {
      if (!currentResult || !currentOptions) return;

      const printQty = Math.max(0, Number(currentOptions.printQty) || 0);
      const scanQty = Math.max(0, Number(currentOptions.scanQty) || 0);
      const hasPrint = printQty > 0;
      const hasScan = currentOptions.scanType !== "none" && scanQty > 0;

      if (!hasPrint && !hasScan) {
        alert("Podaj ilość druku lub skanowania przed dodaniem do listy.");
        return;
      }

      const totalPrice = parseFloat(Number(currentResult.totalPrice || 0).toFixed(2));
      const quantity = hasPrint ? printQty : scanQty;
      const modeLabel = currentOptions.mode === "bw" ? "CZ-B" : "KOLOR";
      const scanLabel = currentOptions.scanType === "auto" ? "auto" : "ręczny";

      const details: string[] = [];
      if (hasPrint) details.push(`druk ${printQty} str. ${currentOptions.format.toUpperCase()} (${modeLabel})`);
      if (currentOptions.surcharge && currentOptions.surchargeQty > 0) details.push(`zadruk >25%: ${currentOptions.surchargeQty} str.`);
      if (hasScan) details.push(`skan ${scanLabel}: ${scanQty} str.`);
      if (currentOptions.email) details.push("wysyłka e-mail");
      if (currentOptions.labelSticker) details.push("naklejka A6: +1,60 zł");
      if (currentOptions.sleeve && currentOptions.sleeveQty > 0) {
        details.push(`koszulka: ${currentOptions.sleeveQty} szt.`);
      }
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
          labelSticker: !!currentOptions.labelSticker,
          sleeve: !!currentOptions.sleeve,
          sleeveQty: Number(currentOptions.sleeveQty) || 0,
          express: !!ctx.expressMode,
          breakdown: {
            totalPrintPrice: currentResult.totalPrintPrice,
            totalScanPrice: currentResult.totalScanPrice,
            surchargePrice: currentResult.surchargePrice,
            emailPrice: currentResult.emailPrice,
            stickerPrice: currentResult.stickerPrice,
            sleevePrice: currentResult.sleevePrice,
            totalPrice
          }
        }
      });
    };
  }
};