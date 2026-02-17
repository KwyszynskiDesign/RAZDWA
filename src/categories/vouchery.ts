import { CategoryModule } from "../ui/router";
import { priceStore } from "../core/price-store";

const VOUCHERY_DEFAULTS = [
  { qty: 1, single: 20, double: 25 },
  { qty: 2, single: 29, double: 32 },
  { qty: 3, single: 30, double: 37 },
  { qty: 4, single: 32, double: 39 },
  { qty: 5, single: 35, double: 43 },
  { qty: 6, single: 39, double: 45 },
  { qty: 7, single: 41, double: 48 },
  { qty: 8, single: 45, double: 50 },
  { qty: 9, single: 48, double: 52 },
  { qty: 10, single: 52, double: 58 },
  { qty: 15, single: 60, double: 70 },
  { qty: 20, single: 67, double: 82 },
  { qty: 25, single: 74, double: 100 },
  { qty: 30, single: 84, double: 120 }
];

function getVoucheryPricing() {
  return VOUCHERY_DEFAULTS.map(tier => ({
    qty: tier.qty,
    single: priceStore.register(`vouchery-s-${tier.qty}`, 'Vouchery', `Jednostronne ${tier.qty} szt`, tier.single),
    double: priceStore.register(`vouchery-d-${tier.qty}`, 'Vouchery', `Dwustronne ${tier.qty} szt`, tier.double)
  }));
}

function getPriceForQuantity(qty: number, isSingle: boolean): number {
  const pricing = getVoucheryPricing();
  let selectedTier = pricing[0];

  for (const tier of pricing) {
    if (qty >= tier.qty) {
      selectedTier = tier;
    } else {
      break;
    }
  }

  return isSingle ? selectedTier.single : selectedTier.double;
}

export interface VoucheryOptions {
  qty: number;
  sides: "single" | "double";
  satin: boolean;
  express: boolean;
}

export function quoteVouchery(options: VoucheryOptions): any {
  const basePrice = getPriceForQuantity(options.qty, options.sides === 'single');
  let percentageSum = 0;

  if (options.satin) {
    percentageSum += priceStore.register('vouchery-mod-satin', 'Vouchery', 'Dopłata Satyna', 0.12);
  }
  if (options.express) {
    percentageSum += priceStore.register('vouchery-mod-express', 'Vouchery', 'Dopłata Express', 0.20);
  }

  const modifiersTotal = basePrice * percentageSum;
  const total = basePrice + modifiersTotal;

  return {
    basePrice,
    modifiersTotal: parseFloat(modifiersTotal.toFixed(2)),
    totalPrice: parseFloat(total.toFixed(2))
  };
}

export const voucheryCategory: CategoryModule = {
  id: 'vouchery',
  name: '🎟️ Vouchery',
  mount: (container, ctx) => {
    container.innerHTML = `
      <div class="category-form">
        <h2>Vouchery - Druk Cyfrowy</h2>
        <p style="color: #999; margin-bottom: 20px;">
          Kreda 200-350g. Cena zależy od ilości.
        </p>

        <div class="form-group">
          <label>Format:</label>
          <select id="format">
            <option value="A4">A4</option>
            <option value="DL">DL</option>
          </select>
        </div>

        <div class="form-group">
          <label>Ilość sztuk:</label>
          <input type="number" id="quantity" value="1" min="1" max="100">
        </div>

        <div class="form-group">
          <label>Druk:</label>
          <select id="sides">
            <option value="single">Jednostronny</option>
            <option value="double">Dwustronny</option>
          </select>
        </div>

        <div class="form-group">
          <label>Papier:</label>
          <select id="paper">
            <option value="standard">Standardowy (kreda)</option>
            <option value="satin">Satynowy (+12%)</option>
          </select>
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
      const format = (container.querySelector('#format') as HTMLSelectElement).value;
      const quantity = parseInt((container.querySelector('#quantity') as HTMLInputElement).value) || 1;
      const sides = (container.querySelector('#sides') as HTMLSelectElement).value;
      const paper = (container.querySelector('#paper') as HTMLSelectElement).value;

      const basePrice = getPriceForQuantity(quantity, sides === 'single');
      const satinMod = priceStore.register('vouchery-mod-satin', 'Vouchery', 'Dopłata Satyna', 0.12);
      const expressMod = priceStore.register('vouchery-mod-express', 'Vouchery', 'Dopłata Express', 0.20);

      const paperMultiplier = paper === 'satin' ? (1 + satinMod) : 1;
      const expressMultiplier = ctx.expressMode ? (1 + expressMod) : 1;

      currentPrice = basePrice * paperMultiplier * expressMultiplier;

      if (totalDisplay) {
        totalDisplay.textContent = currentPrice.toFixed(2) + ' zł';
      }

      if (breakdownDisplay) {
        let tierInfo = VOUCHERY_PRICING[0];
        for (const tier of VOUCHERY_PRICING) {
          if (quantity >= tier.qty) {
            tierInfo = tier;
          } else {
            break;
          }
        }
        breakdownDisplay.textContent = 'Podstawa: ' + basePrice.toFixed(2) + ' zł za ' + quantity + ' szt (przedział: ' + tierInfo.qty + '+ szt)';
      }

      ctx.updateLastCalculated(currentPrice, 'Vouchery ' + format + ' ' + (sides === 'single' ? 'jednostronne' : 'dwustronne') + ' - ' + quantity + ' szt');
    });

    addBtn?.addEventListener('click', () => {
      if (currentPrice === 0) {
        alert('⚠️ Najpierw oblicz cenę!');
        return;
      }

      const format = (container.querySelector('#format') as HTMLSelectElement).value;
      const quantity = (container.querySelector('#quantity') as HTMLInputElement).value;
      const sides = (container.querySelector('#sides') as HTMLSelectElement).value;
      const paper = (container.querySelector('#paper') as HTMLSelectElement).value;

      ctx.addToBasket({
        category: 'Vouchery',
        price: currentPrice,
        description: format + ' ' + (sides === 'single' ? 'jednostronne' : 'dwustronne') + ', ' + quantity + ' szt, ' + (paper === 'satin' ? 'satyna' : 'standard')
      });

      alert('✅ Dodano: ' + currentPrice.toFixed(2) + ' zł');
    });
  }
};
