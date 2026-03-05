import { CategoryModule } from "../ui/router";
import { resolveStoredPrice } from "../core/compat";
import uslugiData from "../../data/normalized/uslugi.json";

const uslugiCategoryData: any = uslugiData as any;

export interface UslugiOptions {
  selectedServices: Array<{
    serviceId: string;
    serviceName: string;
    price: number;
    quantity?: number;
  }>;
}

export function quoteUslugi(options: UslugiOptions): any {
  let totalPrice = 0;

  for (const service of options.selectedServices) {
    const storageKey = `uslugi-${service.serviceId}`;
    const price = resolveStoredPrice(storageKey, service.price);
    const qty = service.quantity || 1;
    totalPrice += price * qty;
  }

  return {
    servicesCount: options.selectedServices.length,
    totalPrice: parseFloat(totalPrice.toFixed(2))
  };
}

export const uslugiCategory: CategoryModule = {
  id: 'uslugi',
  name: '🛠️ Usługi',
  mount: (container, ctx) => {
    container.innerHTML = `
      <div class="category-form">
        <h2>Usługi Dodatkowe</h2>
        <p style="color: #999; margin-bottom: 20px;">
          Formatowanie, grafika, archiwizacja, obróbka plików.
        </p>

        <div id="services-list" style="margin-bottom: 30px;"></div>

        <div class="form-group">
          <button id="calculate-btn" class="btn btn-primary">Oblicz</button>
        </div>

        <div id="summary" style="display: none; margin-top: 20px; padding: 15px; background: #f0f0f0; border-radius: 5px;">
          <h3>Podsumowanie</h3>
          <p>Liczba usług: <strong id="services-count">0</strong></p>
          <p style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #999;">
            Razem: <strong id="total-price">0,00 zł</strong>
          </p>
          <div id="details-info" style="margin-top: 10px; font-size: 0.9em; color: #666;"></div>
        </div>
      </div>
    `;

    // Build services list
    const servicesList = container.querySelector('#services-list') as HTMLElement;

    for (const category of uslugiCategoryData.categories) {
      const categoryDiv = document.createElement('div');
      categoryDiv.style.marginBottom = '20px';
      categoryDiv.innerHTML = `<h3 style="color: #333; margin-bottom: 10px;">${category.name}</h3>`;

      const servicesDiv = document.createElement('div');

      for (const service of category.items) {
        const servicePrice = service.price || service.priceMin || 0;
        const priceDisplay = service.priceMin && service.priceMax 
          ? `${service.priceMin.toFixed(2)} - ${service.priceMax.toFixed(2)} zł`
          : `${servicePrice.toFixed(2)} zł`;

        const serviceDiv = document.createElement('div');
        serviceDiv.style.display = 'flex';
        serviceDiv.style.flexDirection = 'column';
        serviceDiv.style.gap = '5px';
        serviceDiv.style.marginBottom = '10px';
        serviceDiv.style.padding = '10px';
        serviceDiv.style.backgroundColor = '#f9f9f9';
        serviceDiv.style.borderRadius = '3px';

        const hasQty = service.name.includes('(1-9') || service.name.includes('(9-19') || service.name.includes('(powyżej');
        const hasNote = service.note ? true : false;

        serviceDiv.innerHTML = `
          <label style="display: flex; align-items: flex-start; gap: 8px; cursor: pointer; margin: 0;">
            <input type="checkbox" data-service-id="${service.id}" data-service-name="${service.name}" data-price="${servicePrice}" class="service-checkbox" style="margin-top: 3px;">
            <div style="flex: 1;">
              <span style="font-weight: 500;">${service.name}</span>
              ${hasNote ? `<div style="color: #666; font-size: 0.85em; margin-top: 3px;">ℹ️ ${service.note}</div>` : ''}
            </div>
            <span style="font-weight: bold; color: #0066cc; white-space: nowrap;">${priceDisplay}</span>
          </label>
          ${hasQty ? `
            <div style="display: flex; gap: 10px; align-items: center; margin-left: 28px;">
              <label style="font-size: 0.9em; color: #666;">Ilość:</label>
              <input type="number" data-qty-for="${service.id}" value="1" min="1" max="99" style="width: 50px; padding: 4px;" class="service-quantity">
            </div>
          ` : ''}
        `;

        servicesDiv.appendChild(serviceDiv);
      }

      categoryDiv.appendChild(servicesDiv);
      servicesList.appendChild(categoryDiv);
    }

    // Calculate button handler
    const calculateBtn = container.querySelector('#calculate-btn') as HTMLButtonElement;
    const summaryDiv = container.querySelector('#summary') as HTMLElement;

    calculateBtn.addEventListener('click', () => {
      const checked = Array.from(container.querySelectorAll('.service-checkbox:checked')) as HTMLInputElement[];
      
      if (checked.length === 0) {
        alert('Proszę wybrać co najmniej jedną usługę');
        return;
      }

      const selectedServices = checked.map(checkbox => {
        const serviceId = checkbox.getAttribute('data-service-id') || '';
        const serviceName = checkbox.getAttribute('data-service-name') || '';
        const price = parseFloat(checkbox.getAttribute('data-price') || '0');
        const qtyInput = container.querySelector(`input[data-qty-for="${serviceId}"]`) as HTMLInputElement;
        const quantity = qtyInput ? parseInt(qtyInput.value) : 1;

        return {
          serviceId,
          serviceName,
          price,
          quantity
        };
      });

      const result = quoteUslugi({ selectedServices });

      (container.querySelector('#services-count') as HTMLElement).textContent = result.servicesCount.toString();
      (container.querySelector('#total-price') as HTMLElement).textContent = result.totalPrice.toFixed(2) + ' zł';

      // Build details
      const detailsDiv = container.querySelector('#details-info') as HTMLElement;
      const detailsHTML = selectedServices
        .map(s => `<div>• ${s.serviceName}: ${(s.price * (s.quantity || 1)).toFixed(2)} zł</div>`)
        .join('');
      detailsDiv.innerHTML = detailsHTML;

      summaryDiv.style.display = 'block';

      // Emit event
      ctx?.emit?.('price-calculated', {
        categoryId: 'uslugi',
        totalPrice: result.totalPrice,
        details: result
      });
    });
  }
};
