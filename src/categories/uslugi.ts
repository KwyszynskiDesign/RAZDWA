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
  unmount: () => {},
  mount: (container, ctx) => {
    const ac = new AbortController();
    uslugiCategory.unmount = () => ac.abort();
    const isTimeBasedService = (serviceId: string): boolean => {
      return serviceId === 'formatowanie' || serviceId === 'poprawki-graficzne';
    };

    const getTimeBasedHint = (serviceName: string): string => {
      return `${serviceName}: podaj czas pracy w godzinach (rozliczenie godzinowe).`;
    };

    container.innerHTML = `
      <div class="category-form">
        <h2>Usługi Dodatkowe</h2>
        <p style="color: #999; margin-bottom: 10px; font-size: 0.92em;">
          Formatowanie, grafika, archiwizacja, obróbka plików.
        </p>

        <div id="services-list" style="margin-bottom: 14px;"></div>
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
          <button type="button" data-add-service-id="${service.id}" data-service-name="${service.name}" data-price="${servicePrice}" class="btn btn-success service-add-btn add-pill-btn" aria-label="Dodaj usługę ${service.name} do koszyka">+</button>
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

    container.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const addButton = target?.closest('.service-add-btn') as HTMLButtonElement | null;
      if (!addButton) return;

      const serviceId = addButton.getAttribute('data-add-service-id') || '';
      const serviceName = addButton.getAttribute('data-service-name') || '';
      const price = parseFloat(addButton.getAttribute('data-price') || '0');
      const qtyInput = container.querySelector(`input[data-qty-for="${serviceId}"]`) as HTMLInputElement | null;
      const hoursInput = container.querySelector(`input[data-hours-for="${serviceId}"]`) as HTMLInputElement | null;

      const quantity = Math.max(1, parseInt(qtyInput?.value || '1', 10) || 1);
      const hours = Math.max(0.25, parseFloat(hoursInput?.value || '1') || 1);

      const selectedService = {
        serviceId,
        serviceName,
        price,
        quantity,
        hours
      };

      const result = quoteUslugi({ selectedServices: [selectedService] });

      ctx.updateLastCalculated(result.totalPrice, `Usługi - ${serviceName}`);
      ctx?.emit?.('price-calculated', {
        categoryId: 'uslugi',
        totalPrice: result.totalPrice,
        details: result
      });

      ctx.addToBasket({
        category: 'Usługi',
        price: result.totalPrice,
        description: hours !== 1
          ? `${serviceName} × ${quantity} (${hours}h)`
          : `${serviceName} × ${quantity}`
      });
    }, { signal: ac.signal });
  }
};
