import { View, ViewContext } from "./types";

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
      view.mount(this.container, this.getCtx());
    } else {
      this.renderHome();
    }
  }

  private renderHome() {
    this.container.innerHTML = `
      <div class="category-grid">
        ${this.categories.map(cat => `
          <a href="categories/${cat.id}.html"
             class="cat-card ${cat.implemented ? '' : 'disabled'}"
             onclick="if(${cat.implemented}) { event.preventDefault(); window.location.hash='#/${cat.id}'; } else { event.preventDefault(); }">
            <div class="cat-icon">${cat.icon}</div>
            <div class="cat-title">${cat.name}</div>
            ${cat.implemented ? '' : '<div class="cat-status">Wkrótce</div>'}
          </a>
        `).join("")}
      </div>
    `;
  }

  start() {
    this.handleRoute();
  }
}
