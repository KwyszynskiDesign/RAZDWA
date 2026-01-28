import { Router } from "./router";
import { categories } from "../categories";
import { cartApi } from "../core/cart";
import { formatPLN } from "../core/money";

const router = new Router("viewContainer");
categories.forEach(cat => {
  if (cat.mount) router.addRoute(cat as any);
});

// Category Menu Logic
const categorySelect = document.getElementById("categorySelect") as HTMLSelectElement;
const categorySearch = document.getElementById("categorySearch") as HTMLInputElement;

function populateMenu(filter = "") {
  const currentVal = categorySelect.value;
  categorySelect.innerHTML = '<option value="">-- Wybierz kategorię --</option>';

  categories
    .filter(c => c.name.toLowerCase().includes(filter.toLowerCase()))
    .forEach(c => {
      const opt = document.createElement("option");
      opt.value = c.id;
      opt.textContent = c.name;
      categorySelect.appendChild(opt);
    });

  categorySelect.value = currentVal;
}

categorySelect.addEventListener("change", () => {
  if (categorySelect.value) {
    window.location.hash = `/${categorySelect.value}`;
  }
});

categorySearch.addEventListener("input", () => {
  populateMenu(categorySearch.value);
});

// Cart Sync Logic
function updateCartUI() {
  const cartList = document.getElementById("cartList");
  const cartTotal = document.getElementById("cartTotal");
  if (!cartList || !cartTotal) return;

  const items = cartApi.getItems();
  cartList.innerHTML = "";

  if (items.length === 0) {
    cartList.innerHTML = '<div class="basketItem" style="color: var(--muted); padding: 20px; text-align: center;">Koszyk jest pusty</div>';
  } else {
    items.forEach(item => {
      const div = document.createElement("div");
      div.className = "basketItem";
      div.innerHTML = `
        <div>
          <div class="basketTitle">${item.categoryName}</div>
          <div class="basketMeta">${JSON.stringify(item.details)}</div>
        </div>
        <div style="display:flex; gap:10px; align-items:center;">
          <div class="basketPrice">${formatPLN(item.price)}</div>
          <button class="remove-item" data-id="${item.id}" style="padding: 4px 8px; font-size: 10px;">×</button>
        </div>
      `;
      cartList.appendChild(div);
    });
  }

  cartTotal.textContent = money(cartApi.getTotal());

  // Attach remove events
  cartList.querySelectorAll(".remove-item").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const id = (e.target as HTMLElement).dataset.id;
      if (id) {
        cartApi.removeItem(id);
        updateCartUI();
      }
    });
  });
}

function money(n: number) {
  return n.toFixed(2);
}

document.getElementById("clearCartBtn")?.addEventListener("click", () => {
  cartApi.clear();
  updateCartUI();
});

document.getElementById("copyCartBtn")?.addEventListener("click", async () => {
  const payload = {
    createdAt: new Date().toISOString(),
    items: cartApi.getItems(),
    total: cartApi.getTotal()
  };
  await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
  alert("Skopiowano JSON koszyka");
});

document.getElementById("sendCartBtn")?.addEventListener("click", async () => {
  const statusEl = document.getElementById("sendStatus");
  const url = (document.getElementById("webAppUrl") as HTMLInputElement)?.value;

  if (!url) {
    if (statusEl) statusEl.textContent = "Błąd: Brak URL";
    return;
  }

  const payload = {
    createdAt: new Date().toISOString(),
    items: cartApi.getItems(),
    total: cartApi.getTotal()
  };

  if (statusEl) statusEl.textContent = "Wysyłanie...";

  try {
    const res = await fetch(url, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (statusEl) statusEl.textContent = "Wysłano!";
  } catch (e) {
    if (statusEl) statusEl.textContent = "Błąd wysyłki";
  }
});

// Observe cart changes (simple way: polling or wrapping addItem)
// For now, we'll just refresh on actions.
// A better way is to make Cart an EventTarget or use a Proxy.
const originalAddItem = cartApi.addItem.bind(cartApi);
cartApi.addItem = (item) => {
  const res = originalAddItem(item);
  updateCartUI();
  return res;
};

// Init
populateMenu();
updateCartUI();
router.init();

// Sync menu with hash on load
const initialHash = window.location.hash.replace("#/", "");
if (initialHash) {
  categorySelect.value = initialHash;
}
