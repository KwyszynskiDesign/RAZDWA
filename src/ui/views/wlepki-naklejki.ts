import { View, ViewContext } from "../types";
import { calculateWlepki, calculateWlepkiSzt, WlepkiCalculation } from "../../categories/wlepki-naklejki";
import { formatPLN } from "../../core/money";
import { getPrice } from "../../services/priceService";
import { resolveStoredPrice } from "../../core/compat";

const data: any = getPrice("wlepkiNaklejki");

export const WlepkiView: View = {
  id: "wlepki-naklejki",
  name: "Wlepki / Naklejki",
  async mount(container, ctx) {
    const tableData = data as any;

    try {
      const response = await fetch("categories/wlepki-naklejki.html");
      if (!response.ok) throw new Error("Failed to load template");
      container.innerHTML = await response.text();
    } catch (err) {
      container.innerHTML = `<div class="error">Błąd ładowania szablonu: ${err}</div>`;
      return;
    }

    const groupSelect = container.querySelector("#wlepki-group") as HTMLSelectElement;
    const modeSelect = container.querySelector("#wlepki-mode") as HTMLSelectElement;
    const pieceTableSelect = container.querySelector("#wlepki-piece-table") as HTMLSelectElement;
    const pieceQtyInput = container.querySelector("#wlepki-piece-qty") as HTMLInputElement;
    const pieceGroup = container.querySelector("#wlepki-piece-group") as HTMLElement;
    const areaGroup = container.querySelector("#wlepki-area-group") as HTMLElement;
    const modifiersGroup = container.querySelector("#wlepki-modifiers-group") as HTMLElement;
    const areaInput = container.querySelector("#wlepki-area") as HTMLInputElement;
    const calcBtn = container.querySelector("#btn-calculate") as HTMLButtonElement;
    const addBtn = container.querySelector("#btn-add-to-cart") as HTMLButtonElement;
    const resultDiv = container.querySelector("#wlepki-result") as HTMLElement;
    const unitPriceEl = container.querySelector("#unit-price") as HTMLElement;
    const basePriceEl = container.querySelector("#base-price") as HTMLElement;
    const totalPriceEl = container.querySelector("#total-price") as HTMLElement;
    const modifiersBreakdownEl = container.querySelector("#modifiers-breakdown") as HTMLElement;
    const unitLabelEl = container.querySelector("#wlepki-unit-label") as HTMLElement;
    const baseLabelEl = container.querySelector("#wlepki-base-label") as HTMLElement;

    const allModifiers = (tableData.modifiers || []).map((m: any) => {
      const modKey = `wlepki-modifier-${String(m.id).replace(/_/g, "-")}`;
      return { ...m, value: resolveStoredPrice(modKey, m.value) };
    });

    let currentResult: any = null;
    let currentInput: (WlepkiCalculation & { mode: "m2" }) | ({ mode: "szt"; tableId: string; qty: number; express?: boolean }) | null = null;

    const syncMode = () => {
      const mode = modeSelect.value === "szt" ? "szt" : "m2";
      pieceGroup.style.display = mode === "szt" ? "" : "none";
      areaGroup.style.display = mode === "m2" ? "" : "none";
      modifiersGroup.style.display = mode === "m2" ? "" : "none";
      if (mode === "szt") {
        unitLabelEl.textContent = "Cena wg progu:";
        baseLabelEl.textContent = "Ilość rozliczona:";
      } else {
        unitLabelEl.textContent = "Cena za m2:";
        baseLabelEl.textContent = "Baza (rozliczone m²):";
      }
    };

    modeSelect.addEventListener("change", syncMode);
    syncMode();

    const calculate = () => {
      const mode = modeSelect.value === "szt" ? "szt" : "m2";

      try {
        if (mode === "szt") {
          const input = {
            mode: "szt" as const,
            tableId: pieceTableSelect.value,
            qty: parseInt(pieceQtyInput.value, 10) || 1,
            express: ctx.expressMode,
          };
          const result = calculateWlepkiSzt(input);
          currentInput = input;
          currentResult = result;

          unitPriceEl.textContent = formatPLN(result.unitPrice);
          basePriceEl.textContent = `${result.requestedQty} szt (próg: ${result.chargedQty} szt)`;
          modifiersBreakdownEl.innerHTML = result.modifiersTotal > 0
            ? `<div class="result-row"><span>Dopłata EXPRESS:</span><span class="price-value">+${formatPLN(result.modifiersTotal)}</span></div>`
            : `<div class="result-row"><span>Opcje dodatkowe:</span><span class="price-value">brak dopłat</span></div>`;
        } else {
          const modCheckboxes = container.querySelectorAll(".wlepki-mod:checked") as NodeListOf<HTMLInputElement>;
          const modifiers = Array.from(modCheckboxes).map(cb => cb.value);

          const input = {
            mode: "m2" as const,
            groupId: groupSelect.value,
            area: parseFloat(areaInput.value) || 0,
            express: ctx.expressMode,
            modifiers
          };

          const result = calculateWlepki(input);
          currentInput = input;
          currentResult = result;

          unitPriceEl.textContent = formatPLN(result.tierPrice);
          basePriceEl.textContent = `${formatPLN(result.basePrice)} (${result.effectiveQuantity} m² × ${formatPLN(result.tierPrice)})`;

          const activeModifierIds = [...input.modifiers];
          if (input.express) activeModifierIds.push("express");

          const modifierLines = activeModifierIds
            .map((modId) => {
              const mod = allModifiers.find((m: any) => m.id === modId);
              if (!mod) return null;

              let amount = 0;
              let details = "";

              if (mod.type === "percent") {
                amount = result.basePrice * mod.value;
                details = `+${(mod.value * 100).toFixed(0)}% × ${formatPLN(result.basePrice)}`;
              } else if (mod.type === "fixed_per_unit") {
                amount = mod.value * result.effectiveQuantity;
                details = `${formatPLN(mod.value)}/m² × ${result.effectiveQuantity} m²`;
              } else {
                amount = mod.value;
                details = "dopłata stała";
              }

              return `
                <div class="result-row">
                  <span>${mod.name} (${details}):</span>
                  <span class="price-value">+${formatPLN(parseFloat(amount.toFixed(2)))}</span>
                </div>
              `;
            })
            .filter(Boolean)
            .join("");

          if (modifierLines) {
            modifiersBreakdownEl.innerHTML = modifierLines;
          } else {
            modifiersBreakdownEl.innerHTML = `
              <div class="result-row">
                <span>Opcje dodatkowe:</span>
                <span class="price-value">brak dopłat</span>
              </div>
            `;
          }
        }

        totalPriceEl.textContent = formatPLN(currentResult.totalPrice);
        resultDiv.style.display = "block";
        addBtn.disabled = false;

        ctx.updateLastCalculated(result.totalPrice, "Wlepki");
      } catch (err) {
        alert("Błąd: " + (err as Error).message);
      }
    };

    calcBtn.addEventListener("click", calculate);

    addBtn.addEventListener("click", () => {
      if (!currentResult || !currentInput) return;

      if (currentInput.mode === "szt") {
        const selectedTitle = pieceTableSelect.options[pieceTableSelect.selectedIndex]?.text ?? "Naklejki sztukowe";
        ctx.cart.addItem({
          id: `wlepki-${Date.now()}`,
          category: "Wlepki / Naklejki",
          name: selectedTitle,
          quantity: currentInput.qty,
          unit: "szt",
          unitPrice: currentResult.unitPrice,
          isExpress: !!currentInput.express,
          totalPrice: currentResult.totalPrice,
          optionsHint: `${currentResult.requestedQty} szt (próg ${currentResult.chargedQty} szt)${currentInput.express ? ", EXPRESS" : ""}`,
          payload: currentResult
        });
      } else {
        const group = tableData.groups.find((g: any) => g.id === currentInput.groupId);

        const modsLabel = currentInput.modifiers.map(mId => {
          const m = tableData.modifiers.find((mod: any) => mod.id === mId);
          return m ? m.name : mId;
        });

        if (currentInput.express) modsLabel.unshift("EXPRESS (+20%)");

        ctx.cart.addItem({
          id: `wlepki-${Date.now()}`,
          category: "Wlepki / Naklejki",
          name: group?.title || "Wlepki",
          quantity: currentInput.area,
          unit: "m2",
          unitPrice: currentResult.tierPrice,
          isExpress: !!currentInput.express,
          totalPrice: currentResult.totalPrice,
          optionsHint: [`${currentInput.area} m²`, ...(modsLabel.length ? modsLabel : ['Standard'])].join(', '),
          payload: currentResult
        });
      }
    });
  }
};
