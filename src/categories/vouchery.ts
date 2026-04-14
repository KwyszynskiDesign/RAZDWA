import { CategoryModule } from "../ui/router";
import { getPrice } from "../services/priceService";
import { resolveStoredPrice } from "../core/compat";

const voucheryData: any[] = getPrice("vouchery") as any[];

function getPriceForQuantity(qty: number, isSingle: boolean): number {
  let selectedTier = voucheryData[0];

  for (const tier of voucheryData) {
    if (qty >= tier.qty) {
      selectedTier = tier;
    } else {
      break;
    }
  }

  const side = isSingle ? "jed" : "dwu";
  const storageKey = `vouchery-${selectedTier.qty}-${side}`;
  const defaultPrice = isSingle ? selectedTier.single : selectedTier.double;
  return resolveStoredPrice(storageKey, defaultPrice);
}

export interface VoucheryOptions {
  qty: number;
  sides: "single" | "double";
  satin: boolean;
  modigliani: boolean;
  express: boolean;
}

export function quoteVouchery(options: VoucheryOptions): any {
  let selectedTier = voucheryData[0];
  for (const tier of voucheryData) {
    if (options.qty >= tier.qty) {
      selectedTier = tier;
    } else {
      break;
    }
  }

  const basePrice = getPriceForQuantity(options.qty, options.sides === 'single');
  const satinRate = resolveStoredPrice("modifier-satyna", 0.12);
  const modiglianiRate = resolveStoredPrice("modifier-modigliani", 0.20);
  const expressRate = resolveStoredPrice("modifier-express", 0.20);

  let materialModifiersTotal = 0;

  if (options.modigliani) {
    const satinModifier = basePrice * satinRate;
    const satinSubtotal = basePrice + satinModifier;
    const modiglianiModifier = satinSubtotal * modiglianiRate;
    materialModifiersTotal = satinModifier + modiglianiModifier;
  } else if (options.satin) {
    materialModifiersTotal = basePrice * satinRate;
  }

  const expressModifier = options.express ? basePrice * expressRate : 0;
  const modifiersTotal = materialModifiersTotal + expressModifier;
  const total = basePrice + modifiersTotal;

  return {
    tierQty: selectedTier.qty,
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
            <option value="satin">Satynowy</option>
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
          <button id="addToBasket" class="btn-success" style="flex: 1;">DODAJ DO KOSZYKA</button>
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
      const paperMultiplier = paper === 'satin' ? 1 + resolveStoredPrice("modifier-satyna", 0.12) : 1;
      const expressMultiplier = ctx.expressMode ? 1 + resolveStoredPrice("modifier-express", 0.20) : 1;

      currentPrice = basePrice * paperMultiplier * expressMultiplier;

      if (totalDisplay) {
        totalDisplay.textContent = currentPrice.toFixed(2) + ' zł';
      }

      if (breakdownDisplay) {
        let tierInfo = voucheryData[0];
        for (const tier of voucheryData) {
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
