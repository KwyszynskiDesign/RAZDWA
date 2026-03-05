import { CategoryModule } from "../ui/router";
import { getPrice } from "../services/priceService";
import { resolveStoredPrice } from "../core/compat";

const artykulyData: any = getPrice("artykuly-biurowe") as any;

export interface ArtykulyBiuroweOptions {
  selectedItems: Array<{
    categoryName: string;
    itemId: string;
    itemName: string;
    quantity: number;
    price: number;
  }>;
}

export function quoteArtykulyBiurowe(options: ArtykulyBiuroweOptions): any {
  let totalPrice = 0;
  let totalQuantity = 0;

  for (const item of options.selectedItems) {
    const storageKey = `artykuly-${item.itemId}`;
    const price = resolveStoredPrice(storageKey, item.price);
    const itemTotal = price * item.quantity;
    totalPrice += itemTotal;
    totalQuantity += item.quantity;
  }

  return {
    itemsCount: options.selectedItems.length,
    totalQuantity,
    totalPrice: parseFloat(totalPrice.toFixed(2))
  };
}

export const artykulyBiuroweCategory: CategoryModule = {
  id: 'artykuly-biurowe',
  name: '📎 Artykuły Biurowe',
  mount: (container, ctx) => {
    container.innerHTML = `
      <div class="category-form">
        <h2>Artykuły Biurowe</h2>
        <p style="color: #999; margin-bottom: 20px;">
          Artykuły biurowe i akcesoria. Cena za sztukę.
        </p>

        <div id="items-list" style="margin-bottom: 30px;"></div>

        <div class="form-group">
          <button id="calculate-btn" class="btn btn-primary">Oblicz</button>
        </div>

        <div id="summary" style="display: none; margin-top: 20px; padding: 15px; background: #f0f0f0; border-radius: 5px;">
          <h3>Podsumowanie</h3>
          <p>Liczba pozycji: <strong id="items-count">0</strong></p>
          <p>Ilość sztuk: <strong id="total-qty">0</strong></p>
          <p style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #999;">
            Razem: <strong id="total-price">0,00 zł</strong>
          </p>
        </div>
      </div>
    `;

    // Build items list
    const itemsList = container.querySelector('#items-list') as HTMLElement;
    let itemId = 0;

    for (const category of artykulyData.categories) {
      const categoryDiv = document.createElement('div');
      categoryDiv.style.marginBottom = '20px';
      categoryDiv.innerHTML = `<h3 style="color: #333; margin-bottom: 10px;">${category.name}</h3>`;

      const itemsDiv = document.createElement('div');

      for (const item of category.items) {
        const itemPrice = item.price || (item.prices ? item.prices[0] : 0);
        itemId++;

        const itemDiv = document.createElement('div');
        itemDiv.style.display = 'flex';
        itemDiv.style.alignItems = 'center';
        itemDiv.style.gap = '10px';
        itemDiv.style.marginBottom = '8px';
        itemDiv.style.padding = '8px';
        itemDiv.style.backgroundColor = '#f9f9f9';
        itemDiv.style.borderRadius = '3px';

        itemDiv.innerHTML = `
          <div style="flex: 1;">
            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; margin: 0;">
              <input type="checkbox" data-item-id="${item.id}" data-item-name="${item.name}" data-price="${itemPrice}" class="item-checkbox">
              <span>${item.name}</span>
            </label>
          </div>
          <div style="display: flex; gap: 5px; align-items: center;">
            <input type="number" data-qty-for="${item.id}" value="1" min="1" max="999" style="width: 50px; padding: 5px;" class="item-quantity">
            <span style="font-weight: bold; color: #0066cc; min-width: 60px; text-align: right;">${itemPrice.toFixed(2)} zł</span>
          </div>
        `;

        itemsDiv.appendChild(itemDiv);
      }

      categoryDiv.appendChild(itemsDiv);
      itemsList.appendChild(categoryDiv);
    }

    // Calculate button handler
    const calculateBtn = container.querySelector('#calculate-btn') as HTMLButtonElement;
    const summaryDiv = container.querySelector('#summary') as HTMLElement;

    calculateBtn.addEventListener('click', () => {
      const checked = Array.from(container.querySelectorAll('.item-checkbox:checked')) as HTMLInputElement[];
      
      if (checked.length === 0) {
        alert('Proszę wybrać co najmniej jeden artykuł');
        return;
      }

      const selectedItems = checked.map(checkbox => {
        const itemId = checkbox.getAttribute('data-item-id') || '';
        const itemName = checkbox.getAttribute('data-item-name') || '';
        const price = parseFloat(checkbox.getAttribute('data-price') || '0');
        const qtyInput = container.querySelector(`input[data-qty-for="${itemId}"]`) as HTMLInputElement;
        const quantity = parseInt(qtyInput?.value || '1');

        return {
          categoryName: '',
          itemId,
          itemName,
          quantity,
          price
        };
      });

      const result = quoteArtykulyBiurowe({ selectedItems });

      (container.querySelector('#items-count') as HTMLElement).textContent = result.itemsCount.toString();
      (container.querySelector('#total-qty') as HTMLElement).textContent = result.totalQuantity.toString();
      (container.querySelector('#total-price') as HTMLElement).textContent = result.totalPrice.toFixed(2) + ' zł';

      summaryDiv.style.display = 'block';

      // Emit event
      ctx?.emit?.('price-calculated', {
        categoryId: 'artykuly-biurowe',
        totalPrice: result.totalPrice,
        details: result
      });
    });
  }
};
