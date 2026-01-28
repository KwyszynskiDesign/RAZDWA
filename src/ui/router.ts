import { View, ViewContext } from "./types";

export class Router {
  private routes: Map<string, View> = new Map();
  private container: HTMLElement;
  private ctxProvider: () => ViewContext;
  private currentView: View | null = null;

  constructor(container: HTMLElement, ctxProvider: () => ViewContext) {
    this.container = container;
    this.ctxProvider = ctxProvider;
    window.addEventListener("hashchange", () => this.handleRoute());
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
      this.container.innerHTML = "<h2>Witaj w Kalkulatorze</h2><p>Wybierz kategorię z menu powyżej.</p>";
      this.currentView = null;
    } else {
      this.container.innerHTML = "<h2>404 - Nie znaleziono strony</h2>";
      this.currentView = null;
    }
  }
}
