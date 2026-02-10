import { CategoryModule, CategoryContext } from "../ui/router";

// Funkcja ładująca HTML z pliku
export async function loadCategoryHTML(filename: string): Promise<string> {
  const response = await fetch(`./categories/${filename}`);
  if (!response.ok) throw new Error(`Nie można załadować ${filename}`);
  return response.text();
}

// Generator kategorii z plików HTML
export function createHTMLCategory(
  id: string, 
  name: string, 
  filename: string
): CategoryModule {
  return {
    id,
    name,
    mount: async (container: HTMLElement, ctx: CategoryContext) => {
      container.innerHTML = '<div style="padding: 20px; text-align: center;">Ładowanie...</div>';
      
      try {
        const html = await loadCategoryHTML(filename);
        container.innerHTML = html;
        
        // Tutaj możesz dodać logikę kalkulatora, jeśli HTML zawiera formularze
        setupCategoryForm(container, ctx, id, name);
      } catch (error) {
        container.innerHTML = `
          <div style="padding: 40px; text-align: center; color: red;">
            ❌ Błąd: Nie udało się załadować kategorii "${name}"
          </div>
        `;
        console.error(error);
      }
    }
  };
}

// Funkcja obsługująca formularze w HTML (opcjonalna)
function setupCategoryForm(
  container: HTMLElement, 
  ctx: CategoryContext, 
  categoryId: string, 
  categoryName: string
) {
  // Przykład: znajdź przycisk "Dodaj do koszyka" i podepnij logikę
  const addButton = container.querySelector('#addToCart');
  if (addButton) {
    addButton.addEventListener('click', () => {
      // Tutaj możesz dodać logikę zbierania danych z formularza
      const price = parseFloat(container.querySelector('#price')?.textContent || '0');
      
      ctx.cart.addItem({
        categoryId,
        categoryName,
        details: { /* dane z formularza */ },
        price
      });
      
      alert(`Dodano do koszyka: ${categoryName}`);
    });
  }
}
