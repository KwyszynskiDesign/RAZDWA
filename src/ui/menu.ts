import { CategoryModule } from "./router";
export function initMenu(container: HTMLElement, categories: CategoryModule[], onSelect: (id: string) => void) {
  const searchInput = document.createElement("input");
  searchInput.placeholder = "Szukaj kategorii..."; searchInput.style.width = "100%"; searchInput.style.marginBottom = "10px";
  const listContainer = document.createElement("div"); listContainer.style.maxHeight = "200px"; listContainer.style.overflowY = "auto"; listContainer.style.border = "1px solid #eee";
  const renderList = (filter = "") => {
    listContainer.innerHTML = "";
    categories.filter(c => c.name.toLowerCase().includes(filter.toLowerCase())).forEach(cat => {
      const item = document.createElement("div"); item.className = "category-item"; item.textContent = cat.name; item.onclick = () => onSelect(cat.id); listContainer.appendChild(item);
    });
  };
  searchInput.oninput = (e) => renderList((e.target as HTMLInputElement).value);
  container.appendChild(searchInput); container.appendChild(listContainer); renderList();
}
