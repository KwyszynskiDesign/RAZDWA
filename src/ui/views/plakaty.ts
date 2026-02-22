import { View, ViewContext } from "../types";
import { calculatePlakatyM2, calculatePlakatyFormat } from "../../categories/plakaty";
import { formatPLN } from "../../core/money";
import * as data from "../../../data/normalized/plakaty.json";

const SOLWENT_IDS = new Set(["200g-polysk", "blockout200g", "150g-polmat", "115g-mat"]);

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
    const formatSelect  = container.querySelector("#p-format") as HTMLSelectElement;
    const qtyInput      = container.querySelector("#p-qty") as HTMLInputElement;
    const areaInput     = container.querySelector("#p-area") as HTMLInputElement;
    const calcBtn       = container.querySelector("#p-calculate") as HTMLButtonElement;
    const addBtn        = container.querySelector("#p-add-to-cart") as HTMLButtonElement;
    const resultBox     = container.querySelector("#p-result-display") as HTMLElement;
    const unitPriceEl   = container.querySelector("#p-unit-price") as HTMLElement;
    const totalPriceEl  = container.querySelector("#p-total-price") as HTMLElement;
    const expressHint   = container.querySelector("#p-express-hint") as HTMLElement;

    // Populate material select
    const allMaterials = [
      ...tableData.solwent.materials,
      ...tableData.formatowe.materials,
    ];
    materialSelect.innerHTML = allMaterials.map((m: any) =>
      `<option value="${m.id}">${m.name}</option>`
    ).join("");

    function isSolwent(id: string) { return SOLWENT_IDS.has(id); }

    function updateFormatOptions(matId: string) {
      const mat = tableData.formatowe.materials.find((m: any) => m.id === matId);
      if (!mat) return;
      const keys = Object.keys(mat.prices);
      formatSelect.innerHTML = keys.map(k => `<option value="${k}">${k}</option>`).join("");
    }

    function updateVisibility() {
      const matId = materialSelect.value;
      if (isSolwent(matId)) {
        formatGroup.style.display = "none";
        m2Group.style.display = "";
      } else {
        formatGroup.style.display = "";
        m2Group.style.display = "none";
        updateFormatOptions(matId);
      }
    }

    materialSelect.addEventListener("change", updateVisibility);
    updateVisibility();

    let currentResult: any = null;
    let currentOptions: any = null;

    calcBtn.onclick = () => {
      const matId = materialSelect.value;
      try {
        if (isSolwent(matId)) {
          const area = parseFloat(areaInput.value) || 1;
          const res = calculatePlakatyM2({ materialId: matId, areaM2: area, express: ctx.expressMode });
          currentResult = res;
          currentOptions = { type: "m2", matId, area };
          unitPriceEl.innerText = formatPLN(res.tierPrice);
          totalPriceEl.innerText = formatPLN(res.totalPrice);
        } else {
          const fmt = formatSelect.value;
          const qty = parseInt(qtyInput.value, 10) || 1;
          const res = calculatePlakatyFormat({ materialId: matId, formatKey: fmt, qty, express: ctx.expressMode });
          currentResult = res;
          currentOptions = { type: "format", matId, fmt, qty };
          unitPriceEl.innerText = formatPLN(res.pricePerPiece);
          totalPriceEl.innerText = formatPLN(res.totalPrice);
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
        const hint = `${currentOptions.area} m2${ctx.expressMode ? ", EXPRESS" : ""}`;
        ctx.cart.addItem({
          id: `plakaty-${Date.now()}`,
          category: "Plakaty",
          name: matName,
          quantity: currentOptions.area,
          unit: "m2",
          unitPrice: currentResult.tierPrice,
          isExpress: ctx.expressMode,
          totalPrice: currentResult.totalPrice,
          optionsHint: hint,
          payload: currentResult,
        });
      } else {
        const hint = `${currentOptions.fmt} × ${currentOptions.qty} szt${ctx.expressMode ? ", EXPRESS" : ""}`;
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
