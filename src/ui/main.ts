import { Router } from "./router";
import { ViewContext } from "./types";
import { SolwentPlakatyView } from "./views/solwent-plakaty";
import { PlakatyWFView } from "./views/plakaty-wf";
import { PlakatyA4A3View } from "./views/plakaty-a4-a3";
import { VoucheryView } from "./views/vouchery";
import { DyplomyView } from "./views/dyplomy";
import { WizytowkiView } from "./views/wizytowki-druk-cyfrowy";
import { RollUpView } from "./views/roll-up";
import { ZaproszeniaKredaView } from "./views/zaproszenia-kreda";
import { UlotkiCyfroweView } from "./views/ulotki-cyfrowe";
import { BannerView } from "./views/banner";
import { BroszuryKatalogiView } from "./views/broszury-katalogi";
import { WlepkiView } from "./views/wlepki-naklejki";
import { DrukA4A3SkanView } from "./views/druk-a4-a3-skan-view";
import { DrukCADView } from "./views/druk-cad";
import { LaminowanieView } from "./views/laminowanie";
import { WydrukiSpecjalneView } from "./views/wydruki-specjalne";
import { FoliaSzronionaView } from "./views/folia-szroniona";
import { WycinanieFoliiView } from "./views/wycinanie-folii";
import { CanvasView } from "./views/canvas-fixed";
import { CadOpsView } from "./views/cad-ops";
import { CadUploadView } from "./views/cad-upload";
import { UstawieniaView } from "./views/ustawienia";
import { artykulyBiuroweCategory } from "../categories/artykuly-biurowe";
import { uslugiCategory } from "../categories/uslugi";
import { formatPLN } from "../core/money";
import { Cart } from "../core/cart";
import { CartItem, CustomerData } from "../core/types";
import { downloadExcel } from "./excel";
import { buildOrderExportPayload, getOrderExportConfig, sendOrderToAppsScript, fetchStateFromAppsScript, verifyPinOnServer, setPinOnServer, removePinOnServer } from "../services/orderExportService";
import {
  PRICES_UPDATED_EVENT,
  PRICES_STORAGE_KEY,
  VARIANTS_STORAGE_KEY,
  getVariantDefinitions,
  setVariantDefinitions,
  variantsToPriceSubgroups,
  variantsToPriceLabels,
  getPriceSubgroups,
  setPriceSubgroups,
  getPriceLabels,
  setPriceLabels,
  setPrice,
} from "../services/priceService";
import { PDFDocument, StandardFonts, rgb, PDFFont } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { validateCustomerForm } from "../core/customerValidation";
import categories from "../../data/categories.json";

const cart = new Cart();

function syncVariantsToSubgroupsAtStartup(): void {
  try {
    const variants = getVariantDefinitions();
    if (!variants.length) return;

    const fromVariants = variantsToPriceSubgroups(variants);
    const existing = getPriceSubgroups();
    const needsSubgroupSync = Object.entries(fromVariants).some(
      ([catId, prefixes]) => Object.keys(prefixes).some(prefix => !existing[catId]?.[prefix])
    );
    if (needsSubgroupSync) {
      const merged: Record<string, Record<string, string>> = {};
      for (const [c, p] of Object.entries(existing)) merged[c] = { ...p };
      for (const [c, p] of Object.entries(fromVariants)) {
        if (!merged[c]) merged[c] = {};
        Object.assign(merged[c], p);
      }
      setPriceSubgroups(merged);
    }

    const fromLabels = variantsToPriceLabels(variants);
    const existingLabels = getPriceLabels();
    if (Object.entries(fromLabels).some(([k, v]) => existingLabels[k] !== v)) {
      setPriceLabels({ ...existingLabels, ...fromLabels });
    }
  } catch {
    // ignore
  }
}

// App build/version stamp (used to verify deployed bundle and force visibility in Console)
;(window as any).__APP_BUILD__ = '2026-05-22-router-fix-2';

function escapeHtml(str: string): string {
  return String(str)
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/\\n/g, ' ')
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const SETTINGS_AUTH_KEY = 'razdwa_pin_auth';
try { localStorage.removeItem('razdwa_pin'); } catch {} // cleanup: PIN moved to server

function showOrderLoadingPopup(message: string = "WYSYŁANIE...", type: "sending" | "success" = "sending") {
  const host = document.getElementById("toastHost") ?? document.getElementById("orderSummary");
  if (!host) return;
  const toast = document.createElement("div");
  let variant = "sending";
  if (type === "success") variant = "sent";
  toast.className = `ghost-toast ghost-toast--${variant}`;
  let icon = type === "sending" ? "⏳" : "✔️";
  toast.innerHTML = `
    <span class="ghost-toast__icon">${icon}</span>
    <span class="ghost-toast__message">${escapeHtml(message)}</span>
  `;
  host.prepend(toast);
  setTimeout(() => toast.classList.add("is-visible"), 10);
  setTimeout(() => {
    toast.classList.remove("is-visible");
    setTimeout(() => toast.remove(), 350);
  }, 3500);
}

function hideOrderLoadingPopup() {/* niepotrzebne, zostawiam dla kompatybilności */}

function getSummaryPercentValue(elementId: string): number {
  const el = document.getElementById(elementId) as HTMLSelectElement | null;
  if (!el) return 0;
  const parsed = Number.parseFloat(el.value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed / 100 : 0;
}

function applySummaryPercentAdjustments(baseAmount: number): number {
  const base = Number.isFinite(baseAmount) ? baseAmount : 0;
  const discountPercent = getSummaryPercentValue("summaryDiscountPercent");
  const surchargePercent = getSummaryPercentValue("summarySurchargePercent");
  const discountValue = base * discountPercent;
  const surchargeValue = base * surchargePercent;
  return parseFloat((base - discountValue + surchargeValue).toFixed(2));
}

function splitTextByWidth(text: string, maxWidth: number, font: any, fontSize: number): string[] {
  const normalized = String(text ?? "").replace(/\s+/g, " ").trim();
  if (!normalized) return [""];

  const words = normalized.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, fontSize) <= maxWidth) {
      current = candidate;
      continue;
    }

    if (current) {
      lines.push(current);
      current = word;
      continue;
    }

    // Very long single word fallback
    let chunk = "";
    for (const ch of word) {
      const chunkCandidate = `${chunk}${ch}`;
      if (font.widthOfTextAtSize(chunkCandidate, fontSize) <= maxWidth) {
        chunk = chunkCandidate;
      } else {
        if (chunk) lines.push(chunk);
        chunk = ch;
      }
    }
    current = chunk;
  }

  if (current) lines.push(current);
  return lines;
}

function toPdfSafeText(value: string): string {
  // Standard fonts in pdf-lib use WinAnsi and cannot render PL diacritics.
  // All non-ASCII uses \uXXXX escapes to stay safe for esbuild --charset=ascii.
  return String(value ?? "")
    .replace(/Ą/g, "A").replace(/ą/g, "a")
    .replace(/Ć/g, "C").replace(/ć/g, "c")
    .replace(/Ę/g, "E").replace(/ę/g, "e")
    .replace(/Ł/g, "L").replace(/ł/g, "l")
    .replace(/Ń/g, "N").replace(/ń/g, "n")
    .replace(/Ó/g, "O").replace(/ó/g, "o")
    .replace(/Ś/g, "S").replace(/ś/g, "s")
    .replace(/Ź/g, "Z").replace(/ź/g, "z")
    .replace(/Ż/g, "Z").replace(/ż/g, "z")
    .replace(/[–—]/g, "-")
    .replace(/[“”„]/g, "\"")
    .replace(/[‘’]/g, "'")
    .replace(/[^\x20-\x7E]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const DEJAVU_CDN = "https://cdn.jsdelivr.net/npm/dejavu-fonts-ttf@2.37.3/ttf/";

async function generateOrderReportPdf(items: CartItem[], customer: CustomerData) {
  const pdf = await PDFDocument.create();

  let fontRegular: PDFFont;
  let fontBold: PDFFont;
  let polishFontsLoaded = false;

  try {
    pdf.registerFontkit(fontkit);
    const [regularBuf, boldBuf] = await Promise.all([
      fetch(DEJAVU_CDN + "DejaVuSans.ttf").then(r => { if (!r.ok) throw new Error(); return r.arrayBuffer(); }),
      fetch(DEJAVU_CDN + "DejaVuSans-Bold.ttf").then(r => { if (!r.ok) throw new Error(); return r.arrayBuffer(); }),
    ]);
    fontRegular = await pdf.embedFont(regularBuf);
    fontBold = await pdf.embedFont(boldBuf);
    polishFontsLoaded = true;
  } catch {
    fontRegular = await pdf.embedFont(StandardFonts.Helvetica);
    fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  }

  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const margin = 42;
  const contentWidth = pageWidth - margin * 2;

  let page = pdf.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;

  const ensureSpace = (required = 22) => {
    if (y - required >= margin) return;
    page = pdf.addPage([pageWidth, pageHeight]);
    y = pageHeight - margin;
  };

  const writeWrapped = (
    text: string,
    options?: { size?: number; bold?: boolean; color?: [number, number, number]; lineGap?: number }
  ) => {
    const size = options?.size ?? 11;
    const bold = options?.bold ?? false;
    const lineGap = options?.lineGap ?? 4;
    const [r, g, b] = options?.color ?? [0.06, 0.1, 0.16];
    const font = bold ? fontBold : fontRegular;
    const lineHeight = size + lineGap;
    const safeText = polishFontsLoaded ? text : toPdfSafeText(text);
    const lines = splitTextByWidth(safeText, contentWidth, font, size);

    for (const line of lines) {
      ensureSpace(lineHeight + 2);
      page.drawText(line, {
        x: margin,
        y,
        size,
        font,
        color: rgb(r, g, b)
      });
      y -= lineHeight;
    }
  };

  const spacer = (value = 8) => {
    y -= value;
    ensureSpace();
  };

  const now = new Date();
  const reportDate = now.toLocaleString("pl-PL", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });

  const baseTotal = cart.getGrandTotal();
  const adjustedTotal = applySummaryPercentAdjustments(baseTotal);
  const discountPercent = Math.round(getSummaryPercentValue("summaryDiscountPercent") * 100);
  const surchargePercent = Math.round(getSummaryPercentValue("summarySurchargePercent") * 100);

  writeWrapped("Raport zamówienia", { size: 18, bold: true });
  writeWrapped(`Data wygenerowania: ${reportDate}`, { size: 10, color: [0.35, 0.4, 0.48] });
  spacer(10);

  writeWrapped("Dane zamówienia", { size: 13, bold: true });
  writeWrapped(`Kto dodał: ${customer.addedBy || "-"}`);
  writeWrapped(`Imię i nazwisko: ${customer.name || "-"}`);
  writeWrapped(`Nazwa firmy: ${customer.company || "-"}`);
  writeWrapped(`NIP: ${customer.nip || "-"}`);
  writeWrapped(`Telefon: ${customer.phone || "-"}`);
  writeWrapped(`E-mail: ${customer.email || "-"}`);
  writeWrapped(`Realizacja: ${customer.priority || "-"}`);
  writeWrapped(`Tryb EXPRESS (+20%): ${((document.getElementById("globalExpress") as HTMLInputElement | null)?.checked ? "TAK" : "NIE")}`);
  writeWrapped(`Uwagi: ${customer.notes || "-"}`);
  spacer(10);

  writeWrapped("Pozycje koszyka", { size: 13, bold: true });
  if (items.length === 0) {
    writeWrapped("Brak pozycji w koszyku.");
  } else {
    items.forEach((item, idx) => {
      writeWrapped(`${idx + 1}. ${item.name} — ${formatPLN(item.totalPrice)}`, { bold: true });
      if (item.optionsHint) {
        writeWrapped(`   Szczegóły: ${item.optionsHint}`, { size: 10, color: [0.33, 0.38, 0.45] });
      }
      spacer(3);
    });
  }

  spacer(8);
  writeWrapped("Podsumowanie", { size: 13, bold: true });
  writeWrapped(`Suma bazowa: ${formatPLN(baseTotal)}`);
  writeWrapped(`Rabat: ${discountPercent}%`);
  writeWrapped(`Doliczenie: ${surchargePercent}%`);
  writeWrapped(`Suma koszyka (kwota): ${formatPLN(adjustedTotal)}`, { size: 12, bold: true });

  const pdfBytes = await pdf.save();
  const pdfData = new Uint8Array(pdfBytes);
  const blob = new Blob([pdfData], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const fileName = `raport-zamowienia-${now.toISOString().slice(0, 19).replace(/[T:]/g, "-")}.pdf`;

  const opened = window.open(url, "_blank", "noopener,noreferrer");
  if (!opened) {
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
  }

  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

class SimpleEventEmitter {
  private listeners: Map<string, Set<(data?: any) => void>> = new Map();

  on(event: string, callback: (data?: any) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);
  }

  emit(event: string, data?: any) {
    this.listeners.get(event)?.forEach(callback => {
      try {
        callback(data);
      } catch (err) {
        console.error(`Error in event listener for "${event}":`, err);
      }
    });
  }
}

const eventEmitter = new SimpleEventEmitter();

function showToast(message: string, variant: "cart" | "success" | "warning" | "error" = "cart") {
  const host = document.getElementById("toastHost") ?? document.getElementById("orderSummary");
  if (!host) return;

  const toast = document.createElement("div");
  toast.className = `ghost-toast ghost-toast--${variant}`;
  const icon = variant === "success"
    ? "✓"
    : variant === "warning"
      ? "!"
      : variant === "error"
        ? "×"
        : "+";
  toast.innerHTML = `
    <span class="ghost-toast__icon">${icon}</span>
    <span class="ghost-toast__message">${escapeHtml(message)}</span>
  `;

  host.prepend(toast);

  requestAnimationFrame(() => {
    toast.classList.add("is-visible");
  });

  setTimeout(() => {
    toast.classList.remove("is-visible");
    setTimeout(() => toast.remove(), 250);
  }, variant === "success" ? 2400 : variant === "cart" ? 1600 : 2600);
}

function updateCartUI() {
  const listEl = document.getElementById("basketList");
  const totalEl = document.getElementById("basketTotal");

  if (!listEl || !totalEl) return;

  const items = cart.getItems();

  if (items.length === 0) {
    listEl.innerHTML = `
      <div class="basketItem">
        <div>
          <div class="basketTitle">Brak pozycji</div>
          <div class=”basketMeta”>Kliknij „DODAJ DO KOSZYKA”, aby zbudować koszyk.</div>
        </div>
        <div class="basketPrice">—</div>
      </div>
    `;
  } else {
    listEl.innerHTML = items.map((item, idx) => `
      <div class="basketItem">
        <div class="basketItemContent">
          <div class="basketName">${escapeHtml(item.name)}</div>
          <div class="basketMeta">${escapeHtml(item.optionsHint)}</div>
        </div>
        <div class="basketItemRight">
          <div class="basketPrice">${formatPLN(item.totalPrice)}</div>
          <button class="iconBtn" data-remove-idx="${idx}" title="Usuń" aria-label="Usuń pozycję ${idx + 1}">×</button>
        </div>
      </div>
    `).join("");
  }

  const total = cart.getGrandTotal();
  const adjustedTotal = applySummaryPercentAdjustments(total);
  totalEl.innerText = formatPLN(adjustedTotal);

  const globalExpress = document.getElementById("globalExpress") as HTMLInputElement | null;
  const globalExpressSummary = document.getElementById("globalExpressSummary") as HTMLElement | null;
  if (globalExpressSummary) {
    const expressEnabled = !!globalExpress?.checked;
    const expressSurcharge = expressEnabled
      ? parseFloat((total - total / 1.2).toFixed(2))
      : 0;

    globalExpressSummary.innerText = `Dopłata: ${formatPLN(expressSurcharge)}`;
    globalExpressSummary.classList.toggle("is-active", expressEnabled && expressSurcharge > 0);
  }

}


function setupFormValidation(): void {
  function showFieldError(errEl: HTMLElement, message: string | null, input?: HTMLInputElement | null): void {
    errEl.textContent = message ?? '';
    errEl.style.display = message ? 'block' : 'none';
    if (input) input.classList.toggle('is-invalid', !!message);
  }

  function addErrorEl(input: HTMLInputElement | null): HTMLElement | null {
    if (!input) return null;
    const errId = `${input.id}Err`;
    let el = document.getElementById(errId);
    if (!el) {
      el = document.createElement('div');
      el.id = errId;
      el.className = 'field-error';
      el.setAttribute('aria-live', 'polite');
      input.insertAdjacentElement('afterend', el);
    }
    return el;
  }

  const nameEl = document.getElementById('custName') as HTMLInputElement | null;
  const emailEl = document.getElementById('custEmail') as HTMLInputElement | null;
  const phoneEl = document.getElementById('custPhone') as HTMLInputElement | null;
  const nipEl = document.getElementById('custNip') as HTMLInputElement | null;

  const nameErr = addErrorEl(nameEl);
  const emailErr = addErrorEl(emailEl);
  const phoneErr = addErrorEl(phoneEl);
  const nipErr = addErrorEl(nipEl);

  if (nameEl && nameErr) {
    const validate = (v: string) =>
      v.trim().length < 2 ? 'Podaj imię i nazwisko (min. 2 znaki)' : null;
    nameEl.addEventListener('blur', () => showFieldError(nameErr, validate(nameEl.value), nameEl));
    nameEl.addEventListener('input', () => {
      if (nameErr.textContent) showFieldError(nameErr, validate(nameEl.value), nameEl);
    });
  }

  if (emailEl && emailErr) {
    const validate = (v: string) => {
      if (!v.trim()) return 'Podaj adres e-mail';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())) return 'Nieprawidłowy format e-mail';
      return null;
    };
    emailEl.addEventListener('blur', () => showFieldError(emailErr, validate(emailEl.value), emailEl));
    emailEl.addEventListener('input', () => {
      if (emailErr.textContent) showFieldError(emailErr, validate(emailEl.value), emailEl);
    });
  }

  if (phoneEl && phoneErr) {
    const getDigits = (v: string) => v.replace(/\D/g, '');
    const formatPhone = (digits: string): string => {
      const d = digits.slice(0, 9);
      if (d.length <= 3) return d;
      if (d.length <= 6) return `${d.slice(0, 3)} ${d.slice(3)}`;
      return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`;
    };
    const validate = (v: string) => {
      const d = getDigits(v);
      if (!d) return 'Podaj numer telefonu';
      if (d.length < 9) return 'Numer telefonu musi mieć min. 9 cyfr';
      return null;
    };

    phoneEl.addEventListener('input', () => {
      const digits = getDigits(phoneEl.value);
      const formatted = formatPhone(digits);
      if (phoneEl.value !== formatted) phoneEl.value = formatted;
      if (phoneErr.textContent) showFieldError(phoneErr, validate(formatted), phoneEl);
    });
    phoneEl.addEventListener('blur', () => showFieldError(phoneErr, validate(phoneEl.value), phoneEl));
  }

  if (nipEl && nipErr) {
    const getDigits = (v: string) => v.replace(/\D/g, '');
    const formatNip = (digits: string): string => {
      const d = digits.slice(0, 10);
      if (d.length <= 3) return d;
      if (d.length <= 6) return `${d.slice(0, 3)}-${d.slice(3)}`;
      if (d.length <= 8) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
      return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6, 8)}-${d.slice(8)}`;
    };
    const validate = (v: string) => {
      const d = getDigits(v);
      if (!d) return null;
      if (d.length !== 10) return 'NIP musi mieć dokładnie 10 cyfr';
      return null;
    };

    nipEl.addEventListener('input', () => {
      const digits = getDigits(nipEl.value);
      const formatted = formatNip(digits);
      if (nipEl.value !== formatted) nipEl.value = formatted;
      if (nipErr.textContent) showFieldError(nipErr, validate(formatted), nipEl);
    });
    nipEl.addEventListener('blur', () => showFieldError(nipErr, validate(nipEl.value), nipEl));
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const viewContainer = document.getElementById("viewContainer");
  const globalExpress = document.getElementById("globalExpress") as HTMLInputElement;

  const syncHomeLayoutMode = () => {
    const hash = window.location.hash || "#/";
    const isHome = hash === "#/" || hash === "#" || hash.trim() === "";
    document.body.classList.toggle("home-compact-layout", isHome);
  };

  const syncSettingsLayoutMode = () => {
    const hash = window.location.hash || "#/";
    const isSettings = hash === "#/ustawienia" || hash === "#/ustawienia/";
    document.body.classList.toggle("settings-pricing-layout", isSettings);
  };

  window.addEventListener("hashchange", syncHomeLayoutMode);
  window.addEventListener("hashchange", syncSettingsLayoutMode);
  syncHomeLayoutMode();
  syncSettingsLayoutMode();

  // Event delegation for remove buttons rendered inside basket list
  document.addEventListener("click", (e) => {
    const btn = (e.target as HTMLElement).closest("[data-remove-idx]");
    if (btn) {
      const idx = parseInt((btn as HTMLElement).dataset.removeIdx ?? "", 10);
      if (!isNaN(idx)) {
        cart.removeItem(idx);
        updateCartUI();
      }
    }
  });

  // Handle old razdwa:addToCart event from legacy JS categories
  document.addEventListener("razdwa:addToCart", (e: Event) => {
    const customEvent = e as CustomEvent;
    const detail = customEvent.detail || {};
    const category = detail.category || "Inne";
    const totalPrice = detail.totalPrice || 0;

    const cartItem: CartItem = {
      id: `${category.toLowerCase().replace(/[^\w]+/g, "-")}-${Date.now()}`,
      category: category,
      name: category,
      quantity: 1,
      unit: "szt",
      unitPrice: totalPrice,
      isExpress: globalExpress?.checked || false,
      totalPrice: totalPrice * (globalExpress?.checked ? 1.2 : 1),
      optionsHint: detail.description || "",
      payload: detail
    };

    cart.addItem(cartItem);
    updateCartUI();
    showToast("Dodano do koszyka", "cart");
  });

  if (!viewContainer || !globalExpress) return;


  const getCtx = (): ViewContext => ({
    cart: {
      addItem: (item) => {
        cart.addItem(item);
        updateCartUI();
        showToast("Dodano do koszyka", "cart");
      }
    },
    addToBasket: (item) => {
      const cartItem: CartItem = {
        id: `${item.category}-${Date.now()}`,
        category: item.category,
        name: item.category,
        quantity: 1,
        unit: "szt",
        unitPrice: item.price,
        isExpress: globalExpress.checked,
        totalPrice: item.price * (globalExpress.checked ? 1.2 : 1),
        optionsHint: item.description,
        payload: { originalPrice: item.price, description: item.description }
      };
      cart.addItem(cartItem);
      updateCartUI();
      showToast("Dodano do koszyka", "cart");
    },
    expressMode: globalExpress.checked,
    updateLastCalculated: (_price, _hint) => {
      // Intentionally no-op. Podsumowanie pokazuje wyłącznie sumę koszyka.
    },
    on: (event, callback) => {
      eventEmitter.on(event, callback);
    },
    emit: (event, data) => {
      eventEmitter.emit(event, data);
    }
  });

  const router = new Router(viewContainer, getCtx);
  router.setCategories(categories);
  router.addRoute(PlakatyWFView);
  router.addRoute(PlakatyA4A3View);
  router.addRoute(DrukA4A3SkanView);
  router.addRoute(DrukCADView);
  router.addRoute(SolwentPlakatyView);
  router.addRoute(VoucheryView);
  router.addRoute(DyplomyView);
  router.addRoute(WizytowkiView);
  router.addRoute(RollUpView);
  router.addRoute(ZaproszeniaKredaView);
  router.addRoute(UlotkiCyfroweView);
  router.addRoute(BannerView);
  router.addRoute(BroszuryKatalogiView);
  router.addRoute(WlepkiView);
  router.addRoute(LaminowanieView);
  router.addRoute(WydrukiSpecjalneView);
  router.addRoute(FoliaSzronionaView);
  router.addRoute(WycinanieFoliiView);
  router.addRoute(CanvasView);
  router.addRoute(CadOpsView);
  router.addRoute(CadUploadView);
  router.addRoute(UstawieniaView);
  router.addRoute(artykulyBiuroweCategory);
  router.addRoute(uslugiCategory);

  window.addEventListener(PRICES_UPDATED_EVENT, () => {
    const currentHash = window.location.hash || "#/";
    if (!currentHash || currentHash === "#/" || currentHash === "#/ustawienia") {
      return;
    }

    router.handleRoute().catch(() => {});
  });


  // Re-render view when express mode changes
  globalExpress.addEventListener("change", () => {
    cart.setExpressForAll(globalExpress.checked);
    updateCartUI();

    // Toggle express styling on order summary
    const orderSummary = document.getElementById("orderSummary");
    if (orderSummary) {
      orderSummary.classList.toggle("is-express", globalExpress.checked);
    }
    // Trigger route refresh
    const currentHash = window.location.hash;
    window.location.hash = "";
    window.location.hash = currentHash;
  });

  const summaryDiscountPercent = document.getElementById("summaryDiscountPercent") as HTMLSelectElement | null;
  const summarySurchargePercent = document.getElementById("summarySurchargePercent") as HTMLSelectElement | null;

  [summaryDiscountPercent, summarySurchargePercent].forEach((selectEl) => {
    selectEl?.addEventListener("change", () => {
      updateCartUI();
    });
  });

  document.getElementById("goToBaseBtn")?.addEventListener("click", () => {
    const targetUrl = "https://docs.google.com/spreadsheets/u/0/";
    const opened = window.open(targetUrl, "_blank", "noopener,noreferrer");
    if (!opened) {
      showToast("Nie udało się otworzyć bazy (sprawdź blokadę popup)", "warning");
    }
  });

  // Generate PDF report with order data + basket summary
  document.getElementById("copyBtn")?.addEventListener("click", async () => {
    if (cart.isEmpty()) {
      showToast("Koszyk jest pusty", "error");
      alert("Koszyk jest pusty!");
      return;
    }

    const validationError = validateCustomerForm({
      name: (document.getElementById("custName") as HTMLInputElement | null)?.value ?? "",
      email: (document.getElementById("custEmail") as HTMLInputElement | null)?.value ?? "",
      phone: (document.getElementById("custPhone") as HTMLInputElement | null)?.value ?? "",
    });
    if (validationError) {
      showToast(validationError, "error");
      return;
    }

    const customer: CustomerData = {
      addedBy: (document.getElementById("custAddedBy") as HTMLInputElement | null)?.value?.trim() || undefined,
      name: (document.getElementById("custName") as HTMLInputElement).value || "Anonim",
      company: (document.getElementById("custCompany") as HTMLInputElement | null)?.value?.trim() || undefined,
      nip: (document.getElementById("custNip") as HTMLInputElement | null)?.value?.trim() || undefined,
      phone: (document.getElementById("custPhone") as HTMLInputElement).value || "-",
      email: (document.getElementById("custEmail") as HTMLInputElement).value || "-",
      priority: (document.getElementById("custPriority") as HTMLSelectElement).value,
      notes: (document.getElementById("custNotes") as HTMLTextAreaElement | null)?.value?.trim() || ""
    };

    try {
      await generateOrderReportPdf(cart.getItems(), customer);
      showToast("Wygenerowano raport PDF", "success");
    } catch (error) {
      console.error("Błąd generowania raportu PDF:", error);
      showToast("Nie udało się wygenerować raportu PDF", "error");
      alert("Wystąpił błąd podczas tworzenia raportu PDF.");
    }
  });

  // Clear basket
  document.getElementById("clearBtn")?.addEventListener("click", () => {
    cart.clear();
    updateCartUI();
  });

  // Send order: Apps Script (if configured) or local Excel fallback
  let isSubmitting = false;

  const handleSendOrder = async () => {
    if (isSubmitting) return;

    if (cart.isEmpty()) {
      showToast("Koszyk jest pusty", "error");
      alert("Koszyk jest pusty!");
      return;
    }

    const validationError = validateCustomerForm({
      name: (document.getElementById("custName") as HTMLInputElement | null)?.value ?? "",
      email: (document.getElementById("custEmail") as HTMLInputElement | null)?.value ?? "",
      phone: (document.getElementById("custPhone") as HTMLInputElement | null)?.value ?? "",
    });
    if (validationError) {
      showToast(validationError, "error");
      return;
    }

    isSubmitting = true;
    const sendBtnEl = document.getElementById("sendBtn") as HTMLButtonElement | null;
    const sendBtn2El = document.getElementById("sendBtn2") as HTMLButtonElement | null;
    if (sendBtnEl) sendBtnEl.disabled = true;
    if (sendBtn2El) sendBtn2El.disabled = true;

    const resetSending = () => {
      isSubmitting = false;
      if (sendBtnEl) sendBtnEl.disabled = false;
      if (sendBtn2El) sendBtn2El.disabled = false;
    };

    const customer: CustomerData = {
      addedBy: (document.getElementById("custAddedBy") as HTMLInputElement | null)?.value?.trim() || undefined,
      name: (document.getElementById("custName") as HTMLInputElement).value || "Anonim",
      company: (document.getElementById("custCompany") as HTMLInputElement | null)?.value?.trim() || undefined,
      nip: (document.getElementById("custNip") as HTMLInputElement | null)?.value?.trim() || undefined,
      phone: (document.getElementById("custPhone") as HTMLInputElement).value || "-",
      email: (document.getElementById("custEmail") as HTMLInputElement).value || "-",
      priority: (document.getElementById("custPriority") as HTMLSelectElement).value,
      notes: (document.getElementById("custNotes") as HTMLTextAreaElement | null)?.value?.trim() || ""
    };

    const items = cart.getItems();
    const exportConfig = getOrderExportConfig();

    if (exportConfig.enabled && exportConfig.appsScriptUrl) {
      showOrderLoadingPopup("WYSYŁANIE...", "sending");
      try {
        const payload = buildOrderExportPayload(items, customer);
        const result = await sendOrderToAppsScript(payload, exportConfig);

        if (result.ok) {
          showOrderLoadingPopup("Wysłano do bazy (Google Sheets)", "success");
          setTimeout(() => {
            hideOrderLoadingPopup();
            if (result.verified === false) {
              showToast(result.message || "Wysłano bez potwierdzenia odpowiedzi serwera.", "warning");
            }
            cart.clear();
            updateCartUI();
            (document.getElementById("custAddedBy") as HTMLInputElement | null)!.value = "";
            (document.getElementById("custName") as HTMLInputElement).value = "";
            (document.getElementById("custCompany") as HTMLInputElement | null)!.value = "";
            (document.getElementById("custNip") as HTMLInputElement | null)!.value = "";
            (document.getElementById("custPhone") as HTMLInputElement).value = "";
            (document.getElementById("custEmail") as HTMLInputElement).value = "";
            (document.getElementById("custPriority") as HTMLSelectElement).value = "Normalny";
            (document.getElementById("custNotes") as HTMLTextAreaElement | null)!.value = "";
            resetSending();
          }, 3500);
          return;
        }

        resetSending();
        hideOrderLoadingPopup();
        showToast(`Błąd wysyłki: ${result.message || "nieznany błąd"}`, "error");
      } catch (error) {
        resetSending();
        hideOrderLoadingPopup();
        showToast(`Błąd wysyłki: ${error}`, "error");
      }
      return;
    }

    resetSending();
    showToast("Brak aktywnej integracji Apps Script — skonfiguruj URL w ustawieniach.", "error");
  };

  document.getElementById("sendBtn")?.addEventListener("click", handleSendOrder);
  document.getElementById("sendBtn2")?.addEventListener("click", handleSendOrder);

  const pinNewInput = document.getElementById('pinNewInput') as HTMLInputElement | null;
  const pinConfirmInput = document.getElementById('pinConfirmInput') as HTMLInputElement | null;
  const pinSaveBtn = document.getElementById('pinSaveBtn') as HTMLButtonElement | null;
  const pinMsg = document.getElementById('pinMsg') as HTMLElement | null;
  const pinSetForm = document.getElementById('pinSetForm') as HTMLElement | null;
  const pinChangeForm = document.getElementById('pinChangeForm') as HTMLElement | null;
  const pinStatusEl = document.getElementById('pinStatus') as HTMLElement | null;

  const pinChangeToggleBtn = document.getElementById('pinChangeToggleBtn') as HTMLButtonElement | null;
  const pinChangeExpandedForm = document.getElementById('pinChangeExpandedForm') as HTMLElement | null;
  const pinCurrentInput = document.getElementById('pinCurrentInput') as HTMLInputElement | null;
  const pinNewChangeInput = document.getElementById('pinNewChangeInput') as HTMLInputElement | null;
  const pinConfirmChangeInput = document.getElementById('pinConfirmChangeInput') as HTMLInputElement | null;
  const pinDoChangeBtn = document.getElementById('pinDoChangeBtn') as HTMLButtonElement | null;
  const pinChangeCancelBtn = document.getElementById('pinChangeCancelBtn') as HTMLButtonElement | null;
  const pinRemoveToggleBtn = document.getElementById('pinRemoveToggleBtn') as HTMLButtonElement | null;
  const pinRemoveSection = document.getElementById('pinRemoveSection') as HTMLElement | null;
  const pinRemoveConfirmInput = document.getElementById('pinRemoveConfirmInput') as HTMLInputElement | null;
  const pinRemoveBtn = document.getElementById('pinRemoveBtn') as HTMLButtonElement | null;

  let pinIsSet: boolean | null = null;

  const collapseChangeForms = () => {
    if (pinChangeExpandedForm) pinChangeExpandedForm.style.display = 'none';
    if (pinRemoveSection) pinRemoveSection.style.display = 'none';
    if (pinCurrentInput) pinCurrentInput.value = '';
    if (pinNewChangeInput) pinNewChangeInput.value = '';
    if (pinConfirmChangeInput) pinConfirmChangeInput.value = '';
    if (pinRemoveConfirmInput) pinRemoveConfirmInput.value = '';
  };

  const refreshPinUI = () => {
    if (pinSetForm) pinSetForm.style.display = pinIsSet ? 'none' : 'block';
    if (pinChangeForm) pinChangeForm.style.display = pinIsSet ? 'block' : 'none';
    collapseChangeForms();
    if (pinStatusEl) {
      if (pinIsSet === null) {
        pinStatusEl.textContent = '⏳ Sprawdzam status PIN...';
        pinStatusEl.style.color = '#94a3b8';
      } else if (pinIsSet) {
        pinStatusEl.textContent = '🔒 PIN aktywny — panel ustawień zablokowany';
        pinStatusEl.style.color = '#16a34a';
      } else {
        pinStatusEl.textContent = '🔓 Brak PINu — panel ustawień dostępny dla każdego';
        pinStatusEl.style.color = '#b45309';
      }
    }
  };

  const loadPinStatus = async () => {
    const result = await verifyPinOnServer();
    if (result.error === 'offline' || result.error === 'server_error') {
      if (pinStatusEl) {
        pinStatusEl.textContent = '⚠️ Nie można sprawdzić statusu (brak połączenia)';
        pinStatusEl.style.color = '#b45309';
      }
      return;
    }
    pinIsSet = result.firstRun !== true;
    refreshPinUI();
  };

  pinSaveBtn?.addEventListener('click', async () => {
    const val = pinNewInput?.value ?? '';
    const confirmVal = pinConfirmInput?.value ?? '';
    if (val.length < 4) {
      if (pinMsg) { pinMsg.textContent = 'PIN musi mieć min. 4 znaki.'; pinMsg.style.display = 'block'; pinMsg.style.color = '#dc2626'; }
      return;
    }
    if (val !== confirmVal) {
      if (pinMsg) { pinMsg.textContent = 'PINy nie są zgodne.'; pinMsg.style.display = 'block'; pinMsg.style.color = '#dc2626'; }
      return;
    }
    if (pinSaveBtn) { pinSaveBtn.disabled = true; pinSaveBtn.textContent = '⏳ Zapisuję...'; }
    const result = await setPinOnServer(val);
    if (pinSaveBtn) { pinSaveBtn.disabled = false; pinSaveBtn.textContent = 'Zapisz PIN'; }
    if (result.ok) {
      if (pinNewInput) pinNewInput.value = '';
      if (pinConfirmInput) pinConfirmInput.value = '';
      if (pinMsg) { pinMsg.textContent = 'PIN zapisany.'; pinMsg.style.display = 'block'; pinMsg.style.color = '#16a34a'; }
      pinIsSet = true;
      refreshPinUI();
    } else {
      const errText = result.error === 'offline' ? 'Błąd połączenia z serwerem.'
        : result.error === 'wrong_current' ? 'Nieprawidłowy aktualny PIN.'
        : 'Błąd zapisu PIN.';
      if (pinMsg) { pinMsg.textContent = errText; pinMsg.style.display = 'block'; pinMsg.style.color = '#dc2626'; }
    }
  });

  pinChangeToggleBtn?.addEventListener('click', () => {
    if (!pinChangeExpandedForm) return;
    const isOpen = pinChangeExpandedForm.style.display !== 'none';
    if (isOpen) {
      collapseChangeForms();
      if (pinMsg) pinMsg.style.display = 'none';
    } else {
      pinChangeExpandedForm.style.display = 'block';
    }
  });

  pinChangeCancelBtn?.addEventListener('click', () => {
    collapseChangeForms();
    if (pinMsg) pinMsg.style.display = 'none';
  });

  pinDoChangeBtn?.addEventListener('click', async () => {
    const current = pinCurrentInput?.value ?? '';
    const newVal = pinNewChangeInput?.value ?? '';
    const confirmVal = pinConfirmChangeInput?.value ?? '';
    if (!current) {
      if (pinMsg) { pinMsg.textContent = 'Podaj aktualny PIN.'; pinMsg.style.display = 'block'; pinMsg.style.color = '#dc2626'; }
      return;
    }
    if (newVal.length < 4) {
      if (pinMsg) { pinMsg.textContent = 'Nowy PIN musi mieć min. 4 znaki.'; pinMsg.style.display = 'block'; pinMsg.style.color = '#dc2626'; }
      return;
    }
    if (newVal !== confirmVal) {
      if (pinMsg) { pinMsg.textContent = 'PINy nie są zgodne.'; pinMsg.style.display = 'block'; pinMsg.style.color = '#dc2626'; }
      return;
    }
    if (pinDoChangeBtn) { pinDoChangeBtn.disabled = true; pinDoChangeBtn.textContent = '⏳ Zapisuję...'; }
    const result = await setPinOnServer(newVal, current);
    if (pinDoChangeBtn) { pinDoChangeBtn.disabled = false; pinDoChangeBtn.textContent = 'Zapisz nowy PIN'; }
    if (result.ok) {
      collapseChangeForms();
      if (pinMsg) { pinMsg.textContent = 'PIN zmieniony.'; pinMsg.style.display = 'block'; pinMsg.style.color = '#16a34a'; }
    } else {
      const errText = result.error === 'offline' ? 'Błąd połączenia z serwerem.'
        : result.error === 'wrong_current' ? 'Nieprawidłowy aktualny PIN.'
        : 'Błąd zmiany PIN.';
      if (pinMsg) { pinMsg.textContent = errText; pinMsg.style.display = 'block'; pinMsg.style.color = '#dc2626'; }
    }
  });

  pinRemoveToggleBtn?.addEventListener('click', () => {
    if (!pinRemoveSection) return;
    const isOpen = pinRemoveSection.style.display !== 'none';
    if (isOpen) {
      pinRemoveSection.style.display = 'none';
      if (pinRemoveConfirmInput) pinRemoveConfirmInput.value = '';
    } else {
      pinRemoveSection.style.display = 'block';
    }
  });

  pinRemoveBtn?.addEventListener('click', async () => {
    const current = pinRemoveConfirmInput?.value ?? '';
    if (!current) {
      if (pinMsg) { pinMsg.textContent = 'Podaj aktualny PIN, aby usunąć.'; pinMsg.style.display = 'block'; pinMsg.style.color = '#dc2626'; }
      return;
    }
    if (pinRemoveBtn) { pinRemoveBtn.disabled = true; pinRemoveBtn.textContent = '⏳ Usuwam...'; }
    const result = await removePinOnServer(current);
    if (pinRemoveBtn) { pinRemoveBtn.disabled = false; pinRemoveBtn.textContent = 'Usuń PIN'; }
    if (result.ok) {
      sessionStorage.removeItem(SETTINGS_AUTH_KEY);
      collapseChangeForms();
      if (pinMsg) { pinMsg.textContent = 'PIN usunięty.'; pinMsg.style.display = 'block'; pinMsg.style.color = '#16a34a'; }
      pinIsSet = false;
      refreshPinUI();
    } else {
      const errText = result.error === 'offline' ? 'Błąd połączenia z serwerem.'
        : result.error === 'wrong_current' ? 'Nieprawidłowy PIN.'
        : 'Błąd usuwania PIN.';
      if (pinMsg) { pinMsg.textContent = errText; pinMsg.style.display = 'block'; pinMsg.style.color = '#dc2626'; }
    }
  });

  const employeeModeBtn = document.getElementById('employeeModeBtn') as HTMLButtonElement | null;
  const pinPanelSection = document.getElementById('pinPanelSection') as HTMLElement | null;
  if (employeeModeBtn && pinPanelSection) {
    employeeModeBtn.addEventListener('click', () => {
      const isHidden = pinPanelSection.hasAttribute('hidden');
      if (isHidden) {
        pinPanelSection.removeAttribute('hidden');
        employeeModeBtn.setAttribute('aria-expanded', 'true');
      } else {
        pinPanelSection.setAttribute('hidden', '');
        employeeModeBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  refreshPinUI();
  void loadPinStatus();

  updateCartUI();
  setupFormValidation();

  syncVariantsToSubgroupsAtStartup();
  router.start();

  (async () => {
    try {
      const remote = await fetchStateFromAppsScript();
      if (!remote) return;

      if (Object.keys(remote.prices).length > 0) {
        setPrice("defaultPrices", remote.prices as Record<string, number | null>);
        localStorage.setItem('razdwa_prices_ts', String(Date.now()));
      }
      if (remote.variants.length > 0) {
        setVariantDefinitions(remote.variants);
        syncVariantsToSubgroupsAtStartup();
      }
    } catch {
      // offline - OK, nie blokuje startu
    }
  })();
});

(window as any).scrollToTopTiles = () => {
  const grid = document.querySelector('.category-sticky');
  if (grid) {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    grid.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
  }
};

