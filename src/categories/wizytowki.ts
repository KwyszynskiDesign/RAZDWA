import { CategoryModule } from "../ui/router";
import _config from "../../config/prices.json";
import { pickNearestCeilKey, resolveStoredPrice } from "../core/compat";

const _biz: any = _config.wizytowki;

function getPriceForQuantity(format: '85x55' | '90x50', qty: number, foiled: boolean): number {
  const table = _biz.cyfrowe.standardPrices[format][foiled ? 'lam' : 'noLam'];
  const key = pickNearestCeilKey(table, qty);
  if (key == null) throw new Error(`Brak progu cenowego dla ${qty} szt (${format})`);
  const foliaKey = foiled ? 'matt_gloss' : 'none';
  return resolveStoredPrice(`wizytowki-${format}-${foliaKey}-${key}szt`, table[key]);
}

/**
 * @deprecated Use wizytowkiCategory module instead.
 * Kept for compatibility with tests.
 */
export function quoteWizytowki(options: { format: '85x55' | '90x50'; qty: number; folia: 'none' | 'matt_gloss'; express: boolean }) {
  const basePrice = getPriceForQuantity(options.format, options.qty, options.folia === 'matt_gloss');
  let totalPrice = basePrice;
  if (options.express) {
    totalPrice *= 1 + resolveStoredPrice("modifier-express", 0.20);
  }

  return {
    totalPrice: parseFloat(totalPrice.toFixed(2)),
    basePrice
  };
}

export const wizytowkiCategory: CategoryModule = {
  id: 'wizytowki',
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
          <label>Wykończenie:</label>
          <select id="foiling">
            <option value="plain">Bez foliowania</option>
            <option value="foil">Z folią mat/błysk</option>
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
      const foiling = (container.querySelector('#foiling') as HTMLSelectElement).value;

      currentPrice = getPriceForQuantity(format, quantity, foiling === 'foil');
      if (ctx.expressMode) currentPrice *= 1 + resolveStoredPrice("modifier-express", 0.20);

      if (totalDisplay) {
        totalDisplay.textContent = `${currentPrice.toFixed(2)} zł`;
      }

      if (breakdownDisplay) {
        breakdownDisplay.textContent = `Format ${format} mm, ${quantity} szt, ${foiling === 'foil' ? 'z folią' : 'bez foliowania'}`;
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
      const foiling = (container.querySelector('#foiling') as HTMLSelectElement).value;

      ctx.addToBasket({
        category: 'Wizytówki',
        price: currentPrice,
        description: `${format} mm, ${quantity} szt, ${foiling === 'foil' ? 'z folią' : 'bez foliowania'}`
      });

      alert(`✅ Dodano: ${currentPrice.toFixed(2)} zł`);
    });
  }
};
