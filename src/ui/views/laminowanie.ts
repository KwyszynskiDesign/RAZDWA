import { View, ViewContext } from "../types";
import { quoteLaminowanie, quoteIntroligatornia } from "../../categories/laminowanie";
import { formatPLN } from "../../core/money";
import { resolveStoredPrice } from "../../core/compat";

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
    standard: 25.00,
    pozostale: 35.00,
    bezNapisu: 20.00,
    wkarta: 10.00
  },
  zaciskowa: {
    miękka: 15.00
  },
  zbijana: {
    zbijanePrintedHere: resolveStoredPrice("laminowanie-oprawa-zbijane-printed-here", 50.00),
    skrecanePrintedHere: resolveStoredPrice("laminowanie-oprawa-skrecane-printed-here", 60.00),
    zbijaneClientSupplied: resolveStoredPrice("laminowanie-oprawa-zbijane-client-supplied", 60.00),
    skrecaneClientSupplied: resolveStoredPrice("laminowanie-oprawa-skrecane-client-supplied", 70.00),
  }
} as const;

const OPRAWY_CD_PRICE_RAW = resolveStoredPrice(
  "artykuly-plyty-cd",
  resolveStoredPrice("uslugi-archiwizacja-cd", resolveStoredPrice("artykuly-plyty-dvd", 3.2))
);
const OPRAWY_CD_PRICE = Number.isFinite(OPRAWY_CD_PRICE_RAW) && OPRAWY_CD_PRICE_RAW > 0
  ? OPRAWY_CD_PRICE_RAW
  : 3.2;
const OPRAWA_TWARDA_ROZSZYCIE_DEFAULT = resolveStoredPrice("laminowanie-oprawa-twarda-rozszycie", 25);
const OPRAWA_TWARDA_PONOWNE_ZSZYCIE_DEFAULT = resolveStoredPrice("laminowanie-oprawa-twarda-ponowne-zszycie", 25);

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
    if (color === "bezNapisu") return OPRAWY_PRICES.kanałowa.bezNapisu;
    if (color === "wkarta") return OPRAWY_PRICES.kanałowa.wkarta;
    return color === "pozostale" ? OPRAWY_PRICES.kanałowa.pozostale : OPRAWY_PRICES.kanałowa.standard;
  }

  if (type === "zaciskowa") {
    return OPRAWY_PRICES.zaciskowa.miękka;
  }

  return OPRAWY_PRICES.zbijana.zbijanePrintedHere;
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
    const oprDocSource = container.querySelector("#opr-doc-source") as HTMLSelectElement | null;
    const oprQty = container.querySelector("#opr-qty") as HTMLInputElement | null;
    const oprGrzbietColor = container.querySelector("#opr-grzbiet-color") as HTMLSelectElement | null;
    const oprColor = container.querySelector("#opr-color") as HTMLSelectElement | null;
    const oprCustomColor = container.querySelector("#opr-custom-color") as HTMLInputElement | null;
    const oprGrzbietColorRow = container.querySelector("#opr-grzbiet-color-row") as HTMLElement | null;
    const oprColorRow = container.querySelector("#opr-color-row") as HTMLElement | null;
    const oprCustomColorRow = container.querySelector("#opr-custom-color-row") as HTMLElement | null;
    const oprFormatRow = container.querySelector("#opr-format-row") as HTMLElement | null;
    const oprPagesRow = container.querySelector("#opr-pages-row") as HTMLElement | null;
    const oprCalculateBtn = container.querySelector("#opr-calculate") as HTMLButtonElement | null;
    const oprAddBtn = container.querySelector("#opr-add-to-cart") as HTMLButtonElement | null;
    const oprResultDisplay = container.querySelector("#opr-result-display") as HTMLElement | null;
    const oprUnitPrice = container.querySelector("#opr-unit-price") as HTMLElement | null;
    const oprTotalPrice = container.querySelector("#opr-total-price") as HTMLElement | null;
    const oprExpressHint = container.querySelector("#opr-express-hint") as HTMLElement | null;
    const oprRozszycieRow = container.querySelector("#opr-rozszycie-row") as HTMLElement | null;
    const oprHardUnbindCheck = container.querySelector("#opr-hard-unbind-check") as HTMLInputElement | null;
    const oprHardUnbindPrice = container.querySelector("#opr-hard-unbind-price") as HTMLInputElement | null;
    const oprHardResewCheck = container.querySelector("#opr-hard-resew-check") as HTMLInputElement | null;
    const oprHardResewPrice = container.querySelector("#opr-hard-resew-price") as HTMLInputElement | null;
    const oprCdCheck = container.querySelector("#opr-cd-check") as HTMLInputElement | null;
    const oprCdLabel = container.querySelector("#opr-cd-label") as HTMLElement | null;
    const oprDocSourceRow = container.querySelector("#opr-doc-source-row") as HTMLElement | null;
    const oprZbijaneInfoWrap = container.querySelector("#opr-zbijane-info-wrap") as HTMLElement | null;
    const oprZbPriceZbijaneUs = container.querySelector("#opr-zb-price-zbijane-us") as HTMLElement | null;
    const oprZbPriceZbijaneClient = container.querySelector("#opr-zb-price-zbijane-client") as HTMLElement | null;
    const oprZbPriceSkrecaneUs = container.querySelector("#opr-zb-price-skrecane-us") as HTMLElement | null;
    const oprZbPriceSkrecaneClient = container.querySelector("#opr-zb-price-skrecane-client") as HTMLElement | null;
    const oprServiceExtraInput = container.querySelector("#opr-service-extra-input") as HTMLInputElement | null;
    const oprExtraButtons = Array.from(container.querySelectorAll<HTMLButtonElement>(".opr-extra-btn"));

    if (oprCdLabel) {
      oprCdLabel.innerText = `Tak (+${formatPLN(OPRAWY_CD_PRICE)})`;
    }

    if (oprHardUnbindPrice) {
      oprHardUnbindPrice.value = OPRAWA_TWARDA_ROZSZYCIE_DEFAULT.toString();
    }

    if (oprHardResewPrice) {
      oprHardResewPrice.value = OPRAWA_TWARDA_PONOWNE_ZSZYCIE_DEFAULT.toString();
    }

    if (oprZbPriceZbijaneUs) {
      oprZbPriceZbijaneUs.innerText = formatPLN(OPRAWY_PRICES.zbijana.zbijanePrintedHere);
    }

    if (oprZbPriceZbijaneClient) {
      oprZbPriceZbijaneClient.innerText = formatPLN(OPRAWY_PRICES.zbijana.zbijaneClientSupplied);
    }

    if (oprZbPriceSkrecaneUs) {
      oprZbPriceSkrecaneUs.innerText = formatPLN(OPRAWY_PRICES.zbijana.skrecanePrintedHere);
    }

    if (oprZbPriceSkrecaneClient) {
      oprZbPriceSkrecaneClient.innerText = formatPLN(OPRAWY_PRICES.zbijana.skrecaneClientSupplied);
    }

    let oprState: {
      type: "grzbietowa" | "kanałowa" | "zaciskowa" | "zbijana";
      format: "A4" | "A3";
      pages: number;
      qty: number;
      color: string;
      customColor?: string;
      unitPrice: number;
      total: number;
      hardUnbind: boolean;
      hardUnbindPrice: number;
      hardResew: boolean;
      hardResewPrice: number;
      cdBurn: boolean;
      cdPrice: number;
      grzbietColor?: "czarna" | "biała";
      docSource?: "printed-here" | "client-supplied";
      serviceExtra: number;
    } | null = null;

    const parseServiceExtra = (value: string | undefined | null): number => {
      const normalized = (value ?? "").replace(",", ".").trim();
      const parsed = parseFloat(normalized);
      if (!Number.isFinite(parsed) || parsed < 0) return 0;
      return parseFloat(parsed.toFixed(2));
    };

    let oprServiceExtra = parseServiceExtra(oprServiceExtraInput?.value);

    const updateExtraButtonsState = () => {
      oprExtraButtons.forEach(btn => {
        const value = parseFloat(btn.dataset.extra || "0") || 0;
        btn.classList.toggle("is-active", value === oprServiceExtra);
      });
    };

    const applyServiceExtraToSummary = () => {
      updateExtraButtonsState();

      if (!oprState) return;

      const expressFactor = ctx.expressMode ? 1.2 : 1;
      const baseTotal = (
        oprState.unitPrice * oprState.qty
        + (oprState.hardUnbind ? oprState.hardUnbindPrice : 0)
        + (oprState.hardResew ? oprState.hardResewPrice : 0)
        + (oprState.cdBurn ? oprState.cdPrice : 0)
      ) * expressFactor;
      const total = parseFloat((baseTotal + oprServiceExtra).toFixed(2));

      oprState.total = total;
      oprState.serviceExtra = oprServiceExtra;

      if (oprTotalPrice) oprTotalPrice.innerText = formatPLN(total);
      if (oprExpressHint) oprExpressHint.style.display = ctx.expressMode ? "block" : "none";

      ctx.updateLastCalculated(total, "Oprawy");
    };

    const syncOprCustomColorRow = () => {
      if (!oprColor || !oprCustomColorRow) return;
      const noColorVariants = ["bezNapisu", "wkarta"];
      oprCustomColorRow.style.display =
        !noColorVariants.includes(oprColor.value) && oprColor.value === "pozostale" ? "" : "none";
    };

    const parseHardCoverServicePrice = (value: string | undefined | null, fallback: number): number => {
      const parsed = parseFloat((value ?? "").replace(",", ".").trim());
      const candidate = Number.isFinite(parsed) ? parsed : fallback;
      const clamped = Math.min(40, Math.max(25, candidate));
      return parseFloat(clamped.toFixed(2));
    };

    const syncOprRows = () => {
      if (!oprType || !oprColorRow || !oprFormatRow || !oprPagesRow || !oprCustomColorRow || !oprGrzbietColorRow) return;
      const type = oprType.value;

      const hardCoverOnly = type === "kanałowa";
      if (oprHardUnbindCheck) {
        if (!hardCoverOnly) oprHardUnbindCheck.checked = false;
        oprHardUnbindCheck.disabled = !hardCoverOnly;
      }
      if (oprHardResewCheck) {
        if (!hardCoverOnly) oprHardResewCheck.checked = false;
        oprHardResewCheck.disabled = !hardCoverOnly;
      }
      if (oprHardUnbindPrice) {
        if (!hardCoverOnly) oprHardUnbindPrice.value = OPRAWA_TWARDA_ROZSZYCIE_DEFAULT.toString();
        oprHardUnbindPrice.disabled = !hardCoverOnly;
      }
      if (oprHardResewPrice) {
        if (!hardCoverOnly) oprHardResewPrice.value = OPRAWA_TWARDA_PONOWNE_ZSZYCIE_DEFAULT.toString();
        oprHardResewPrice.disabled = !hardCoverOnly;
      }

      if (type === "grzbietowa") {
        oprFormatRow.style.display = "";
        oprPagesRow.style.display = "";
        oprGrzbietColorRow.style.display = "";
        if (oprDocSourceRow) oprDocSourceRow.style.display = "none";
        if (oprZbijaneInfoWrap) oprZbijaneInfoWrap.style.display = "none";
        oprColorRow.style.display = "none";
        oprCustomColorRow.style.display = "none";
        if (oprRozszycieRow) oprRozszycieRow.style.display = "none";
      } else if (type === "kanałowa") {
        oprFormatRow.style.display = "none";
        oprPagesRow.style.display = "none";
        oprGrzbietColorRow.style.display = "none";
        if (oprDocSourceRow) oprDocSourceRow.style.display = "none";
        if (oprZbijaneInfoWrap) oprZbijaneInfoWrap.style.display = "none";
        oprColorRow.style.display = "";
        syncOprCustomColorRow();
        if (oprRozszycieRow) oprRozszycieRow.style.display = "";
      } else if (type === "zaciskowa") {
        oprFormatRow.style.display = "none";
        oprPagesRow.style.display = "none";
        oprGrzbietColorRow.style.display = "none";
        if (oprDocSourceRow) oprDocSourceRow.style.display = "none";
        if (oprZbijaneInfoWrap) oprZbijaneInfoWrap.style.display = "none";
        oprColorRow.style.display = "none";
        oprCustomColorRow.style.display = "none";
        if (oprRozszycieRow) oprRozszycieRow.style.display = "none";
      } else {
        oprFormatRow.style.display = "none";
        oprPagesRow.style.display = "none";
        oprGrzbietColorRow.style.display = "none";
        if (oprDocSourceRow) oprDocSourceRow.style.display = "";
        if (oprZbijaneInfoWrap) oprZbijaneInfoWrap.style.display = "";
        oprColorRow.style.display = "none";
        oprCustomColorRow.style.display = "none";
        if (oprRozszycieRow) oprRozszycieRow.style.display = "none";
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
      const grzbietColor = (oprGrzbietColor?.value === "biała" ? "biała" : "czarna") as "czarna" | "biała";
      const customColor = color === "pozostale" ? (oprCustomColor?.value?.trim() || "") : "";
      let unitPrice = getOprUnitPrice(type, format, pages, color);

      const docSource = ((oprDocSource?.value === "client-supplied") ? "client-supplied" : "printed-here") as "printed-here" | "client-supplied";

      if (type === "zbijana") {
        unitPrice = docSource === "client-supplied"
          ? OPRAWY_PRICES.zbijana.zbijaneClientSupplied
          : OPRAWY_PRICES.zbijana.zbijanePrintedHere;
      }

      const expressFactor = ctx.expressMode ? 1.2 : 1;
      const hardUnbind = type === "kanałowa" && (oprHardUnbindCheck?.checked ?? false);
      const hardUnbindUnitPrice = parseHardCoverServicePrice(oprHardUnbindPrice?.value, OPRAWA_TWARDA_ROZSZYCIE_DEFAULT);
      const hardUnbindPrice = hardUnbind ? hardUnbindUnitPrice : 0;
      const hardResew = type === "kanałowa" && (oprHardResewCheck?.checked ?? false);
      const hardResewUnitPrice = parseHardCoverServicePrice(oprHardResewPrice?.value, OPRAWA_TWARDA_PONOWNE_ZSZYCIE_DEFAULT);
      const hardResewPrice = hardResew ? hardResewUnitPrice : 0;
      const cdBurn = oprCdCheck?.checked ?? false;
      const cdPrice = cdBurn ? OPRAWY_CD_PRICE : 0;
      const total = parseFloat((((unitPrice * qty + hardUnbindPrice + hardResewPrice + cdPrice) * expressFactor) + oprServiceExtra).toFixed(2));

      oprState = {
        type,
        format,
        pages,
        qty,
        color,
        customColor,
        unitPrice,
        total,
        hardUnbind,
        hardUnbindPrice,
        hardResew,
        hardResewPrice,
        cdBurn,
        cdPrice,
        grzbietColor,
        docSource,
      };
      if (oprUnitPrice) oprUnitPrice.innerText = formatPLN(unitPrice * expressFactor);
      if (oprTotalPrice) oprTotalPrice.innerText = formatPLN(total);
      if (oprExpressHint) oprExpressHint.style.display = ctx.expressMode ? "block" : "none";
      if (oprResultDisplay) oprResultDisplay.style.display = "block";
      if (oprAddBtn) oprAddBtn.disabled = false;

      oprState.serviceExtra = oprServiceExtra;
      applyServiceExtraToSummary();

      ctx.updateLastCalculated(total, "Oprawy");
    });

    oprAddBtn?.addEventListener("click", () => {
      if (!oprState) return;

      const options: string[] = [];
      if (oprState.type === "grzbietowa") {
        options.push(`${oprState.format}, ${oprState.pages} str., kolor: ${oprState.grzbietColor ?? "czarna"}`);
      } else if (oprState.type === "kanałowa") {
        options.push(
          oprState.color === "bezNapisu" ? "bez napisu"
            : oprState.color === "wkarta" ? "wkarta okładka"
            : `kolor: ${oprState.color === "pozostale" ? (oprState.customColor || "pozostałe") : oprState.color}`
        );
      } else if (oprState.type === "zbijana") {
        const sourceLabel = oprState.docSource === "client-supplied"
          ? "dostarczone przez klienta"
          : "drukowane u nas";
        options.push(`zbijane, ${sourceLabel}`);
      } else {
        options.push(oprState.type);
      }

      if (oprState.type === "kanałowa" && oprState.hardUnbind) {
        options.push(`rozszycie oprawy twardej (+${formatPLN(oprState.hardUnbindPrice)})`);
      }

      if (oprState.type === "kanałowa" && oprState.hardResew) {
        options.push(`ponowne zszycie oprawy twardej (+${formatPLN(oprState.hardResewPrice)})`);
      }

      if (oprState.cdBurn) {
        options.push(`nagrywanie płyty (+${formatPLN(oprState.cdPrice)})`);
      }

      ctx.cart.addItem({
        id: `oprawa-${Date.now()}`,
        category: "Introligatornia",
        name: oprState.type === "zbijana" ? "Oprawa zbijana / skręcana" : `Oprawa ${oprState.type}`,
        quantity: oprState.qty,
        unit: "szt",
        unitPrice: oprState.total / oprState.qty,
        isExpress: ctx.expressMode,
        totalPrice: oprState.total,
        optionsHint: options.join(", "),
        payload: oprState
      });
    });

    oprServiceExtraInput?.addEventListener("input", () => {
      oprServiceExtra = parseServiceExtra(oprServiceExtraInput.value);
      applyServiceExtraToSummary();
    });

    oprServiceExtraInput?.addEventListener("blur", () => {
      oprServiceExtra = parseServiceExtra(oprServiceExtraInput.value);
      if (oprServiceExtraInput.value.trim() !== "") {
        oprServiceExtraInput.value = oprServiceExtra.toString();
      }
      applyServiceExtraToSummary();
    });

    oprHardUnbindPrice?.addEventListener("blur", () => {
      const normalized = parseHardCoverServicePrice(oprHardUnbindPrice.value, OPRAWA_TWARDA_ROZSZYCIE_DEFAULT);
      oprHardUnbindPrice.value = normalized.toString();
      applyServiceExtraToSummary();
    });

    oprHardResewPrice?.addEventListener("blur", () => {
      const normalized = parseHardCoverServicePrice(oprHardResewPrice.value, OPRAWA_TWARDA_PONOWNE_ZSZYCIE_DEFAULT);
      oprHardResewPrice.value = normalized.toString();
      applyServiceExtraToSummary();
    });

    oprExtraButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        oprServiceExtra = parseServiceExtra(btn.dataset.extra);
        if (oprServiceExtraInput) {
          oprServiceExtraInput.value = oprServiceExtra.toString();
        }
        applyServiceExtraToSummary();
      });
    });

    updateExtraButtonsState();

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
