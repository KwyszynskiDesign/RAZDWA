import { View, ViewContext } from "../types";
import { calculatePlakatyM2, calculatePlakatyFormat, calculatePlakatyMalyCanon, calculatePlakatyDuzyCanon } from "../../categories/plakaty";
import { formatPLN } from "../../core/money";
import { getPrice } from "../../services/priceService";

const data: any = getPrice("plakaty");

const FORMAT_LABELS: Record<string, string> = {
  "297x420": "A3 (297x420)",
  "420x594": "A2 (420x594)",
  "594x841": "A1 (594x841)",
  "841x1189": "A0 (841x1189)",
};

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
    const formatSelect  = container.querySelector("#p-format") as HTMLSelectElement;
    const canonVariantSelect = container.querySelector("#p-canon-variant") as HTMLSelectElement;
    const canonFormatSelect = container.querySelector("#p-canon-format") as HTMLSelectElement;
    const canonQtyInput = container.querySelector("#p-canon-qty") as HTMLInputElement;
    const canonCalcBtn   = container.querySelector("#p-canon-calculate") as HTMLButtonElement;
    const duzyCanonVariantSelect = container.querySelector("#p-duzy-canon-variant") as HTMLSelectElement;
    const duzyCanonQtyInput = container.querySelector("#p-duzy-canon-qty") as HTMLInputElement;
    const duzyCanonCalcBtn = container.querySelector("#p-duzy-canon-calculate") as HTMLButtonElement;
    const lengthGroup   = container.querySelector("#p-length-group") as HTMLElement;
    const lengthLabel   = container.querySelector("#p-length-label") as HTMLElement;
    const lengthInput   = container.querySelector("#p-length-mm") as HTMLInputElement;
    const qtyInput      = container.querySelector("#p-qty") as HTMLInputElement;
    const calcBtn       = container.querySelector("#p-calculate") as HTMLButtonElement;
    const addBtn        = container.querySelector("#p-add-to-cart") as HTMLButtonElement;
    const resultBox     = container.querySelector("#p-result-display") as HTMLElement;
    const unitPriceEl   = container.querySelector("#p-unit-price") as HTMLElement;
    const totalPriceEl  = container.querySelector("#p-total-price") as HTMLElement;
    const discountRow   = container.querySelector("#p-discount-row") as HTMLElement | null;
    const discountLabel = container.querySelector("#p-discount-label") as HTMLElement | null;
    const discountVal   = container.querySelector("#p-discount-val") as HTMLElement | null;
    const qtyLabel      = container.querySelector("#p-qty-label") as HTMLElement | null;
    const qtyValEl      = container.querySelector("#p-qty-val") as HTMLElement | null;
    const expressHint   = container.querySelector("#p-express-hint") as HTMLElement;

    const requiredElements = [
      materialSelect,
      formatGroup,
      formatSelect,
      qtyInput,
      calcBtn,
      addBtn,
      resultBox,
      unitPriceEl,
      totalPriceEl,
    ];

    if (requiredElements.some((el) => !el)) {
      throw new Error("Brak wymaganych elementów formularza plakatów.");
    }

    // Populate material select (tylko wielkoformatowe)
    const allMaterials = [...tableData.formatowe.materials];
    materialSelect.innerHTML = allMaterials.map((m: any) =>
      `<option value="${m.id}">${m.name}</option>`
    ).join("");

    // Populate mały Canon variants (z marginesem / bez marginesu, gramatury)
    if (canonVariantSelect) {
      canonVariantSelect.innerHTML = tableData.malyCanon.variants.map((v: any) =>
        `<option value="${v.id}">${v.name}</option>`
      ).join("");
    }

    // Populate duży Canon variants
    const duzyVariants = (tableData.duzyCanon?.variants ?? [
      { id: "a4-170-kreda-130-170", name: "A4 170g kreda 130/170" },
      { id: "a3-170-kreda-130-170", name: "A3 170g kreda 130/170" },
      { id: "a4-200-kreda-200", name: "A4 200g kreda 200" },
      { id: "a3-200-kreda-200", name: "A3 200g kreda 200" },
    ]) as Array<{ id: string; name: string }>;
    if (duzyCanonVariantSelect) {
      duzyCanonVariantSelect.innerHTML = duzyVariants
        .map((v: any) => `<option value="${v.id}">${v.name}</option>`)
        .join("");
    }

    const parsePositiveInt = (value: string): number | null => {
      const parsed = Number.parseInt(value, 10);
      return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
    };

    function updateFormatOptions(matId: string) {
      const mat = tableData.formatowe.materials.find((m: any) => m.id === matId);
      if (!mat) return;
      const keys = Object.keys(mat.prices);
      formatSelect.innerHTML = keys.map((k: string) => `<option value="${k}">${FORMAT_LABELS[k] ?? k}</option>`).join("");
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

      if (!matId.includes("nieformatowe")) {
        lengthGroup.style.display = "none";
        return;
      }

      lengthGroup.style.display = "";
      lengthInput.value = "";
      lengthInput.placeholder = `np. ${dims.lengthMm}`;
      lengthLabel.innerText = `Długość drugiego boku dla ${dims.widthMm} mm (mm):`;
    }

    const updateVisibility = () => {
      const matId = materialSelect.value;
      formatGroup.style.display = "";
      updateFormatOptions(matId);
      updateLengthInput(matId);
    };

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
        const fmt = formatSelect.value;
        const qty = parsePositiveInt(qtyInput.value);
        if (!qty) throw new Error("Podaj ilość sztuk.");
        const customLengthMm = lengthGroup && lengthGroup.style.display !== "none"
          ? (parseFloat(lengthInput.value) || undefined)
          : undefined;
        const res = calculatePlakatyFormat({ materialId: matId, formatKey: fmt, qty, customLengthMm, express: ctx.expressMode });
        currentResult = res;
        currentOptions = { type: "format", matId, fmt, qty, customLengthMm };
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
        if (qtyLabel) qtyLabel.innerText = "Ilość:";
        if (qtyValEl) qtyValEl.innerText = `${qty} szt, ${fmt}`;

        if (expressHint) expressHint.style.display = ctx.expressMode ? "block" : "none";
        resultBox.style.display = "block";
        addBtn.disabled = false;
        ctx.updateLastCalculated(currentResult.totalPrice, "Plakaty");
      } catch (err) {
        alert("Błąd: " + (err as Error).message);
      }
    };

    if (canonCalcBtn && canonQtyInput && canonFormatSelect && canonVariantSelect) {
      canonCalcBtn.onclick = () => {
      try {
        const qty = parsePositiveInt(canonQtyInput.value);
        if (!qty) throw new Error("Podaj ilość sztuk dla Małego Canon.");
        const fmt = (canonFormatSelect.value === "A3" ? "A3" : "A4") as "A4" | "A3";
        const matId = canonVariantSelect.value;
        const res = calculatePlakatyMalyCanon({ variantId: matId, format: fmt, qty, express: ctx.expressMode });
        currentResult = res;
        currentOptions = { type: "canon", matId, fmt, qty };
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
        if (qtyValEl) qtyValEl.innerText = `${qty} szt, ${fmt}`;
        if (expressHint) expressHint.style.display = ctx.expressMode ? "block" : "none";
        resultBox.style.display = "block";
        addBtn.disabled = false;
        ctx.updateLastCalculated(currentResult.totalPrice, "Plakaty (Mały Canon)");
      } catch (err) {
        alert("Błąd: " + (err as Error).message);
      }
      };
    }

    if (duzyCanonCalcBtn && duzyCanonQtyInput && duzyCanonVariantSelect) {
      duzyCanonCalcBtn.onclick = () => {
      try {
        const qty = parsePositiveInt(duzyCanonQtyInput.value);
        if (!qty) throw new Error("Podaj ilość sztuk dla Dużego Canon.");

        const variantId = duzyCanonVariantSelect.value;
        const res = calculatePlakatyDuzyCanon({ variantId, qty, express: ctx.expressMode });

        currentResult = res;
        currentOptions = { type: "duzy-canon", variantId, qty: res.qty };

        unitPriceEl.innerText = formatPLN(res.tierPrice);
        totalPriceEl.innerText = formatPLN(res.totalPrice);

        if (discountRow && discountLabel && discountVal) {
          discountRow.style.display = "none";
        }

        if (qtyLabel) qtyLabel.innerText = "Ilość:";
        if (qtyValEl) qtyValEl.innerText = `${res.qty} szt`;
        if (expressHint) expressHint.style.display = ctx.expressMode ? "block" : "none";

        resultBox.style.display = "block";
        addBtn.disabled = false;
        ctx.updateLastCalculated(currentResult.totalPrice, "Plakaty (Duży Canon)");
      } catch (err) {
        alert("Błąd: " + (err as Error).message);
      }
      };
    }

    addBtn.onclick = () => {
      if (!currentResult || !currentOptions) return;
      const matName = materialSelect.options[materialSelect.selectedIndex].text;
      if (currentOptions.type === "canon") {
        const canonName = canonVariantSelect.options[canonVariantSelect.selectedIndex].text;
        const hint = `${currentOptions.fmt} × ${currentOptions.qty} szt${ctx.expressMode ? ", EXPRESS" : ""}`;
        ctx.cart.addItem({
          id: `plakaty-${Date.now()}`,
          category: "Plakaty",
          name: `${canonName} (mały Canon)`,
          quantity: currentOptions.qty,
          unit: "szt",
          unitPrice: currentResult.tierPrice,
          isExpress: ctx.expressMode,
          totalPrice: currentResult.totalPrice,
          optionsHint: hint,
          payload: currentResult,
        });
      } else if (currentOptions.type === "duzy-canon") {
        const variantName = duzyCanonVariantSelect.options[duzyCanonVariantSelect.selectedIndex].text;
        const hint = `${currentOptions.qty} szt${ctx.expressMode ? ", EXPRESS" : ""}`;

        ctx.cart.addItem({
          id: `plakaty-${Date.now()}`,
          category: "Plakaty",
          name: `${variantName} (duży Canon)`,
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
