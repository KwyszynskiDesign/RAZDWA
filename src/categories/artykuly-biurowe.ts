import { CategoryModule } from "../ui/router";
import { resolveStoredPrice } from "../core/compat";
import artykulyData from "../../data/normalized/artykuly-biurowe.json";

const artykulyBiuroweData: any = artykulyData as any;

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
    let currentResult: { itemsCount: number; totalQuantity: number; totalPrice: number } | null = null;
    let currentSelection: ArtykulyBiuroweOptions['selectedItems'] = [];

    container.innerHTML = `
      <div class="category-form">
        <h2>Artykuły Biurowe</h2>
        <p style="color: #999; margin-bottom: 10px; font-size: 0.92em;">
          Artykuły biurowe i akcesoria. Cena za sztukę.
        </p>

        <div id="items-list" style="margin-bottom: 14px;"></div>

        <div class="form-group" style="margin-bottom: 10px; display: flex; gap: 10px;">
          <button id="calculate-btn" class="btn btn-primary" style="flex: 1;">Oblicz</button>
          <button id="add-to-cart-btn" class="btn btn-success" style="flex: 1;" disabled>DODAJ DO KOSZYKA</button>
        </div>

        <div id="summary" style="display: none; margin-top: 10px; padding: 12px; background: #f0f0f0; border-radius: 6px;">
          <h3 style="margin: 0 0 8px 0; font-size: 1rem;">Podsumowanie</h3>
          <p style="margin: 2px 0;">Liczba pozycji: <strong id="items-count">0</strong></p>
          <p style="margin: 2px 0;">Ilość sztuk: <strong id="total-qty">0</strong></p>
          <div id="details-info" style="margin-top: 8px; font-size: 0.86em; color: #555; max-height: 120px; overflow-y: auto;"></div>
          <p style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #999;">
            Razem: <strong id="total-price">0,00 zł</strong>
          </p>
        </div>
      </div>
    `;

    const itemsList = container.querySelector('#items-list') as HTMLElement;

    for (const category of artykulyBiuroweData.categories) {
      const categoryDiv = document.createElement('div');
      categoryDiv.style.marginBottom = '10px';
      categoryDiv.style.padding = '8px 10px';
      categoryDiv.style.backgroundColor = '#f7f9fb';
      categoryDiv.style.border = '1px solid #e3e8ef';
      categoryDiv.style.borderRadius = '8px';
      categoryDiv.innerHTML = `<h3 style="color: #2d3a4a; margin: 0 0 6px 0; font-size: 0.95rem;">${category.name}</h3>`;

      const itemsDiv = document.createElement('div');
      itemsDiv.style.display = 'grid';
      itemsDiv.style.gap = '5px';

      for (const item of category.items) {
        const itemPrice = item.price || (item.prices ? item.prices[0] : 0);

        const itemDiv = document.createElement('div');
        itemDiv.style.display = 'grid';
        itemDiv.style.gridTemplateColumns = '1fr auto auto auto';
        itemDiv.style.alignItems = 'center';
        itemDiv.style.columnGap = '8px';
        itemDiv.style.padding = '5px 8px';
        itemDiv.style.backgroundColor = '#ffffff';
        itemDiv.style.border = '1px solid #e7edf5';
        itemDiv.style.borderRadius = '6px';

        itemDiv.innerHTML = `
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; margin: 0; min-width: 0;">
            <span style="font-size: 0.93em; line-height: 1.2;">${item.name}</span>
          </label>
          <input type="number" data-qty-for="${item.id}" value="1" min="1" max="999" style="width: 54px; padding: 4px; font-size: 0.9em;" class="item-quantity">
          <span class="item-price" data-item-id="${item.id}" data-base-price="${itemPrice}" style="font-weight: bold; color: #0066cc; min-width: 68px; text-align: right; font-size: 0.9em;">${itemPrice.toFixed(2)} zł</span>
          <input type="checkbox" data-item-id="${item.id}" data-item-name="${item.name}" data-price="${itemPrice}" class="item-checkbox" style="width: 18px; height: 18px; cursor: pointer;">
        `;

        itemsDiv.appendChild(itemDiv);
      }

      categoryDiv.appendChild(itemsDiv);
      itemsList.appendChild(categoryDiv);
    }

    const calculateBtn = container.querySelector('#calculate-btn') as HTMLButtonElement;
    const addToCartBtn = container.querySelector('#add-to-cart-btn') as HTMLButtonElement;
    const summaryDiv = container.querySelector('#summary') as HTMLElement;

    const getCurrentPrice = (itemId: string, basePrice: number): number => {
      const storageKey = `artykuly-${itemId}`;
      return resolveStoredPrice(storageKey, basePrice);
    };

    const updatePriceDisplay = (itemId: string) => {
      const priceSpan = container.querySelector(`span.item-price[data-item-id="${itemId}"]`) as HTMLElement | null;
      const checkbox = container.querySelector(`input[data-item-id="${itemId}"]`) as HTMLInputElement | null;
      if (!priceSpan || !checkbox) return;

      const basePrice = parseFloat(priceSpan.getAttribute('data-base-price') || '0');
      const currentPrice = getCurrentPrice(itemId, basePrice);

      priceSpan.textContent = `${currentPrice.toFixed(2)} zł`;
      checkbox.setAttribute('data-price', currentPrice.toString());
    };

    const collectSelectedItems = (): ArtykulyBiuroweOptions['selectedItems'] => {
      const checked = Array.from(container.querySelectorAll('.item-checkbox:checked')) as HTMLInputElement[];
      return checked.map((checkbox) => {
        const itemId = checkbox.getAttribute('data-item-id') || '';
        const itemName = checkbox.getAttribute('data-item-name') || '';
        const basePrice = parseFloat(checkbox.getAttribute('data-price') || '0');
        const price = getCurrentPrice(itemId, basePrice);
        const qtyInput = container.querySelector(`input[data-qty-for="${itemId}"]`) as HTMLInputElement;
        const quantity = parseInt(qtyInput?.value || '1', 10);

        return {
          categoryName: '',
          itemId,
          itemName,
          quantity,
          price
        };
      });
    };

    const updateAddButtonState = () => {
      addToCartBtn.disabled = collectSelectedItems().length === 0;
    };

    const renderCalculation = (selectedItems: ArtykulyBiuroweOptions['selectedItems']) => {
      currentSelection = selectedItems;
      const result = quoteArtykulyBiurowe({ selectedItems });
      currentResult = result;

      (container.querySelector('#items-count') as HTMLElement).textContent = result.itemsCount.toString();
      (container.querySelector('#total-qty') as HTMLElement).textContent = result.totalQuantity.toString();
      (container.querySelector('#total-price') as HTMLElement).textContent = `${result.totalPrice.toFixed(2)} zł`;

      const detailsDiv = container.querySelector('#details-info') as HTMLElement;
      detailsDiv.innerHTML = selectedItems
        .map((s) => `<div>• ${s.itemName} × ${s.quantity} szt: ${(s.price * s.quantity).toFixed(2)} zł</div>`)
        .join('');

      summaryDiv.style.display = 'block';
      addToCartBtn.disabled = false;

      ctx.updateLastCalculated(result.totalPrice, `Artykuły biurowe - ${result.itemsCount} poz.`);
      ctx?.emit?.('price-calculated', {
        categoryId: 'artykuly-biurowe',
        totalPrice: result.totalPrice,
        details: result
      });
    };

    const priceSpans = container.querySelectorAll('span.item-price') as NodeListOf<HTMLElement>;
    priceSpans.forEach((span) => {
      const itemId = span.getAttribute('data-item-id') || '';
      updatePriceDisplay(itemId);
    });

    ctx?.on?.('prices-updated', () => {
      priceSpans.forEach((span) => {
        const itemId = span.getAttribute('data-item-id') || '';
        updatePriceDisplay(itemId);
      });
    });

    calculateBtn.addEventListener('click', () => {
      const selectedItems = collectSelectedItems();
      if (selectedItems.length === 0) {
        alert('Proszę wybrać co najmniej jeden artykuł');
        return;
      }
      renderCalculation(selectedItems);
    });

    addToCartBtn.addEventListener('click', () => {
      const selectedItems = collectSelectedItems();
      if (selectedItems.length === 0) {
        alert('Wybierz co najmniej jeden artykuł.');
        return;
      }

      renderCalculation(selectedItems);
      ctx.addToBasket({
        category: 'Artykuły biurowe',
        price: currentResult?.totalPrice ?? 0,
        description: selectedItems.map((item) => `${item.itemName} × ${item.quantity}`).join(', ')
      });
    });

    container.addEventListener('change', (e) => {
      const target = e.target as HTMLElement;
      if (target?.classList.contains('item-checkbox') || target?.classList.contains('item-quantity')) {
        updateAddButtonState();
      }
    });

    container.addEventListener('input', (e) => {
      const target = e.target as HTMLElement;
      if (target?.classList.contains('item-quantity')) {
        updateAddButtonState();
      }
    });

    updateAddButtonState();
  }
};
