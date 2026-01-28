import { Router } from "./router";
import { ViewContext } from "./types";
import { SampleCategory } from "./categories/sample";
import { SolwentPlakatyView } from "./categories/solwent-plakaty";
import { formatPLN } from "../core/money";
import { Cart } from "../core/cart";
import { downloadExcel } from "./excel";
import { CustomerData } from "../core/types";

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
  router.addRoute(SampleCategory);
  router.addRoute(SolwentPlakatyView);

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
    const options = categorySelector.options;
    for (let i = 1; i < options.length; i++) {
      const option = options[i];
      const text = option.text.toLowerCase();
      (option as any).hidden = !text.includes(filter);
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
