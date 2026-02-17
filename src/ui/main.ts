import { Router } from "./router";
import { ViewContext } from "./types";
import { formatPLN } from "../core/money";
import { Cart } from "../core/cart";
import { downloadExcel } from "./excel";
import { CustomerData } from "../core/types";
import categories from "../../data/categories.json";
import { categories as categoryModules } from "../categories/index";
import { CONFIG } from "../core/config";
import { SettingsView } from "./views/settings";

const cart = new Cart();

function updateCartUI() {
  const listEl = document.getElementById("basket-items");
  const totalEl = document.getElementById("basket-total");
  const debugEl = document.getElementById("json-preview");

  if (!listEl || !totalEl || !debugEl) return;

  const items = cart.getItems();

  if (items.length === 0) {
    listEl.innerHTML = `
      <p style="color: #999; text-align: center; padding: 20px;">
        Brak pozycji<br>
        <small>Kliknij „Dodaj”, aby zbudować listę.</small>
      </p>
    `;
    totalEl.textContent = '0,00 zł';
  } else {
    listEl.innerHTML = items.map((item, idx) => `
      <div class="basket-item" style="padding: 12px; background: #1a1a1a; border-radius: 8px; margin-bottom: 8px;">
        <div style="display: flex; justify-content: space-between; align-items: start;">
          <div style="flex: 1; min-width: 0;">
            <strong style="color: white; font-size: 14px; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              ${item.category}: ${item.name}
            </strong>
            <p style="color: #999; font-size: 12px; margin: 4px 0 0 0;">
              ${item.optionsHint} (${item.quantity} ${item.unit})
            </p>
          </div>
          <div style="text-align: right; margin-left: 10px; flex-shrink: 0;">
            <strong style="color: #667eea; font-size: 14px;">${formatPLN(item.totalPrice)}</strong>
            <button onclick="window.removeItem(${idx})" style="display: block; width: 100%; margin-top: 4px; background: none; border: none; color: #f56565; cursor: pointer; font-size: 12px; text-align: right; padding: 0;">✕ usuń</button>
          </div>
        </div>
      </div>
    `).join("");

    const total = cart.getGrandTotal();
    totalEl.innerText = formatPLN(total);
  }

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
  const globalExpress = document.getElementById("tryb-express") as HTMLInputElement;

  if (!viewContainer || !categorySelector || !globalExpress || !categorySearch) return;

  const getCtx = (): ViewContext => ({
    cart: {
      addItem: (item) => {
        cart.addItem(item);
        updateCartUI();
      }
    },
    addToBasket: (item) => {
      cart.addItem({
        id: `item-${Date.now()}`,
        category: item.category,
        name: item.description || "Produkt",
        quantity: 1,
        unit: "szt.",
        unitPrice: item.price,
        isExpress: globalExpress.checked,
        totalPrice: item.price,
        optionsHint: item.description || "",
        payload: item
      });
      updateCartUI();
    },
    expressMode: globalExpress.checked,
    updateLastCalculated: (price, hint) => {
      const currentPriceEl = document.getElementById("last-calculated");
      const currentHintEl = document.getElementById("currentHint");
      if (currentPriceEl) currentPriceEl.innerText = formatPLN(price);
      if (currentHintEl) currentHintEl.innerText = hint ? `(${hint})` : "";
    }
  });

  const router = new Router(viewContainer, getCtx);
  router.setCategories(categories);

  // Register all categories from the index
  categoryModules.forEach(module => {
    router.addRoute(module);
  });

  // Register settings view
  router.addRoute(SettingsView);

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
  document.getElementById("clear-basket")?.addEventListener("click", () => {
    cart.clear();
    updateCartUI();
  });

  // Excel download
  document.getElementById("export-excel")?.addEventListener("click", () => {
    const customer: CustomerData = {
      name: (document.getElementById("client-name") as HTMLInputElement).value || "Anonim",
      phone: (document.getElementById("client-phone") as HTMLInputElement).value || "-",
      email: (document.getElementById("client-email") as HTMLInputElement).value || "-",
      priority: (document.getElementById("priority") as HTMLSelectElement).value
    };

    if (cart.isEmpty()) {
      alert("Lista jest pusta!");
      return;
    }

    downloadExcel(cart.getItems(), customer);
  });

  // Copy JSON
  document.getElementById("copy-json")?.addEventListener("click", () => {
    const items = cart.getItems();
    const json = JSON.stringify(items.map(i => i.payload), null, 2);
    navigator.clipboard.writeText(json).then(() => {
      alert("JSON skopiowany do schowka!");
    });
  });

  updateCartUI();
  router.start();

  // Settings Logic
  const settingsBtn = document.getElementById("settings-btn");
  const pinModal = document.getElementById("pin-modal");
  const pinInput = document.getElementById("pin-input") as HTMLInputElement;
  const pinSubmit = document.getElementById("pin-submit");
  const pinCancel = document.getElementById("pin-cancel");
  const pinError = document.getElementById("pin-error");

  settingsBtn?.addEventListener("click", () => {
    if (pinModal) pinModal.style.display = "flex";
    pinInput?.focus();
  });

  pinCancel?.addEventListener("click", () => {
    if (pinModal) pinModal.style.display = "none";
    if (pinInput) pinInput.value = "";
    if (pinError) pinError.style.display = "none";
  });

  const verifyPin = () => {
    if (pinInput?.value === CONFIG.SETTINGS_PIN) {
      if (pinModal) pinModal.style.display = "none";
      pinInput.value = "";
      if (pinError) pinError.style.display = "none";
      window.location.hash = "#/settings";
    } else {
      if (pinError) pinError.style.display = "block";
      if (pinInput) {
        pinInput.value = "";
        pinInput.focus();
      }
    }
  };

  pinSubmit?.addEventListener("click", verifyPin);
  pinInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") verifyPin();
  });
});

// Service Worker Registration
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js")
      .then(reg => console.log("SW registered", reg))
      .catch(err => console.error("SW failed", err));
  });
}
