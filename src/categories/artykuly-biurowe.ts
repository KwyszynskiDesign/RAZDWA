import { CategoryModule } from "../ui/router";
import { resolveStoredPrice } from "../core/compat";
import artykulyData from "../../data/normalized/artykuly-biurowe.json";

const artykulyBiuroweData: any = artykulyData as any;
const ENVELOPE_LETTERS = ["a", "b", "c", "d", "e", "f", "g"] as const;

function isEnvelopeLetterItem(itemId: string): boolean {
  return /^koperty-[a-g]$/i.test(itemId);
}

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
    const storageKey = isEnvelopeLetterItem(item.itemId) ? item.itemId.toLowerCase() : `artykuly-${item.itemId}`;
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
        <p style="color: #999; margin-bottom: 10px; font-size: 0.92em;">
          Artykuły biurowe i akcesoria. Cena za sztukę.
        </p>

        <div id="items-list" style="margin-bottom: 14px;"></div>
      </div>
    `;

    const itemsList = container.querySelector('#items-list') as HTMLElement;
    const envelopeLetterCategory = {
      name: 'KOPERTY (A–G)',
      items: ENVELOPE_LETTERS.map((letter) => ({
        id: `koperty-${letter}`,
        name: `Koperta ${letter.toUpperCase()}`,
        price: resolveStoredPrice(`koperty-${letter}`, 0)
      }))
    };
    const displayCategories = [...artykulyBiuroweData.categories, envelopeLetterCategory];

    for (const category of displayCategories) {
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
          <button type="button" data-add-item-id="${item.id}" data-item-name="${item.name}" data-price="${itemPrice}" class="btn btn-success item-add-btn add-pill-btn" aria-label="Dodaj artykuł ${item.name} do koszyka">+</button>
        `;

        itemsDiv.appendChild(itemDiv);
      }

      categoryDiv.appendChild(itemsDiv);
      itemsList.appendChild(categoryDiv);
    }

    const getCurrentPrice = (itemId: string, basePrice: number): number => {
      const storageKey = isEnvelopeLetterItem(itemId) ? itemId.toLowerCase() : `artykuly-${itemId}`;
      return resolveStoredPrice(storageKey, basePrice);
    };

    const updatePriceDisplay = (itemId: string) => {
      const priceSpan = container.querySelector(`span.item-price[data-item-id="${itemId}"]`) as HTMLElement | null;
      const addButton = container.querySelector(`button[data-add-item-id="${itemId}"]`) as HTMLButtonElement | null;
      if (!priceSpan || !addButton) return;

      const basePrice = parseFloat(priceSpan.getAttribute('data-base-price') || '0');
      const currentPrice = getCurrentPrice(itemId, basePrice);

      priceSpan.textContent = `${currentPrice.toFixed(2)} zł`;
      addButton.setAttribute('data-price', currentPrice.toString());
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

    container.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const addButton = target?.closest('.item-add-btn') as HTMLButtonElement | null;
      if (!addButton) return;

      const itemId = addButton.getAttribute('data-add-item-id') || '';
      const itemName = addButton.getAttribute('data-item-name') || '';
      const basePrice = parseFloat(addButton.getAttribute('data-price') || '0');
      const price = getCurrentPrice(itemId, basePrice);
      const qtyInput = container.querySelector(`input[data-qty-for="${itemId}"]`) as HTMLInputElement | null;
      const quantity = Math.max(1, parseInt(qtyInput?.value || '1', 10) || 1);

      const selectedItems: ArtykulyBiuroweOptions['selectedItems'] = [{
        categoryName: '',
        itemId,
        itemName,
        quantity,
        price
      }];

      const result = quoteArtykulyBiurowe({ selectedItems });

      ctx.updateLastCalculated(result.totalPrice, `Artykuły biurowe - ${itemName}`);
      ctx?.emit?.('price-calculated', {
        categoryId: 'artykuly-biurowe',
        totalPrice: result.totalPrice,
        details: result
      });

      ctx.addToBasket({
        category: 'Artykuły biurowe',
        price: result.totalPrice,
        description: `${itemName} × ${quantity}`
      });
    });
  }
};
