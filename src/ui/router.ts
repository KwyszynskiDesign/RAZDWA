import { cartApi } from "../core/cart";

export interface CategoryContext {
  cart: typeof cartApi;
  expressMode: boolean;
}

export interface CategoryModule {
  id: string;
  name: string;
  mount: (container: HTMLElement, ctx: CategoryContext) => void;
  unmount?: () => void;
}

export class Router {
  private routes: Map<string, CategoryModule> = new Map();
  private currentModule: CategoryModule | null = null;
  private container: HTMLElement;

  constructor(containerId: string) {
    const el = document.getElementById(containerId);
    if (!el) throw new Error(`Container #${containerId} not found`);
    this.container = el;

    window.addEventListener("hashchange", () => this.handleRoute());
  }

  addRoute(module: CategoryModule) {
    this.routes.set(module.id, module);
  }

  handleRoute() {
    const hash = window.location.hash.replace("#/", "");
    const module = this.routes.get(hash);

    if (this.currentModule && this.currentModule.unmount) {
      this.currentModule.unmount();
    }

    this.container.innerHTML = "";

    if (module) {
      this.currentModule = module;
      const ctx: CategoryContext = {
        cart: cartApi,
        expressMode: false, // Can be linked to a global toggle if needed
      };
      module.mount(this.container, ctx);
    } else {
      this.container.innerHTML = `<div style="padding: 40px; text-align: center; color: var(--muted);">
        Wybierz kategorię z menu powyżej, aby rozpocząć.
      </div>`;
    }
  }

  init() {
    this.handleRoute();
  }
}
