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
    window.addEventListener("hashchange", () => {
      this.handleRoute().catch(e => {
        console.error('Router navigation error:', e);
        this.renderHome();
      });
    });
  }

  setCategories(categories: any[]) {
    this.categories = categories;
  }

  addRoute(view: View) {
    this.routes.set(view.id, view);
  }

  async handleRoute() {
    const hash = window.location.hash || "#/";
    let path = hash.startsWith("#/") ? hash.slice(2) : "";
    path = path.replace(/^\/+/, "");
    if (!path) {
      this.renderHome();
      return;
    }

    // Unmount previous view before mounting a new one
    if (this.currentView?.unmount) {
      this.currentView.unmount();
    }

    const view = this.routes.get(path);
    if (view) {
      this.currentView = view;
      await view.mount(this.container, this.getCtx());
    } else {
      try {
        const resp = await fetch(`categories/${path}.html`);
        if (resp.ok) {
          this.currentView = null;
          this.container.innerHTML = await resp.text();
          // Re-execute inline <script> tags (innerHTML does not run scripts)
          this.container.querySelectorAll<HTMLScriptElement>('script').forEach(oldScript => {
            const newScript = document.createElement('script');
            newScript.textContent = oldScript.textContent ?? '';
            oldScript.replaceWith(newScript);
          });
          // Opcjonalny JS
          try {
            const jsResp = await fetch(`categories/${path}.js`);
            if (jsResp.ok) {
              const script = document.createElement('script');
              script.textContent = await jsResp.text();
              this.container.appendChild(script);
            }
          } catch {}
        } else {
          this.renderHome();
        }
      } catch(e) {
        console.error('Category load:', e);
        this.renderHome();
      }
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
