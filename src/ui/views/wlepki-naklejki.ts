import { View, ViewContext } from "../types";
import { autoCalc } from "../autoCalc";
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

    const piecePaperGroup = container.querySelector("#wlepki-piece-paper-group") as HTMLElement;
    const pieceFoilGroup = container.querySelector("#wlepki-piece-foil-group") as HTMLElement;
    const areaFoilGroup = container.querySelector("#wlepki-area-foil-group") as HTMLElement;
    const areaFoilFinishGroup = container.querySelector("#wlepki-area-foil-finish-group") as HTMLElement;

    const singleChoiceCheckboxes = (selector: string) =>
      Array.from(container.querySelectorAll(selector) as NodeListOf<HTMLInputElement>);

    const enforceSingleChoice = (selector: string) => {
      const checkboxes = singleChoiceCheckboxes(selector);
      checkboxes.forEach((checkbox) => {
        checkbox.addEventListener("change", () => {
          if (!checkbox.checked) return;
          checkboxes.forEach((other) => {
            if (other !== checkbox) other.checked = false;
          });
        });
      });
    };

    enforceSingleChoice(".wlepki-piece-paper");
    enforceSingleChoice(".wlepki-piece-foil");
    enforceSingleChoice(".wlepki-area-foil");
    enforceSingleChoice(".wlepki-area-foil-finish");

    const getSelectedValue = (selector: string): string | undefined => {
      const checked = container.querySelector(`${selector}:checked`) as HTMLInputElement | null;
      return checked?.value;
    };

    let currentResult: any = null;
    let currentInput:
      | (WlepkiCalculation & { mode: "m2"; foilType?: "biala" | "transparentna"; foilFinish?: "mat" | "blysk" })
      | ({
          mode: "szt";
          tableId: string;
          qty: number;
          express?: boolean;
          paperFinish?: "mat" | "blysk";
          foilType?: "biala" | "transparentna";
        })
      | null = null;

    const syncMode = () => {
      const mode = modeSelect.value === "szt" ? "szt" : "m2";
      pieceGroup.style.display = mode === "szt" ? "" : "none";
      areaGroup.style.display = mode === "m2" ? "" : "none";
      modifiersGroup.style.display = mode === "m2" ? "" : "none";

      const selectedTable = pieceTableSelect.value;
      const requiresPaperFinish = selectedTable === "papier-sra3";
      const requiresPieceFoilType = selectedTable.includes("folia");
      const selectedGroup = groupSelect.value;
      const requiresAreaFoilType = selectedGroup.includes("folia");

      piecePaperGroup.style.display = mode === "szt" && requiresPaperFinish ? "" : "none";
      pieceFoilGroup.style.display = mode === "szt" && requiresPieceFoilType ? "" : "none";
      areaFoilGroup.style.display = mode === "m2" && requiresAreaFoilType ? "" : "none";
      areaFoilFinishGroup.style.display = mode === "m2" && requiresAreaFoilType ? "" : "none";

      if (mode === "szt") {
        unitLabelEl.textContent = "Cena wg progu:";
        baseLabelEl.textContent = "Ilość rozliczona:";
      } else {
        unitLabelEl.textContent = "Cena za m2:";
        baseLabelEl.textContent = "Baza (rozliczone m²):";
      }
    };

    modeSelect.addEventListener("change", syncMode);
  pieceTableSelect.addEventListener("change", syncMode);
  groupSelect.addEventListener("change", syncMode);
    syncMode();

    const calculate = () => {
      const mode = modeSelect.value === "szt" ? "szt" : "m2";

      if (mode === "szt" && !pieceTableSelect.value) {
        resultDiv.style.display = "none";
        addBtn.disabled = true;
        return;
      }
      if (mode === "m2" && !groupSelect.value) {
        resultDiv.style.display = "none";
        addBtn.disabled = true;
        return;
      }

      try {
        if (mode === "szt") {
          const selectedTable = pieceTableSelect.value;
          const paperFinish = getSelectedValue(".wlepki-piece-paper") as "mat" | "blysk" | undefined;
          const foilType = getSelectedValue(".wlepki-piece-foil") as "biala" | "transparentna" | undefined;

          if (selectedTable === "papier-sra3" && !paperFinish) {
            throw new Error("Dla Papier SRA3 wybierz: mat albo błysk.");
          }

          if (selectedTable.includes("folia") && !foilType) {
            throw new Error("Dla opcji foliowej wybierz: folia biała albo transparentna.");
          }

          const input = {
            mode: "szt" as const,
            tableId: selectedTable,
            qty: parseInt(pieceQtyInput.value, 10) || 1,
            express: ctx.expressMode,
            paperFinish,
            foilType,
          };
          const result = calculateWlepkiSzt(input);
          currentInput = input;
          currentResult = result;

          unitPriceEl.textContent = formatPLN(result.unitPrice);
          basePriceEl.textContent = `${result.requestedQty} szt (próg: ${result.chargedQty} szt)`;

          const technicalDetails: string[] = [];
          if (input.paperFinish) technicalDetails.push(`Papier: ${input.paperFinish === "mat" ? "mat" : "błysk"}`);
          if (input.foilType) technicalDetails.push(`Folia: ${input.foilType === "biala" ? "biała" : "transparentna"}`);

          modifiersBreakdownEl.innerHTML = result.modifiersTotal > 0
            ? `<div class="result-row"><span>Dopłata EXPRESS:</span><span class="price-value">+${formatPLN(result.modifiersTotal)}</span></div>${technicalDetails.length ? `<div class="result-row"><span>Specyfikacja:</span><span class="price-value">${technicalDetails.join(", ")}</span></div>` : ""}`
            : `<div class="result-row"><span>Opcje dodatkowe:</span><span class="price-value">${technicalDetails.length ? technicalDetails.join(", ") : "brak dopłat"}</span></div>`;
        } else {
          const modCheckboxes = container.querySelectorAll(".wlepki-mod:checked") as NodeListOf<HTMLInputElement>;
          const modifiers = Array.from(modCheckboxes).map(cb => cb.value);
          const foilType = getSelectedValue(".wlepki-area-foil") as "biala" | "transparentna" | undefined;

          if (groupSelect.value.includes("folia") && !foilType) {
            throw new Error("Dla opcji foliowej wybierz: folia biała albo transparentna.");
          }

          const foilFinish = getSelectedValue(".wlepki-area-foil-finish") as "mat" | "blysk" | undefined;

          if (groupSelect.value.includes("folia") && !foilFinish) {
            throw new Error("Dla opcji foliowej wybierz wykończenie: mat albo błysk.");
          }

          const input = {
            mode: "m2" as const,
            groupId: groupSelect.value,
            area: parseFloat(areaInput.value) || 0,
            express: ctx.expressMode,
            modifiers,
            foilType,
            foilFinish,
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

          const foilDetails = input.foilType
            ? `<div class="result-row"><span>Kolor folii:</span><span class="price-value">${input.foilType === "biala" ? "biała" : "transparentna"}</span></div>${input.foilFinish ? `<div class="result-row"><span>Wykończenie folii:</span><span class="price-value">${input.foilFinish === "mat" ? "mat" : "błysk"}</span></div>` : ""}`
            : "";

          if (modifierLines || foilDetails) {
            modifiersBreakdownEl.innerHTML = modifierLines;
            modifiersBreakdownEl.innerHTML += foilDetails;
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

        ctx.updateLastCalculated(currentResult.totalPrice, "Wlepki");
      } catch (err) {
        resultDiv.style.display = "none";
        addBtn.disabled = true;
      }
    };

    autoCalc({ root: container, calc: calculate });

    addBtn.addEventListener("click", () => {
      if (!currentResult || !currentInput) return;

      if (currentInput.mode === "szt") {
        const selectedTitle = pieceTableSelect.options[pieceTableSelect.selectedIndex]?.text ?? "Naklejki sztukowe";
        const technical: string[] = [];
        if (currentInput.paperFinish) technical.push(`Papier: ${currentInput.paperFinish === "mat" ? "mat" : "błysk"}`);
        if (currentInput.foilType) technical.push(`Folia: ${currentInput.foilType === "biala" ? "biała" : "transparentna"}`);
        ctx.cart.addItem({
          id: `wlepki-${Date.now()}`,
          category: "Wlepki / Naklejki",
          name: selectedTitle,
          quantity: currentInput.qty,
          unit: "szt",
          unitPrice: currentResult.unitPrice,
          isExpress: !!currentInput.express,
          totalPrice: currentResult.totalPrice,
          optionsHint: `${currentResult.requestedQty} szt (próg ${currentResult.chargedQty} szt)${technical.length ? `, ${technical.join(", ")}` : ""}${currentInput.express ? ", EXPRESS" : ""}`,
          payload: {
            ...currentResult,
            pieceTableId: currentInput.tableId,
            paperFinish: currentInput.paperFinish,
            foilType: currentInput.foilType,
          }
        });
      } else {
        const currentInputM2 = currentInput;
        const group = tableData.groups.find((g: any) => g.id === currentInputM2.groupId);

        const modsLabel = currentInputM2.modifiers.map(mId => {
          const m = tableData.modifiers.find((mod: any) => mod.id === mId);
          return m ? m.name : mId;
        });

        if (currentInputM2.foilType) {
          modsLabel.push(`Kolor: ${currentInputM2.foilType === "biala" ? "biała" : "transparentna"}`);
        }
        if (currentInputM2.foilFinish) {
          modsLabel.push(`Wykończenie: ${currentInputM2.foilFinish === "mat" ? "mat" : "błysk"}`);
        }

        if (currentInputM2.express) modsLabel.unshift("EXPRESS (+20%)");

        ctx.cart.addItem({
          id: `wlepki-${Date.now()}`,
          category: "Wlepki / Naklejki",
          name: group?.title || "Wlepki",
          quantity: currentInputM2.area,
          unit: "m2",
          unitPrice: currentResult.tierPrice,
          isExpress: !!currentInputM2.express,
          totalPrice: currentResult.totalPrice,
          optionsHint: [`${currentInputM2.area} m²`, ...(modsLabel.length ? modsLabel : ['Standard'])].join(', '),
          payload: {
            ...currentResult,
            groupId: currentInputM2.groupId,
            foilType: currentInputM2.foilType,
            foilFinish: currentInputM2.foilFinish,
          }
        });
      }
    });
  }
};
