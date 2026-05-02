import { View, ViewContext } from "../types";
import { autoCalc } from "../autoCalc";
import { calculatePlakatyMalyCanon, calculatePlakatyDuzyCanon } from "../../categories/plakaty";
import { formatPLN } from "../../core/money";
import { getPrice } from "../../services/priceService";
import { resolveStoredPrice } from "../../core/compat";

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
      this.initLogic?.(container, ctx);
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

    const duzyCanonPaperSelect = container.querySelector("#pa-duzy-canon-paper") as HTMLSelectElement;
    const duzyCanonFinishSelect = container.querySelector("#pa-duzy-canon-finish") as HTMLSelectElement;
    const duzyCanonFormatSelect = container.querySelector("#pa-duzy-canon-format") as HTMLSelectElement;
    const duzyCanonQtyInput = container.querySelector("#pa-duzy-canon-qty") as HTMLInputElement;
    const duzyCanonTrim2Checkbox = container.querySelector("#pa-duzy-canon-trim-2") as HTMLInputElement | null;
    const duzyCanonTrim4Checkbox = container.querySelector("#pa-duzy-canon-trim-4") as HTMLInputElement | null;
    const duzyCanonTrim2QtyGroup = container.querySelector("#pa-duzy-canon-trim-2-qty-group") as HTMLElement | null;
    const duzyCanonTrim4QtyGroup = container.querySelector("#pa-duzy-canon-trim-4-qty-group") as HTMLElement | null;
    const duzyCanonTrim2QtyInput = container.querySelector("#pa-duzy-canon-trim-2-qty") as HTMLInputElement | null;
    const duzyCanonTrim4QtyInput = container.querySelector("#pa-duzy-canon-trim-4-qty") as HTMLInputElement | null;

    const addBtn = container.querySelector("#pa-add-to-cart") as HTMLButtonElement;
    const resultBox = container.querySelector("#pa-result-area") as HTMLElement;
    const unitPriceEl = container.querySelector("#pa-unit-price") as HTMLElement;
    const totalPriceEl = container.querySelector("#pa-total-price") as HTMLElement;
    const discountRow = container.querySelector("#pa-discount-row") as HTMLElement | null;
    const discountLabel = container.querySelector("#pa-discount-label") as HTMLElement | null;
    const discountVal = container.querySelector("#pa-discount-val") as HTMLElement | null;
    const qtyLabel = container.querySelector("#pa-qty-label") as HTMLElement | null;
    const qtyValEl = container.querySelector("#pa-qty-val") as HTMLElement | null;
    const expressHint = container.querySelector("#pa-express-hint") as HTMLElement;
    const conflictWarning = container.querySelector("#pa-conflict-warning") as HTMLElement | null;
    const calcHintEl = container.querySelector("#pa-calc-hint") as HTMLElement | null;

    const ensureLegend = () => {
      let legend = container.querySelector<HTMLElement>("#pa-dynamic-legend");
      if (!legend) {
        legend = document.createElement("div");
        legend.id = "pa-dynamic-legend";
        legend.className = "card";
        legend.style.marginTop = "16px";
        resultBox.insertAdjacentElement("afterend", legend);
      }

      const findMalyVariant = (variantId: string) =>
        (tableData.malyCanon?.variants ?? []).find((variant: any) => variant.id === variantId);

      const findDuzyVariant = (variantId: string) =>
        (tableData.duzyCanon?.variants ?? []).find((variant: any) => variant.id === variantId);

      const getMalyPrice = (variantId: string, format: "A4" | "A3", tier: any) => {
        const suffix = tier.max == null ? `${tier.min}+` : `${tier.min}-${tier.max}`;
        const base = tier?.prices?.[format] ?? (format === "A3" ? tier?.priceA3 : tier?.priceA4) ?? tier?.price;
        const legacyAware = resolveStoredPrice(`plakaty-maly-canon-${variantId}-${suffix}`, Number(base));
        return formatPLN(resolveStoredPrice(`plakaty-maly-canon-${variantId}-${format}-${suffix}`, legacyAware));
      };

      const getDuzyPrice = (variantId: string, qty: number, fallback = "-") => {
        const variant = findDuzyVariant(variantId);
        const tier = (variant?.tiers ?? []).find((entry: any) => entry.qty === qty);
        if (!tier) return fallback;
        return formatPLN(resolveStoredPrice(`plakaty-duzy-canon-${variantId}-${qty}`, tier.price));
      };

      const malyRows = ((findMalyVariant("margin-170")?.tiers ?? []) as any[])
        .map((tier) => {
          const label = tier.max == null ? `${tier.min}+ szt` : `${tier.min}-${tier.max} szt`;
          return `
            <tr>
              <td>${label}</td>
              <td style="white-space:nowrap">${getMalyPrice("margin-170", "A4", tier)} | ${getMalyPrice("margin-170", "A3", tier)}</td>
              <td style="white-space:nowrap">${getMalyPrice("no-margin-170", "A4", tier)} | ${getMalyPrice("no-margin-170", "A3", tier)}</td>
              <td style="white-space:nowrap">${getMalyPrice("margin-200", "A4", tier)} | ${getMalyPrice("margin-200", "A3", tier)}</td>
              <td style="white-space:nowrap">${getMalyPrice("no-margin-200", "A4", tier)} | ${getMalyPrice("no-margin-200", "A3", tier)}</td>
            </tr>
          `;
        })
        .join("");

      const duzyQuantities = ((findDuzyVariant("a4-170-kreda-130-170")?.tiers ?? []) as any[])
        .map((tier) => tier.qty);

      const duzy170Rows = duzyQuantities
        .map((qty) => `
          <tr>
            <td>${qty} szt</td>
            <td>${getDuzyPrice("a4-170-kreda-130-170", qty)}</td>
            <td>${getDuzyPrice("a3-170-kreda-130-170", qty)}</td>
          </tr>
        `)
        .join("");

      const duzy200Rows = duzyQuantities
        .map((qty) => `
          <tr>
            <td>${qty} szt</td>
            <td>${getDuzyPrice("a4-200-kreda-200", qty)}</td>
            <td>${getDuzyPrice("a3-200-kreda-200", qty)}</td>
          </tr>
        `)
        .join("");

      legend.innerHTML = `
        <h4 style="margin:10px 0 6px;">Mały Canon</h4>
        <table style="width:auto; table-layout:auto;">
          <thead>
            <tr>
              <th>Ilość</th>
              <th>170 margines</th>
              <th>170 bez marginesu</th>
              <th>200 margines</th>
              <th>200 bez marginesu</th>
            </tr>
            <tr>
              <th></th>
              <th>A4 | A3</th>
              <th>A4 | A3</th>
              <th>A4 | A3</th>
              <th>A4 | A3</th>
            </tr>
          </thead>
          <tbody>${malyRows}</tbody>
        </table>
        <h4 style="margin:16px 0 6px;">Duży Canon 170g</h4>
        <table>
          <thead>
            <tr>
              <th>Ilość</th>
              <th>A4 cena</th>
              <th>A3 cena</th>
            </tr>
          </thead>
          <tbody>${duzy170Rows}</tbody>
        </table>
        <h4 style="margin:16px 0 6px;">Duży Canon 200g</h4>
        <table>
          <thead>
            <tr>
              <th>Ilość</th>
              <th>A4 cena</th>
              <th>A3 cena</th>
            </tr>
          </thead>
          <tbody>${duzy200Rows}</tbody>
        </table>
      `;
    };

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
          label: key === "200" ? "200g kreda" : "170g kreda",
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

    const getDuzyCanonTrimSurcharge = (): number => {
      let surcharge = 0;
      if (duzyCanonTrim2Checkbox?.checked) {
        const qty = parsePositiveInt(duzyCanonTrim2QtyInput?.value || "") || 1;
        surcharge += qty * 1; // 1 zł per item for 2 cuts
      }
      if (duzyCanonTrim4Checkbox?.checked) {
        const qty = parsePositiveInt(duzyCanonTrim4QtyInput?.value || "") || 1;
        surcharge += qty * 2; // 2 zł per item for 4 cuts
      }
      return surcharge;
    };

    let currentResult: any = null;
    let currentOptions: any = null;
    let activeCanonInput: "maly" | "duzy" = "maly";

    const clearResult = () => {
      resultBox.style.display = "none";
      addBtn.disabled = true;
      if (discountRow) discountRow.style.display = "none";
    };

    const showConflictWarning = (message: string | null) => {
      if (!conflictWarning) return;
      if (!message) {
        conflictWarning.style.display = "none";
        conflictWarning.textContent = "";
        return;
      }
      conflictWarning.textContent = message;
      conflictWarning.style.display = "block";
    };

    const calcMalyCanon = (qty: number) => {
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
    };

    const calcDuzyCanon = (qty: number) => {
      const variantId = resolveDuzyCanonVariantId();
      const finish = duzyCanonFinishSelect.value === "blysk" ? "błysk" : "mat";
      const paper = duzyCanonPaperSelect.value;
      const res = calculatePlakatyDuzyCanon({ variantId, qty, express: ctx.expressMode });
      const trimSurcharge = getDuzyCanonTrimSurcharge();
      const totalWithTrim = parseFloat((res.totalPrice + trimSurcharge).toFixed(2));

      currentResult = {
        ...res,
        totalPrice: totalWithTrim,
        trimSurcharge,
      };
      currentOptions = { type: "duzy-canon", variantId, qty: res.qty, finish, paper, trimSurcharge };

      unitPriceEl.innerText = formatPLN(res.tierPrice);
      totalPriceEl.innerText = formatPLN(totalWithTrim);
      if (discountRow && discountLabel && discountVal) {
        if (res.tierQty !== res.qty) {
          discountLabel.innerText = "Próg ilościowy:";
          discountVal.innerText = `${res.qty} → ${res.tierQty} szt`;
          discountRow.style.display = "";
        } else {
          discountRow.style.display = "none";
        }
      }

      if (qtyLabel) qtyLabel.innerText = "Ilość:";
      if (qtyValEl) qtyValEl.innerText = `${res.qty} szt, ${paper}g kreda, ${finish}`;

      if (calcHintEl) {
        if (trimSurcharge > 0) {
          const trimParts: string[] = [];
          if (duzyCanonTrim2Checkbox?.checked) {
            const qty = parsePositiveInt(duzyCanonTrim2QtyInput?.value || "") || 1;
            trimParts.push(`${qty} szt × 2 cięcia trymer (+1,00 zł) = ${formatPLN(qty * 1)}`);
          }
          if (duzyCanonTrim4Checkbox?.checked) {
            const qty = parsePositiveInt(duzyCanonTrim4QtyInput?.value || "") || 1;
            trimParts.push(`${qty} szt × 4 cięcia trymer (+2,00 zł) = ${formatPLN(qty * 2)}`);
          }
          calcHintEl.innerText = `Doliczono: ${trimParts.join(" + ")} = ${formatPLN(trimSurcharge)}`;
          calcHintEl.style.display = "block";
        } else {
          calcHintEl.style.display = "none";
          calcHintEl.innerText = "";
        }
      }

      if (expressHint) expressHint.style.display = ctx.expressMode ? "block" : "none";
      resultBox.style.display = "block";
      addBtn.disabled = false;
      ctx.updateLastCalculated(currentResult.totalPrice, "Plakaty A4-A3 (Duży Canon)");
    };

    const recalculate = () => {
      const malyQty = parsePositiveInt(canonQtyInput.value);
      const duzyQty = parsePositiveInt(duzyCanonQtyInput.value);

      if (malyQty && duzyQty) {
        showConflictWarning(
          activeCanonInput === "duzy"
            ? "USUŃ ILOŚĆ SZTUK Z MAŁY CANON"
            : "USUŃ ILOŚĆ SZTUK Z DUŻY CANON"
        );
        clearResult();
        return;
      }

      showConflictWarning(null);

      if (malyQty) {
        try {
          calcMalyCanon(malyQty);
        } catch {
          clearResult();
        }
        return;
      }

      if (duzyQty) {
        try {
          calcDuzyCanon(duzyQty);
        } catch {
          clearResult();
        }
        return;
      }

      clearResult();
    };

    canonQtyInput.addEventListener("input", () => {
      activeCanonInput = "maly";
    });

    duzyCanonQtyInput.addEventListener("input", () => {
      activeCanonInput = "duzy";
    });

    autoCalc({ root: container, calc: recalculate });

    // Handle Duży Canon trim checkboxes
    const recalcForDuzyTrimChange = () => {
      // Show/hide quantity inputs
      if (duzyCanonTrim2QtyGroup) duzyCanonTrim2QtyGroup.style.display = duzyCanonTrim2Checkbox?.checked ? "block" : "none";
      if (duzyCanonTrim4QtyGroup) duzyCanonTrim4QtyGroup.style.display = duzyCanonTrim4Checkbox?.checked ? "block" : "none";

      // Set default values when shown
      if (duzyCanonTrim2Checkbox?.checked && duzyCanonTrim2QtyInput && !duzyCanonTrim2QtyInput.value) {
        duzyCanonTrim2QtyInput.value = duzyCanonQtyInput.value || "1";
      }
      if (duzyCanonTrim4Checkbox?.checked && duzyCanonTrim4QtyInput && !duzyCanonTrim4QtyInput.value) {
        duzyCanonTrim4QtyInput.value = duzyCanonQtyInput.value || "1";
      }

      // Recalculate
      const duzyQty = parsePositiveInt(duzyCanonQtyInput.value);
      if (duzyQty) {
        try {
          calcDuzyCanon(duzyQty);
        } catch {}
      }
    };

    duzyCanonTrim2Checkbox?.addEventListener("change", recalcForDuzyTrimChange);
    duzyCanonTrim4Checkbox?.addEventListener("change", recalcForDuzyTrimChange);
    duzyCanonTrim2QtyInput?.addEventListener("input", () => {
      const duzyQty = parsePositiveInt(duzyCanonQtyInput.value);
      if (duzyQty) {
        try {
          calcDuzyCanon(duzyQty);
        } catch {}
      }
    });
    duzyCanonTrim4QtyInput?.addEventListener("input", () => {
      const duzyQty = parsePositiveInt(duzyCanonQtyInput.value);
      if (duzyQty) {
        try {
          calcDuzyCanon(duzyQty);
        } catch {}
      }
    });
    ensureLegend();

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
        const trimHint = currentOptions.trimSurcharge > 0 ? `, trymer: +${formatPLN(currentOptions.trimSurcharge)}` : "";
        const hint = `${currentOptions.qty} szt, ${currentOptions.paper}g kreda, ${currentOptions.finish}${trimHint}${ctx.expressMode ? ", EXPRESS" : ""}`;
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
