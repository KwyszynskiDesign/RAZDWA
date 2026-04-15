import { View, ViewContext } from "../types";
import { autoCalc } from "../autoCalc";
import { calculateDrukCAD } from "../../categories/druk-cad";
import { quoteCadFold, quoteCadWfScan } from "../../categories/cad-ops";
import { formatPLN } from "../../core/money";
import { getPrice } from "../../services/priceService";
import { resolveStoredPrice } from "../../core/compat";

export const DrukCADView: View = {
  id: "druk-cad",
  name: "Druk CAD wielkoformatowy",
  async mount(container, ctx) {
    try {
      const response = await fetch("categories/druk-cad.html");
      if (!response.ok) throw new Error("Failed to load template");
      container.innerHTML = await response.text();

      this.initLogic?.(container, ctx);
    } catch (err) {
      container.innerHTML = `<div class="error">Błąd ładowania: ${err}</div>`;
    }
  },

  initLogic(container: HTMLElement, ctx: ViewContext) {
    const data = getPrice("drukCAD");
    if (!data?.price || !data?.base) {
      container.innerHTML = `<div class="error">Błąd: brak danych cennika CAD</div>`;
      return;
    }

    const modeSelect = container.querySelector("#cad-mode") as HTMLSelectElement;
    const formatSelect = container.querySelector("#cad-format") as HTMLSelectElement;
    const lengthInput = container.querySelector("#cad-length") as HTMLInputElement;
    const qtySheetsInput = container.querySelector("#qty-sheets") as HTMLInputElement;
    const qtySheetsGroup = container.querySelector("#qty-sheets-group") as HTMLElement;
    const useBaseBtn = container.querySelector("#cad-use-base") as HTMLButtonElement;
    const baseInfo = container.querySelector("#cad-base-info") as HTMLElement;

    const addToCartBtn = container.querySelector("#cad-add-to-cart") as HTMLButtonElement;
    const resultDisplay = container.querySelector("#cad-result-display") as HTMLElement;
    const priceTypeSpan = container.querySelector("#cad-price-type") as HTMLElement;
    const totalPriceSpan = container.querySelector("#cad-total-price") as HTMLElement;
    const unitPriceSpan = container.querySelector("#cad-unit-price") as HTMLElement | null;
    const qtyHintSpan = container.querySelector("#cad-qty-hint") as HTMLElement | null;
    const grandTotalSpan = container.querySelector("#cad-grand-total") as HTMLElement | null;
    const expressHint = container.querySelector("#cad-express-hint") as HTMLElement;
    const optZadruk25 = container.querySelector("#cad-opt-zadruk25") as HTMLInputElement | null;
    const optScale = container.querySelector("#cad-opt-scale") as HTMLInputElement | null;
    const optEmail = container.querySelector("#cad-opt-email") as HTMLInputElement | null;
    const optionsSummary = container.querySelector("#cad-options-summary") as HTMLElement | null;
    const optZadruk25PriceSpan = container.querySelector("#cad-opt-zadruk25-price") as HTMLElement | null;
    const optScalePriceSpan = container.querySelector("#cad-opt-scale-price") as HTMLElement | null;
    const optEmailPriceSpan = container.querySelector("#cad-opt-email-price") as HTMLElement | null;
    const totalWithOptionsSpan = container.querySelector("#cad-total-with-options") as HTMLElement | null;

    const foldFormatSelect = container.querySelector("#cad-fold-format") as HTMLSelectElement | null;
    const foldQtyInput = container.querySelector("#cad-fold-qty") as HTMLInputElement | null;
    const foldAddBtn = container.querySelector("#cad-fold-add") as HTMLButtonElement | null;
    const wfScanCmInput = container.querySelector("#cad-wf-scan-cm") as HTMLInputElement | null;
    const wfScanQtyInput = container.querySelector("#cad-wf-scan-qty") as HTMLInputElement | null;
    const wfScanAddBtn = container.querySelector("#cad-wf-scan-add") as HTMLButtonElement | null;
    const cadOpsList = container.querySelector("#cad-ops-list") as HTMLElement | null;
    const cadOpsListItems = container.querySelector("#cad-ops-list-items") as HTMLElement | null;
    const cadOpsTotal = container.querySelector("#cad-ops-total") as HTMLElement | null;

    const optKlientSkladanie = container.querySelector("#cad-opt-klient-skladanie") as HTMLInputElement | null;
    const klientSkladanieQtyRow = container.querySelector("#cad-klient-skladanie-qty-row") as HTMLElement | null;
    const klientSkladanieQtyInput = container.querySelector("#cad-klient-skladanie-qty") as HTMLInputElement | null;
    const optNieformatoweSkladanie = container.querySelector("#cad-opt-nieformatowe-skladanie") as HTMLInputElement | null;
    const nieformatoweSkladanieQtyRow = container.querySelector("#cad-nieformatowe-skladanie-qty-row") as HTMLElement | null;
    const nieformatoweSkladanieQtyInput = container.querySelector("#cad-nieformatowe-skladanie-qty") as HTMLInputElement | null;
    const optPaskiWzmacniajace = container.querySelector("#cad-opt-paski-wzmacniajace") as HTMLInputElement | null;
    const paskiWzmacniajaceQtyRow = container.querySelector("#cad-paski-wzmacniajace-qty-row") as HTMLElement | null;
    const paskiWzmacniajaceQtyInput = container.querySelector("#cad-paski-wzmacniajace-qty") as HTMLInputElement | null;

    const ensureLegend = () => {
      let legend = container.querySelector<HTMLElement>("#cad-dynamic-legend");
      if (!legend) {
        legend = document.createElement("div");
        legend.id = "cad-dynamic-legend";
        legend.className = "card";
        legend.style.marginTop = "16px";
        const anchor = container.querySelector("#cad-breakdown-display") as HTMLElement | null;
        (anchor ?? resultDisplay).insertAdjacentElement("afterend", legend);
      }

      const collectRowsForMode = (mode: "bw" | "color", modeLabel: string) => {
        const modeKey = mode === "bw" ? "bw" : "kolor";
        const fmtMap = data.price?.[mode]?.formatowe ?? {};
        const mbMap = data.price?.[mode]?.mb ?? {};
        const allFormats = Array.from(new Set([...Object.keys(fmtMap), ...Object.keys(mbMap)]));

        return allFormats.map((format) => {
          const normalized = String(format).toLowerCase().replace("0p", "0plus").replace("1p", "1plus").replace("r1067", "mb1067");
          const fmtBase = Number((fmtMap as any)[format] ?? 0);
          const mbBase = Number((mbMap as any)[format] ?? 0);
          const fmtKey = `druk-cad-${modeKey}-fmt-${normalized}`;
          const mbKey = `druk-cad-${modeKey}-mb-${normalized}`;

          const fmtPrice = (fmtMap as any)[format] == null ? "-" : formatPLN(resolveStoredPrice(fmtKey, fmtBase));
          const mbPrice = (mbMap as any)[format] == null ? "-" : formatPLN(resolveStoredPrice(mbKey, mbBase));

          return `<tr><td class="col-mode">${modeLabel}</td><td class="col-format">${displayCadFormat(String(format))}</td><td class="col-format-price">${fmtPrice}</td><td class="col-nonformat-price">${mbPrice}</td></tr>`;
        }).join("");
      };

      const bwRows = collectRowsForMode("bw", "Czarno-biały");
      const colorRows = collectRowsForMode("color", "Kolorowy");

      legend.innerHTML = `
        <table class="cad-legend-table">
          <tr>
            <th class="col-mode">Tryb</th>
            <th class="col-format">Format</th>
            <th class="col-format-price"><span class="cad-legend-break">Cena<br>formatowa</span></th>
            <th class="col-nonformat-price"><span class="cad-legend-break">Cena<br>nieformatowa</span></th>
          </tr>
          <tr><td colspan="4" class="cad-legend-section" style="border-top:2px solid #0f172a;background:#f8fafc;">CZARNO-BIAŁE</td></tr>
          ${bwRows}
          <tr><td colspan="4" class="cad-legend-section" style="border-top:3px solid #0f172a;background:#eff6ff;">KOLOROWE</td></tr>
          ${colorRows}
          <tr><td colspan="4" class="cad-legend-section" style="border-top:2px solid #0f172a;background:#fff7ed;">USŁUGI DODATKOWE</td></tr>
          <tr><td colspan="2">Składanie od klienta</td><td colspan="2">${formatPLN(resolveStoredPrice("cad-klient-skladanie", 4.0))} / szt</td></tr>
          <tr><td colspan="2">Składanie nieformatowych</td><td colspan="2">${formatPLN(resolveStoredPrice("cad-nieformatowe-skladanie", 2.5))} / m²</td></tr>
          <tr><td colspan="2">Doklejanie pasków wzmacniających</td><td colspan="2">${formatPLN(resolveStoredPrice("cad-paski-wzmacniajace", 0.8))} / szt</td></tr>
        </table>
        <div class="hint" style="margin-top:8px;">Składanie i skan WF rozliczane wg aktualnych stawek z ustawień.</div>
      `;
    };

    type CadOpItem = {
      id: string;
      name: string;
      quantity: number;
      unit: string;
      unitPrice: number;
      totalPrice: number;
      optionsHint: string;
      payload: any;
    };

    const cadOps: CadOpItem[] = [];

    const normalizeFoldFormat = (format: string): string => {
      if (format === "A0+") return "A0p";
      if (format === "A3-poprzeczne") return "A3L";
      return format;
    };

    const displayCadFormat = (format: string): string => {
      if (format === "A0p") return "A0+";
      if (format === "A1p") return "A1+";
      return format;
    };

    const getInlineWfScanOp = (): CadOpItem | null => {
      if (!wfScanCmInput || !wfScanQtyInput) return null;

      const rawCm = (wfScanCmInput.value || "").trim();
      if (!rawCm) return null;

      const cm = parseFloat(rawCm.replace(",", "."));
      const qty = parseInt(wfScanQtyInput.value, 10);
      if (isNaN(cm) || cm <= 0 || isNaN(qty) || qty <= 0) return null;

      try {
        const mm = Math.round(cm * 10);
        const result = quoteCadWfScan({ lengthMm: mm, qty });
        return {
          id: "cad-wf-scan-inline",
          name: "Skanowanie wielkoformatowe",
          quantity: qty,
          unit: "szt",
          unitPrice: result.unitPrice,
          totalPrice: result.total,
          optionsHint: `${qty} szt., ${cm} cm`,
          payload: result
        };
      } catch {
        return null;
      }
    };

    const getInlineKlientSkladanieOp = (): CadOpItem | null => {
      if (!optKlientSkladanie?.checked || !klientSkladanieQtyInput) return null;
      const qty = parseInt(klientSkladanieQtyInput.value, 10);
      if (isNaN(qty) || qty <= 0) return null;
      const price = resolveStoredPrice("cad-klient-skladanie", 4.0);
      return {
        id: "cad-klient-skladanie-inline",
        name: "Składanie rysunków od klienta",
        quantity: qty,
        unit: "szt",
        unitPrice: price,
        totalPrice: parseFloat((price * qty).toFixed(2)),
        optionsHint: `${qty} szt.`,
        payload: { price, qty }
      };
    };

    const getInlineNieformatoweSkladanieOp = (): CadOpItem | null => {
      if (!optNieformatoweSkladanie?.checked || !nieformatoweSkladanieQtyInput) return null;
      const qty = parseFloat(nieformatoweSkladanieQtyInput.value.replace(",", "."));
      if (isNaN(qty) || qty <= 0) return null;
      const price = resolveStoredPrice("cad-nieformatowe-skladanie", 2.5);
      return {
        id: "cad-nieformatowe-skladanie-inline",
        name: "Składanie rysunków nieformatowych",
        quantity: qty,
        unit: "m²",
        unitPrice: price,
        totalPrice: parseFloat((price * qty).toFixed(2)),
        optionsHint: `${qty} m²`,
        payload: { price, qty }
      };
    };

    const getInlinePaskiWzmacniajaceOp = (): CadOpItem | null => {
      if (!optPaskiWzmacniajace?.checked || !paskiWzmacniajaceQtyInput) return null;
      const qty = parseInt(paskiWzmacniajaceQtyInput.value, 10);
      if (isNaN(qty) || qty <= 0) return null;
      const price = resolveStoredPrice("cad-paski-wzmacniajace", 0.8);
      return {
        id: "cad-paski-wzmacniajace-inline",
        name: "Doklejanie pasków wzmacniających",
        quantity: qty,
        unit: "szt",
        unitPrice: price,
        totalPrice: parseFloat((price * qty).toFixed(2)),
        optionsHint: `${qty} szt.`,
        payload: { price, qty }
      };
    };

    const getEffectiveCadOps = (): CadOpItem[] => {
      const extra: CadOpItem[] = [];
      const inlineScan = getInlineWfScanOp();
      if (inlineScan) {
        const duplicateExists = cadOps.some(op =>
          op.name === inlineScan.name &&
          op.optionsHint === inlineScan.optionsHint &&
          Math.abs(op.totalPrice - inlineScan.totalPrice) < 0.01
        );
        if (!duplicateExists) extra.push(inlineScan);
      }
      const klientOp = getInlineKlientSkladanieOp();
      if (klientOp) extra.push(klientOp);
      const nieformatoweOp = getInlineNieformatoweSkladanieOp();
      if (nieformatoweOp) extra.push(nieformatoweOp);
      const paskiOp = getInlinePaskiWzmacniajaceOp();
      if (paskiOp) extra.push(paskiOp);
      return extra.length > 0 ? [...cadOps, ...extra] : cadOps;
    };

    const updateCadOpsSummary = () => {
      if (!cadOpsList || !cadOpsListItems || !cadOpsTotal) return;

      const effectiveOps = getEffectiveCadOps();

      if (effectiveOps.length === 0) {
        cadOpsList.style.display = "none";
        cadOpsListItems.innerHTML = "";
        cadOpsTotal.innerText = formatPLN(0);
        return;
      }

      const total = effectiveOps.reduce((sum, op) => sum + op.totalPrice, 0);
      cadOpsList.style.display = "block";
      cadOpsListItems.innerHTML = effectiveOps
        .map(op => `<div>• ${op.name}: ${formatPLN(op.totalPrice)} (${op.optionsHint})</div>`)
        .join("");
      cadOpsTotal.innerText = formatPLN(total);
    };

    const getCadOpsTotal = () => getEffectiveCadOps().reduce((sum, op) => sum + op.totalPrice, 0);

    const zadrukFactor = resolveStoredPrice("modifier-druk-zadruk25", 0.5);
    const emailFeeUnit = resolveStoredPrice("druk-email", 1);

    const getPrintOptionsBreakdown = (printTotal: number) => {
      const zadruk25 = optZadruk25?.checked ? printTotal * zadrukFactor : 0;
      const scale = optScale?.checked ? printTotal * 0.5 : 0;
      const email = optEmail?.checked ? emailFeeUnit : 0;
      const total = zadruk25 + scale + email;

      return {
        zadruk25: parseFloat(zadruk25.toFixed(2)),
        scale: parseFloat(scale.toFixed(2)),
        email: parseFloat(email.toFixed(2)),
        total: parseFloat(total.toFixed(2)),
      };
    };

    const updateOptionsSummary = () => {
      const printTotal = currentResult?.totalPrice ?? 0;
      const breakdown = getPrintOptionsBreakdown(printTotal);

      if (optZadruk25PriceSpan) optZadruk25PriceSpan.innerText = formatPLN(breakdown.zadruk25);
      if (optScalePriceSpan) optScalePriceSpan.innerText = formatPLN(breakdown.scale);
      if (optEmailPriceSpan) optEmailPriceSpan.innerText = formatPLN(breakdown.email);
      if (totalWithOptionsSpan) totalWithOptionsSpan.innerText = formatPLN(printTotal + breakdown.total);
      if (optionsSummary) optionsSummary.style.display = currentResult ? "block" : "none";
    };

    const updateGrandTotal = () => {
      if (!grandTotalSpan) return;
      const printTotal = currentResult?.totalPrice ?? 0;
      const optionsTotal = getPrintOptionsBreakdown(printTotal).total;
      const opsTotal = getCadOpsTotal();
      grandTotalSpan.innerText = formatPLN(printTotal + optionsTotal + opsTotal);
    };

    foldAddBtn?.addEventListener("click", () => {
      if (!foldFormatSelect || !foldQtyInput) return;
      const qty = parseInt(foldQtyInput.value, 10);
      if (isNaN(qty) || qty <= 0) return;

      try {
        const formatKey = normalizeFoldFormat(foldFormatSelect.value);
        const result = quoteCadFold({ format: formatKey, qty });
        const labelFmt = foldFormatSelect.value;
        cadOps.push({
          id: `cad-fold-${Date.now()}`,
          name: `Składanie (${labelFmt})`,
          quantity: qty,
          unit: "szt",
          unitPrice: result.unit,
          totalPrice: result.total,
          optionsHint: `${qty} szt.`,
          payload: result
        });
        updateCadOpsSummary();
        updateGrandTotal();
      } catch (err) {
        console.warn("Składanie CAD:", (err as Error).message);
      }
    });

    foldQtyInput?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        foldAddBtn?.click();
      }
    });

    wfScanAddBtn?.addEventListener("click", () => {
      if (!wfScanCmInput || !wfScanQtyInput) return;
      const cm = parseFloat(wfScanCmInput.value);
      const qty = parseInt(wfScanQtyInput.value, 10);
      if (isNaN(cm) || cm <= 0 || isNaN(qty) || qty <= 0) return;

      try {
        const mm = Math.round(cm * 10);
        const result = quoteCadWfScan({ lengthMm: mm, qty });
        cadOps.push({
          id: `cad-wf-scan-${Date.now()}`,
          name: "Skanowanie wielkoformatowe",
          quantity: qty,
          unit: "szt",
          unitPrice: result.unitPrice,
          totalPrice: result.total,
          optionsHint: `${qty} szt., ${cm} cm`,
          payload: result
        });
        updateCadOpsSummary();
        updateGrandTotal();
      } catch (err) {
        console.warn("Skanowanie WF:", (err as Error).message);
      }
    });

    [wfScanCmInput, wfScanQtyInput].forEach((el) => {
      el?.addEventListener("input", () => {
        updateCadOpsSummary();
        updateGrandTotal();
      });
    });

    optKlientSkladanie?.addEventListener("change", () => {
      if (klientSkladanieQtyRow) klientSkladanieQtyRow.style.display = optKlientSkladanie.checked ? "block" : "none";
      updateCadOpsSummary();
      updateGrandTotal();
    });
    optNieformatoweSkladanie?.addEventListener("change", () => {
      if (nieformatoweSkladanieQtyRow) nieformatoweSkladanieQtyRow.style.display = optNieformatoweSkladanie.checked ? "block" : "none";
      updateCadOpsSummary();
      updateGrandTotal();
    });
    optPaskiWzmacniajace?.addEventListener("change", () => {
      if (paskiWzmacniajaceQtyRow) paskiWzmacniajaceQtyRow.style.display = optPaskiWzmacniajace.checked ? "block" : "none";
      updateCadOpsSummary();
      updateGrandTotal();
    });
    [klientSkladanieQtyInput, nieformatoweSkladanieQtyInput, paskiWzmacniajaceQtyInput].forEach((el) => {
      el?.addEventListener("input", () => {
        updateCadOpsSummary();
        updateGrandTotal();
      });
    });

    const updateUI = () => {
      const format = formatSelect.value;
      const mode = modeSelect.value;
      const baseLen = data.base[format]?.l;
      baseInfo.innerText = `Wymiar bazowy: ${baseLen} mm`;

      qtySheetsGroup.style.display = "grid";

      return baseLen;
    };

    formatSelect.onchange = () => {
      const baseLen = data.base[formatSelect.value]?.l;
      if (baseLen != null) lengthInput.value = String(baseLen);
      updateUI();
      ensureLegend();
    };
    modeSelect.onchange = () => {
      updateUI();
      ensureLegend();
    };
    lengthInput.oninput = updateUI;

    useBaseBtn.onclick = () => {
      lengthInput.value = updateUI().toString();
      updateUI();
    };

    updateUI();
    ensureLegend();

    let currentResult: any = null;
    let currentOptions: any = null;

    const performCalculation = () => {
      const parsedQty = parseInt(qtySheetsInput.value, 10);
      const parsedLength = parseInt(lengthInput.value, 10);
      if (!qtySheetsInput.value || isNaN(parsedQty) || parsedQty <= 0 || isNaN(parsedLength) || parsedLength <= 0) {
        resultDisplay.style.display = "none";
        addToCartBtn.disabled = true;
        currentResult = null;
        updateOptionsSummary();
        updateGrandTotal();
        return;
      }

      currentOptions = {
        mode: modeSelect.value,
        format: formatSelect.value,
        lengthMm: parsedLength,
        qty: parsedQty,
        express: ctx.expressMode
      };

      const result = calculateDrukCAD(currentOptions, data);
      currentResult = result;

      priceTypeSpan.innerText = result.isMeter ? "Cena za mb:" : "Cena za szt:";
      if (unitPriceSpan) unitPriceSpan.innerText = formatPLN(result.rate ?? 0);
      if (qtyHintSpan) {
        const qty = currentOptions.qty || 1;
        const unit = result.isMeter ? "mb" : "szt";
        qtyHintSpan.innerText = `${qty} ${unit} × ${formatPLN(result.rate ?? 0)} = ${formatPLN(result.basePrice)}${result.isMeter ? "" : ""}, format: ${displayCadFormat(currentOptions.format)}`;
      }
      totalPriceSpan.innerText = formatPLN(result.totalPrice);
      if (expressHint) expressHint.style.display = ctx.expressMode ? "block" : "none";
      resultDisplay.style.display = "block";
      addToCartBtn.disabled = false;

      updateOptionsSummary();
      updateGrandTotal();

      const optionsTotal = getPrintOptionsBreakdown(result.totalPrice).total;
      ctx.updateLastCalculated(result.totalPrice + optionsTotal + getCadOpsTotal(), "Druk CAD + usługi");
    };

    autoCalc({ root: container, calc: performCalculation });

    addToCartBtn.onclick = () => {
      if (currentResult && currentOptions) {
        const qtyLabel = currentResult.isMeter ? "" : `${currentOptions.qty} szt, `;
        const printOptions = getPrintOptionsBreakdown(currentResult.totalPrice);
        const printTotalWithOptions = parseFloat((currentResult.totalPrice + printOptions.total).toFixed(2));
        const effectiveOps = getEffectiveCadOps();
        const opts = [
          `${displayCadFormat(currentOptions.format)} (${currentOptions.mode === 'bw' ? 'CZ-B' : 'KOLOR'})`,
            `${qtyLabel}${currentOptions.lengthMm} mm`,
          optZadruk25?.checked ? "Zadruk >25% (+50%)" : "",
          optScale?.checked ? "Skalowanie (+50%)" : "",
          optEmail?.checked ? `Wysyłka e-mail (+${formatPLN(emailFeeUnit)})` : "",
            effectiveOps.some(op => op.name === "Skanowanie wielkoformatowe") ? "Skanowanie wielkoformatowe" : "",
            ctx.expressMode ? "EXPRESS" : ""
        ].filter(Boolean).join(", ");

        ctx.cart.addItem({
          id: `cad-${Date.now()}`,
          category: "Druk CAD wielkoformatowy",
          name: `${displayCadFormat(currentOptions.format)} ${currentOptions.mode === 'bw' ? 'CZ-B' : 'KOLOR'}`,
          quantity: currentOptions.lengthMm,
          unit: "mm",
          unitPrice: printTotalWithOptions / currentOptions.lengthMm,
          isExpress: ctx.expressMode,
          totalPrice: printTotalWithOptions,
          optionsHint: opts,
          payload: {
            ...currentResult,
            options: {
              zadruk25: optZadruk25?.checked || false,
              scale: optScale?.checked || false,
              email: optEmail?.checked || false,
              zadruk25Price: printOptions.zadruk25,
              scalePrice: printOptions.scale,
              emailPrice: printOptions.email,
              optionsTotal: printOptions.total,
            },
            totalWithOptions: printTotalWithOptions,
          }
        });

        for (const op of effectiveOps) {
          ctx.cart.addItem({
            id: `${op.id}-${Date.now()}`,
            category: "CAD",
            name: op.name,
            quantity: op.quantity,
            unit: op.unit,
            unitPrice: op.unitPrice,
            isExpress: false,
            totalPrice: op.totalPrice,
            optionsHint: op.optionsHint,
            payload: op.payload
          });
        }

        if (cadOps.length > 0) {
          cadOps.splice(0, cadOps.length);
          updateCadOpsSummary();
          updateGrandTotal();
        }

        ctx.updateLastCalculated(printTotalWithOptions + getCadOpsTotal(), "Druk CAD + usługi");
      }
    };

    [optZadruk25, optScale, optEmail].forEach((el) => {
      el?.addEventListener("change", () => {
        updateOptionsSummary();
        updateGrandTotal();
        if (currentResult) {
          const optionsTotal = getPrintOptionsBreakdown(currentResult.totalPrice).total;
          ctx.updateLastCalculated(currentResult.totalPrice + optionsTotal + getCadOpsTotal(), "Druk CAD + usługi");
        }
      });
    });

    updateOptionsSummary();
    updateGrandTotal();
  }
};
