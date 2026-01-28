import { Router } from "./router";
import { ViewContext, CartItem } from "./types";
import { SampleCategory } from "./categories/sample";
import { SolwentPlakatyView } from "./categories/solwent-plakaty";
import { formatPLN } from "../core/money";

const basket: CartItem[] = [];

function updateCartUI() {
  const listEl = document.getElementById("basketList");
  const totalEl = document.getElementById("basketTotal");
  const debugEl = document.getElementById("basketDebug");

  if (!listEl || !totalEl || !debugEl) return;

  if (basket.length === 0) {
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
    listEl.innerHTML = basket.map((item, idx) => `
      <div class="basketItem">
        <div style="min-width:0;">
          <div class="basketTitle">${item.title}</div>
          <div class="basketMeta">${item.description}</div>
        </div>
        <div style="display:flex; gap:10px; align-items:center;">
          <div class="basketPrice">${formatPLN(item.totalPrice)}</div>
          <button class="iconBtn" onclick="window.removeItem(${idx})" title="Usuń">×</button>
        </div>
      </div>
    `).join("");
  }

  const total = basket.reduce((sum, item) => sum + item.totalPrice, 0);
  totalEl.innerText = formatPLN(total).replace(" zł", "");
  debugEl.innerText = JSON.stringify(basket.map(i => i.payload), null, 2);
}

// Global exposure for the 'onclick' in generated HTML
(window as any).removeItem = (idx: number) => {
  basket.splice(idx, 1);
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
        basket.push(item);
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
    basket.length = 0;
    updateCartUI();
  });

  router.start();
});
