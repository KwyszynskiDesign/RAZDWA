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
    hours?: number;
  }>;
}

export function quoteUslugi(options: UslugiOptions): any {
  let totalPrice = 0;

  for (const service of options.selectedServices) {
    const storageKey = `uslugi-${service.serviceId}`;
    const price = resolveStoredPrice(storageKey, service.price);
    const qty = service.quantity || 1;
    const hours = service.hours || 1;
    totalPrice += price * qty * hours;
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
    const isTimeBasedService = (serviceId: string): boolean => {
      return serviceId === 'formatowanie' || serviceId === 'poprawki-graficzne';
    };

    const getTimeBasedHint = (serviceName: string): string => {
      return `${serviceName}: podaj czas pracy w godzinach (rozliczenie godzinowe).`;
    };

    let currentResult: { servicesCount: number; totalPrice: number } | null = null;
    let currentSelection: UslugiOptions['selectedServices'] = [];

    container.innerHTML = `
      <div class="category-form">
        <h2>Usługi Dodatkowe</h2>
        <p style="color: #999; margin-bottom: 10px; font-size: 0.92em;">
          Formatowanie, grafika, archiwizacja, obróbka plików.
        </p>

        <div id="services-list" style="margin-bottom: 14px;"></div>

        <div class="form-group" style="margin-bottom: 10px; display: flex; gap: 10px;">
          <button id="calculate-btn" class="btn btn-primary" style="flex: 1;">Oblicz</button>
          <button id="add-to-cart-btn" class="btn btn-success" style="flex: 1;" disabled>DODAJ DO KOSZYKA</button>
        </div>

        <div id="summary" style="display: none; margin-top: 10px; padding: 12px; background: #f0f0f0; border-radius: 6px;">
          <h3 style="margin: 0 0 8px 0; font-size: 1rem;">Podsumowanie</h3>
          <p style="margin: 2px 0;">Liczba usług: <strong id="services-count">0</strong></p>
          <p style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #999;">
            Razem: <strong id="total-price">0,00 zł</strong>
          </p>
          <div id="details-info" style="margin-top: 8px; font-size: 0.86em; color: #666;"></div>
        </div>
      </div>
    `;

    // Build services list
    const servicesList = container.querySelector('#services-list') as HTMLElement;

    for (const category of uslugiCategoryData.categories) {
      const categoryDiv = document.createElement('div');
      categoryDiv.style.marginBottom = '8px';
      categoryDiv.style.padding = '8px';
      categoryDiv.style.backgroundColor = '#f7f9fb';
      categoryDiv.style.border = '1px solid #e3e8ef';
      categoryDiv.style.borderRadius = '8px';
      categoryDiv.innerHTML = `<h3 style="color: #2d3a4a; margin: 0 0 6px 0; font-size: 0.95rem;">${category.name}</h3>`;

      const servicesDiv = document.createElement('div');
      servicesDiv.style.display = 'grid';
      servicesDiv.style.gap = '6px';

      const hasTimeBased = category.items.some((s: any) => isTimeBasedService(s.id));
      void hasTimeBased; // used for future header logic if needed

      for (const service of category.items) {
        const servicePrice = service.price || service.priceMin || 0;
        const priceDisplay = service.priceMin && service.priceMax 
          ? `${service.priceMin.toFixed(2)} - ${service.priceMax.toFixed(2)} zł`
          : `${servicePrice.toFixed(2)} zł`;

        const serviceDiv = document.createElement('div');
        serviceDiv.style.display = 'grid';
        serviceDiv.style.gridTemplateColumns = 'auto 1fr auto auto auto';
        serviceDiv.style.alignItems = 'center';
        serviceDiv.style.columnGap = '6px';
        serviceDiv.style.padding = '5px 8px';
        serviceDiv.style.backgroundColor = '#ffffff';
        serviceDiv.style.border = '1px solid #e7edf5';
        serviceDiv.style.borderRadius = '6px';

        const isTimeBased = isTimeBasedService(service.id);

        serviceDiv.innerHTML = `
          <label style="cursor: pointer; margin: 0; font-size: 0.93em; line-height: 1.2;">${service.name}${isTimeBased ? ' <span style="font-size:0.78em; color:#e07b00; font-weight:600;">(czas)</span>' : ''}</label>
          <div style="display:flex; flex-direction:column; align-items:center; gap:2px;">
            <span style="font-size:0.7em; color:#7a8a9a;">ilość szt.</span>
            <input type="number" data-qty-for="${service.id}" value="1" min="1" max="99" style="width: 48px; padding: 4px; font-size: 0.9em;" class="service-quantity" aria-label="Ilość sztuk">
          </div>
          ${isTimeBased ? `<div style="display:flex; flex-direction:column; align-items:center; gap:2px; width:96px;"><span style="font-size:0.7em; color:#e07b00; font-weight:700;">⏱ wpisz czas (godz.)</span><input type="number" data-hours-for="${service.id}" value="1" min="0.25" step="0.25" max="24" placeholder="np. 1.5" title="Wpisz czas pracy w godzinach" style="width:100%; padding: 4px; font-size: 0.9em;" class="service-hours" aria-label="Wpisz czas pracy w godzinach"><span style="font-size:0.66em; color:#8b97a3;">np. 0.5, 1, 1.5</span></div>` : '<span style="width: 96px;"></span>'}
          <span style="font-weight: bold; color: #0066cc; min-width: 64px; text-align: right; font-size: 0.9em;">${priceDisplay}</span>
          <input type="checkbox" data-service-id="${service.id}" data-service-name="${service.name}" data-price="${servicePrice}" class="service-checkbox" style="width: 18px; height: 18px; cursor: pointer;">
        `;

        servicesDiv.appendChild(serviceDiv);

        if (isTimeBased) {
          const noteDiv = document.createElement('div');
          noteDiv.style.cssText = 'font-size:0.78em; color:#7a8a9a; padding:2px 8px 4px 12px; font-style:italic;';
          const noteParts = [getTimeBasedHint(service.name)];
          if (service.note) {
            noteParts.push(service.note);
          }
          noteDiv.innerHTML = `ℹ️ ${noteParts.join(' ')}`;
          servicesDiv.appendChild(noteDiv);
        }
      }

      categoryDiv.appendChild(servicesDiv);
      servicesList.appendChild(categoryDiv);
    }

    // Calculate button handler
    const calculateBtn = container.querySelector('#calculate-btn') as HTMLButtonElement;
    const addToCartBtn = container.querySelector('#add-to-cart-btn') as HTMLButtonElement;
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
        const hoursInput = container.querySelector(`input[data-hours-for="${serviceId}"]`) as HTMLInputElement;
        const quantity = qtyInput ? parseInt(qtyInput.value) : 1;
        const hours = hoursInput ? parseFloat(hoursInput.value || '1') : 1;

        return {
          serviceId,
          serviceName,
          price,
          quantity,
          hours
        };
      });

      currentSelection = selectedServices;
      const result = quoteUslugi({ selectedServices });
      currentResult = result;

      (container.querySelector('#services-count') as HTMLElement).textContent = result.servicesCount.toString();
      (container.querySelector('#total-price') as HTMLElement).textContent = result.totalPrice.toFixed(2) + ' zł';

      // Build details
      const detailsDiv = container.querySelector('#details-info') as HTMLElement;
      const detailsHTML = selectedServices
        .map(s => {
          const qty = s.quantity || 1;
          const hours = s.hours || 1;
          const extra = hours !== 1 ? ` (${hours}h)` : '';
          return `<div>• ${s.serviceName}${extra}: ${(s.price * qty * hours).toFixed(2)} zł</div>`;
        })
        .join('');
      detailsDiv.innerHTML = detailsHTML;

      summaryDiv.style.display = 'block';
      addToCartBtn.disabled = false;

      ctx.updateLastCalculated(result.totalPrice, `Usługi - ${result.servicesCount} poz.`);

      // Emit event
      ctx?.emit?.('price-calculated', {
        categoryId: 'uslugi',
        totalPrice: result.totalPrice,
        details: result
      });
    });

    addToCartBtn.addEventListener('click', () => {
      if (!currentResult || currentSelection.length === 0) {
        alert('Najpierw oblicz wybrane usługi.');
        return;
      }

      ctx.addToBasket({
        category: 'Usługi',
        price: currentResult.totalPrice,
        description: currentSelection
          .map(service => {
            const qty = service.quantity || 1;
            const hours = service.hours || 1;
            return hours !== 1
              ? `${service.serviceName} × ${qty} (${hours}h)`
              : `${service.serviceName} × ${qty}`;
          })
          .join(', ')
      });
    });
  }
};
