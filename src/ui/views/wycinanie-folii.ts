import { View, ViewContext } from "../types";
import { calculateWycinanieFolii, WycinanieFoliiOptions } from "../../categories/wycinanie-folii";
import { formatPLN } from "../../core/money";

export const WycinanieFoliiView: View = {
  id: "wycinanie-folii",
  name: "Wycinanie z folii",
  async mount(container, ctx) {
    try {
      const response = await fetch("categories/wycinanie-folii.html");
      if (!response.ok) throw new Error("Failed to load template");
      container.innerHTML = await response.text();
      this.initLogic(container, ctx);
    } catch (err) {
      container.innerHTML = `<div class="error">BĹ‚Ä…d Ĺ‚adowania: ${err}</div>`;
    }
  },

  initLogic(container: HTMLElement, ctx: ViewContext) {
    const widthInput = container.querySelector("#wf-width") as HTMLInputElement;
    const heightInput = container.querySelector("#wf-height") as HTMLInputElement;
    const colorInput = container.querySelector("#wf-color") as HTMLInputElement;
    const goldCheck = container.querySelector("#wf-gold") as HTMLInputElement;
    const silverCheck = container.querySelector("#wf-silver") as HTMLInputElement;
    const customCheck = container.querySelector("#wf-custom") as HTMLInputElement;
    const foilTypeCheckboxes = container.querySelectorAll(".wf-foil-type") as NodeListOf<HTMLInputElement>;
    const calcBtn = container.querySelector("#wf-calculate") as HTMLButtonElement;
    const addBtn = container.querySelector("#wf-add-to-cart") as HTMLButtonElement;

    const resultEl = container.querySelector("#wf-result") as HTMLElement;
    const areaEl = container.querySelector("#wf-area") as HTMLElement;
    const unitEl = container.querySelector("#wf-unit") as HTMLElement;
    const totalEl = container.querySelector("#wf-total") as HTMLElement;
    const expressEl = container.querySelector("#wf-express") as HTMLElement;

    let currentOptions: (WycinanieFoliiOptions & { color?: string }) | null = null;
    let currentResult: any = null;

    // Single-choice for foil type
    const enforceSingleChoiceFoilType = () => {
      foilTypeCheckboxes.forEach((checkbox) => {
        checkbox.addEventListener("change", () => {
          if (!checkbox.checked) return;
          foilTypeCheckboxes.forEach((other) => {
            if (other !== checkbox) other.checked = false;
          });
        });
      });
    };
    enforceSingleChoiceFoilType();

    const getSelectedColor = (): string | undefined => {
      if (goldCheck.checked) return "zĹ‚ota";
      if (silverCheck.checked) return "srebrna";
      if (customCheck.checked) {
        const custom = (colorInput?.value || "").trim();
        return custom || undefined;
      }
      return undefined;
    };

    const calculate = () => {
      const options: WycinanieFoliiOptions = {
        variantId: "kolorowa" as WycinanieFoliiOptions["variantId"],
        widthMm: parseInt(widthInput.value) || 0,
        heightMm: parseInt(heightInput.value) || 0,
        express: ctx.expressMode
      };
      const color = getSelectedColor();

      const result = calculateWycinanieFolii(options);
      const areaM2 = (options.widthMm * options.heightMm) / 1_000_000;

      areaEl.innerText = `${areaM2.toFixed(2)} m2`;
      unitEl.innerText = formatPLN(result.tierPrice);
      totalEl.innerText = formatPLN(result.totalPrice);
      expressEl.style.display = options.express ? "block" : "none";
      resultEl.style.display = "block";
      addBtn.disabled = false;

      currentOptions = {
        ...options,
        color: color || undefined
      };
      currentResult = result;
      ctx.updateLastCalculated(result.totalPrice, "Wycinanie z folii");
    };

    calcBtn.onclick = () => {
      try {
        calculate();
      } catch (err) {
        alert("BĹ‚Ä…d: " + (err as Error).message);
      }
    };

    addBtn.onclick = () => {
      if (!currentOptions || !currentResult) return;

      const foilName = (currentOptions.color ? `Folia ${currentOptions.color}` : "Wycinanie z folii");
      const areaM2 = (currentOptions.widthMm * currentOptions.heightMm) / 1_000_000;
      const colorHint = currentOptions.color ? `, kolor: ${currentOptions.color}` : "";

      ctx.cart.addItem({
        id: `wycinanie-${Date.now()}`,
        category: "Wycinanie z folii",
        name: foilName,
        quantity: areaM2,
        unit: "m2",
        unitPrice: currentResult.tierPrice,
        isExpress: currentOptions.express,
        totalPrice: currentResult.totalPrice,
        optionsHint: `${currentOptions.widthMm}x${currentOptions.heightMm} mm, ${areaM2.toFixed(2)} m2${colorHint}${currentOptions.express ? ", EXPRESS" : ""}`,
        payload: {
          ...currentOptions,
          ...currentResult
        }
      });
    };


  }
};
