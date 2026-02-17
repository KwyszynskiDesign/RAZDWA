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
      <div style="text-align: center; padding: 40px; color: rgba(255,255,255,0.8);">
        <h2 style="margin:0; font-size: 24px;">Witaj w kalkulatorze Raz Druku Dwa</h2>
        <p style="margin-top: 10px;">Wybierz kategorię z panelu powyżej, aby rozpocząć obliczenia.</p>
      </div>
    `;
  }

  start() {
    this.handleRoute();
  }
}
