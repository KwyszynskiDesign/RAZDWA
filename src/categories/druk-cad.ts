import { CategoryModule } from "../ui/router";
import { calculateCad } from "../core/compat-logic";

export interface DrukCADOptions {
  mode: "bw" | "color";
  format: string;
  lengthMm: number;
  qty: number;
  express: boolean;
}

/**
 * @deprecated Use drukCADCategory module instead.
 * Kept for compatibility with tests and legacy views.
 */
export function calculateDrukCAD(options: DrukCADOptions, pricing?: any) {
  const res = calculateCad({
    mode: options.mode,
    format: options.format,
    lengthMm: options.lengthMm,
    qty: options.qty || 1
  });

  let totalPrice = res.total;
  if (options.express) {
    totalPrice = res.total * 1.2;
  }

  return {
    totalPrice: parseFloat(totalPrice.toFixed(2)),
    basePrice: res.total,
    detectedType: res.detectedType,
    isMeter: res.detectedType === 'mb',
    rate: res.rate
  };
}

const CAD_PRODUCTS = [
  {
    produkt: "A0+ 914×1292",
    jednostka: "1 szt",
    cena: 26.0,
    baseWidth: 914,
    baseLength: 1292,
    typ: "cad_length"
  },
  {
    produkt: "A1+ 610×914",
    jednostka: "1 szt",
    cena: 18.0,
    baseWidth: 610,
    baseLength: 914,
    typ: "cad_length"
  },
  {
    produkt: "A2+ 450×610",
    jednostka: "1 szt",
    cena: 12.0,
    baseWidth: 450,
    baseLength: 610,
    typ: "cad_length"
  },
  {
    produkt: "MB 90cm",
    jednostka: "1 mb",
    cena: 21.0,
    baseWidth: 900,
    baseLength: 1000,
    typ: "cad_length"
  },
  {
    produkt: "MB 61cm",
    jednostka: "1 mb",
    cena: 15.0,
    baseWidth: 610,
    baseLength: 1000,
    typ: "cad_length"
  }
];

export const drukCADCategory: CategoryModule = {
  id: 'druk-cad',
  name: '🗺️ Druk CAD wielkoformatowy',
  mount: (container, ctx) => {
    container.innerHTML = `
      <div class="category-form">
        <h2>Druk CAD wielkoformatowy</h2>
        <p style="color: #999; margin-bottom: 20px;">
          Druk techniczny na ploterze wielkoformatowym. Dostosuj długość druku.
        </p>

        <div id="cad-products"></div>
      </div>
    `;

    const productsContainer = container.querySelector('#cad-products');
    if (!productsContainer) return;

    CAD_PRODUCTS.forEach((product, index) => {
      const card = document.createElement('div');
      card.className = 'product-card';
      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <strong>${product.produkt}</strong>
          <span style="color: #999;">${product.jednostka}</span>
        </div>

        <div class="form-group" style="margin-bottom: 10px;">
          <label>Długość (mm):</label>
          <input
            type="number"
            id="clen-${index}"
            value="${product.baseLength}"
            min="${product.baseLength}"
            step="10"
          >
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <span style="color: #999;">Cena:</span>
            <strong id="price-${index}" style="font-size: 18px; color: #667eea; margin-left: 8px;">
              ${product.cena.toFixed(2)} zł
            </strong>
          </div>
          <button class="btn-success" data-index="${index}">Dodaj do listy</button>
        </div>
      `;

      productsContainer.appendChild(card);

      // Event listener: aktualizacja ceny
      const lengthInput = card.querySelector(`#clen-${index}`) as HTMLInputElement;
      const priceDisplay = card.querySelector(`#price-${index}`);

      lengthInput.addEventListener('input', () => {
        const customLength = parseFloat(lengthInput.value) || product.baseLength;
        const ratio = customLength / product.baseLength;
        const newPrice = product.cena * ratio;
        if (priceDisplay) {
          priceDisplay.textContent = `${newPrice.toFixed(2)} zł`;
        }
      });

      // Event listener: dodaj do koszyka
      const addBtn = card.querySelector('.btn-success');
      addBtn?.addEventListener('click', () => {
        const customLength = parseFloat(lengthInput.value) || product.baseLength;
        const ratio = customLength / product.baseLength;
        const finalPrice = product.cena * ratio;

        ctx.addToBasket({
          category: 'Druk CAD',
          price: finalPrice,
          description: `${product.produkt} - ${customLength}mm`
        });

        alert(`✅ Dodano do listy: ${product.produkt} (${finalPrice.toFixed(2)} zł)`);
      });
    });
  }
};
