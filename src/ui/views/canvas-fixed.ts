import { View, ViewContext } from "../types";
import { autoCalc } from "../autoCalc";
import { calculateCanvas, CanvasOptions, CanvasResult } from "../../categories/canvas";
import { formatPLN } from "../../core/money";
import { getPrice } from "../../services/priceService";
import { resolveStoredPrice } from "../../core/compat";

export const CanvasView: View = {
  id: "canvas",
  name: "Canvas / P\u0142\u00F3tno",
  async mount(container, ctx) {
    try {
      const response = await fetch("categories/canvas.html");
      if (!response.ok) throw new Error("Failed to load template");
      container.innerHTML = await response.text();
      this.initLogic?.(container, ctx);
    } catch (err) {
      container.innerHTML = `<div class="error">B\u0142\u0105d \u0142adowania: ${err}</div>`;
    }
  },

  initLogic(container: HTMLElement, ctx: ViewContext) {
    const data = getPrice("canvas") as any;

    const modeSel = container.querySelector("#cv-mode") as HTMLSelectElement;
    const formatRow = container.querySelector("#cv-format-row") as HTMLElement;
    const formatSel = container.querySelector("#cv-format") as HTMLSelectElement;
    const sizeRow = container.querySelector("#cv-size-row") as HTMLElement;
    const widthInput = container.querySelector("#cv-width") as HTMLInputElement;
    const heightInput = container.querySelector("#cv-height") as HTMLInputElement;
    const qtyInput = container.querySelector("#cv-qty") as HTMLInputElement;

    const addBtn = container.querySelector("#cv-add") as HTMLButtonElement;

    const resultEl = container.querySelector("#cv-result") as HTMLElement;
    const normalEl = container.querySelector("#cv-normal") as HTMLElement;
    const modeLabelEl = container.querySelector("#cv-mode-label") as HTMLElement;
    const formatLabelEl = container.querySelector("#cv-format-label") as HTMLElement;
    const areaRowEl = container.querySelector("#cv-area-row") as HTMLElement;
    const areaEl = container.querySelector("#cv-area") as HTMLElement;
    const unitEl = container.querySelector("#cv-unit") as HTMLElement;
    const printCostRowEl = container.querySelector("#cv-print-cost-row") as HTMLElement;
    const printCostEl = container.querySelector("#cv-print-cost") as HTMLElement;
    const frameCostRowEl = container.querySelector("#cv-frame-cost-row") as HTMLElement;
    const frameCostEl = container.querySelector("#cv-frame-cost") as HTMLElement;
    const qtyEl = container.querySelector("#cv-qty-val") as HTMLElement;
    const totalEl = container.querySelector("#cv-total") as HTMLElement;
    const expressEl = container.querySelector("#cv-express") as HTMLElement;
    const legendM2Rate = container.querySelector("#cv-legend-m2-rate") as HTMLElement | null;
    const legendExpress = container.querySelector("#cv-legend-express") as HTMLElement | null;
    const legendFramedRows = container.querySelector("#cv-legend-framed-rows") as HTMLElement | null;
    const legendUnframedRows = container.querySelector("#cv-legend-unframed-rows") as HTMLElement | null;
    const legendNote = container.querySelector("#cv-legend-note") as HTMLElement | null;

    let currentOptions: CanvasOptions | null = null;
    let currentResult: CanvasResult | null = null;

    const updateLegend = () => {
      const framedMode = data?.modes?.find((m: any) => m.id === "framed");
      const unframedMode = data?.modes?.find((m: any) => m.id === "unframed");
      const m2Mode = data?.modes?.find((m: any) => m.id === "m2-unframed");

      if (legendM2Rate) {
        legendM2Rate.innerText = `${formatPLN(resolveStoredPrice("canvas-m2-unframed", m2Mode?.pricePerM2 ?? 180))} / m²`;
      }
      if (legendExpress) {
        legendExpress.innerText = `+${Math.round(resolveStoredPrice("modifier-express", 0.2) * 100)}%`;
      }

      if (legendFramedRows) {
        const rows = (framedMode?.formats ?? [])
          .filter((f: any) => !f.customSize && !f.customQuote)
          .map((f: any) => {
            const price = resolveStoredPrice(`canvas-framed-${f.id}`, f.price);
            const label = String(f.label ?? f.id).replace("x", " × ");
            return `<tr><td>${label} cm</td><td>${formatPLN(price)}</td></tr>`;
          })
          .join("");
        legendFramedRows.innerHTML = rows;
      }

      if (legendUnframedRows) {
        const rows = (unframedMode?.formats ?? [])
          .filter((f: any) => !f.customSize && !f.customQuote)
          .map((f: any) => {
            const price = resolveStoredPrice(`canvas-unframed-${f.id}`, f.price);
            const label = String(f.label ?? f.id).replace("x", " × ");
            return `<tr><td>${label} cm</td><td>${formatPLN(price)}</td></tr>`;
          })
          .join("");
        legendUnframedRows.innerHTML = rows;
      }

      if (legendNote) {
        const border = resolveStoredPrice("canvas-framed-custom-border", framedMode?.customPricePerCmBorder ?? 0.22);
        legendNote.innerText = `* Format niestandardowy wyceniany indywidualnie. Cena oprawy na zamówienie: ${formatPLN(border)} / cmb.`;
      }
    };

    const syncModeUI = () => {
      const modeId = modeSel.value;
      const mode = data?.modes?.find((m: any) => m.id === modeId);
      if (!mode) return;

      if (modeId === "m2-unframed") {
        formatRow.style.display = "none";
        sizeRow.style.display = "";
      } else {
        formatRow.style.display = "";
        sizeRow.style.display = "none";

        formatSel.innerHTML = "";
        const placeholderOpt = document.createElement("option");
        placeholderOpt.value = "";
        placeholderOpt.disabled = true;
        placeholderOpt.selected = true;
        placeholderOpt.text = "— wybierz format —";
        formatSel.appendChild(placeholderOpt);
        (mode.formats ?? []).forEach((f: any) => {
          const opt = document.createElement("option");
          opt.value = f.id;
          opt.text = f.label;
          formatSel.appendChild(opt);
        });
      }

      formatSel.onchange = () => {
        const isCustom = formatSel.value === "custom";
        sizeRow.style.display = isCustom ? "" : "none";
      };

      if (modeId === "m2-unframed") {
        sizeRow.style.display = "";
      } else {
        sizeRow.style.display = formatSel.value === "custom" ? "" : "none";
      }
    };

    const calculate = () => {
      if (!modeSel.value) {
        resultEl.style.display = "none";
        addBtn.disabled = true;
        return;
      }
      if (!qtyInput.value) {
        resultEl.style.display = "none";
        addBtn.disabled = true;
        return;
      }
      const options: CanvasOptions = {
        modeId: modeSel.value as CanvasOptions["modeId"],
        formatId: formatSel.value,
        quantity: parseInt(qtyInput.value, 10) || 1,
        widthMm: parseInt(widthInput.value, 10) || 0,
        heightMm: parseInt(heightInput.value, 10) || 0,
        express: ctx.expressMode
      };

      const result = calculateCanvas(options);

      if (result.totalPrice <= 0) {
        resultEl.style.display = "none";
        addBtn.disabled = true;
        return;
      }

      resultEl.style.display = "block";
      normalEl.style.display = "block";

        modeLabelEl.innerText = result.modeLabel;
        formatLabelEl.innerText = result.formatLabel;

        if (typeof result.areaM2 === "number") {
          areaRowEl.hidden = false;
          areaEl.innerText = `${result.areaM2.toFixed(2)} m2`;
        } else {
          areaRowEl.hidden = true;
          areaEl.innerText = "-";
        }

        if (result.printCost !== undefined) {
          printCostRowEl.hidden = false;
          printCostEl.innerText = formatPLN(result.printCost);
        } else {
          printCostRowEl.hidden = true;
        }

        if (result.frameCost !== undefined) {
          frameCostRowEl.hidden = false;
          frameCostEl.innerText = formatPLN(result.frameCost);
        } else {
          frameCostRowEl.hidden = true;
        }

        const unitQty = options.modeId === "m2-unframed"
          ? (result.areaM2 ?? 0)
          : Math.max(1, options.quantity);

        unitEl.innerText = formatPLN(unitQty > 0 ? result.basePrice / unitQty : result.tierPrice);
        qtyEl.innerText = `${Math.max(1, options.quantity)} szt`;
        totalEl.innerText = formatPLN(result.totalPrice);
        expressEl.style.display = options.express ? "block" : "none";

      addBtn.disabled = false;
      ctx.updateLastCalculated(result.totalPrice, "Canvas / P\u0142\u00F3tno");

      currentOptions = options;
      currentResult = result;
    };

    modeSel.onchange = syncModeUI;

    autoCalc({ root: container, calc: calculate });
    updateLegend();

    addBtn.onclick = () => {
      if (!currentOptions || !currentResult) return;

      const optionsHintParts = [
        currentResult.modeLabel,
        currentResult.formatLabel,
        `${Math.max(1, currentOptions.quantity)} szt`,
        currentOptions.modeId === "m2-unframed" && typeof currentResult.areaM2 === "number"
          ? `${currentResult.areaM2.toFixed(2)} m2 / szt`
          : "",
        currentOptions.express ? "EXPRESS" : ""
      ].filter(Boolean);

      ctx.cart.addItem({
        id: `canvas-${Date.now()}`,
        category: "Canvas / P\u0142\u00F3tno",
        name: `${currentResult.modeLabel} \u2014 ${currentResult.formatLabel}`,
        quantity: Math.max(1, currentOptions.quantity),
        unit: "szt",
        unitPrice: currentResult.totalPrice / Math.max(1, currentOptions.quantity),
        isExpress: currentOptions.express,
        totalPrice: currentResult.totalPrice,
        optionsHint: optionsHintParts.join(", "),
        payload: {
          ...currentOptions,
          ...currentResult
        }
      });
    };

    syncModeUI();
  }
};
