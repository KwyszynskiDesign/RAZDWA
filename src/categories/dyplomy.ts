import { CategoryModule } from "../ui/router";
import { priceStore } from "../core/price-store";

const DEFAULT_DYPLOMY_PRICING = [
  { qty: 1, price: 20 },
  { qty: 2, price: 30 },
  { qty: 3, price: 32 },
  { qty: 4, price: 34 },
  { qty: 5, price: 35 },
  { qty: 6, price: 35 },
  { qty: 7, price: 36 },
  { qty: 8, price: 37 },
  { qty: 9, price: 39 },
  { qty: 10, price: 40 },
  { qty: 15, price: 45 },
  { qty: 20, price: 49 },
  { qty: 30, price: 58 },
  { qty: 40, price: 65 },
  { qty: 50, price: 75 },
  { qty: 100, price: 120 }
];

function getPriceForQuantity(qty: number): number {
  const tiers = priceStore.registerTiers('dyplomy', 'Dyplomy', DEFAULT_DYPLOMY_PRICING.map(t => ({ min: t.qty, max: null, price: t.price })));

  let selectedTier = tiers[0];
  for (const tier of tiers) {
    if (qty >= tier.min) {
      selectedTier = tier;
    } else {
      break;
    }
  }

  return selectedTier.price;
}

/**
 * @deprecated Use dyplomyCategory module instead.
 * Kept for compatibility with tests.
 */
export function calculateDyplomy(options: { qty: number; sides?: number; isSatin: boolean; express: boolean }) {
  const basePrice = getPriceForQuantity(options.qty);
  let percentageSum = 0;

  if (options.isSatin) {
    percentageSum += 0.12;
  }
  if (options.express) {
    percentageSum += 0.20;
  }

  const modifiersTotal = basePrice * percentageSum;
  const totalPrice = basePrice + modifiersTotal;

  return {
    basePrice,
    modifiersTotal,
    totalPrice: Math.round(totalPrice * 100) / 100
  };
}

export const dyplomyCategory: CategoryModule = {
  id: 'dyplomy',
  name: '🎓 Dyplomy',
  mount: (container, ctx) => {
    container.innerHTML = `
      <div class="category-form">
        <h2>Dyplomy - Druk Cyfrowy</h2>
        <p style="color: #999; margin-bottom: 20px;">
          Kreda 200-300g. Format DL dwustronny. Cena zależy od ilości.
        </p>

        <div class="form-group">
          <label>Format:</label>
          <select id="format">
            <option value="DL">DL (99×210 mm) - dwustronny</option>
          </select>
        </div>

        <div class="form-group">
          <label>Ilość sztuk:</label>
          <input type="number" id="quantity" value="1" min="1" max="200">
        </div>

        <div class="form-group">
          <label>Papier:</label>
          <select id="paper">
            <option value="standard">Standardowy (kreda)</option>
            <option value="satin">Satynowy (+12%)</option>
          </select>
        </div>

        <div id="price-tiers" style="background: #1a1a1a; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="color: #667eea; margin: 0 0 10px 0;">Przedziały cenowe:</h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px; font-size: 13px; color: #ccc;">
            <div>1 szt → 20 zł</div><div>2 szt → 30 zł</div>
            <div>5 szt → 35 zł</div><div>10 szt → 40 zł</div>
            <div>20 szt → 49 zł</div><div>30 szt → 58 zł</div>
            <div>50 szt → 75 zł</div><div>100 szt → 120 zł</div>
          </div>
        </div>

        <div style="padding: 15px; background: #2a2a2a; border-radius: 8px; margin: 20px 0;">
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

    const calculateBtn = container.querySelector('#calculate');
    const addBtn = container.querySelector('#addToBasket');
    const totalDisplay = container.querySelector('#total-price');
    const breakdownDisplay = container.querySelector('#price-breakdown');

    calculateBtn?.addEventListener('click', () => {
      const quantity = parseInt((container.querySelector('#quantity') as HTMLInputElement).value) || 1;
      const paper = (container.querySelector('#paper') as HTMLSelectElement).value;

      const basePrice = getPriceForQuantity(quantity);
      const paperMultiplier = paper === 'satin' ? 1.12 : 1;
      const expressMultiplier = ctx.expressMode ? 1.20 : 1;

      currentPrice = basePrice * paperMultiplier * expressMultiplier;

      if (totalDisplay) {
        totalDisplay.textContent = `${currentPrice.toFixed(2)} zł`;
      }

      if (breakdownDisplay) {
        const tiers = priceStore.registerTiers('dyplomy', 'Dyplomy', DEFAULT_DYPLOMY_PRICING.map(t => ({ min: t.qty, max: null, price: t.price })));
        let selectedTier = tiers[0];
        for (const tier of tiers) {
          if (quantity >= tier.min) {
            selectedTier = tier;
          } else {
            break;
          }
        }
        breakdownDisplay.textContent = `${quantity} szt, przedział: ${selectedTier.min}+ szt → ${basePrice.toFixed(2)} zł${paper === 'satin' ? ' × 1.12 (satyna)' : ''}`;
      }

      ctx.updateLastCalculated(currentPrice, `Dyplomy DL - ${quantity} szt`);
    });

    addBtn?.addEventListener('click', () => {
      if (currentPrice === 0) {
        alert('⚠️ Najpierw oblicz cenę!');
        return;
      }

      const quantity = (container.querySelector('#quantity') as HTMLInputElement).value;
      const paper = (container.querySelector('#paper') as HTMLSelectElement).value;

      ctx.addToBasket({
        category: 'Dyplomy',
        price: currentPrice,
        description: `DL dwustronny, ${quantity} szt, ${paper === 'satin' ? 'satyna' : 'standard'}`
      });

      alert(`✅ Dodano: ${currentPrice.toFixed(2)} zł`);
    });
  }
};
