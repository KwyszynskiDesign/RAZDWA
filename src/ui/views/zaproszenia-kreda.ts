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
      const foldKey = foldedCheck.checked ? "folded" : "normal";
      const foldStorageKey = foldedCheck.checked ? "skladane" : "normal";
      const paperVal = paperSel.value;
      const isSatin = paperVal?.startsWith("satyna") || paperVal === "modigliani";
      const paperBase: "kreda" | "satyna" = isSatin ? "satyna" : "kreda";
      const tiers = (paperBase === "satyna"
        ? (data?.satynaFormats?.[format]?.[sidesKey]?.[foldKey] ?? data?.satynaFormats?.[format]?.[sidesKey]?.["skladane"])
        : (data?.formats?.[format]?.[sidesKey]?.[foldKey] ?? data?.formats?.[format]?.[sidesKey]?.["skladane"])) ?? {};

      const qtyList = Object.keys(tiers)
        .map((k) => Number(k))
        .filter((n) => Number.isFinite(n))
        .sort((a, b) => a - b);

      if (legendTitle) {
        legendTitle.innerText = `CENNIK ZAPROSZENIA ${format} ${sidesNum === 1 ? "JEDNOSTRONNE" : "DWUSTRONNE"}${foldedCheck.checked ? " SKŁADANE" : ""}`;
      }
      if (legendSubtitle) {
        legendSubtitle.innerText = "Legenda cenowa dla aktualnie wybranego wariantu.";
      }
      if (legendModeBadge) {
        legendModeBadge.textContent = `Wariant: ${format}, ${sidesNum === 1 ? "jednostronne" : "dwustronne"}, ${foldedCheck.checked ? "składane" : "normal"}, ${paperBase.toUpperCase()}`;
      }

      legendRows.replaceChildren();
      qtyList.forEach((qty) => {
        const base = Number(tiers[String(qty)] ?? 0);
        const keyPrefix = paperBase === "satyna" ? "zaproszenia-satyna" : "zaproszenia";
        const price = resolveStoredPrice(`${keyPrefix}-${format.toLowerCase()}-${sidesKey}-${foldStorageKey}-${qty}`, base);

        const tr = document.createElement("tr");
        const qtyTd = document.createElement("td");
        qtyTd.textContent = `${qty} szt`;
        const priceTd = document.createElement("td");
        priceTd.textContent = formatPLN(price);
        tr.append(qtyTd, priceTd);
        legendRows.appendChild(tr);
      });
    };

    const renderBreakdownRows = (rows: Array<{ label: string; value: string; isTotal?: boolean }>) => {
      breakdownLines.replaceChildren();
      rows.forEach((row) => {
        const line = document.createElement("div");
        if (row.isTotal) {
          line.style.paddingTop = "8px";
          line.style.borderTop = "1px solid rgba(255,255,255,0.08)";
        }

        const strong = document.createElement("strong");
        strong.textContent = `${row.label}: `;
        line.appendChild(strong);
        line.appendChild(document.createTextNode(row.value));
        breakdownLines.appendChild(line);
      });
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

      const breakdownRows: Array<{ label: string; value: string; isTotal?: boolean }> = [
        {
          label: "Parametry",
          value: `${options.qty} szt, ${options.format}, ${options.sides === 1 ? "jednostronne" : "dwustronne"}${options.isFolded ? ", składane" : ""}`,
        },
        { label: "Cena z tabeli", value: formatPLN(result.basePrice) },
      ];

      if (options.isModigliani) {
        breakdownRows.push({
          label: "Modigliani",
          value: `${Math.round(modiglianiRate * 100)}% × ${formatPLN(result.basePrice)} = ${formatPLN(modiglianiAmount)}`,
        });
      } else if (options.isSatin) {
        breakdownRows.push({
          label: "Satyna",
          value: "cena z osobnej tabeli SATYNA (bez dodatkowego +12%)",
        });
      }

      if (options.express) {
        breakdownRows.push({
          label: "EXPRESS",
          value: `${Math.round(expressRate * 100)}% × ${formatPLN(result.basePrice)} = ${formatPLN(expressAmount)}`,
        });
      }

      if (withEnvelopes) {
        breakdownRows.push({
          label: envelopeLabel,
          value: `${envelopeQty} szt × ${formatPLN(envelopeUnitPrice)} = ${formatPLN(envelopeTotal)}`,
        });
      }

      breakdownRows.push({
        label: "Razem",
        value: formatPLN(totalPrice),
        isTotal: true,
      });

      renderBreakdownRows(breakdownRows);
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
    ctx?.on?.("prices-updated", () => { updateLegend(); calculate(); });

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
