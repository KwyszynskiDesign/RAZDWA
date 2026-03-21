import { Router } from "./router";
import { ViewContext } from "./types";
import { SolwentPlakatyView } from "./views/solwent-plakaty";
import { PlakatyWFView } from "./views/plakaty-wf";
import { PlakatyA4A3View } from "./views/plakaty-a4-a3";
import { VoucheryView } from "./views/vouchery";
import { DyplomyView } from "./views/dyplomy";
import { WizytowkiView } from "./views/wizytowki-druk-cyfrowy-fixed";
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
import categories from "../../data/categories.json";

const cart = new Cart();

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

function showToast(message: string) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerText = message;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 300);
  }, 2000);
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
  totalEl.innerText = formatPLN(total);
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
    showToast("✓ Dodano do koszyka");
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
        showToast("✓ Dodano do koszyka");
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
      showToast("✓ Dodano do koszyka");
    },
    expressMode: globalExpress.checked,
    updateLastCalculated: (price, hint) => {
      const currentPriceEl = document.getElementById("currentPrice");
      const currentHintEl = document.getElementById("currentHint");
      if (currentPriceEl) currentPriceEl.innerText = formatPLN(price);
      if (currentHintEl) currentHintEl.innerText = hint ? `(${hint})` : "";
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
      opt.innerText = `${cat.icon} ${cat.name}`;
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

  // Copy summary to clipboard
  document.getElementById("copyBtn")?.addEventListener("click", () => {
    const total = document.getElementById("basketTotal");
    const text = total ? `Suma: ${total.innerText}` : "Brak pozycji";
    navigator.clipboard?.writeText(text);
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
      phone: (document.getElementById("custPhone") as HTMLInputElement).value || "-",
      email: (document.getElementById("custEmail") as HTMLInputElement).value || "-",
      priority: (document.getElementById("custPriority") as HTMLSelectElement).value,
      notes: (document.getElementById("custNotes") as HTMLTextAreaElement | null)?.value?.trim() || ""
    };

    if (cart.isEmpty()) {
      alert("Koszyk jest pusty!");
      return;
    }

    const items = cart.getItems();
    const exportConfig = getOrderExportConfig();

    if (exportConfig.enabled && exportConfig.appsScriptUrl) {
      const payload = buildOrderExportPayload(items, customer);
      const result = await sendOrderToAppsScript(payload, exportConfig);

      if (result.ok) {
        showToast("✓ Wysłano do bazy (Google Sheets)");
        alert("Zamówienie wysłane do bazy (Google Sheets).\n\nMożesz dalej pracować z listą albo ją wyczyścić.");
        return;
      }

      alert(`Nie udało się wysłać do bazy: ${result.message || "nieznany błąd"}\n\nPobieram plik Excel lokalnie jako kopię zapasową.`);
      downloadExcel(items, customer);
      return;
    }

    downloadExcel(items, customer);
    alert("Brak aktywnej integracji Apps Script. Zapisano lokalny plik Excel.");
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
