import { View, ViewContext } from "../types";
import { calculateBanner } from "../../categories/banner";
import { formatPLN } from "../../core/money";
import { getPrice } from "../../services/priceService";
import { resolveStoredPrice } from "../../core/compat";

const bannerData: any = getPrice("banner");

export const BannerView: View = {
  id: "banner",
  name: "Bannery",
  async mount(container, ctx) {
    try {
      const response = await fetch("categories/banner.html");
      if (!response.ok) throw new Error("Failed to load template");
      container.innerHTML = await response.text();

      this.initLogic?.(container, ctx);
    } catch (err) {
      container.innerHTML = `<div class="error">Błąd ładowania: ${err}</div>`;
    }
  },

  initLogic(container: HTMLElement, ctx: ViewContext) {
    const materialSelect = container.querySelector("#b-material") as HTMLSelectElement;
    const widthInput = container.querySelector("#b-width") as HTMLInputElement;
    const heightInput = container.querySelector("#b-height") as HTMLInputElement;
    const areaInput = container.querySelector("#b-area") as HTMLInputElement;
    const oczkowanieCheckbox = container.querySelector("#b-oczkowanie") as HTMLInputElement;
    const calculateBtn = container.querySelector("#b-calculate") as HTMLButtonElement;
    const addToCartBtn = container.querySelector("#b-add-to-cart") as HTMLButtonElement;
    const resultDisplay = container.querySelector("#b-result-display") as HTMLElement;
    const breakdownDisplay = container.querySelector("#b-breakdown-display") as HTMLElement;
    const breakdownLines = container.querySelector("#b-breakdown-lines") as HTMLElement;
    const unitPriceSpan = container.querySelector("#b-unit-price") as HTMLElement;
    const totalPriceSpan = container.querySelector("#b-total-price") as HTMLElement;
    const computedAreaInfo = container.querySelector("#b-computed-area-info") as HTMLElement | null;
    const expressHint = container.querySelector("#b-express-hint") as HTMLElement;

    let currentResult: any = null;
    let currentOptions: any = null;

    const parsePositive = (value: string): number | null => {
      const normalized = (value ?? "").toString().trim().replace(",", ".");
      const parsed = parseFloat(normalized);
      return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
    };

    const computeAreaFromInputs = () => {
      const widthCm = parsePositive(widthInput.value);
      const heightCm = parsePositive(heightInput.value);

      if (widthCm && heightCm) {
        const computedArea = parseFloat(((widthCm * heightCm) / 10_000).toFixed(4));
        areaInput.value = String(computedArea);
        if (computedAreaInfo) {
          computedAreaInfo.innerText = `Wyliczona powierzchnia: ${computedArea} m² (${widthCm} cm × ${heightCm} cm)`;
        }
        return {
          areaM2: computedArea,
          widthCm,
          heightCm
        };
      }

      areaInput.value = "";
      if (computedAreaInfo) {
        computedAreaInfo.innerText = "Wyliczona powierzchnia: -";
      }
      return {
        areaM2: 0,
        widthCm: null,
        heightCm: null
      };
    };

    const syncAreaFromDimensions = () => {
      computeAreaFromInputs();
    };

    widthInput.addEventListener("input", syncAreaFromDimensions);
    heightInput.addEventListener("input", syncAreaFromDimensions);

    const renderBreakdown = (result: any, options: any) => {
      const materialData = bannerData.materials.find((m: any) => m.id === options.material);
      const materialName = materialData?.name ?? options.material;
      const oczkowanieModifier = bannerData.modifiers.find((m: any) => m.id === "oczkowanie");
      const expressModifier = bannerData.modifiers.find((m: any) => m.id === "express");
      const oczkowanieRate = oczkowanieModifier
        ? resolveStoredPrice("banner-oczkowanie", oczkowanieModifier.value)
        : 0;
      const expressRate = expressModifier?.value ?? 0;
      const oczkowanieCost = options.oczkowanie
        ? parseFloat((result.effectiveQuantity * oczkowanieRate).toFixed(2))
        : 0;
      const expressCost = options.express
        ? parseFloat((result.basePrice * expressRate).toFixed(2))
        : 0;

      const lines = [
        `<div><strong>Materiał:</strong> ${materialName}</div>`,
        `<div><strong>Rozliczana powierzchnia:</strong> ${result.effectiveQuantity} m²${result.effectiveQuantity !== options.areaM2 ? ` (z podanej ${options.areaM2} m²)` : ""}</div>`,
        `<div><strong>Próg cenowy:</strong> ${formatPLN(result.tierPrice)} / m²</div>`,
        `<div><strong>Cena bazowa:</strong> ${result.effectiveQuantity} m² × ${formatPLN(result.tierPrice)} = ${formatPLN(result.basePrice)}</div>`,
      ];

      if (options.oczkowanie) {
        lines.push(`<div><strong>Oczkowanie:</strong> ${result.effectiveQuantity} m² × ${formatPLN(oczkowanieRate)} = ${formatPLN(oczkowanieCost)}</div>`);
      } else {
        lines.push(`<div><strong>Oczkowanie:</strong> nie wybrano = ${formatPLN(0)}</div>`);
      }

      if (options.express) {
        lines.push(`<div><strong>EXPRESS:</strong> ${Math.round(expressRate * 100)}% × ${formatPLN(result.basePrice)} = ${formatPLN(expressCost)}</div>`);
      } else {
        lines.push(`<div><strong>EXPRESS:</strong> nie wybrano = ${formatPLN(0)}</div>`);
      }

      lines.push(`<div style="padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.08);"><strong>Razem:</strong> ${formatPLN(result.basePrice)} + ${formatPLN(oczkowanieCost)} + ${formatPLN(expressCost)} = <strong>${formatPLN(result.totalPrice)}</strong></div>`);

      breakdownLines.innerHTML = lines.join("");
      breakdownDisplay.style.display = "block";
    };

    calculateBtn.onclick = () => {
      const { areaM2, widthCm, heightCm } = computeAreaFromInputs();
      if (!areaM2) {
        alert("Błąd: Podaj poprawny rozmiar banera w cm.");
        return;
      }

      currentOptions = {
        material: materialSelect.value,
        areaM2,
        widthCm,
        heightCm,
        oczkowanie: oczkowanieCheckbox.checked,
        express: ctx.expressMode
      };

      try {
        const result = calculateBanner(currentOptions);
        currentResult = result;

        unitPriceSpan.innerText = formatPLN(result.tierPrice);
        totalPriceSpan.innerText = formatPLN(result.totalPrice);
        if (expressHint) expressHint.style.display = ctx.expressMode ? "block" : "none";
        renderBreakdown(result, currentOptions);
        resultDisplay.style.display = "block";
        addToCartBtn.disabled = false;

        ctx.updateLastCalculated(result.totalPrice, "Banner");
      } catch (err) {
        alert("Błąd: " + (err as Error).message);
      }
    };

    addToCartBtn.onclick = () => {
      if (currentResult && currentOptions) {
        const matName = materialSelect.options[materialSelect.selectedIndex].text;
        const opts = [
            currentOptions.widthCm && currentOptions.heightCm
              ? `${currentOptions.widthCm}cm x ${currentOptions.heightCm}cm (${currentOptions.areaM2} m2)`
              : `${currentOptions.areaM2} m2`,
            currentOptions.oczkowanie ? "z oczkowaniem" : "bez oczkowania",
            currentOptions.express ? "EXPRESS" : ""
        ].filter(Boolean).join(", ");

        ctx.cart.addItem({
          id: `banner-${Date.now()}`,
          category: "Bannery",
          name: matName,
          quantity: currentOptions.areaM2,
          unit: "m2",
          unitPrice: currentResult.tierPrice,
          isExpress: currentOptions.express,
          totalPrice: currentResult.totalPrice,
          optionsHint: opts,
          payload: currentResult
        });
      }
    };
  }
};
