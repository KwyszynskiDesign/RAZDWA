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
import { buildOrderExportPayload, getOrderExportConfig, sendOrderToAppsScript } from "../services/orderExportService";
import { PRICES_UPDATED_EVENT } from "../services/priceService";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import categories from "../../data/categories.json";

const cart = new Cart();

// Loading popup functions
function showOrderLoadingPopup(message: string = "WYSYŁANIE...", type: "sending" | "success" = "sending") {
  const popup = document.getElementById("orderLoadingPopup");
  const text = document.getElementById("loadingText");
  if (popup && text) {
    text.textContent = message;
    popup.className = `loading-popup loading-popup--${type}`;
    popup.style.display = "flex";
  }
}

function hideOrderLoadingPopup() {
  const popup = document.getElementById("orderLoadingPopup");
  if (popup) {
    popup.style.display = "none";
  }
}

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
  // Standard fonts in pdf-lib use WinAnsi and may fail on PL diacritics/emojis.
  // Replace problematic chars with safe ASCII equivalents.
  return String(value ?? "")
    .replace(/[Ąą]/g, "a")
    .replace(/[Ćć]/g, "c")
    .replace(/[Ęę]/g, "e")
    .replace(/[Łł]/g, "l")
    .replace(/[Ńń]/g, "n")
    .replace(/[Óó]/g, "o")
    .replace(/[Śś]/g, "s")
    .replace(/[ŹźŻż]/g, "z")
    .replace(/[–—]/g, "-")
    .replace(/[“”„]/g, '"')
    .replace(/[’]/g, "'")
    .replace(/[^\x20-\x7E]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function generateOrderReportPdf(items: CartItem[], customer: CustomerData) {
  const pdf = await PDFDocument.create();
  const fontRegular = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);

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
    const safeText = toPdfSafeText(text);
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
    <span class="ghost-toast__message">${message}</span>
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
  const debugEl = document.getElementById("basketDebug");

  if (!listEl || !totalEl) return;

  const items = cart.getItems();

  if (items.length === 0) {
    listEl.innerHTML = `
      <div class="basketItem">
        <div>
          <div class="basketTitle">Brak pozycji</div>
          <div class="basketMeta">Kliknij „DODAJ DO KOSZYKA”, aby zbudować koszyk.</div>
        </div>
        <div class="basketPrice">—</div>
      </div>
    `;
  } else {
    listEl.innerHTML = items.map((item, idx) => `
      <div class="basketItem">
        <div class="basketItemContent">
          <div class="basketName">${item.name}</div>
          <div class="basketMeta">${item.optionsHint}</div>
        </div>
        <div class="basketItemRight">
          <div class="basketPrice">${formatPLN(item.totalPrice)}</div>
          <button class="iconBtn" data-remove-idx="${idx}" title="Usuń">×</button>
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

  if (debugEl) {
    debugEl.innerText = JSON.stringify(items.map(i => i.payload), null, 2);
  }
}


document.addEventListener("DOMContentLoaded", () => {
  const viewContainer = document.getElementById("viewContainer");
  const categorySearch = document.getElementById("categorySearch") as HTMLInputElement;
  const categorySearchButton = document.getElementById("categorySearchButton") as HTMLButtonElement | null;
  const globalExpress = document.getElementById("globalExpress") as HTMLInputElement;

  const syncHomeLayoutMode = () => {
    const hash = window.location.hash || "#/";
    const isHome = hash === "#/" || hash === "#" || hash.trim() === "";
    document.body.classList.toggle("home-compact-layout", isHome);
  };

  window.addEventListener("hashchange", syncHomeLayoutMode);
  syncHomeLayoutMode();

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

  if (!viewContainer || !globalExpress || !categorySearch) return;

  const categoryTiles = Array.from(document.querySelectorAll<HTMLAnchorElement>(".tile-grid .tile"));

  const getVisibleCategoryTiles = () => categoryTiles.filter((tile) => !tile.hidden && tile.offsetParent !== null);

  const filterCategoryTiles = () => {
    const filter = categorySearch.value.trim().toLowerCase();

    categoryTiles.forEach((tile) => {
      const tileTitle = tile.querySelector(".tile-title")?.textContent?.toLowerCase() ?? "";
      const tileLabel = tile.getAttribute("aria-label")?.toLowerCase() ?? "";
      const matches = !filter || tileTitle.includes(filter) || tileLabel.includes(filter);
      tile.hidden = !matches;
    });

    if (categorySelector) {
      const options = Array.from(categorySelector.options);
      options.forEach((opt, idx) => {
        if (idx === 0) return;
        const text = opt.text.toLowerCase();
        (opt as HTMLOptionElement & { hidden?: boolean }).hidden = !!filter && !text.includes(filter);
      });
    }
  };

  const navigateToFirstMatchedCategory = () => {
    const firstVisibleTile = getVisibleCategoryTiles()[0];
    if (firstVisibleTile) {
      const targetHash = firstVisibleTile.getAttribute("href");
      if (targetHash) {
        window.location.hash = targetHash;
      }
      categorySearch.blur();
      return;
    }

    if (categorySelector) {
      const firstVisible = Array.from(categorySelector.options).find((opt, idx) => {
        return idx > 0 && !(opt as HTMLOptionElement & { hidden?: boolean }).hidden && !opt.disabled;
      });
      if (firstVisible) {
        categorySelector.value = firstVisible.value;
        window.location.hash = `#/${firstVisible.value}`;
        categorySearch.blur();
      }
    }
  };

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

  // Populate category selector (if exists)
  const categorySelector = document.getElementById("categorySelector") as HTMLSelectElement | null;
  if (categorySelector) {
    categories.forEach(cat => {
      const opt = document.createElement("option");
      opt.value = cat.id;
      const iconText = /^https?:\/\//i.test(String(cat.icon ?? "")) ? "-" : String(cat.icon ?? "");
      opt.innerText = `${iconText} ${cat.name}`;
      if (!cat.implemented) {
        opt.disabled = true;
        opt.innerText += " (wkrótce)";
      }
      categorySelector.appendChild(opt);
    });

    categorySelector.addEventListener("change", () => {
      const val = categorySelector.value;
      if (val) {
        window.location.hash = `#/${val}`;
      } else {
        window.location.hash = "#/";
      }
    });

    // Keep selector in sync with hash
    window.addEventListener("hashchange", () => {
      const hash = window.location.hash || "#/";
      const path = hash.slice(2); // remove #/
      categorySelector.value = path;
    });
  }

  categorySearch.addEventListener("input", filterCategoryTiles);

  categorySearch.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      navigateToFirstMatchedCategory();
    }
  });

  categorySearchButton?.addEventListener("click", () => {
    if (categorySearch.value.trim()) {
      navigateToFirstMatchedCategory();
      return;
    }

    categorySearch.focus();
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

  // Generate PDF report with order data + basket summary
  document.getElementById("copyBtn")?.addEventListener("click", async () => {
    if (cart.isEmpty()) {
      showToast("Koszyk jest pusty", "error");
      alert("Koszyk jest pusty!");
      return;
    }

    const customer: CustomerData = {
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
  document.getElementById("sendBtn")?.addEventListener("click", async () => {
    const customer: CustomerData = {
      name: (document.getElementById("custName") as HTMLInputElement).value || "Anonim",
      company: (document.getElementById("custCompany") as HTMLInputElement | null)?.value?.trim() || undefined,
      nip: (document.getElementById("custNip") as HTMLInputElement | null)?.value?.trim() || undefined,
      phone: (document.getElementById("custPhone") as HTMLInputElement).value || "-",
      email: (document.getElementById("custEmail") as HTMLInputElement).value || "-",
      priority: (document.getElementById("custPriority") as HTMLSelectElement).value,
      notes: (document.getElementById("custNotes") as HTMLTextAreaElement | null)?.value?.trim() || ""
    };

    if (cart.isEmpty()) {
      showToast("Koszyk jest pusty", "error");
      alert("Koszyk jest pusty!");
      return;
    }

    const items = cart.getItems();
    const exportConfig = getOrderExportConfig();

    if (exportConfig.enabled && exportConfig.appsScriptUrl) {
      showOrderLoadingPopup("WYSYŁANIE...", "sending");
      try {
        const payload = buildOrderExportPayload(items, customer);
        const result = await sendOrderToAppsScript(payload, exportConfig);

        if (result.ok) {
          showOrderLoadingPopup("COMPLET - WYSŁANO", "success");
          setTimeout(() => {
            hideOrderLoadingPopup();
            if (result.verified === false) {
              showToast(result.message || "Wysłano bez potwierdzenia odpowiedzi serwera.", "warning");
            } else {
              showToast("Wysłano do bazy (Google Sheets)", "success");
            }
            cart.clear();
            updateCartUI();
          }, 4500);
          return;
        }

        hideOrderLoadingPopup();
        showToast(`Błąd wysyłki: ${result.message || "nieznany błąd"}`, "error");
      } catch (error) {
        hideOrderLoadingPopup();
        showToast(`Błąd wysyłki: ${error}`, "error");
      }
      return;
    }

    showToast("Brak aktywnej integracji Apps Script — skonfiguruj URL w ustawieniach.", "error");
  });

  updateCartUI();
  filterCategoryTiles();
  router.start();
});

(window as any).scrollToTopTiles = () => {
  const grid = document.querySelector('.category-sticky');
  if (grid) {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    grid.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
  }
};

// Service Worker Registration
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js")
      .then((registration) => {
        registration.update();

        let refreshed = false;
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          if (refreshed) return;
          refreshed = true;
          window.location.reload();
        });
      })
      .catch(() => {});
  });
}
