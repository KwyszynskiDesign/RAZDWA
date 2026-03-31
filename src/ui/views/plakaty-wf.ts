import { View, ViewContext } from "../types";
import { calculatePlakatyFormat } from "../../categories/plakaty";
import { formatPLN } from "../../core/money";
import { getPrice } from "../../services/priceService";

const data: any = getPrice("plakaty");

const FORMAT_LABELS: Record<string, string> = {
  "297x420":  "A3 (297×420 mm)",
  "420x594":  "A2 (420×594 mm)",
  "594x841":  "A1 (594×841 mm)",
  "610x841":  "A1+ (610×841 mm)",
  "841x1189": "A0 (841×1189 mm)",
  "914x1292": "A0+ (914×1292 mm)",
  "rolka1067": "Rolka 1067 mm",
};

export const PlakatyWFView: View = {
  id: "plakaty",
  name: "Plakaty wielkoformatowe",
  async mount(container, ctx) {
    try {
      const response = await fetch("categories/plakaty.html");
      if (!response.ok) throw new Error("Failed to load template");
      container.innerHTML = await response.text();
      this.initLogic?.(container, ctx);
    } catch (err) {
      container.innerHTML = `<div class="error">Błąd ładowania: ${err}</div>`;
    }
  },

  initLogic(container: HTMLElement, ctx: ViewContext) {
    const tableData = data as any;

    const materialSelect = container.querySelector("#p-material") as HTMLSelectElement;
    const formatGroup = container.querySelector("#p-format-group") as HTMLElement;
    const formatSelect = container.querySelector("#p-format") as HTMLSelectElement;
    const lengthGroup = container.querySelector("#p-length-group") as HTMLElement;
    const lengthLabel = container.querySelector("#p-length-label") as HTMLElement;
    const lengthInput = container.querySelector("#p-length-mm") as HTMLInputElement;
    const qtyInput = container.querySelector("#p-qty") as HTMLInputElement;
    const calcBtn = container.querySelector("#p-calculate") as HTMLButtonElement;
    const addBtn = container.querySelector("#p-add-to-cart") as HTMLButtonElement;
    const resultBox = container.querySelector("#p-result-display") as HTMLElement;
    const unitPriceEl = container.querySelector("#p-unit-price") as HTMLElement;
    const totalPriceEl = container.querySelector("#p-total-price") as HTMLElement;
    const discountRow = container.querySelector("#p-discount-row") as HTMLElement | null;
    const discountLabel = container.querySelector("#p-discount-label") as HTMLElement | null;
    const discountVal = container.querySelector("#p-discount-val") as HTMLElement | null;
    const qtyLabel = container.querySelector("#p-qty-label") as HTMLElement | null;
    const qtyValEl = container.querySelector("#p-qty-val") as HTMLElement | null;
    const calcHintEl = container.querySelector("#p-calc-hint") as HTMLElement | null;
    const expressHint = container.querySelector("#p-express-hint") as HTMLElement;

    const allMaterials = [...tableData.formatowe.materials];
    materialSelect.innerHTML = allMaterials.map((m: any) => `<option value="${m.id}">${m.name}</option>`).join("");

    const parsePositiveInt = (value: string): number | null => {
      const parsed = Number.parseInt(value, 10);
      return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
    };

    const parseFormatDimensions = (formatKey: string) => {
      const match = formatKey.match(/^(\d+)x(\d+)$/);
      if (!match) return null;
      return {
        widthMm: parseInt(match[1], 10),
        lengthMm: parseInt(match[2], 10),
      };
    };

    const formatShortLabel = (formatKey: string): string => {
      const labeled = FORMAT_LABELS[formatKey];
      if (labeled) return labeled.split(" ")[0];
      const dims = parseFormatDimensions(formatKey);
      if (!dims) return formatKey;
      const byLength: Record<number, string> = { 420: "A3", 594: "A2", 841: "A1", 1189: "A0", 1292: "A0+" };
      return byLength[dims.lengthMm] ?? formatKey;
    };

    const buildNieformatCalcHint = (res: any): string => {
      const isNieformat = String(materialSelect.value).includes("nieformatowe");
      if (!isNieformat || !res || !res.baseLengthMm || !res.customLengthMm) return "";

      const meterRate = parseFloat((res.unitPrice / (res.baseLengthMm / 1000)).toFixed(2));
      const lengthM = parseFloat((res.customLengthMm / 1000).toFixed(3));
      const baseLabel = formatShortLabel(res.formatKey ?? formatSelect.value);

      return [
        `Nieformatowy bok: ${res.customLengthMm} mm (bazowo ${res.baseLengthMm} mm dla ${baseLabel}).`,
        `Przeliczenie jak CAD: ${formatPLN(res.unitPrice)} / ${(res.baseLengthMm / 1000).toFixed(3)} m = ${formatPLN(meterRate)}/mb.`,
        `${lengthM.toFixed(3)} m × ${formatPLN(meterRate)}/mb = ${formatPLN(res.effectiveUnitPrice)} za szt.`,
      ].join("<br>");
    };

    const updateFormatOptions = (matId: string) => {
      const mat = tableData.formatowe.materials.find((m: any) => m.id === matId);
      if (!mat) return;
      const keys = Object.keys(mat.prices);
      formatSelect.innerHTML = keys.map((k: string) => `<option value="${k}">${FORMAT_LABELS[k] ?? k}</option>`).join("");
    };

    const updateLengthInput = (matId: string) => {
      const dims = parseFormatDimensions(formatSelect.value);
      if (!lengthGroup || !lengthInput || !lengthLabel) return;

      if (!dims || !matId.includes("nieformatowe")) {
        lengthGroup.style.display = "none";
        return;
      }

      lengthGroup.style.display = "";
      lengthInput.value = "";
      lengthInput.placeholder = `np. ${dims.lengthMm}`;
      lengthLabel.innerText = `Długość drugiego boku dla ${dims.widthMm} mm (mm):`;
    };

    const updateVisibility = () => {
      const matId = materialSelect.value;
      formatGroup.style.display = "";
      updateFormatOptions(matId);
      updateLengthInput(matId);
    };

    materialSelect.addEventListener("change", updateVisibility);
    formatSelect.addEventListener("change", () => updateLengthInput(materialSelect.value));
    updateVisibility();

    let currentResult: any = null;
    let currentOptions: any = null;

    calcBtn.onclick = () => {
      try {
        const matId = materialSelect.value;
        const fmt = formatSelect.value;
        const qty = parsePositiveInt(qtyInput.value);
        if (!qty) throw new Error("Podaj ilość sztuk.");

        const customLengthMm = lengthGroup && lengthGroup.style.display !== "none"
          ? (parseFloat(lengthInput.value) || undefined)
          : undefined;

        const res = calculatePlakatyFormat({ materialId: matId, formatKey: fmt, qty, customLengthMm, express: ctx.expressMode });
        currentResult = res;
        currentOptions = { matId, fmt, qty, customLengthMm };

        unitPriceEl.innerText = formatPLN(res.pricePerPiece);
        totalPriceEl.innerText = formatPLN(res.totalPrice);

        if (discountRow && discountLabel && discountVal) {
          if (res.discountFactor < 1) {
            const pct = Math.round((1 - res.discountFactor) * 100);
            const saved = parseFloat((res.effectiveUnitPrice * res.qty - res.basePrice).toFixed(2));
            discountLabel.innerText = `Rabat ilościowy ${pct}%:`;
            discountVal.innerText = `-${formatPLN(saved)}`;
            discountRow.style.display = "";
          } else {
            discountRow.style.display = "none";
          }
        }

        const fmtLabel = formatShortLabel(fmt);
        const dimsForDisplay = parseFormatDimensions(fmt);
        const sizeLabel = (dimsForDisplay && customLengthMm && customLengthMm !== dimsForDisplay.lengthMm)
          ? `${dimsForDisplay.widthMm}\u00d7${customLengthMm}\u00a0mm`
          : fmtLabel;
        if (qtyLabel) qtyLabel.innerText = "Ilość:"; 
        if (qtyValEl) qtyValEl.innerText = `${qty} szt, ${sizeLabel}`;

        if (calcHintEl) {
          const hint = buildNieformatCalcHint(res);
          calcHintEl.innerHTML = hint;
          calcHintEl.style.display = hint ? "block" : "none";
        }

        if (expressHint) expressHint.style.display = ctx.expressMode ? "block" : "none";

        resultBox.style.display = "block";
        addBtn.disabled = false;
        ctx.updateLastCalculated(currentResult.totalPrice, "Plakaty wielkoformatowe");
      } catch (err) {
        alert("Błąd: " + (err as Error).message);
      }
    };

    addBtn.onclick = () => {
      if (!currentResult || !currentOptions) return;

      const matName = materialSelect.options[materialSelect.selectedIndex].text;
      const fmtLabel = formatShortLabel(currentOptions.fmt);
      const dimsForCart = parseFormatDimensions(currentOptions.fmt);
      const sizeLabelCart = (dimsForCart && currentOptions.customLengthMm && currentOptions.customLengthMm !== dimsForCart.lengthMm)
        ? `${dimsForCart.widthMm}\u00d7${currentOptions.customLengthMm}\u00a0mm`
        : fmtLabel;
      const lengthHint = (dimsForCart && currentOptions.customLengthMm && currentOptions.customLengthMm !== dimsForCart.lengthMm) ? "" : (currentOptions.customLengthMm ? `, długość: ${currentOptions.customLengthMm} mm` : "");
      const calcHint = buildNieformatCalcHint(currentResult);
      const hintBase = `${sizeLabelCart} × ${currentOptions.qty} szt${lengthHint}${ctx.expressMode ? ", EXPRESS" : ""}`;
      const hint = calcHint ? `${hintBase} | ${calcHint.replace(/<br>/g, " ")}` : hintBase;

      ctx.cart.addItem({
        id: `plakaty-${Date.now()}`,
        category: "Plakaty wielkoformatowe",
        name: matName,
        quantity: currentOptions.qty,
        unit: "szt",
        unitPrice: currentResult.pricePerPiece,
        isExpress: ctx.expressMode,
        totalPrice: currentResult.totalPrice,
        optionsHint: hint,
        payload: currentResult,
      });
    };
  },
};

