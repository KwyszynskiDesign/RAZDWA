import { View, ViewContext } from "../types";
import { quoteWydrukiSpecjalne } from "../../categories/laminowanie";
import { formatPLN } from "../../core/money";

export const WydrukiSpecjalneView: View = {
  id: "wydruki-specjalne",
  name: "DODRUKI / SPECJALNE WYDRUKI",
  async mount(container, ctx) {
    try {
      const response = await fetch("categories/wydruki-specjalne.html");
      if (!response.ok) throw new Error("Failed to load template");
      container.innerHTML = await response.text();

      this.initLogic(container, ctx);
    } catch (err) {
      container.innerHTML = `<div class="error">Błąd ładowania: ${err}</div>`;
    }
  },

  initLogic(container: HTMLElement, ctx: ViewContext) {
    const specialVariant = container.querySelector("#special-variant") as HTMLSelectElement | null;
    const specialQty = container.querySelector("#special-qty") as HTMLInputElement | null;
    const specialDouble = container.querySelector("#special-double") as HTMLInputElement | null;
    const specialCalcBtn = container.querySelector("#special-calculate") as HTMLButtonElement | null;
    const specialAddBtn = container.querySelector("#special-add-to-cart") as HTMLButtonElement | null;
    const specialResultDisplay = container.querySelector("#special-result-display") as HTMLElement | null;
    const specialUnitPrice = container.querySelector("#special-unit-price") as HTMLElement | null;
    const specialTotalPrice = container.querySelector("#special-total-price") as HTMLElement | null;
    const specialExpressHint = container.querySelector("#special-express-hint") as HTMLElement | null;

    let specialState: ReturnType<typeof quoteWydrukiSpecjalne> | null = null;

    specialCalcBtn?.addEventListener("click", () => {
      if (!specialVariant || !specialQty || !specialDouble) return;

      try {
        const result = quoteWydrukiSpecjalne({
          variantId: specialVariant.value,
          qty: parseInt(specialQty.value, 10) || 1,
          doubleSided: specialDouble.checked,
          express: ctx.expressMode,
        });

        specialState = result;
        if (specialUnitPrice) specialUnitPrice.innerText = formatPLN(result.totalPrice / result.qty);
        if (specialTotalPrice) specialTotalPrice.innerText = formatPLN(result.totalPrice);
        if (specialExpressHint) specialExpressHint.style.display = ctx.expressMode ? "block" : "none";
        if (specialResultDisplay) specialResultDisplay.style.display = "block";
        if (specialAddBtn) specialAddBtn.disabled = false;

        ctx.updateLastCalculated(result.totalPrice, "DODRUKI / SPECJALNE WYDRUKI");
      } catch {
        // noop
      }
    });

    specialQty?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        specialCalcBtn?.click();
      }
    });

    specialAddBtn?.addEventListener("click", () => {
      if (!specialState) return;

      ctx.cart.addItem({
        id: `special-print-${Date.now()}`,
        category: "DODRUKI / SPECJALNE WYDRUKI",
        name: specialState.variantName,
        quantity: specialState.qty,
        unit: "szt",
        unitPrice: specialState.totalPrice / specialState.qty,
        isExpress: ctx.expressMode,
        totalPrice: specialState.totalPrice,
        optionsHint: `${specialState.qty} szt${specialState.doubleSided ? ", dwustronnie (+50%)" : ", jednostronnie"}${ctx.expressMode ? ", EXPRESS" : ""}`,
        payload: specialState,
      });
    });
  }
};
