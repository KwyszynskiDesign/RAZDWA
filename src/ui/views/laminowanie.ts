import { View, ViewContext } from "../types";
import { quoteLaminowanie, quoteIntroligatornia } from "../../categories/laminowanie";
import { formatPLN } from "../../core/money";

const BINDOWANIE_PRICES = {
  plastik: {
    "1-50": { do20: 7.00, "21-100": 5.00, "100+": 4.00 },
    "51-100": { do20: 9.00, "21-100": 8.00, "100+": 7.00 },
    "101-200": { do20: 13.00, "21-100": 12.00, "100+": 11.00 }
  },
  metal: {
    "1-50": { do40: 11.00, do80: 13.00, do120: 15.00 },
    "51-100": { do40: 10.00, do80: 11.00, do120: 13.00 }
  }
} as const;

const OPRAWY_PRICES = {
  grzbietowa: {
    do50: { A4: 3.50, A3: 7.00 },
    do60: { A4: 4.50, A3: 8.00 },
    do90: { A4: 5.50, A3: 9.00 },
    do150: { A4: 7.00, A3: 14.00 }
  },
  kanałowa: {
    standard: 35.00,
    pozostale: 35.00
  },
  zaciskowa: {
    miękka: 15.00
  },
  zbijana: {
    standard: 15.00
  }
} as const;

function getBindingUnitPrice(type: "plastik" | "metal", qty: number, pages: number): number {
  const tier = qty >= 101 ? "101-200" : qty >= 51 ? "51-100" : "1-50";

  if (type === "plastik") {
    const row = BINDOWANIE_PRICES.plastik[tier];
    if (pages <= 20) return row.do20;
    if (pages <= 100) return row["21-100"];
    return row["100+"];
  }

  const row = BINDOWANIE_PRICES.metal[tier === "101-200" ? "51-100" : tier];
  if (pages <= 40) return row.do40;
  if (pages <= 80) return row.do80;
  return row.do120;
}

function getOprUnitPrice(
  type: "grzbietowa" | "kanałowa" | "zaciskowa" | "zbijana",
  format: "A4" | "A3",
  pages: number,
  color: string
): number {
  if (type === "grzbietowa") {
    if (pages <= 50) return OPRAWY_PRICES.grzbietowa.do50[format];
    if (pages <= 60) return OPRAWY_PRICES.grzbietowa.do60[format];
    if (pages <= 90) return OPRAWY_PRICES.grzbietowa.do90[format];
    return OPRAWY_PRICES.grzbietowa.do150[format];
  }

  if (type === "kanałowa") {
    return color === "pozostale" ? OPRAWY_PRICES.kanałowa.pozostale : OPRAWY_PRICES.kanałowa.standard;
  }

  if (type === "zaciskowa") {
    return OPRAWY_PRICES.zaciskowa.miękka;
  }

  return OPRAWY_PRICES.zbijana.standard;
}

export const LaminowanieView: View = {
  id: "laminowanie",
  name: "Introligatornia",
  async mount(container, ctx) {
    try {
      const response = await fetch("categories/laminowanie.html");
      if (!response.ok) throw new Error("Failed to load template");
      container.innerHTML = await response.text();

      this.initLogic(container, ctx);
    } catch (err) {
      container.innerHTML = `<div class="error">Błąd ładowania: ${err}</div>`;
    }
  },

  initLogic(container: HTMLElement, ctx: ViewContext) {
    const tabBtns = Array.from(container.querySelectorAll<HTMLButtonElement>(".tab-btn"));
    const tabContents = Array.from(container.querySelectorAll<HTMLElement>(".tab-content"));

    tabBtns.forEach(btn => {
      btn.onclick = () => {
        const targetTab = btn.dataset.tab;
        tabBtns.forEach(b => {
          b.classList.remove("active");
          b.style.borderBottom = "3px solid transparent";
        });
        btn.classList.add("active");
        btn.style.borderBottom = "3px solid #2B8A3E";

        tabContents.forEach(content => {
          content.style.display = content.id === `tab-${targetTab}` ? "block" : "none";
        });
      };
    });

    const formatSelect = container.querySelector("#lam-format") as HTMLSelectElement;
    const qtyInput = container.querySelector("#lam-qty") as HTMLInputElement;
    const calculateBtn = container.querySelector("#lam-calculate") as HTMLButtonElement;
    const addToCartBtn = container.querySelector("#lam-add-to-cart") as HTMLButtonElement;
    const resultDisplay = container.querySelector("#lam-result-display") as HTMLElement;
    const unitPriceSpan = container.querySelector("#lam-unit-price") as HTMLElement;
    const totalPriceSpan = container.querySelector("#lam-total-price") as HTMLElement;
    const qtyHintSpan = container.querySelector("#lam-qty-hint") as HTMLElement;
    const expressHint = container.querySelector("#lam-express-hint") as HTMLElement;

    let currentResult: any = null;
    let currentOptions: any = null;

    const performCalculation = () => {
        const qty = parseInt(qtyInput.value);
        if (isNaN(qty) || qty <= 0) return;

        currentOptions = {
          format: formatSelect.value,
          qty: qty,
          express: ctx.expressMode
        };

        try {
          const result = quoteLaminowanie(currentOptions);
          currentResult = result;

          totalPriceSpan.innerText = formatPLN(result.totalPrice);
          if (unitPriceSpan) unitPriceSpan.innerText = formatPLN(result.totalPrice / qty);
          if (qtyHintSpan) qtyHintSpan.innerText = `${qty} szt × ${formatPLN(result.totalPrice / qty)}, format: ${currentOptions.format}`;
          if (expressHint) expressHint.style.display = ctx.expressMode ? "block" : "none";
          resultDisplay.style.display = "block";
          addToCartBtn.disabled = false;

          ctx.updateLastCalculated(result.totalPrice, "Introligatornia - laminowanie");
        } catch {
          // calculation error — result remains unchanged
        }
    };

    calculateBtn.onclick = performCalculation;

    addToCartBtn.onclick = () => {
      if (currentResult && currentOptions) {
        const expressLabel = currentOptions.express ? ', EXPRESS' : '';

        ctx.cart.addItem({
          id: `laminowanie-${Date.now()}`,
          category: "Introligatornia",
          name: `Laminowanie ${currentOptions.format}`,
          quantity: currentOptions.qty,
          unit: "szt",
          unitPrice: currentResult.totalPrice / currentOptions.qty,
          isExpress: currentOptions.express,
          totalPrice: currentResult.totalPrice,
          optionsHint: `${currentOptions.qty} szt, Format ${currentOptions.format}${expressLabel}`,
          payload: currentResult
        });
      }
    };

    const bindTypeChecks = Array.from(container.querySelectorAll<HTMLInputElement>(".bind-type-check"));
    const bindColorChecks = Array.from(container.querySelectorAll<HTMLInputElement>(".bind-color-check"));
    const bindQty = container.querySelector("#bind-qty") as HTMLInputElement | null;
    const bindPages = container.querySelector("#bind-pages") as HTMLInputElement | null;
    const bindCalculateBtn = container.querySelector("#bind-calculate") as HTMLButtonElement | null;
    const bindAddBtn = container.querySelector("#bind-add-to-cart") as HTMLButtonElement | null;
    const bindResultDisplay = container.querySelector("#bind-result-display") as HTMLElement | null;
    const bindUnitPrice = container.querySelector("#bind-unit-price") as HTMLElement | null;
    const bindTotalPrice = container.querySelector("#bind-total-price") as HTMLElement | null;

    const enforceSingleChoice = (checks: HTMLInputElement[]) => {
      checks.forEach((check) => {
        check.addEventListener("change", () => {
          if (!check.checked) {
            check.checked = true;
            return;
          }
          checks.forEach(other => {
            if (other !== check) other.checked = false;
          });
        });
      });
    };

    enforceSingleChoice(bindTypeChecks);
    enforceSingleChoice(bindColorChecks);

    let bindState: {
      type: "plastik" | "metal";
      subtype: "spirala" | "listwa";
      color: "czarny" | "biały";
      qty: number;
      pages: number;
      unitPrice: number;
      total: number;
    } | null = null;

    bindCalculateBtn?.addEventListener("click", () => {
      if (!bindQty || !bindPages) return;

      const selectedType = bindTypeChecks.find(c => c.checked);
      const selectedColor = bindColorChecks.find(c => c.checked);
      if (!selectedType || !selectedColor) return;

      const type = ((selectedType.dataset.type === "metal") ? "metal" : "plastik") as "plastik" | "metal";
      const subtype = ((selectedType.dataset.subtype === "listwa") ? "listwa" : "spirala") as "spirala" | "listwa";
      const color = ((selectedColor.value === "biały") ? "biały" : "czarny") as "czarny" | "biały";
      const qty = parseInt(bindQty.value, 10) || 1;
      const pages = parseInt(bindPages.value, 10) || 1;
      const unitPrice = getBindingUnitPrice(type, qty, pages);
      const expressFactor = ctx.expressMode ? 1.2 : 1;
      const total = parseFloat((unitPrice * qty * expressFactor).toFixed(2));

      bindState = { type, subtype, color, qty, pages, unitPrice, total };
      if (bindUnitPrice) bindUnitPrice.innerText = formatPLN(unitPrice * expressFactor);
      if (bindTotalPrice) bindTotalPrice.innerText = formatPLN(total);
      if (bindResultDisplay) bindResultDisplay.style.display = "block";
      if (bindAddBtn) bindAddBtn.disabled = false;

      ctx.updateLastCalculated(total, "Bindowanie");
    });

    bindAddBtn?.addEventListener("click", () => {
      if (!bindState) return;

      ctx.cart.addItem({
        id: `bindowanie-${Date.now()}`,
        category: "Introligatornia",
        name: `Bindowanie ${bindState.type === "plastik" ? "plastik" : "metal"} ${bindState.subtype}`,
        quantity: bindState.qty,
        unit: "szt",
        unitPrice: bindState.total / bindState.qty,
        isExpress: ctx.expressMode,
        totalPrice: bindState.total,
        optionsHint: `${bindState.qty} szt., ${bindState.pages} kartek, ${bindState.type}/${bindState.subtype}, kolor: ${bindState.color}`,
        payload: bindState
      });
    });

    const oprType = container.querySelector("#opr-type") as HTMLSelectElement | null;
    const oprFormat = container.querySelector("#opr-format") as HTMLSelectElement | null;
    const oprPages = container.querySelector("#opr-pages") as HTMLInputElement | null;
    const oprQty = container.querySelector("#opr-qty") as HTMLInputElement | null;
    const oprColor = container.querySelector("#opr-color") as HTMLSelectElement | null;
    const oprCustomColor = container.querySelector("#opr-custom-color") as HTMLInputElement | null;
    const oprColorRow = container.querySelector("#opr-color-row") as HTMLElement | null;
    const oprCustomColorRow = container.querySelector("#opr-custom-color-row") as HTMLElement | null;
    const oprFormatRow = container.querySelector("#opr-format-row") as HTMLElement | null;
    const oprPagesRow = container.querySelector("#opr-pages-row") as HTMLElement | null;
    const oprCalculateBtn = container.querySelector("#opr-calculate") as HTMLButtonElement | null;
    const oprAddBtn = container.querySelector("#opr-add-to-cart") as HTMLButtonElement | null;
    const oprResultDisplay = container.querySelector("#opr-result-display") as HTMLElement | null;
    const oprUnitPrice = container.querySelector("#opr-unit-price") as HTMLElement | null;
    const oprTotalPrice = container.querySelector("#opr-total-price") as HTMLElement | null;

    let oprState: {
      type: "grzbietowa" | "kanałowa" | "zaciskowa" | "zbijana";
      format: "A4" | "A3";
      pages: number;
      qty: number;
      color: string;
      customColor?: string;
      unitPrice: number;
      total: number;
    } | null = null;

    const syncOprCustomColorRow = () => {
      if (!oprColor || !oprCustomColorRow) return;
      oprCustomColorRow.style.display = oprColor.value === "pozostale" ? "" : "none";
    };

    const syncOprRows = () => {
      if (!oprType || !oprColorRow || !oprFormatRow || !oprPagesRow || !oprCustomColorRow) return;
      const type = oprType.value;
      if (type === "grzbietowa") {
        oprFormatRow.style.display = "";
        oprPagesRow.style.display = "";
        oprColorRow.style.display = "none";
        oprCustomColorRow.style.display = "none";
      } else if (type === "kanałowa") {
        oprFormatRow.style.display = "none";
        oprPagesRow.style.display = "none";
        oprColorRow.style.display = "";
        syncOprCustomColorRow();
      } else {
        oprFormatRow.style.display = "none";
        oprPagesRow.style.display = "none";
        oprColorRow.style.display = "none";
        oprCustomColorRow.style.display = "none";
      }
    };

    oprType?.addEventListener("change", syncOprRows);
    oprColor?.addEventListener("change", syncOprCustomColorRow);
    syncOprRows();

    oprCalculateBtn?.addEventListener("click", () => {
      if (!oprType || !oprFormat || !oprPages || !oprQty || !oprColor) return;
      const type = (oprType.value === "kanałowa" || oprType.value === "zaciskowa"
        || oprType.value === "zbijana"
        ? oprType.value
        : "grzbietowa") as "grzbietowa" | "kanałowa" | "zaciskowa" | "zbijana";
      const format = (oprFormat.value === "A3" ? "A3" : "A4") as "A4" | "A3";
      const pages = parseInt(oprPages.value, 10) || 1;
      const qty = parseInt(oprQty.value, 10) || 1;
      const color = oprColor.value;
      const customColor = color === "pozostale" ? (oprCustomColor?.value?.trim() || "") : "";
      const unitPrice = getOprUnitPrice(type, format, pages, color);
      const expressFactor = ctx.expressMode ? 1.2 : 1;
      const total = parseFloat((unitPrice * qty * expressFactor).toFixed(2));

      oprState = { type, format, pages, qty, color, customColor, unitPrice, total };
      if (oprUnitPrice) oprUnitPrice.innerText = formatPLN(unitPrice * expressFactor);
      if (oprTotalPrice) oprTotalPrice.innerText = formatPLN(total);
      if (oprResultDisplay) oprResultDisplay.style.display = "block";
      if (oprAddBtn) oprAddBtn.disabled = false;

      ctx.updateLastCalculated(total, "Oprawy");
    });

    oprAddBtn?.addEventListener("click", () => {
      if (!oprState) return;

      ctx.cart.addItem({
        id: `oprawa-${Date.now()}`,
        category: "Introligatornia",
        name: `Oprawa ${oprState.type}`,
        quantity: oprState.qty,
        unit: "szt",
        unitPrice: oprState.total / oprState.qty,
        isExpress: ctx.expressMode,
        totalPrice: oprState.total,
        optionsHint: oprState.type === "grzbietowa"
          ? `${oprState.format}, ${oprState.pages} str.`
          : oprState.type === "kanałowa"
            ? `kolor: ${oprState.color === "pozostale" ? (oprState.customColor || "pozostałe") : oprState.color}`
            : oprState.type,
        payload: oprState
      });
    });

    // Auto update on input change
    [formatSelect, qtyInput].forEach(el => {
        el.addEventListener('change', performCalculation);
    });
    qtyInput.addEventListener('input', performCalculation);

    const introService = container.querySelector("#intro-service") as HTMLSelectElement | null;
    const introQty = container.querySelector("#intro-qty") as HTMLInputElement | null;
    const introCalcBtn = container.querySelector("#intro-calculate") as HTMLButtonElement | null;
    const introAddBtn = container.querySelector("#intro-add-to-cart") as HTMLButtonElement | null;
    const introResultDisplay = container.querySelector("#intro-result-display") as HTMLElement | null;
    const introUnitPrice = container.querySelector("#intro-unit-price") as HTMLElement | null;
    const introTotalPrice = container.querySelector("#intro-total-price") as HTMLElement | null;
    const introExpressHint = container.querySelector("#intro-express-hint") as HTMLElement | null;

    let introState: ReturnType<typeof quoteIntroligatornia> | null = null;

    introCalcBtn?.addEventListener("click", () => {
      if (!introService || !introQty) return;
      try {
        const result = quoteIntroligatornia({
          serviceId: introService.value,
          qty: parseInt(introQty.value, 10) || 1,
          express: ctx.expressMode,
        });

        introState = result;
        if (introUnitPrice) introUnitPrice.innerText = formatPLN(result.totalPrice / result.qty);
        if (introTotalPrice) introTotalPrice.innerText = formatPLN(result.totalPrice);
        if (introExpressHint) introExpressHint.style.display = ctx.expressMode ? "block" : "none";
        if (introResultDisplay) introResultDisplay.style.display = "block";
        if (introAddBtn) introAddBtn.disabled = false;
        ctx.updateLastCalculated(result.totalPrice, "Introligatornia");
      } catch {
        // noop
      }
    });

    introAddBtn?.addEventListener("click", () => {
      if (!introState) return;
      ctx.cart.addItem({
        id: `intro-${Date.now()}`,
        category: "Introligatornia",
        name: `Introligatornia: ${introState.serviceName}`,
        quantity: introState.qty,
        unit: "szt",
        unitPrice: introState.totalPrice / introState.qty,
        isExpress: ctx.expressMode,
        totalPrice: introState.totalPrice,
        optionsHint: `${introState.qty} operacji${ctx.expressMode ? ", EXPRESS" : ""}`,
        payload: introState
      });
    });

  }
};
