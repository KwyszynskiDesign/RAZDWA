import { CategoryModule } from "../ui/router";
import { calculateSimplePrint, calculateSimpleScan } from "../core/compat-logic";
import { PRICE, resolveStoredPrice } from "../core/compat";

export interface DrukA4A3SkanOptions {
  mode: "bw" | "color";
  format: "A4" | "A3";
  printQty: number;
  email: boolean;
  surcharge: boolean;
  surchargeQty: number;
  scanType: "none" | "auto" | "manual";
  scanQty: number;
  express: boolean;
}

export function calculateDrukA4A3Skan(options: DrukA4A3SkanOptions, pricing?: any) {
  const format = options.format.toUpperCase() as "A4" | "A3";
  const printResult = calculateSimplePrint({
    mode: options.mode,
    format: format,
    pages: options.printQty,
    email: options.email,
    ink25: options.surcharge,
    ink25Qty: options.surchargeQty
  });

  let scanResult = { total: 0, unitPrice: 0 };
  if (options.scanType !== "none" && options.scanQty > 0) {
    scanResult = calculateSimpleScan({
      type: options.scanType as "auto" | "manual",
      pages: options.scanQty
    });
  }

  const baseTotal = printResult.grandTotal + scanResult.total;
  let finalTotal = baseTotal;
  if (options.express) {
    finalTotal = baseTotal * 1.2;
  }

  return {
    totalPrice: parseFloat(finalTotal.toFixed(2)),
    unitPrintPrice: printResult.unitPrice,
    totalPrintPrice: printResult.printTotal,
    unitScanPrice: scanResult.unitPrice,
    totalScanPrice: scanResult.total,
    emailPrice: printResult.emailTotal,
    surchargePrice: printResult.inkTotal,
    baseTotal
  };
}

function getPricePerPage(
  format: "A4" | "A3",
  quantity: number,
  color: "czarnoBialy" | "kolorowy"
): number {
  // Use PRICE from compat.ts (same data, no duplication) and apply stored overrides.
  const modeKey = color === "czarnoBialy" ? "bw" : "color";
  const tiers = (PRICE.print as any)[modeKey][format];

  let selectedTier = tiers[tiers.length - 1];
  for (const tier of tiers) {
    if (quantity >= tier.from && quantity <= tier.to) {
      selectedTier = tier;
      break;
    }
  }

  const adminModeKey = color === "czarnoBialy" ? "bw" : "kolor";
  const suffix = selectedTier.to > 50000 ? `${selectedTier.from}+` : `${selectedTier.from}-${selectedTier.to}`;
  const storageKey = `druk-${adminModeKey}-${format.toLowerCase()}-${suffix}`;
  return resolveStoredPrice(storageKey, selectedTier.unit);
}

export const drukA4A3Category: CategoryModule = {
  id: 'druk-a4-a3',
  name: '📄 Druk A4/A3 + skan',
  mount: (container, ctx) => {
    container.innerHTML = `
      <div class="category-form">
        <h2>Druk / Ksero A4/A3</h2>
        <p style="color: #999; margin-bottom: 20px;">
          Cena za stronę zależy od nakładu. Im więcej stron, tym niższa cena jednostkowa.
        </p>

        <div class="form-group">
          <label>Format:</label>
          <select id="format">
            <option value="A4">A4 (210×297 mm)</option>
            <option value="A3">A3 (297×420 mm)</option>
          </select>
        </div>

        <div class="form-group">
          <label>Ilość stron:</label>
          <input type="number" id="quantity" value="1" min="1" max="10000" step="1">
          <small style="color: #666;">Całkowita liczba stron do wydruku</small>
        </div>

        <div class="form-group">
          <label>Druk:</label>
          <select id="color">
            <option value="czarnoBialy">Czarno-biały</option>
            <option value="kolorowy">Kolorowy</option>
          </select>
        </div>

        <div id="price-tiers" style="background: #1a1a1a; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="color: #667eea; margin: 0 0 10px 0;">Przedziały cenowe:</h4>
          <div id="tiers-list"></div>
        </div>

        <div style="padding: 15px; background: #2a2a2a; border-radius: 8px; margin: 20px 0;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <span style="color: #999;">Cena za stronę:</span>
            <strong id="price-per-page" style="font-size: 18px; color: #667eea;">0.00 zł/str</strong>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="color: #999;">Cena całkowita:</span>
            <strong id="total-price" style="font-size: 24px; color: #667eea;">0.00 zł</strong>
          </div>
          <p id="price-breakdown" style="color: #666; font-size: 12px; margin: 10px 0 0 0;"></p>
        </div>

        <div style="display: flex; gap: 10px;">
          <button id="calculate" class="btn-primary" style="flex: 1;">Oblicz cenę</button>
          <button id="addToBasket" class="btn-success" style="flex: 1;">Dodaj do listy</button>
        </div>
      </div>
    `;

    let currentPrice = 0;
    let currentPricePerPage = 0;

    const formatSelect = container.querySelector('#format') as HTMLSelectElement;
    const quantityInput = container.querySelector('#quantity') as HTMLInputElement;
    const colorSelect = container.querySelector('#color') as HTMLSelectElement;
    const calculateBtn = container.querySelector('#calculate');
    const addBtn = container.querySelector('#addToBasket');
    const tiersList = container.querySelector('#tiers-list');
    const pricePerPageDisplay = container.querySelector('#price-per-page');
    const totalDisplay = container.querySelector('#total-price');
    const breakdownDisplay = container.querySelector('#price-breakdown');

    // Update tiers display when format or color changes
    function updateTiersDisplay() {
      const format = formatSelect.value as "A4" | "A3";
      const color = colorSelect.value as "czarnoBialy" | "kolorowy";
      const modeKey = color === "czarnoBialy" ? "bw" : "color";
      const tiers = (PRICE.print as any)[modeKey][format];

      if (tiersList) {
        tiersList.innerHTML = tiers.map((tier: any) => {
          const rangeText = tier.to >= 99999
            ? `${tier.from}+ str`
            : `${tier.from}-${tier.to} str`;
          const adminModeKey = color === "czarnoBialy" ? "bw" : "kolor";
          const suffix = tier.to > 50000 ? `${tier.from}+` : `${tier.from}-${tier.to}`;
          const storageKey = `druk-${adminModeKey}-${format.toLowerCase()}-${suffix}`;
          const displayPrice = resolveStoredPrice(storageKey, tier.unit);
          return `<div style="display: flex; justify-content: space-between; padding: 5px 0; color: #ccc;">
            <span>${rangeText}</span>
            <span style="color: #667eea;">${displayPrice.toFixed(2)} zł/str</span>
          </div>`;
        }).join('');
      }
    }

    formatSelect.addEventListener('change', updateTiersDisplay);
    colorSelect.addEventListener('change', updateTiersDisplay);
    updateTiersDisplay();

    calculateBtn?.addEventListener('click', () => {
      const format = formatSelect.value as "A4" | "A3";
      const quantity = parseInt(quantityInput.value) || 1;
      const color = colorSelect.value as "czarnoBialy" | "kolorowy";

      currentPricePerPage = getPricePerPage(format, quantity, color);
      currentPrice = currentPricePerPage * quantity;
      if (ctx.expressMode) currentPrice *= 1.2;

      if (pricePerPageDisplay) {
        pricePerPageDisplay.textContent = `${currentPricePerPage.toFixed(2)} zł/str`;
      }

      if (totalDisplay) {
        totalDisplay.textContent = `${currentPrice.toFixed(2)} zł`;
      }

      if (breakdownDisplay) {
        const colorLabel = color === "czarnoBialy" ? "Czarno-biały" : "Kolorowy";
        breakdownDisplay.textContent = `${colorLabel}, ${format}, ${quantity} str × ${currentPricePerPage.toFixed(2)} zł = ${currentPrice.toFixed(2)} zł`;
      }

      ctx.updateLastCalculated(currentPrice, `Druk ${format} ${color === "czarnoBialy" ? "CZ-B" : "KOLOR"} - ${quantity} str`);
    });

    addBtn?.addEventListener('click', () => {
      if (currentPrice === 0) {
        alert('⚠️ Najpierw oblicz cenę!');
        return;
      }

      const format = formatSelect.value;
      const quantity = quantityInput.value;
      const color = colorSelect.value === "czarnoBialy" ? "CZ-B" : "KOLOR";

      ctx.addToBasket({
        category: 'Druk A4/A3',
        price: currentPrice,
        description: `${format}, ${quantity} str, ${color} (${currentPricePerPage.toFixed(2)} zł/str)`
      });

      alert(`✅ Dodano: ${currentPrice.toFixed(2)} zł`);
    });
  }
};
