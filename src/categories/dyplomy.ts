import { CategoryModule } from "../ui/router";
import { getPrice } from "../services/priceService";
import { resolveStoredPrice } from "../core/compat";

const DYPLOMY_PRICING: Array<{ qty: number; price: number }> = getPrice("dyplomy") as Array<{ qty: number; price: number }>;

function getPriceForQuantity(qty: number): number {
  let selectedTier = DYPLOMY_PRICING[0];

  for (const tier of DYPLOMY_PRICING) {
    if (qty >= tier.qty) {
      selectedTier = tier;
    } else {
      break;
    }
  }

  return selectedTier.price;
}

export interface DyplomyOptions {
  format?: "A4" | "A5";
  qty: number;
  sides?: number;
  isSatin: boolean;
  isModigliani?: boolean;
  express: boolean;
}

export function calculateDyplomy(options: DyplomyOptions) {
  const basePrice = getPriceForQuantity(options.qty);
  const satinRate = resolveStoredPrice("modifier-satyna", 0.12);
  const modiglianiRate = resolveStoredPrice("modifier-modigliani", 0.20);
  const expressRate = resolveStoredPrice("modifier-express", 0.20);

  let materialModifiersTotal = 0;
  const appliedModifiers: string[] = [];

  if (options.isModigliani) {
    const satinModifier = basePrice * satinRate;
    const satinSubtotal = basePrice + satinModifier;
    const modiglianiModifier = satinSubtotal * modiglianiRate;
    materialModifiersTotal = satinModifier + modiglianiModifier;
    appliedModifiers.push("satin");
    appliedModifiers.push("modigliani");
  } else if (options.isSatin) {
    materialModifiersTotal = basePrice * satinRate;
    appliedModifiers.push("satin");
  }

  const expressModifier = options.express ? basePrice * expressRate : 0;
  if (options.express) {
    appliedModifiers.push("express");
  }

  const modifiersTotal = parseFloat((materialModifiersTotal + expressModifier).toFixed(2));
  const totalPrice = parseFloat((basePrice + modifiersTotal).toFixed(2));

  return {
    basePrice,
    modifiersTotal,
    totalPrice,
    appliedModifiers
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
            ${DYPLOMY_PRICING.map(t => `<div>${t.qty} szt → ${t.price} zł</div>`).join('')}
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
      const paperMultiplier = paper === 'satin' ? 1 + resolveStoredPrice("modifier-satyna", 0.12) : 1;
      const expressMultiplier = ctx.expressMode ? 1 + resolveStoredPrice("modifier-express", 0.20) : 1;

      currentPrice = basePrice * paperMultiplier * expressMultiplier;

      if (totalDisplay) {
        totalDisplay.textContent = `${currentPrice.toFixed(2)} zł`;
      }

      if (breakdownDisplay) {
        let selectedTier = DYPLOMY_PRICING[0];
        for (const tier of DYPLOMY_PRICING) {
          if (quantity >= tier.qty) {
            selectedTier = tier;
          } else {
            break;
          }
        }
        breakdownDisplay.textContent = `${quantity} szt, przedział: ${selectedTier.qty}+ szt → ${basePrice.toFixed(2)} zł${paper === 'satin' ? ` × ${paperMultiplier.toFixed(2)} (satyna)` : ''}`;
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
