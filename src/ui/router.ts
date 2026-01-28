import { View, ViewContext } from "./types";

export class Router {
  private routes: Map<string, View> = new Map();
  private container: HTMLElement;
  private ctx: ViewContext;

  constructor(container: HTMLElement, ctx: ViewContext) {
    this.container = container;
    this.ctx = ctx;
    window.addEventListener("hashchange", () => this.handleRoute());
  }

  addRoute(path: string, view: View) {
    this.routes.set(path, view);
  }

  start() {
    this.handleRoute();
  }

  private handleRoute() {
    const hash = window.location.hash || "#/";
    const path = hash.slice(1) || "/";
    const view = this.routes.get(path);

    if (view) {
      this.container.innerHTML = "";
      view.mount(this.container, this.ctx);
    } else {
      this.container.innerHTML = "<h1>404 - Nie znaleziono strony</h1>";
    }
  }
}
