import { CategoryModule } from "../ui/router";
import { priceStore } from "../core/price-store";

const DEFAULT_WIZYTOWKI_PRICING = {
  '85x55': [
    { qty: 50, plain: 65, foil: 160 },
    { qty: 100, plain: 75, foil: 170 },
    { qty: 150, plain: 85, foil: 180 },
    { qty: 200, plain: 96, foil: 190 },
    { qty: 250, plain: 110, foil: 200 },
    { qty: 300, plain: 126, foil: 220 },
    { qty: 400, plain: 146, foil: 240 },
    { qty: 500, plain: 170, foil: 250 },
    { qty: 1000, plain: 290, foil: 335 }
  ],
  '90x50': [
    { qty: 50, plain: 70, foil: 170 },
    { qty: 100, plain: 79, foil: 180 },
    { qty: 150, plain: 89, foil: 190 },
    { qty: 200, plain: 99, foil: 200 },
    { qty: 250, plain: 120, foil: 210 },
    { qty: 300, plain: 129, foil: 230 },
    { qty: 400, plain: 149, foil: 250 },
    { qty: 500, plain: 175, foil: 260 },
    { qty: 1000, plain: 300, foil: 345 }
  ]
};

function getPriceForQuantity(format: '85x55' | '90x50', qty: number, foiled: boolean): number {
  const defaultTiers = DEFAULT_WIZYTOWKI_PRICING[format];
  const type = foiled ? 'foil' : 'plain';

  const tiers = priceStore.registerTiers(`wizytowki-${format}-${type}`, `Wizytówki ${format} ${type}`, defaultTiers.map(t => ({ min: t.qty, max: null, price: foiled ? t.foil : t.plain })));

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
 * @deprecated Use wizytowkiCategory module instead.
 * Kept for compatibility with tests.
 */
export function quoteWizytowki(options: { format: '85x55' | '90x50'; qty: number; folia: 'none' | 'matt_gloss'; express: boolean }) {
  const basePrice = getPriceForQuantity(options.format, options.qty, options.folia === 'matt_gloss');
  let totalPrice = basePrice;
  if (options.express) {
    totalPrice *= 1.2;
  }

  return {
    totalPrice: parseFloat(totalPrice.toFixed(2)),
    basePrice
  };
}

export const wizytowkiCategory: CategoryModule = {
  id: 'wizytowki-druk-cyfrowy',
  name: '💼 Wizytówki',
  mount: (container, ctx) => {
    container.innerHTML = `
      <div class="category-form">
        <h2>Wizytówki - Druk Cyfrowy</h2>
        <p style="color: #999; margin-bottom: 20px;">
          Kreda mat 350g. Czas realizacji: 4-5 dni roboczych.
        </p>

        <div class="form-group">
          <label>Format:</label>
          <select id="format">
            <option value="85x55">85×55 mm (standardowy)</option>
            <option value="90x50">90×50 mm</option>
          </select>
        </div>

        <div class="form-group">
          <label>Ilość sztuk:</label>
          <select id="quantity">
            <option value="50">50 szt</option>
            <option value="100">100 szt</option>
            <option value="150">150 szt</option>
            <option value="200">200 szt</option>
            <option value="250">250 szt</option>
            <option value="300">300 szt</option>
            <option value="400">400 szt</option>
            <option value="500">500 szt</option>
            <option value="1000">1000 szt</option>
          </select>
        </div>

        <div class="form-group">
          <label>Gramatura papieru:</label>
          <select id="gramature">
            <option value="1.0">120g</option>
            <option value="1.1">160g (+10%)</option>
            <option value="1.2">200g (+20%)</option>
            <option value="1.3">250g (+30%)</option>
            <option value="1.4">300g (+40%)</option>
            <option value="1.6" selected>350g (+60%)</option>
          </select>
        </div>

        <div class="form-group">
          <label>Wykończenie:</label>
          <select id="finish">
            <option value="1.0">Mat</option>
            <option value="1.15">Połysk (+15%)</option>
            <option value="foil">Z folią mat/błysk (stała cena)</option>
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
      const format = (container.querySelector('#format') as HTMLSelectElement).value as '85x55' | '90x50';
      const quantity = parseInt((container.querySelector('#quantity') as HTMLSelectElement).value);
      const finish = (container.querySelector('#finish') as HTMLSelectElement).value;
      const gramMod = parseFloat((container.querySelector('#gramature') as HTMLSelectElement).value);

      if (finish === 'foil') {
        currentPrice = getPriceForQuantity(format, quantity, true);
        if (ctx.expressMode) currentPrice *= 1.2;
      } else {
        const finishMod = parseFloat(finish);
        const basePrice = getPriceForQuantity(format, quantity, false);

        let percentageSum = (gramMod - 1) + (finishMod - 1);
        if (ctx.expressMode) percentageSum += 0.20;

        currentPrice = basePrice * (1 + percentageSum);
      }

      if (totalDisplay) {
        totalDisplay.textContent = `${currentPrice.toFixed(2)} zł`;
      }

      if (breakdownDisplay) {
        breakdownDisplay.textContent = `Format ${format} mm, ${quantity} szt, ${finish === 'foil' ? 'z folią' : 'wykończenie: ' + finish}`;
      }

      ctx.updateLastCalculated(currentPrice, `Wizytówki ${format} - ${quantity} szt`);
    });

    addBtn?.addEventListener('click', () => {
      if (currentPrice === 0) {
        alert('⚠️ Najpierw oblicz cenę!');
        return;
      }

      const format = (container.querySelector('#format') as HTMLSelectElement).value;
      const quantity = (container.querySelector('#quantity') as HTMLSelectElement).value;
      const finishText = (container.querySelector('#finish') as HTMLSelectElement).options[(container.querySelector('#finish') as HTMLSelectElement).selectedIndex].text;
      const gramText = (container.querySelector('#gramature') as HTMLSelectElement).options[(container.querySelector('#gramature') as HTMLSelectElement).selectedIndex].text;

      ctx.addToBasket({
        category: 'Wizytówki',
        price: currentPrice,
        description: `${format} mm, ${quantity} szt, ${gramText}, ${finishText}`
      });

      alert(`✅ Dodano: ${currentPrice.toFixed(2)} zł`);
    });
  }
};
