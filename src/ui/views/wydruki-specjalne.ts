import { View, ViewContext } from "../types";
import { autoCalc } from "../autoCalc";
import { quoteWydrukiSpecjalne } from "../../categories/laminowanie";
import { formatPLN } from "../../core/money";
import { calculateDyplomy, getResolvedDyplomyTiers } from "../../categories/dyplomy";
import { calculateZaproszeniaKreda } from "../../categories/zaproszenia-kreda";
import { getPrice } from "../../services/priceService";
import { resolveStoredPrice } from "../../core/compat";

type SpecialBreakdownRow = {
  label: string;
  value: string;
  separatorTop?: boolean;
};

function renderBreakdownRows(target: HTMLElement, rows: SpecialBreakdownRow[]): void {
  target.replaceChildren();

  for (const row of rows) {
    const line = document.createElement("div");
    if (row.separatorTop) {
      line.style.paddingTop = "8px";
      line.style.borderTop = "1px solid rgba(255,255,255,0.08)";
    }

    const strong = document.createElement("strong");
    strong.textContent = `${row.label}:`;
    line.appendChild(strong);
    line.appendChild(document.createTextNode(` ${row.value}`));
    target.appendChild(line);
  }
}

export const WydrukiSpecjalneView: View = {
  id: "wydruki-specjalne",
  name: "Wydruki specjalne",
  async mount(container, ctx) {
    try {
      const response = await fetch("categories/wydruki-specjalne.html");
      if (!response.ok) throw new Error("Failed to load template");
      container.innerHTML = await response.text();

      this.initLogic?.(container, ctx);
    } catch (err) {
      container.innerHTML = `<div class="error">Błąd ładowania: ${err}</div>`;
    }
  },

  initLogic(container: HTMLElement, ctx: ViewContext) {
    const specialVariant = container.querySelector("#special-variant") as HTMLSelectElement | null;
    const specialQty = container.querySelector("#special-qty") as HTMLInputElement | null;
    const specialDouble = container.querySelector("#special-double") as HTMLInputElement | null;
    const specialDoubleRow = container.querySelector("#special-double-row") as HTMLElement | null;
    const specialDyplomOptions = container.querySelector("#special-dyplom-options") as HTMLElement | null;
    const specialDyplomPaper = container.querySelector("#special-dyplom-paper") as HTMLSelectElement | null;
    const specialZapOptions = container.querySelector("#special-zap-options") as HTMLElement | null;
    const specialZapFormat = container.querySelector("#special-zap-format") as HTMLSelectElement | null;
    const specialZapSides = container.querySelector("#special-zap-sides") as HTMLSelectElement | null;
    const specialZapFolded = container.querySelector("#special-zap-folded") as HTMLInputElement | null;
    const specialZapPaper = container.querySelector("#special-zap-paper") as HTMLSelectElement | null;
    const specialAddBtn = container.querySelector("#special-add-to-cart") as HTMLButtonElement | null;
    const specialResultArea = container.querySelector("#specialResult") as HTMLElement | null;
    const specialUnitPrice = container.querySelector("#special-unit") as HTMLElement | null;
    const specialTotalPrice = container.querySelector("#special-total") as HTMLElement | null;
    const specialTierHint = container.querySelector("#specialTierHint") as HTMLElement | null;
    const specialExpressHint = container.querySelector("#specialExpressHint") as HTMLElement | null;
    const specialBreakdown = container.querySelector("#specialBreakdown") as HTMLElement | null;
    const specialBreakdownLines = container.querySelector("#specialBreakdownLines") as HTMLElement | null;
    const specialLegendDyplom = container.querySelector("#special-legend-dyplom") as HTMLElement | null;
    const specialLegendZap = container.querySelector("#special-legend-zap") as HTMLElement | null;

    const zaproszeniaData = getPrice("zaproszeniaKreda") as any;

    const showLegendForVariant = (variantId: string) => {
      if (specialLegendDyplom) specialLegendDyplom.style.display = variantId === "dyplom" ? "block" : "none";
      if (specialLegendZap) specialLegendZap.style.display = variantId === "zaproszenia-dodruk" ? "block" : "none";
    };

    const clearBreakdown = () => {
      if (specialBreakdownLines) specialBreakdownLines.innerHTML = "";
      if (specialBreakdown) specialBreakdown.style.display = "none";
    };

    const renderBreakdown = (lines: SpecialBreakdownRow[]) => {
      if (!specialBreakdown || !specialBreakdownLines) return;
      renderBreakdownRows(specialBreakdownLines, lines);
      specialBreakdown.style.display = "block";
    };

    const updateVariantUI = () => {
      const variantId = specialVariant?.value ?? "";
      const isDyplom = variantId === "dyplom";
      const isZap = variantId === "zaproszenia-dodruk";

      if (specialDyplomOptions) specialDyplomOptions.style.display = isDyplom ? "block" : "none";
      if (specialZapOptions) specialZapOptions.style.display = isZap ? "block" : "none";
      if (specialDoubleRow) specialDoubleRow.style.display = isDyplom || isZap ? "none" : "flex";

      if (specialQty) {
        specialQty.min = isZap ? "10" : "1";
        if (isZap && (!specialQty.value || Number(specialQty.value) < 10)) {
          specialQty.value = "10";
        }
      }

      showLegendForVariant(variantId);
      clearBreakdown();
    };

    let specialState: ReturnType<typeof quoteWydrukiSpecjalne> | null = null;

    const performCalculation = () => {
      if (!specialVariant || !specialQty || !specialDouble) return;
      if (!specialVariant.value) {
        if (specialResultArea) specialResultArea.style.display = "none";
        if (specialAddBtn) specialAddBtn.disabled = true;
        clearBreakdown();
        return;
      }
      if (!specialQty.value) {
        if (specialResultArea) specialResultArea.style.display = "none";
        if (specialAddBtn) specialAddBtn.disabled = true;
        clearBreakdown();
        return;
      }

      const variantId = specialVariant.value;
      const qty = Math.max(1, parseInt(specialQty.value, 10) || 1);
      let result: ReturnType<typeof quoteWydrukiSpecjalne>;

      if (variantId === "dyplom") {
        const paper = specialDyplomPaper?.value ?? "kreda_200";
        const isSatin = paper.startsWith("satyna");
        const isModigliani = paper === "modigliani";
        const calc = calculateDyplomy({
          qty,
          isSatin,
          isModigliani,
          express: ctx.expressMode,
        });

        result = {
          variantId,
          variantName: "Dyplom",
          qty,
          unitPrice: parseFloat((calc.totalPrice / qty).toFixed(2)),
          doubleSided: false,
          totalPrice: calc.totalPrice,
        };

        const satinRate = resolveStoredPrice("modifier-satyna", 0.12);
        const modiglianiRate = resolveStoredPrice("modifier-modigliani", 0.20);
        const expressRate = resolveStoredPrice("modifier-express", 0.20);
        const breakdown: SpecialBreakdownRow[] = [
          { label: "Parametry", value: `${qty} szt, papier: ${paper.replace("_", " ")}` },
          { label: "Cena z progu ilości", value: formatPLN(calc.basePrice) },
        ];
        if (isModigliani) {
          const satinAmount = parseFloat((calc.basePrice * satinRate).toFixed(2));
          const modiglianiAmount = parseFloat(((calc.basePrice + satinAmount) * modiglianiRate).toFixed(2));
          breakdown.push({ label: "Satyna", value: `+${Math.round(satinRate * 100)}% = ${formatPLN(satinAmount)}` });
          breakdown.push({ label: "Modigliani", value: `+${Math.round(modiglianiRate * 100)}% od satyny = ${formatPLN(modiglianiAmount)}` });
        } else if (isSatin) {
          const satinAmount = parseFloat((calc.basePrice * satinRate).toFixed(2));
          breakdown.push({ label: "Satyna", value: `+${Math.round(satinRate * 100)}% = ${formatPLN(satinAmount)}` });
        }
        if (ctx.expressMode) {
          const expressAmount = parseFloat((calc.basePrice * expressRate).toFixed(2));
          breakdown.push({ label: "EXPRESS", value: `+${Math.round(expressRate * 100)}% = ${formatPLN(expressAmount)}` });
        }
        breakdown.push({ label: "Razem", value: formatPLN(calc.totalPrice), separatorTop: true });
        renderBreakdown(breakdown);
      } else if (variantId === "zaproszenia-dodruk") {
        const format = specialZapFormat?.value || "A6";
        const sides = parseInt(specialZapSides?.value || "1", 10) || 1;
        const isFolded = Boolean(specialZapFolded?.checked);
        const paper = specialZapPaper?.value ?? "kreda_200";
        const isSatin = paper.startsWith("satyna");
        const isModigliani = paper === "modigliani";
        const calc = calculateZaproszeniaKreda({
          format,
          qty,
          sides,
          isFolded,
          isSatin,
          isModigliani,
          express: ctx.expressMode,
        });

        result = {
          variantId,
          variantName: "Zaproszenia (dodruk)",
          qty,
          unitPrice: parseFloat((calc.totalPrice / qty).toFixed(2)),
          doubleSided: sides === 2,
          totalPrice: calc.totalPrice,
        };

        const satinRate = resolveStoredPrice("modifier-satyna", zaproszeniaData?.modifiers?.satin ?? 0.12);
        const modiglianiRate = resolveStoredPrice("modifier-modigliani", 0.20);
        const expressRate = resolveStoredPrice("modifier-express", zaproszeniaData?.modifiers?.express ?? 0.20);
        const breakdown: SpecialBreakdownRow[] = [
          { label: "Parametry", value: `${qty} szt, ${format}, ${sides === 1 ? "jednostronne" : "dwustronne"}${isFolded ? ", składane" : ""}, papier: ${paper.replace("_", " ")}` },
          { label: "Cena z tabeli", value: formatPLN(calc.basePrice) },
        ];
        if (isModigliani) {
          const satinAmount = parseFloat((calc.basePrice * satinRate).toFixed(2));
          const modiglianiAmount = parseFloat(((calc.basePrice + satinAmount) * modiglianiRate).toFixed(2));
          breakdown.push({ label: "Satyna", value: `+${Math.round(satinRate * 100)}% = ${formatPLN(satinAmount)}` });
          breakdown.push({ label: "Modigliani", value: `+${Math.round(modiglianiRate * 100)}% od satyny = ${formatPLN(modiglianiAmount)}` });
        } else if (isSatin) {
          const satinAmount = parseFloat((calc.basePrice * satinRate).toFixed(2));
          breakdown.push({ label: "Satyna", value: `+${Math.round(satinRate * 100)}% = ${formatPLN(satinAmount)}` });
        }
        if (ctx.expressMode) {
          const expressAmount = parseFloat((calc.basePrice * expressRate).toFixed(2));
          breakdown.push({ label: "EXPRESS", value: `+${Math.round(expressRate * 100)}% = ${formatPLN(expressAmount)}` });
        }
        breakdown.push({ label: "Razem", value: formatPLN(calc.totalPrice), separatorTop: true });
        renderBreakdown(breakdown);
      } else {
        result = quoteWydrukiSpecjalne({
          variantId,
          qty,
          doubleSided: specialDouble.checked,
          express: ctx.expressMode,
        });
        clearBreakdown();
      }

      specialState = result;
      if (specialUnitPrice) specialUnitPrice.innerText = formatPLN(result.totalPrice / result.qty);
      if (specialTotalPrice) specialTotalPrice.innerText = formatPLN(result.totalPrice);
      if (specialExpressHint) specialExpressHint.style.display = ctx.expressMode ? "block" : "none";
      if (specialResultArea) specialResultArea.style.display = "block";
      if (specialAddBtn) specialAddBtn.disabled = result.totalPrice === 0;

      ctx.updateLastCalculated(result.totalPrice, "Wydruki specjalne");
    };

    const updateLegends = () => {
      if (specialLegendDyplom) {
        const freshDyplomyTiers = getResolvedDyplomyTiers();
        if (freshDyplomyTiers.length > 0) {
          specialLegendDyplom.innerHTML = `
            <div class="legend-head"><div><h4>CENNIK DYPLOMY</h4><p class="legend-subtitle">Progi ilościowe (cena bazowa).</p></div></div>
            <div class="legend-badges">
              <span class="legend-badge"><strong>Satyna:</strong> +${Math.round(resolveStoredPrice("modifier-satyna", 0.12) * 100)}%</span>
              <span class="legend-badge"><strong>Modigliani:</strong> Satyna +${Math.round(resolveStoredPrice("modifier-modigliani", 0.20) * 100)}%</span>
              <span class="legend-badge"><strong>EXPRESS:</strong> +${Math.round(resolveStoredPrice("modifier-express", 0.20) * 100)}%</span>
            </div>
            <table>
              <thead><tr><th>Ilość (szt)</th><th>Cena</th></tr></thead>
              <tbody>${freshDyplomyTiers.map((tier) => `<tr><td>${tier.qty}+</td><td>${formatPLN(tier.price)}</td></tr>`).join("")}</tbody>
            </table>
          `;
        }
      }

      if (specialLegendZap && zaproszeniaData?.formats?.A6?.single?.normal) {
        const a6Single = zaproszeniaData.formats.A6.single.normal as Record<string, number>;
        const rows = Object.keys(a6Single).map((qtyKey) => {
          const price = resolveStoredPrice(`zaproszenia-a6-single-normal-${qtyKey}`, a6Single[qtyKey]);
          return `<tr><td>${qtyKey}</td><td>${formatPLN(price)}</td></tr>`;
        }).join("");

        specialLegendZap.innerHTML = `
          <div class="legend-head"><div><h4>CENNIK ZAPROSZENIA (A6 1-str)</h4><p class="legend-subtitle">Cennik bazowy. Dokładna cena zależy od parametrów.</p></div></div>
          <div class="legend-badges">
            <span class="legend-badge"><strong>Składane:</strong> osobna stawka</span>
            <span class="legend-badge"><strong>Satyna:</strong> +${Math.round(resolveStoredPrice("modifier-satyna", 0.12) * 100)}%</span>
            <span class="legend-badge"><strong>EXPRESS:</strong> +${Math.round(resolveStoredPrice("modifier-express", 0.20) * 100)}%</span>
          </div>
          <table>
            <thead><tr><th>Ilość (szt)</th><th>Cena</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        `;
      }
    };

    autoCalc({ root: container, calc: performCalculation, cancelOn: [specialAddBtn] });
    specialVariant?.addEventListener("change", updateVariantUI);
    updateVariantUI();
    updateLegends();
    ctx?.on?.("prices-updated", () => { updateLegends(); performCalculation(); });

    specialAddBtn?.addEventListener("click", () => {
      if (!specialState) return;

      const variantId = specialVariant?.value ?? "";
      let optionsHint = `${specialState.qty} szt${specialState.doubleSided ? ", dwustronnie" : ""}${ctx.expressMode ? ", EXPRESS" : ""}`;

      if (variantId === "dyplom") {
        const paper = specialDyplomPaper?.value ?? "kreda_200";
        optionsHint = [
          `${specialState.qty} szt`,
          `papier: ${paper.replace("_", " ")}`,
          ...(ctx.expressMode ? ["EXPRESS"] : []),
        ].join(", ");
      }

      if (variantId === "zaproszenia-dodruk") {
        const format = specialZapFormat?.value || "A6";
        const sides = parseInt(specialZapSides?.value || "1", 10) || 1;
        const isFolded = Boolean(specialZapFolded?.checked);
        const paper = specialZapPaper?.value ?? "kreda_200";
        optionsHint = [
          `${specialState.qty} szt`,
          format,
          sides === 1 ? "1-str" : "2-str",
          ...(isFolded ? ["składane"] : []),
          `papier: ${paper.replace("_", " ")}`,
          ...(ctx.expressMode ? ["EXPRESS"] : []),
        ].join(", ");
      }

      ctx.cart.addItem({
        id: `special-print-${Date.now()}`,
        category: "Wydruki specjalne",
        name: specialState.variantName,
        quantity: specialState.qty,
        unit: "szt",
        unitPrice: specialState.totalPrice / specialState.qty,
        isExpress: ctx.expressMode,
        totalPrice: specialState.totalPrice,
        optionsHint,
        payload: specialState,
      });

      specialState = null;
      if (specialResultArea) specialResultArea.style.display = 'none';
      if (specialAddBtn) specialAddBtn.disabled = true;
      clearBreakdown();
    });
  }
};
