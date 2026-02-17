import { View, ViewContext } from "../types";
import { priceStore, PriceEntry } from "../../core/price-store";
import { formatPLN } from "../../core/money";

export const SettingsView: View = {
  id: "settings",
  name: "⚙️ Ustawienia",
  mount: (container: HTMLElement, ctx: ViewContext) => {
    const entries = priceStore.getAllEntries();
    const categories = Array.from(new Set(entries.map(e => e.category))).sort();

    container.innerHTML = `
      <div class="category-view" style="max-width: 1000px; margin: 0 auto;">
        <div class="view-header">
          <h2>⚙️ Zarządzanie cenami</h2>
        </div>

        <div class="settings-tabs" style="display: flex; gap: 5px; margin-bottom: 20px;">
          <button class="tab-btn active" data-tab="tab-ceny">Ceny</button>
          <button class="tab-btn" data-tab="tab-mnozniki">Mnożniki</button>
          <button class="tab-btn" data-tab="tab-progi">Progi ilościowe</button>
          <button class="tab-btn" data-tab="tab-ogolne">Ogólne</button>
        </div>

        <div id="tab-ceny" class="tab-content active">
          <div class="card">
            <div class="sticky-actions">
              <div style="display: flex; gap: 10px; align-items: center;">
                <label style="margin: 0;">Filtruj kategorię:</label>
                <select id="filter-category" style="width: 200px;">
                  <option value="">Wszystkie</option>
                  ${categories.map(cat => `<option value="${cat}">${cat}</option>`).join("")}
                </select>
              </div>
              <button class="btn-success save-btn">Zapisz ceny</button>
            </div>

            <div class="settings-table-container">
              <table class="settings-table">
                <thead>
                  <tr>
                    <th>Kategoria</th>
                    <th>Produkt / Próg</th>
                    <th>Aktualna cena</th>
                    <th>Nowa cena</th>
                  </tr>
                </thead>
                <tbody id="price-table-body">
                  <!-- Rows will be injected here -->
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div id="tab-mnozniki" class="tab-content" style="display: none;">
          <div class="card">
            <h3>Współczynniki i mnożniki</h3>
            <p style="color: #94a3b8;">Zarządzaj mnożnikami dla dwustronności, ekspresu i innych.</p>
            <div class="settings-table-container">
              <table class="settings-table">
                <thead>
                  <tr><th>Nazwa</th><th>Wartość</th></tr>
                </thead>
                <tbody>
                  <tr><td>Dwustronność (Standard)</td><td>1.8x</td></tr>
                  <tr><td>Tryb EXPRESS</td><td>1.2x</td></tr>
                  <tr><td>Druk Satyna (+12%)</td><td>1.12x</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div id="tab-progi" class="tab-content" style="display: none;">
          <div class="card">
            <h3>Progi ilościowe</h3>
            <p style="color: #94a3b8;">Definiuj progi dla kalkulacji uniwersalnej.</p>
            <!-- Content for thresholds -->
          </div>
        </div>

        <div id="tab-ogolne" class="tab-content" style="display: none;">
          <div class="card">
            <h3>Ustawienia ogólne</h3>
            <div class="form-group">
              <label>Nazwa drukarni:</label>
              <input type="text" class="form-control" value="RazDwa">
            </div>
            <div class="form-group">
              <label>Waluta:</label>
              <input type="text" class="form-control" value="PLN">
            </div>
          </div>
        </div>

        <div id="save-success" class="modal-overlay" style="display: none; background: rgba(16, 185, 129, 0.2);">
           <div class="modal-content" style="border-color: #10b981;">
              <h3 style="color: #10b981;">✅ Sukces</h3>
              <p>Ceny zostały zaktualizowane!</p>
              <button id="close-success" class="btn-success" style="margin-top: 20px;">OK</button>
           </div>
        </div>
      </div>
    `;

    const tableBody = container.querySelector("#price-table-body") as HTMLElement;
    const filterSelect = container.querySelector("#filter-category") as HTMLSelectElement;
    const successModal = container.querySelector("#save-success") as HTMLElement;
    const closeSuccessBtn = container.querySelector("#close-success") as HTMLElement;

    function renderTable(filter: string = "") {
      const filteredEntries = filter
        ? entries.filter(e => e.category === filter)
        : entries;

      tableBody.innerHTML = filteredEntries.map(e => `
        <tr data-category="${e.category}">
          <td style="color: #94a3b8;">${e.category}</td>
          <td><strong>${e.name}</strong></td>
          <td>${e.currentValue.toFixed(2)} zł</td>
          <td>
            <input type="number" step="0.01" min="0"
                   class="price-input" data-id="${e.id}"
                   placeholder="${e.currentValue.toFixed(2)}">
          </td>
        </tr>
      `).join("");
    }

    function handleSave() {
      const inputs = container.querySelectorAll(".price-input") as NodeListOf<HTMLInputElement>;
      const updates: Record<string, number> = {};
      let changedCount = 0;

      inputs.forEach(input => {
        const val = input.value;
        if (val !== "" && !isNaN(parseFloat(val))) {
          const newPrice = parseFloat(val);
          const id = input.getAttribute("data-id")!;
          const entry = entries.find(e => e.id === id);

          if (entry && entry.currentValue !== newPrice) {
            updates[id] = newPrice;
            changedCount++;
          }
        }
      });

      if (changedCount > 0) {
        priceStore.updatePrices(updates);
        // Refresh local entries
        const updatedEntries = priceStore.getAllEntries();
        entries.forEach(e => {
          if (updates[e.id] !== undefined) e.currentValue = updates[e.id];
        });

        renderTable(filterSelect.value);
        if (successModal) successModal.style.display = "flex";
      } else {
        alert("Brak zmian do zapisania.");
      }
    }

    // Tab switching logic
    const tabBtns = container.querySelectorAll(".tab-btn");
    const tabContents = container.querySelectorAll(".tab-content");

    tabBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const tabId = btn.getAttribute("data-tab");

        tabBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        tabContents.forEach(content => {
          if (content.id === tabId) {
            (content as HTMLElement).style.display = "block";
          } else {
            (content as HTMLElement).style.display = "none";
          }
        });
      });
    });

    filterSelect.addEventListener("change", () => renderTable(filterSelect.value));
    container.querySelectorAll(".save-btn").forEach(btn => btn.addEventListener("click", handleSave));
    closeSuccessBtn?.addEventListener("click", () => {
      if (successModal) successModal.style.display = "none";
    });

    renderTable();
  }
};
