import { View, ViewContext } from "./types";

export class Router {
  private routes: Map<string, View> = new Map();
  private container: HTMLElement;
  private ctxProvider: () => ViewContext;
  private currentView: View | null = null;
  private categories: any[] = [];

  constructor(container: HTMLElement, ctxProvider: () => ViewContext) {
    this.container = container;
    this.ctxProvider = ctxProvider;
    window.addEventListener("hashchange", () => this.handleRoute());
  }

  setCategories(categories: any[]) {
    this.categories = categories;
  }

  addRoute(view: View) {
    this.routes.set(`/${view.id}`, view);
  }

  start() {
    this.handleRoute();
  }

  private handleRoute() {
    const hash = window.location.hash || "#/";
    const path = hash.slice(1) || "/";

    const view = this.routes.get(path);

    if (this.currentView && this.currentView.unmount) {
      this.currentView.unmount();
    }

    this.container.innerHTML = "";

    if (view) {
      this.currentView = view;
      view.mount(this.container, this.ctxProvider());
    } else if (path === "/") {
      this.renderCategoryGrid();
      this.currentView = null;
    } else {
      this.container.innerHTML = "<h2>404 - Nie znaleziono strony</h2>";
      this.currentView = null;
    }
  }

  private renderCategoryGrid() {
    this.container.innerHTML = `
      <h2>Wybierz kategorię</h2>
      <div class="category-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; margin-top: 20px;">
        ${this.categories.map(cat => `
          <a href="#/${cat.id}" class="category-card" style="
            text-decoration: none;
            color: inherit;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            padding: 24px;
            text-align: center;
            transition: all 0.2s;
            display: flex;
            flex-direction: column;
            gap: 12px;
            ${!cat.implemented ? 'opacity: 0.5; pointer-events: none;' : ''}
          ">
            <span style="font-size: 32px;">${cat.icon}</span>
            <span style="font-weight: 800;">${cat.name}</span>
            ${!cat.implemented ? '<span style="font-size: 11px; font-weight: 400; opacity: 0.7;">Wkrótce...</span>' : ''}
          </a>
        `).join("")}
      </div>
    `;

    // Hover effect via JS since it's injected HTML
    const cards = this.container.querySelectorAll('.category-card');
    cards.forEach(card => {
      (card as HTMLElement).onmouseenter = () => {
        (card as HTMLElement).style.background = 'rgba(255, 255, 255, 0.1)';
        (card as HTMLElement).style.borderColor = 'var(--primary)';
        (card as HTMLElement).style.transform = 'translateY(-2px)';
      };
      (card as HTMLElement).onmouseleave = () => {
        (card as HTMLElement).style.background = 'rgba(255, 255, 255, 0.05)';
        (card as HTMLElement).style.borderColor = 'rgba(255, 255, 255, 0.1)';
        (card as HTMLElement).style.transform = 'translateY(0)';
      };
    });
  }
}
