import { Router } from "./router";
import { View, ViewContext, CartItem } from "./types";
import { SolwentPlakatyView } from "./views/solwent-plakaty";
import { formatPLN } from "../core/money";

const categories = [
  { id: "solwent-plakaty", label: "Solwent - Plakaty", view: new SolwentPlakatyView() },
  { id: "vouchery", label: "Vouchery", view: new CategoryPlaceholder("Vouchery") }
];

function CategoryPlaceholder(title: string): View {
  return {
    mount(el: HTMLElement, ctx: ViewContext) {
      el.innerHTML = `<h2>${title}</h2><p>Widok kategorii: ${title}. Logika wyceny zostanie podpięta wkrótce.</p>`;
    }
  };
}

function renderMenu() {
  const menuEl = document.getElementById("menu");
  if (!menuEl) return;

  menuEl.innerHTML = categories.map(cat => `
    <a href="#/${cat.id}" class="menu-item" id="menu-link-${cat.id}">${cat.label}</a>
  `).join("");

  // Sync active state
  const syncActive = () => {
    const hash = window.location.hash || "#/";
    categories.forEach(cat => {
      const link = document.getElementById(`menu-link-${cat.id}`);
      if (link) {
        link.classList.toggle("active", hash === `#/${cat.id}`);
      }
    });
  };

  window.addEventListener("hashchange", syncActive);
  syncActive();
}

document.addEventListener("DOMContentLoaded", () => {
  const viewContainer = document.getElementById("view");
  if (!viewContainer) return;

  const cart: CartItem[] = [];

  const updateCartUI = () => {
    const total = cart.reduce((sum, item) => sum + item.totalPrice, 0);
    const basketTotalEl = document.getElementById("basketTotal");
    if (basketTotalEl) basketTotalEl.innerText = formatPLN(total).replace(" zł", "");

    const basketDebugEl = document.getElementById("basketDebug");
    if (basketDebugEl) basketDebugEl.innerText = JSON.stringify(cart, null, 2);

    // Simple list render
    const basketListEl = document.getElementById("basketList");
    if (basketListEl) {
      basketListEl.innerHTML = cart.map(item => `
        <div class="basketItem">
          <div>
            <div class="basketTitle">${item.title}</div>
            <div class="basketMeta">${item.description}</div>
          </div>
          <div class="basketPrice">${formatPLN(item.totalPrice)}</div>
        </div>
      `).join("");
    }
  };

  const ctx: ViewContext = {
    addToCart: (item: CartItem) => {
      cart.push(item);
      updateCartUI();
    },
    updateLastCalculated: (price: number) => {
      const currentPriceEl = document.getElementById("currentPrice");
      if (currentPriceEl) currentPriceEl.innerText = formatPLN(price).replace(" zł", "");
    }
  };

  const router = new Router(viewContainer, ctx);

  categories.forEach(cat => {
    router.addRoute(`/${cat.id}`, cat.view);
  });

  // Default route
  router.addRoute("/", {
    mount(el) {
      el.innerHTML = "<h2>Witaj w Kalkulatorze</h2><p>Wybierz kategorię z menu po lewej.</p>";
    }
  });

  const clearBtn = document.getElementById("clearBtn");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      cart.length = 0;
      updateCartUI();
    });
  }

  renderMenu();
  router.start();
});
