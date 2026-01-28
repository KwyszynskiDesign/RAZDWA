import { Router } from "./router";
import { ViewContext } from "./types";
import { SampleCategory } from "./categories/sample";
import { SolwentPlakatyView } from "./views/solwent-plakaty";
import { VoucheryView } from "./views/vouchery";
import { WizytowkiView } from "./views/wizytowki-druk-cyfrowy";
import { UlotkiDwustronneView } from "./views/ulotki-cyfrowe-dwustronne";
import { formatPLN } from "../core/money";
import { Cart } from "../core/cart";
import { downloadExcel } from "./excel";
import { CustomerData } from "../core/types";
import categories from "../../data/categories.json";

const cart = new Cart();

function updateCartUI() {
  const listEl = document.getElementById("basketList");
  const totalEl = document.getElementById("basketTotal");
  const debugEl = document.getElementById("basketDebug");

  if (!listEl || !totalEl || !debugEl) return;

  const items = cart.getItems();

  if (items.length === 0) {
    listEl.innerHTML = `
      <div class="basketItem">
        <div>
          <div class="basketTitle">Brak pozycji</div>
          <div class="basketMeta">Kliknij „Dodaj”, aby zbudować listę.</div>
        </div>
        <div class="basketPrice">—</div>
      </div>
    `;
  } else {
    listEl.innerHTML = items.map((item, idx) => `
      <div class="basketItem">
        <div style="min-width:0;">
          <div class="basketTitle">${item.category}: ${item.name}</div>
          <div class="basketMeta">${item.optionsHint} (${item.quantity} ${item.unit})</div>
        </div>
        <div style="display:flex; gap:10px; align-items:center;">
          <div class="basketPrice">${formatPLN(item.totalPrice)}</div>
          <button class="iconBtn" onclick="window.removeItem(${idx})" title="Usuń">×</button>
        </div>
      </div>
    `).join("");
  }

  const total = cart.getGrandTotal();
  totalEl.innerText = formatPLN(total).replace(" zł", "");
  debugEl.innerText = JSON.stringify(items.map(i => i.payload), null, 2);
}

// Global exposure for the 'onclick' in generated HTML
(window as any).removeItem = (idx: number) => {
  cart.removeItem(idx);
  updateCartUI();
};

document.addEventListener("DOMContentLoaded", () => {
  const viewContainer = document.getElementById("viewContainer");
  const categorySelector = document.getElementById("categorySelector") as HTMLSelectElement;
  const categorySearch = document.getElementById("categorySearch") as HTMLInputElement;
  const globalExpress = document.getElementById("globalExpress") as HTMLInputElement;

  if (!viewContainer || !categorySelector || !globalExpress || !categorySearch) return;

  const getCtx = (): ViewContext => ({
    cart: {
      addItem: (item) => {
        cart.addItem(item);
        updateCartUI();
      }
    },
    expressMode: globalExpress.checked,
    updateLastCalculated: (price, hint) => {
      const currentPriceEl = document.getElementById("currentPrice");
      const currentHintEl = document.getElementById("currentHint");
      if (currentPriceEl) currentPriceEl.innerText = formatPLN(price).replace(" zł", "");
      if (currentHintEl) currentHintEl.innerText = hint ? `(${hint})` : "";
    }
  });

  const router = new Router(viewContainer, getCtx);
  router.setCategories(categories);
  router.addRoute(SolwentPlakatyView);
  router.addRoute(VoucheryView);
  router.addRoute(WizytowkiView);
  router.addRoute(UlotkiDwustronneView);

  // Populate category selector
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

  categorySearch.addEventListener("input", () => {
    const filter = categorySearch.value.toLowerCase();
    const options = Array.from(categorySelector.options);
    options.forEach((opt, idx) => {
      if (idx === 0) return; // Skip "Wybierz kategorię..."
      const text = opt.text.toLowerCase();
      (opt as any).hidden = !text.includes(filter);
    });
  });

  categorySearch.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const filter = categorySearch.value.toLowerCase();
      const firstVisible = Array.from(categorySelector.options).find((opt, idx) => {
        return idx > 0 && !(opt as any).hidden && !(opt as any).disabled;
      });
      if (firstVisible) {
        categorySelector.value = firstVisible.value;
        window.location.hash = `#/${firstVisible.value}`;
        categorySearch.value = "";
      }
    }
  });

  // Keep selector in sync with hash
  window.addEventListener("hashchange", () => {
    const hash = window.location.hash || "#/";
    const path = hash.slice(2); // remove #/
    categorySelector.value = path;
  });

  // Re-render view when express mode changes
  globalExpress.addEventListener("change", () => {
    // Triger route refresh
    const currentHash = window.location.hash;
    window.location.hash = "";
    window.location.hash = currentHash;
  });

  // Clear basket
  document.getElementById("clearBtn")?.addEventListener("click", () => {
    cart.clear();
    updateCartUI();
  });

  // Excel download
  document.getElementById("sendBtn")?.addEventListener("click", () => {
    const customer: CustomerData = {
      name: (document.getElementById("custName") as HTMLInputElement).value || "Anonim",
      phone: (document.getElementById("custPhone") as HTMLInputElement).value || "-",
      email: (document.getElementById("custEmail") as HTMLInputElement).value || "-",
      priority: (document.getElementById("custPriority") as HTMLSelectElement).value
    };

    if (cart.isEmpty()) {
      alert("Lista jest pusta!");
      return;
    }

    downloadExcel(cart.getItems(), customer);
  });

  updateCartUI();
  router.start();
});

// Service Worker Registration
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js")
      .then(reg => console.log("SW registered", reg))
      .catch(err => console.error("SW failed", err));
  });
}
