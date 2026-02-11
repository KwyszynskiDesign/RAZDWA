import { CategoryModule } from "../ui/router";

export const drukA4A3Category: CategoryModule = {
  id: 'druk-a4-a3',
  name: '📄 Druk A4/A3',
  mount: (container, ctx) => {
    container.innerHTML = `
      <div class="category-form">
        <h2>Druk A4/A3</h2>

        <div class="form-group">
          <label>Format:</label>
          <select id="format">
            <option value="A4">A4</option>
            <option value="A3">A3</option>
          </select>
        </div>

        <div class="form-group">
          <label>Ilość stron:</label>
          <input type="number" id="pages" value="1" min="1" max="1000">
        </div>

        <div class="form-group">
          <label>Kolor:</label>
          <select id="color">
            <option value="mono">Czarno-biały (0.50 zł/str)</option>
            <option value="color">Kolorowy (1.50 zł/str)</option>
          </select>
        </div>

        <div style="padding: 15px; background: #2a2a2a; border-radius: 8px; margin: 20px 0;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="color: #999;">Cena całkowita:</span>
            <strong id="total-price" style="font-size: 24px; color: #667eea;">0.00 zł</strong>
          </div>
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

    calculateBtn?.addEventListener('click', () => {
      const format = (container.querySelector('#format') as HTMLSelectElement).value;
      const pages = parseInt((container.querySelector('#pages') as HTMLInputElement).value) || 1;
      const color = (container.querySelector('#color') as HTMLSelectElement).value;

      // Logika ceny
      const pricePerPage = color === 'mono' ? 0.50 : 1.50;
      const formatMultiplier = format === 'A3' ? 1.5 : 1;

      currentPrice = pages * pricePerPage * formatMultiplier;

      if (totalDisplay) {
        totalDisplay.textContent = `${currentPrice.toFixed(2)} zł`;
      }

      ctx.updateLastCalculated(currentPrice, `${format} ${color} - ${pages} str.`);
    });

    addBtn?.addEventListener('click', () => {
      if (currentPrice === 0) {
        alert('⚠️ Najpierw oblicz cenę!');
        return;
      }

      const format = (container.querySelector('#format') as HTMLSelectElement).value;
      const pages = (container.querySelector('#pages') as HTMLInputElement).value;
      const color = (container.querySelector('#color') as HTMLSelectElement).value;

      ctx.addToBasket({
        category: 'Druk A4/A3',
        price: currentPrice,
        description: `Format: ${format}, Strony: ${pages}, Kolor: ${color}`
      });

      alert(`✅ Dodano do listy: ${currentPrice.toFixed(2)} zł`);
    });
  }
};
