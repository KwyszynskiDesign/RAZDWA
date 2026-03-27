import { View, ViewContext } from "../types";
import { calculateZaproszeniaKreda, ZaproszeniaKredaOptions } from "../../categories/zaproszenia-kreda";
import { formatPLN } from "../../core/money";
import { resolveStoredPrice } from "../../core/compat";

export const ZaproszeniaKredaView: View = {
  id: "zaproszenia-kreda",
  name: "Zaproszenia KREDA",
  async mount(container, ctx) {
    const response = await fetch("categories/zaproszenia-kreda.html");
    container.innerHTML = await response.text();

    const formatSel = container.querySelector("#zapFormat") as HTMLSelectElement;
    const sidesSel = container.querySelector("#zapSides") as HTMLSelectElement;
    const foldedCheck = container.querySelector("#zapFolded") as HTMLInputElement;
    const qtyInput = container.querySelector("#zapQty") as HTMLInputElement;
    const paperSel = container.querySelector("#zapPaper") as HTMLSelectElement;
    const envelopeEnabled = container.querySelector("#zapEnvelopeEnabled") as HTMLInputElement;
    const envelopeFields = container.querySelector("#zapEnvelopeFields") as HTMLElement;
    const envelopeTypeSel = container.querySelector("#zapEnvelopeType") as HTMLSelectElement;
    const envelopeQtyInput = container.querySelector("#zapEnvelopeQty") as HTMLInputElement;
    const calcBtn = container.querySelector("#calcBtn") as HTMLButtonElement;
    const addToCartBtn = container.querySelector("#addToCartBtn") as HTMLButtonElement;
    const resultArea = container.querySelector("#zapResult") as HTMLElement;
    const breakdownBox = container.querySelector("#zapBreakdown") as HTMLElement;
    const breakdownLines = container.querySelector("#zapBreakdownLines") as HTMLElement;
    const envelopeSummaryRow = container.querySelector("#resEnvelopeSummary") as HTMLElement;
    const envelopeSummaryValue = container.querySelector("#resEnvelopeSummaryValue") as HTMLElement;

    const satinRate = resolveStoredPrice("modifier-satyna", 0.12);
    const modiglianiRate = resolveStoredPrice("modifier-modigliani", 0.20);
    const expressRate = resolveStoredPrice("modifier-express", 0.20);

    const getEnvelopeLabel = (key: string): string => `Koperta ${key.toUpperCase()}`;
    const updateEnvelopeVisibility = () => {
      if (!envelopeFields) return;
      envelopeFields.style.display = envelopeEnabled?.checked ? "block" : "none";
    };

    envelopeEnabled?.addEventListener("change", updateEnvelopeVisibility);
    updateEnvelopeVisibility();

    const calculate = () => {
      const paperVal = paperSel.value;
      const isSatin = paperVal.startsWith("satyna");
      const isModigliani = paperVal === "modigliani";
      const options: ZaproszeniaKredaOptions = {
        format: formatSel.value,
        qty: parseInt(qtyInput.value) || 10,
        sides: parseInt(sidesSel.value) || 1,
        isFolded: foldedCheck.checked,
        isSatin,
        isModigliani,
        express: ctx.expressMode
      };

      const result = calculateZaproszeniaKreda(options);
      const envelopeType = (envelopeTypeSel?.value || "a").toLowerCase();
      const envelopeQty = Math.max(1, parseInt(envelopeQtyInput?.value || "1", 10) || 1);
      const withEnvelopes = Boolean(envelopeEnabled?.checked);
      const envelopeKey = `koperty-${envelopeType}`;
      const envelopeLabel = getEnvelopeLabel(envelopeType);
      const envelopeUnitPrice = withEnvelopes ? resolveStoredPrice(envelopeKey, 0) : 0;
      const envelopeTotal = withEnvelopes ? parseFloat((envelopeUnitPrice * envelopeQty).toFixed(2)) : 0;
      const totalPrice = parseFloat((result.totalPrice + envelopeTotal).toFixed(2));

      let satinAmount = 0;
      let modiglianiAmount = 0;
      if (options.isModigliani) {
        satinAmount = parseFloat((result.basePrice * satinRate).toFixed(2));
        modiglianiAmount = parseFloat(((result.basePrice + satinAmount) * modiglianiRate).toFixed(2));
      } else if (options.isSatin) {
        satinAmount = parseFloat((result.basePrice * satinRate).toFixed(2));
      }
      const expressAmount = options.express ? parseFloat((result.basePrice * expressRate).toFixed(2)) : 0;

      const breakdown = [
        `<div><strong>Parametry:</strong> ${options.qty} szt, ${options.format}, ${options.sides === 1 ? "jednostronne" : "dwustronne"}${options.isFolded ? ", składane" : ""}</div>`,
        `<div><strong>Cena z tabeli:</strong> ${formatPLN(result.basePrice)}</div>`,
      ];

      if (options.isModigliani) {
        breakdown.push(`<div><strong>Satyna:</strong> ${Math.round(satinRate * 100)}% × ${formatPLN(result.basePrice)} = ${formatPLN(satinAmount)}</div>`);
        breakdown.push(`<div><strong>Modigliani:</strong> ${Math.round(modiglianiRate * 100)}% × (${formatPLN(result.basePrice)} + ${formatPLN(satinAmount)}) = ${formatPLN(modiglianiAmount)}</div>`);
      } else if (options.isSatin) {
        breakdown.push(`<div><strong>Satyna:</strong> ${Math.round(satinRate * 100)}% × ${formatPLN(result.basePrice)} = ${formatPLN(satinAmount)}</div>`);
      } else {
        breakdown.push(`<div><strong>Papier:</strong> Kreda (bez dopłaty) = ${formatPLN(0)}</div>`);
      }

      if (options.express) {
        breakdown.push(`<div><strong>EXPRESS:</strong> ${Math.round(expressRate * 100)}% × ${formatPLN(result.basePrice)} = ${formatPLN(expressAmount)}</div>`);
      } else {
        breakdown.push(`<div><strong>EXPRESS:</strong> nie wybrano = ${formatPLN(0)}</div>`);
      }

      if (withEnvelopes) {
        breakdown.push(`<div><strong>${envelopeLabel}:</strong> ${envelopeQty} szt × ${formatPLN(envelopeUnitPrice)} = ${formatPLN(envelopeTotal)}</div>`);
      } else {
        breakdown.push(`<div><strong>Koperty:</strong> nie wybrano = ${formatPLN(0)}</div>`);
      }

      breakdown.push(`<div style="padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.08);"><strong>Razem:</strong> ${formatPLN(result.basePrice)} + ${formatPLN(satinAmount + modiglianiAmount)} + ${formatPLN(expressAmount)} + ${formatPLN(envelopeTotal)} = <strong>${formatPLN(totalPrice)}</strong></div>`);
      breakdownLines.innerHTML = breakdown.join("");
      breakdownBox.style.display = "block";

      resultArea.style.display = "block";
      (container.querySelector("#resUnitPrice") as HTMLElement).textContent = formatPLN(totalPrice / options.qty);
      (container.querySelector("#resTotalPrice") as HTMLElement).textContent = formatPLN(totalPrice);
      if (withEnvelopes) {
        envelopeSummaryRow.style.display = "block";
        envelopeSummaryValue.textContent = `${envelopeLabel}, ${envelopeQty} szt (${formatPLN(envelopeTotal)})`;
      } else {
        envelopeSummaryRow.style.display = "none";
        envelopeSummaryValue.textContent = "0";
      }
      const tierHintEl = container.querySelector("#resTierHint") as HTMLElement;
      if (tierHintEl) {
        tierHintEl.textContent = `Dla ${options.qty} szt użyto ceny ${result.basePrice.toFixed(2)} zł (papier: ${paperVal.replace("_", " ")})`;
      }
      (container.querySelector("#resExpressHint") as HTMLElement).style.display = options.express ? "block" : "none";
      (container.querySelector("#resSatinHint") as HTMLElement).style.display = options.isSatin ? "block" : "none";
      (container.querySelector("#resModiglianiHint") as HTMLElement).style.display = options.isModigliani ? "block" : "none";

      ctx.updateLastCalculated(totalPrice, "Zaproszenia");
      return {
        options,
        result: {
          ...result,
          totalPrice,
          envelopeType,
          envelopeLabel,
          envelopeQty: withEnvelopes ? envelopeQty : 0,
          envelopeUnitPrice,
          envelopeTotal,
          withEnvelopes
        }
      };
    };

    calcBtn.addEventListener("click", () => calculate());

    addToCartBtn.addEventListener("click", () => {
      const { options, result } = calculate();

      const zpv = paperSel.value;
      const zPaperLabel = zpv === 'modigliani'
        ? 'Modigliani'
        : zpv.startsWith('satyna_')
          ? `Satyna ${zpv.slice(7)}g`
          : `Kreda ${zpv.slice(6)}g`;

      ctx.cart.addItem({
        id: `zap-${Date.now()}`,
        category: "Zaproszenia Kreda",
        name: `Zaproszenia ${options.format} ${options.sides === 1 ? '1-str' : '2-str'}${options.isFolded ? ' składane' : ''}`,
        quantity: options.qty,
        unit: "szt",
        unitPrice: result.totalPrice / options.qty,
        isExpress: options.express,
        totalPrice: result.totalPrice,
        optionsHint: [
          `${options.qty} szt`,
          zPaperLabel,
          ...(result.withEnvelopes ? [`${result.envelopeLabel}: ${result.envelopeQty} szt (+${formatPLN(result.envelopeTotal)})`] : []),
          ...(options.express ? ['EXPRESS (+20%)'] : [])
        ].join(', '),
        payload: { ...options, envelope: result.withEnvelopes ? { type: result.envelopeType, qty: result.envelopeQty } : null }
      });
    });

    // Initial calculation
    calculate();
  }
};
