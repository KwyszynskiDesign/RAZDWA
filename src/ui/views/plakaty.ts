import { View, ViewContext } from "../types";
import { calculatePlakatyM2, calculatePlakatyFormat, calculatePlakatyMalyCanon } from "../../categories/plakaty";
import { formatPLN } from "../../core/money";
import { getPrice } from "../../services/priceService";

const data: any = getPrice("plakaty");

const SOLWENT_IDS = new Set(["200g-polysk", "blockout200g", "150g-polmat", "115g-mat"]);
const CANON_IDS = new Set(["margin-170", "margin-200", "no-margin-170", "no-margin-200"]);

export const PlakatyView: View = {
  id: "plakaty",
  name: "Plakaty",
  async mount(container, ctx) {
    try {
      const response = await fetch("categories/plakaty.html");
      if (!response.ok) throw new Error("Failed to load template");
      container.innerHTML = await response.text();
      this.initLogic(container, ctx);
    } catch (err) {
      container.innerHTML = `<div class="error">Błąd ładowania: ${err}</div>`;
    }
  },

  initLogic(container: HTMLElement, ctx: ViewContext) {
    const tableData = data as any;

    const materialSelect = container.querySelector("#p-material") as HTMLSelectElement;
    const formatGroup   = container.querySelector("#p-format-group") as HTMLElement;
    const m2Group       = container.querySelector("#p-m2-group") as HTMLElement;
    const canonGroup    = container.querySelector("#p-canon-group") as HTMLElement;
    const formatSelect  = container.querySelector("#p-format") as HTMLSelectElement;
    const canonFormatSelect = container.querySelector("#p-canon-format") as HTMLSelectElement;
    const canonQtyInput = container.querySelector("#p-canon-qty") as HTMLInputElement;
    const lengthGroup   = container.querySelector("#p-length-group") as HTMLElement;
    const lengthLabel   = container.querySelector("#p-length-label") as HTMLElement;
    const lengthInput   = container.querySelector("#p-length-mm") as HTMLInputElement;
    const qtyInput      = container.querySelector("#p-qty") as HTMLInputElement;
    const areaInput     = container.querySelector("#p-area") as HTMLInputElement;
    const solwentQtyInput = container.querySelector("#p-solwent-qty") as HTMLInputElement;
    const calcBtn       = container.querySelector("#p-calculate") as HTMLButtonElement;
    const addBtn        = container.querySelector("#p-add-to-cart") as HTMLButtonElement;
    const resultBox     = container.querySelector("#p-result-display") as HTMLElement;
    const unitPriceEl   = container.querySelector("#p-unit-price") as HTMLElement;
    const totalPriceEl  = container.querySelector("#p-total-price") as HTMLElement;
    const qtyLabel      = container.querySelector("#p-qty-label") as HTMLElement | null;
    const qtyValEl      = container.querySelector("#p-qty-val") as HTMLElement | null;
    const expressHint   = container.querySelector("#p-express-hint") as HTMLElement;

    // Populate material select
    const allMaterials = [
      ...tableData.solwent.materials,
      ...tableData.formatowe.materials,
      ...tableData.malyCanon.variants,
    ];
    materialSelect.innerHTML = allMaterials.map((m: any) =>
      `<option value="${m.id}">${m.name}</option>`
    ).join("");

    function isSolwent(id: string) { return SOLWENT_IDS.has(id); }
    function isCanon(id: string) { return CANON_IDS.has(id); }

    function updateFormatOptions(matId: string) {
      const mat = tableData.formatowe.materials.find((m: any) => m.id === matId);
      if (!mat) return;
      const keys = Object.keys(mat.prices);
      formatSelect.innerHTML = keys.map(k => `<option value="${k}">${k}</option>`).join("");
    }

    function parseFormatDimensions(formatKey: string) {
      const match = formatKey.match(/^(\d+)x(\d+)$/);
      if (!match) return null;
      return {
        widthMm: parseInt(match[1], 10),
        lengthMm: parseInt(match[2], 10),
      };
    }

    function updateLengthInput(matId: string) {
      const dims = parseFormatDimensions(formatSelect.value);
      if (!lengthGroup || !lengthInput || !lengthLabel) return;

      if (!dims) {
        lengthGroup.style.display = "none";
        return;
      }

      lengthGroup.style.display = "";
      lengthInput.value = String(dims.lengthMm);
      if (matId.includes("nieformatowe")) {
        lengthLabel.innerText = `Długość drugiego boku dla ${dims.widthMm} mm (mm):`;
      } else {
        lengthLabel.innerText = `Długość dla ${dims.widthMm} mm (mm):`;
      }
    }

    function updateVisibility() {
      const matId = materialSelect.value;
      if (isSolwent(matId)) {
        formatGroup.style.display = "none";
        canonGroup.style.display = "none";
        m2Group.style.display = "";
      } else if (isCanon(matId)) {
        formatGroup.style.display = "none";
        m2Group.style.display = "none";
        canonGroup.style.display = "";
      } else {
        formatGroup.style.display = "";
        canonGroup.style.display = "none";
        m2Group.style.display = "none";
        updateFormatOptions(matId);
        updateLengthInput(matId);
      }
    }

    materialSelect.addEventListener("change", updateVisibility);
    formatSelect.addEventListener("change", () => {
      updateLengthInput(materialSelect.value);
    });
    updateVisibility();

    let currentResult: any = null;
    let currentOptions: any = null;

    calcBtn.onclick = () => {
      const matId = materialSelect.value;
      try {
        if (isSolwent(matId)) {
          const area = parseFloat(areaInput.value) || 1;
          const qty = Math.max(1, parseInt(solwentQtyInput.value, 10) || 1);
          const res = calculatePlakatyM2({ materialId: matId, areaM2: area, qty, express: ctx.expressMode });
          currentResult = res;
          currentOptions = { type: "m2", matId, area, qty };
          unitPriceEl.innerText = formatPLN(res.tierPrice);
          totalPriceEl.innerText = formatPLN(res.totalPrice);
          if (qtyLabel) qtyLabel.innerText = "Powierzchnia:";
          if (qtyValEl) qtyValEl.innerText = `${qty} szt × ${area} m²${res.effectiveM2 > area * qty ? " (min.)" : ""}`;
        } else if (isCanon(matId)) {
          const qty = Math.max(1, parseInt(canonQtyInput.value, 10) || 1);
          const fmt = (canonFormatSelect.value === "A3" ? "A3" : "A4") as "A4" | "A3";
          const res = calculatePlakatyMalyCanon({ variantId: matId, format: fmt, qty, express: ctx.expressMode });
          currentResult = res;
          currentOptions = { type: "canon", matId, fmt, qty };
          unitPriceEl.innerText = formatPLN(res.tierPrice);
          totalPriceEl.innerText = formatPLN(res.totalPrice);
          if (qtyLabel) qtyLabel.innerText = "Ilość:";
          if (qtyValEl) qtyValEl.innerText = `${qty} szt, ${fmt}`;
        } else {
          const fmt = formatSelect.value;
          const qty = parseInt(qtyInput.value, 10) || 1;
          const customLengthMm = lengthGroup && lengthGroup.style.display !== "none"
            ? (parseFloat(lengthInput.value) || undefined)
            : undefined;
          const res = calculatePlakatyFormat({ materialId: matId, formatKey: fmt, qty, customLengthMm, express: ctx.expressMode });
          currentResult = res;
          currentOptions = { type: "format", matId, fmt, qty, customLengthMm };
          unitPriceEl.innerText = formatPLN(res.pricePerPiece);
          totalPriceEl.innerText = formatPLN(res.totalPrice);
          if (qtyLabel) qtyLabel.innerText = "Ilość:";
          if (qtyValEl) qtyValEl.innerText = `${qty} szt, ${fmt}`;
        }
        if (expressHint) expressHint.style.display = ctx.expressMode ? "block" : "none";
        resultBox.style.display = "block";
        addBtn.disabled = false;
        ctx.updateLastCalculated(currentResult.totalPrice, "Plakaty");
      } catch (err) {
        alert("Błąd: " + (err as Error).message);
      }
    };

    addBtn.onclick = () => {
      if (!currentResult || !currentOptions) return;
      const matName = materialSelect.options[materialSelect.selectedIndex].text;
      if (currentOptions.type === "m2") {
        const hint = `${currentOptions.qty} szt × ${currentOptions.area} m2/szt${ctx.expressMode ? ", EXPRESS" : ""}`;
        ctx.cart.addItem({
          id: `plakaty-${Date.now()}`,
          category: "Plakaty",
          name: matName,
          quantity: currentResult.effectiveM2,
          unit: "m2",
          unitPrice: currentResult.tierPrice,
          isExpress: ctx.expressMode,
          totalPrice: currentResult.totalPrice,
          optionsHint: hint,
          payload: currentResult,
        });
      } else if (currentOptions.type === "canon") {
        const hint = `${currentOptions.fmt} × ${currentOptions.qty} szt${ctx.expressMode ? ", EXPRESS" : ""}`;
        ctx.cart.addItem({
          id: `plakaty-${Date.now()}`,
          category: "Plakaty",
          name: `${matName} (mały Canon)`,
          quantity: currentOptions.qty,
          unit: "szt",
          unitPrice: currentResult.tierPrice,
          isExpress: ctx.expressMode,
          totalPrice: currentResult.totalPrice,
          optionsHint: hint,
          payload: currentResult,
        });
      } else {
        const lengthHint = currentOptions.customLengthMm ? `, długość: ${currentOptions.customLengthMm} mm` : "";
        const hint = `${currentOptions.fmt} × ${currentOptions.qty} szt${lengthHint}${ctx.expressMode ? ", EXPRESS" : ""}`;
        ctx.cart.addItem({
          id: `plakaty-${Date.now()}`,
          category: "Plakaty",
          name: matName,
          quantity: currentOptions.qty,
          unit: "szt",
          unitPrice: currentResult.pricePerPiece,
          isExpress: ctx.expressMode,
          totalPrice: currentResult.totalPrice,
          optionsHint: hint,
          payload: currentResult,
        });
      }
    };
  },
};
