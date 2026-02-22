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

  async handleRoute() {
    const path = window.location.hash.replace(/^#\/*/, '');
    if (!path) return this.renderHome();

    if (!/^[\w-]+$/.test(path)) return this.renderHome();

    const container = document.getElementById('viewContainer') || this.container;
    if (!container) return;

    // Clear previous content and show loading spinner
    container.innerHTML = '<div class="router-loading"><div class="router-spinner"></div></div>';

    try {
      // Check registered route views first
      const view = this.routes.get(path);
      if (view) {
        await view.mount(container, this.getCtx());
        return;
      }

      // Fall back to static HTML file
      const htmlResp = await fetch(`categories/${path}.html`);
      if (htmlResp.ok) {
        container.innerHTML = await htmlResp.text();

        // Remove previous category script if present
        const oldScript = container.querySelector('script[data-category]');
        if (oldScript) oldScript.remove();

        // Dynamically load JS module for category
        const script = document.createElement('script');
        script.type = 'module';
        script.src = `categories/${path}.js`;
        script.dataset.category = path;
        container.appendChild(script);
      } else {
        this.renderHome();
      }
    } catch (e) {
      console.error('Router error:', e);
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
