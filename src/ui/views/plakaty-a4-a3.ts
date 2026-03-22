import { View, ViewContext } from "../types";
import { calculatePlakatyMalyCanon, calculatePlakatyDuzyCanon } from "../../categories/plakaty";
import { formatPLN } from "../../core/money";
import { getPrice } from "../../services/priceService";

const data: any = getPrice("plakaty");

const DUZY_CANON_FORMAT_LABELS: Record<string, string> = {
  a4: "A4",
  a3: "A3",
};

export const PlakatyA4A3View: View = {
  id: "plakaty-a4-a3",
  name: "Plakaty A4-A3",
  async mount(container, ctx) {
    try {
      const response = await fetch("categories/plakaty-a4-a3.html");
      if (!response.ok) throw new Error("Failed to load template");
      container.innerHTML = await response.text();
      this.initLogic(container, ctx);
    } catch (err) {
      container.innerHTML = `<div class="error">Błąd ładowania: ${err}</div>`;
    }
  },

  initLogic(container: HTMLElement, ctx: ViewContext) {
    const tableData = data as any;

    const canonVariantSelect = container.querySelector("#pa-canon-variant") as HTMLSelectElement;
    const canonPaperSelect = container.querySelector("#pa-canon-paper") as HTMLSelectElement;
    const canonFinishSelect = container.querySelector("#pa-canon-finish") as HTMLSelectElement;
    const canonFormatSelect = container.querySelector("#pa-canon-format") as HTMLSelectElement;
    const canonQtyInput = container.querySelector("#pa-canon-qty") as HTMLInputElement;
    const canonCalcBtn = container.querySelector("#pa-canon-calculate") as HTMLButtonElement;

    const duzyCanonPaperSelect = container.querySelector("#pa-duzy-canon-paper") as HTMLSelectElement;
    const duzyCanonFinishSelect = container.querySelector("#pa-duzy-canon-finish") as HTMLSelectElement;
    const duzyCanonFormatSelect = container.querySelector("#pa-duzy-canon-format") as HTMLSelectElement;
    const duzyCanonQtyInput = container.querySelector("#pa-duzy-canon-qty") as HTMLInputElement;
    const duzyCanonCalcBtn = container.querySelector("#pa-duzy-canon-calculate") as HTMLButtonElement;

    const addBtn = container.querySelector("#pa-add-to-cart") as HTMLButtonElement;
    const resultBox = container.querySelector("#pa-result-display") as HTMLElement;
    const unitPriceEl = container.querySelector("#pa-unit-price") as HTMLElement;
    const totalPriceEl = container.querySelector("#pa-total-price") as HTMLElement;
    const discountRow = container.querySelector("#pa-discount-row") as HTMLElement | null;
    const discountLabel = container.querySelector("#pa-discount-label") as HTMLElement | null;
    const discountVal = container.querySelector("#pa-discount-val") as HTMLElement | null;
    const qtyLabel = container.querySelector("#pa-qty-label") as HTMLElement | null;
    const qtyValEl = container.querySelector("#pa-qty-val") as HTMLElement | null;
    const expressHint = container.querySelector("#pa-express-hint") as HTMLElement;

    canonVariantSelect.innerHTML = `
      <option value="margin">Z marginesem</option>
      <option value="no-margin">Bez marginesu</option>
    `;

    const duzyVariants = (tableData.duzyCanon?.variants ?? [
      { id: "a4-170-kreda-130-170", name: "A4 170g kreda 130/170" },
      { id: "a3-170-kreda-130-170", name: "A3 170g kreda 130/170" },
      { id: "a4-200-kreda-200", name: "A4 200g kreda 200" },
      { id: "a3-200-kreda-200", name: "A3 200g kreda 200" },
    ]) as Array<{ id: string; name: string }>;

    const duzyCanonPaperOptions = duzyVariants.reduce((acc, variant) => {
      const key = variant.id.includes("200") ? "200" : "170";
      if (!acc.some((option) => option.value === key)) {
        acc.push({
          value: key,
          label: key === "200" ? "200g kreda" : "130g/170g kreda",
        });
      }
      return acc;
    }, [] as Array<{ value: string; label: string }>);

    if (!duzyCanonPaperOptions.some((o) => o.value === "130")) {
      duzyCanonPaperOptions.unshift({ value: "130", label: "130g kreda" });
    }

    const duzyCanonFormatOptions = duzyVariants.reduce((acc, variant) => {
      const key = variant.id.startsWith("a3") ? "a3" : "a4";
      if (!acc.includes(key)) acc.push(key);
      return acc;
    }, [] as string[]);

    duzyCanonPaperSelect.innerHTML = duzyCanonPaperOptions
      .map((option) => `<option value="${option.value}">${option.label}</option>`)
      .join("");

    duzyCanonFormatSelect.innerHTML = duzyCanonFormatOptions
      .map((format) => `<option value="${format}">${DUZY_CANON_FORMAT_LABELS[format] ?? format.toUpperCase()}</option>`)
      .join("");

    const resolveDuzyCanonVariantId = () => {
      const size = duzyCanonFormatSelect.value === "a3" ? "a3" : "a4";
      const paper = duzyCanonPaperSelect.value === "200" ? "200-kreda-200" : "170-kreda-130-170";
      return `${size}-${paper}`;
    };

    const resolveMalyCanonVariantId = () => {
      const type = canonVariantSelect.value === "no-margin" ? "no-margin" : "margin";
      const mappedPaper = canonPaperSelect.value === "200" ? "200" : "170";
      return `${type}-${mappedPaper}`;
    };

    const parsePositiveInt = (value: string): number | null => {
      const parsed = Number.parseInt(value, 10);
      return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
    };

    let currentResult: any = null;
    let currentOptions: any = null;

    canonCalcBtn.onclick = () => {
      try {
        const qty = parsePositiveInt(canonQtyInput.value);
        if (!qty) throw new Error("Podaj ilość sztuk dla Małego Canon.");
        const fmt = (canonFormatSelect.value === "A3" ? "A3" : "A4") as "A4" | "A3";
        const matId = resolveMalyCanonVariantId();
        const finish = canonFinishSelect.value === "blysk" ? "błysk" : "mat";
        const paper = canonPaperSelect.value;

        const res = calculatePlakatyMalyCanon({ variantId: matId, format: fmt, qty, express: ctx.expressMode });
        currentResult = res;
        currentOptions = { type: "canon", matId, fmt, qty, finish, paper };

        unitPriceEl.innerText = formatPLN(res.tierPrice);
        totalPriceEl.innerText = formatPLN(res.totalPrice);

        if (discountRow && discountLabel && discountVal) {
          if (res.qty > 1 && res.singleTierPrice > res.tierPrice) {
            const saved = parseFloat(((res.singleTierPrice - res.tierPrice) * res.qty).toFixed(2));
            discountLabel.innerText = `Rabat ilościowy (${res.qty} szt):`;
            discountVal.innerText = `-${formatPLN(saved)}`;
            discountRow.style.display = "";
          } else {
            discountRow.style.display = "none";
          }
        }

        if (qtyLabel) qtyLabel.innerText = "Ilość:";
        if (qtyValEl) qtyValEl.innerText = `${qty} szt, ${fmt}, ${paper}g kreda, ${finish}`;
        if (expressHint) expressHint.style.display = ctx.expressMode ? "block" : "none";
        resultBox.style.display = "block";
        addBtn.disabled = false;
        ctx.updateLastCalculated(currentResult.totalPrice, "Plakaty A4-A3 (Mały Canon)");
      } catch (err) {
        alert("Błąd: " + (err as Error).message);
      }
    };

    duzyCanonCalcBtn.onclick = () => {
      try {
        const qty = parsePositiveInt(duzyCanonQtyInput.value);
        if (!qty) throw new Error("Podaj ilość sztuk dla Dużego Canon.");

        const variantId = resolveDuzyCanonVariantId();
        const finish = duzyCanonFinishSelect.value === "blysk" ? "błysk" : "mat";
        const paper = duzyCanonPaperSelect.value;
        const res = calculatePlakatyDuzyCanon({ variantId, qty, express: ctx.expressMode });

        currentResult = res;
        currentOptions = { type: "duzy-canon", variantId, qty: res.qty, finish, paper };

        unitPriceEl.innerText = formatPLN(res.tierPrice);
        totalPriceEl.innerText = formatPLN(res.totalPrice);
        if (discountRow) discountRow.style.display = "none";

        if (qtyLabel) qtyLabel.innerText = "Ilość:";
        if (qtyValEl) qtyValEl.innerText = `${res.qty} szt, ${paper}g kreda, ${finish}`;
        if (expressHint) expressHint.style.display = ctx.expressMode ? "block" : "none";
        resultBox.style.display = "block";
        addBtn.disabled = false;
        ctx.updateLastCalculated(currentResult.totalPrice, "Plakaty A4-A3 (Duży Canon)");
      } catch (err) {
        alert("Błąd: " + (err as Error).message);
      }
    };

    addBtn.onclick = () => {
      if (!currentResult || !currentOptions) return;

      if (currentOptions.type === "canon") {
        const canonTypeName = canonVariantSelect.options[canonVariantSelect.selectedIndex].text;
        const hint = `${currentOptions.fmt} × ${currentOptions.qty} szt, ${currentOptions.paper}g kreda, ${currentOptions.finish}${ctx.expressMode ? ", EXPRESS" : ""}`;
        ctx.cart.addItem({
          id: `plakaty-a4-a3-${Date.now()}`,
          category: "Plakaty A4-A3",
          name: `${canonTypeName} (${currentOptions.paper}g, ${currentOptions.finish}, mały Canon)`,
          quantity: currentOptions.qty,
          unit: "szt",
          unitPrice: currentResult.tierPrice,
          isExpress: ctx.expressMode,
          totalPrice: currentResult.totalPrice,
          optionsHint: hint,
          payload: currentResult,
        });
      } else {
        const hint = `${currentOptions.qty} szt, ${currentOptions.paper}g kreda, ${currentOptions.finish}${ctx.expressMode ? ", EXPRESS" : ""}`;
        ctx.cart.addItem({
          id: `plakaty-a4-a3-${Date.now()}`,
          category: "Plakaty A4-A3",
          name: `${currentOptions.paper}g kreda (${currentOptions.finish}, duży Canon)`,
          quantity: currentOptions.qty,
          unit: "szt",
          unitPrice: currentResult.tierPrice,
          isExpress: ctx.expressMode,
          totalPrice: currentResult.totalPrice,
          optionsHint: hint,
          payload: currentResult,
        });
      }
    };
  },
};
