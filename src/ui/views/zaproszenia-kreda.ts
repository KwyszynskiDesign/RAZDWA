import { View, ViewContext } from "../types";
import { autoCalc } from "../autoCalc";
import { calculateZaproszeniaKreda, ZaproszeniaKredaOptions } from "../../categories/zaproszenia-kreda";
import { formatPLN } from "../../core/money";
import { resolveStoredPrice } from "../../core/compat";
import { getPrice } from "../../services/priceService";

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
    const addToCartBtn = container.querySelector("#addToCartBtn") as HTMLButtonElement;
    const resultArea = container.querySelector("#zapResult") as HTMLElement;
    const breakdownBox = container.querySelector("#zapBreakdown") as HTMLElement;
    const breakdownLines = container.querySelector("#zapBreakdownLines") as HTMLElement;
    const legendTitle = container.querySelector("#zap-legend-title") as HTMLElement | null;
    const legendSubtitle = container.querySelector("#zap-legend-subtitle") as HTMLElement | null;
    const legendModeBadge = container.querySelector("#zap-legend-mode-badge") as HTMLElement | null;
    const legendRows = container.querySelector("#zap-legend-rows") as HTMLElement | null;
    const envelopeSummaryRow = container.querySelector("#resEnvelopeSummary") as HTMLElement;
    const envelopeSummaryValue = container.querySelector("#resEnvelopeSummaryValue") as HTMLElement;

    const updateLegend = () => {
      if (!legendRows) return;

      const data = getPrice("zaproszeniaKreda") as any;
      const format = formatSel.value || "A6";
      const sidesNum = parseInt(sidesSel.value, 10) || 1;
      const sidesKey = sidesNum === 1 ? "single" : "double";
      const foldKey = foldedCheck.checked ? "skladane" : "normal";
      const paperVal = paperSel.value;
      const isSatin = paperVal?.startsWith("satyna") || paperVal === "modigliani";
      const paperBase: "kreda" | "satyna" = isSatin ? "satyna" : "kreda";
      const tiers = (paperBase === "satyna"
        ? data?.satynaFormats?.[format]?.[sidesKey]?.[foldKey]
        : data?.formats?.[format]?.[sidesKey]?.[foldKey]) ?? {};

      const qtyList = Object.keys(tiers)
        .map((k) => Number(k))
        .filter((n) => Number.isFinite(n))
        .sort((a, b) => a - b);

      if (legendTitle) {
        legendTitle.innerText = `CENNIK ZAPROSZENIA ${format} ${sidesNum === 1 ? "JEDNOSTRONNE" : "DWUSTRONNE"}${foldKey === "skladane" ? " SKŁADANE" : ""}`;
      }
      if (legendSubtitle) {
        legendSubtitle.innerText = "Legenda cenowa dla aktualnie wybranego wariantu.";
      }
      if (legendModeBadge) {
        legendModeBadge.innerHTML = `<strong>Wariant:</strong> ${format}, ${sidesNum === 1 ? "jednostronne" : "dwustronne"}, ${foldKey === "skladane" ? "składane" : "normal"}, ${paperBase.toUpperCase()}`;
      }

      legendRows.innerHTML = qtyList
        .map((qty) => {
          const base = Number(tiers[String(qty)] ?? 0);
          const keyPrefix = paperBase === "satyna" ? "zaproszenia-satyna" : "zaproszenia";
          const price = resolveStoredPrice(`${keyPrefix}-${format.toLowerCase()}-${sidesKey}-${foldKey}-${qty}`, base);
          return `<tr><td>${qty} szt</td><td>${formatPLN(price)}</td></tr>`;
        })
        .join("");
    };

    const modiglianiRate = resolveStoredPrice("modifier-modigliani", 0.20);
    const expressRate = resolveStoredPrice("modifier-express", 0.20);

    const getEnvelopeLabel = (key: string): string => `Koperta ${key.toUpperCase()}`;
    const updateEnvelopeVisibility = () => {
      if (!envelopeFields) return;
      envelopeFields.style.display = envelopeEnabled?.checked ? "block" : "none";
    };

    envelopeEnabled?.addEventListener("change", updateEnvelopeVisibility);
    formatSel?.addEventListener("change", updateLegend);
    sidesSel?.addEventListener("change", updateLegend);
    foldedCheck?.addEventListener("change", updateLegend);
    paperSel?.addEventListener("change", updateLegend);
    updateEnvelopeVisibility();

    const calculate = () => {
      const qtyRaw = (qtyInput.value || "").trim();
      const qty = parseInt(qtyRaw, 10);
      const sides = parseInt(sidesSel.value, 10);

      const hasAllRequiredInputs =
        Boolean(formatSel.value) &&
        Number.isFinite(sides) &&
        sides > 0 &&
        Boolean(paperSel.value) &&
        qtyRaw.length > 0 &&
        Number.isFinite(qty) &&
        qty > 0;

      if (!hasAllRequiredInputs) {
        resultArea.style.display = "none";
        breakdownBox.style.display = "none";
        addToCartBtn.disabled = true;
        return null;
      }
      const paperVal = paperSel.value;
      const isSatin = paperVal.startsWith("satyna");
      const isModigliani = paperVal === "modigliani";
      const options: ZaproszeniaKredaOptions = {
        format: formatSel.value,
        qty,
        sides,
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

      let modiglianiAmount = 0;
      if (options.isModigliani) {
        modiglianiAmount = parseFloat((result.basePrice * modiglianiRate).toFixed(2));
      }
      const expressAmount = options.express ? parseFloat((result.basePrice * expressRate).toFixed(2)) : 0;

      const breakdown = [
        `<div><strong>Parametry:</strong> ${options.qty} szt, ${options.format}, ${options.sides === 1 ? "jednostronne" : "dwustronne"}${options.isFolded ? ", składane" : ""}</div>`,
        `<div><strong>Cena z tabeli:</strong> ${formatPLN(result.basePrice)}</div>`,
      ];

      if (options.isModigliani) {
        breakdown.push(`<div><strong>Modigliani:</strong> ${Math.round(modiglianiRate * 100)}% × ${formatPLN(result.basePrice)} = ${formatPLN(modiglianiAmount)}</div>`);
      } else if (options.isSatin) {
        breakdown.push(`<div><strong>Satyna:</strong> cena z osobnej tabeli SATYNA (bez dodatkowego +12%)</div>`);
      }

      if (options.express) {
        breakdown.push(`<div><strong>EXPRESS:</strong> ${Math.round(expressRate * 100)}% × ${formatPLN(result.basePrice)} = ${formatPLN(expressAmount)}</div>`);
      }

      if (withEnvelopes) {
        breakdown.push(`<div><strong>${envelopeLabel}:</strong> ${envelopeQty} szt × ${formatPLN(envelopeUnitPrice)} = ${formatPLN(envelopeTotal)}</div>`);
      }

      breakdown.push(`<div style="padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.08);"><strong>Razem:</strong> ${formatPLN(result.basePrice)} + ${formatPLN(modiglianiAmount)} + ${formatPLN(expressAmount)} + ${formatPLN(envelopeTotal)} = <strong>${formatPLN(totalPrice)}</strong></div>`);
      breakdownLines.innerHTML = breakdown.join("");
      breakdownBox.style.display = "block";

      resultArea.style.display = "block";
      addToCartBtn.disabled = false;
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

    autoCalc({ root: container, calc: calculate });
    updateLegend();

    addToCartBtn.addEventListener("click", () => {
      const calc = calculate();
      if (!calc) return;
      const { options, result } = calc;

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
  }
};
