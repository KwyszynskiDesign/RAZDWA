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
