import { View, ViewContext } from "./types";

export type CategoryModule = View;
export type CategoryContext = ViewContext;

export class Router {
  private routes: Map<string, View> = new Map();
  private currentView: View | null = null;
  private container: HTMLElement;
  private getCtx: () => ViewContext;
  private categories: any[] = [];

  constructor(container: HTMLElement, getCtx: () => ViewContext) {
    this.container = container;
    this.getCtx = getCtx;
    window.addEventListener("hashchange", () => this.handleRoute());
  }

  setCategories(categories: any[]) {
    this.categories = categories;
  }

  addRoute(view: View) {
    this.routes.set(view.id, view);
  }

  handleRoute() {
    const hash = window.location.hash || "#/";
    const path = hash.slice(2); // remove #/

    if (this.currentView && this.currentView.unmount) {
      this.currentView.unmount();
    }

    this.container.innerHTML = "";

    const view = this.routes.get(path);
    if (view) {
      this.currentView = view;

      // Dodaj przycisk powrotu
      const backButton = document.createElement('button');
      backButton.className = 'back-button';
      backButton.textContent = 'Wszystkie kategorie';
      backButton.onclick = () => { window.location.hash = '#/'; };
      this.container.appendChild(backButton);

      // Kontener na kategorię
      const categoryContent = document.createElement('div');
      categoryContent.className = 'category-content';
      categoryContent.id = 'current-category';
      this.container.appendChild(categoryContent);

      view.mount(categoryContent, this.getCtx());
    } else {
      this.renderHome();
    }
  }

  private renderHome() {
    this.container.innerHTML = `
      <div class="category-grid">
        ${this.categories.map(cat => `
          <div class="category-card ${cat.implemented ? '' : 'coming-soon'}"
               ${cat.implemented ? `onclick="window.location.hash='#/${cat.id}'"` : ''}>
            <div class="category-icon">${cat.icon}</div>
            <div class="category-name">${cat.name}</div>
            ${cat.implemented ? '' : '<div class="badge">Wkrótce</div>'}
          </div>
        `).join("")}
      </div>
    `;
  }

  start() {
    this.handleRoute();
  }
}
