import { View, ViewContext } from "../types";
import { quoteCadFold, quoteCadWfScan } from "../../categories/cad-ops";
import { formatPLN } from "../../core/money";

export const CadOpsView: View = {
  id: "cad-ops",
  name: "CAD: składanie / skan",
  async mount(container, ctx) {
    try {
      const response = await fetch("categories/cad-ops.html");
      if (!response.ok) throw new Error("Failed to load template");
      container.innerHTML = await response.text();

      this.initLogic(container, ctx);
    } catch (err) {
      container.innerHTML = `<div class="error">Błąd ładowania: ${err}</div>`;
    }
  },

  initLogic(container: HTMLElement, ctx: ViewContext) {
    // Folding logic
    const foldFormat = container.querySelector("#fold-format") as HTMLSelectElement;
    const foldQty = container.querySelector("#fold-qty") as HTMLInputElement;
    const foldAddBtn = container.querySelector("#fold-add") as HTMLButtonElement;

    foldAddBtn.onclick = () => {
      const qty = parseInt(foldQty.value);
      if (isNaN(qty) || qty <= 0) return;

      try {
        const res = quoteCadFold({ format: foldFormat.value, qty });
        const labelFmt = foldFormat.value === 'A0p' ? 'A0+' : (foldFormat.value === 'A3L' ? 'A3-poprzeczne' : foldFormat.value);

        ctx.cart.addItem({
          id: `cad-fold-${Date.now()}`,
          category: "CAD",
          name: `Składanie (${labelFmt})`,
          quantity: qty,
          unit: "szt",
          unitPrice: res.unit,
          totalPrice: res.total,
          optionsHint: `${qty} szt.`,
          payload: res
        });

        ctx.updateLastCalculated(res.total, "Składanie CAD");
      } catch (err) {
        alert((err as Error).message);
      }
    };

    // WF Scan logic
    const wfScanMm = container.querySelector("#wf-scan-mm") as HTMLInputElement;
    const wfScanQty = container.querySelector("#wf-scan-qty") as HTMLInputElement;
    const wfScanAddBtn = container.querySelector("#wf-scan-add") as HTMLButtonElement;

    wfScanAddBtn.onclick = () => {
      const mm = parseInt(wfScanMm.value);
      const qty = parseInt(wfScanQty.value);
      if (isNaN(mm) || mm <= 0 || isNaN(qty) || qty <= 0) return;

      try {
        const res = quoteCadWfScan({ lengthMm: mm, qty });

        ctx.cart.addItem({
          id: `cad-wf-scan-${Date.now()}`,
          category: "CAD",
          name: "Skanowanie wielkoformatowe",
          quantity: qty,
          unit: "szt",
          unitPrice: res.unitPrice,
          totalPrice: res.total,
          optionsHint: `${qty} szt, ${mm} mm`,
          payload: res
        });

        ctx.updateLastCalculated(res.total, "Skanowanie WF");
      } catch (err) {
        alert((err as Error).message);
      }
    };
  }
};
