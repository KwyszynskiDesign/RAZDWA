import { CategoryModule, CategoryContext } from "../ui/router";

export async function loadCategoryHTML(filename: string): Promise<string> {
  const response = await fetch(`./categories/${filename}`);
  if (!response.ok) throw new Error(`Failed to load ${filename}`);
  return response.text();
}

export function createHTMLCategory(
  id: string,
  name: string,
  filename: string
): CategoryModule {
  return {
    id,
    name,
    mount: async (container: HTMLElement, ctx: CategoryContext) => {
      container.innerHTML = '<div style="padding: 20px; text-align: center; color: #999;">⏳ Ładowanie kategorii...</div>';

      try {
        const html = await loadCategoryHTML(filename);
        container.innerHTML = html;

        // Re-attach event listeners if needed
        attachCategoryEventListeners(container, ctx);
      } catch (error) {
        container.innerHTML = `
          <div style="padding: 40px; text-align: center; color: #e74c3c;">
            ❌ Błąd ładowania kategorii: ${name}
            <br><small>${error}</small>
          </div>
        `;
        console.error('Category load error:', error);
      }
    }
  };
}

function attachCategoryEventListeners(container: HTMLElement, ctx: CategoryContext) {
  // Znajdź wszystkie buttony "Dodaj do listy" lub "Oblicz"
  const buttons = container.querySelectorAll('button[data-action]');

  buttons.forEach(btn => {
    const action = btn.getAttribute('data-action');

    if (action === 'calculate') {
      btn.addEventListener('click', () => {
        // Logika obliczania ceny
        console.log('Calculate clicked');
      });
    }

    if (action === 'add-to-basket') {
      btn.addEventListener('click', () => {
        // Logika dodawania do koszyka
        ctx.addToBasket({
          category: container.getAttribute('data-category-id') || 'unknown',
          price: parseFloat(container.getAttribute('data-price') || '0'),
          description: container.getAttribute('data-description') || ''
        });
      });
    }
  });
}
