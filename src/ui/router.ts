import { View, ViewContext } from "./types";

export type CategoryModule = View;
export type CategoryContext = ViewContext;

export class Router {
  private routes: Map<string, View> = new Map();
  private currentView: View | null = null;
  private container: HTMLElement;
  private getCtx: () => ViewContext;
  private categories: any[] = [];
  private legacyScriptPages: Set<string> = new Set(["plakaty", "ustawienia"]);
  
  private isIconUrl(icon: string): boolean {
    return /^https?:\/\//i.test(icon);
  }
  
  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
  
  private renderCategoryIcon(icon: string, name: string): string {
    if (this.isIconUrl(icon)) {
      const safeUrl = this.escapeHtml(icon);
      const safeAlt = this.escapeHtml(name);
      return `<img src="${safeUrl}" alt="Ikona ${safeAlt}" loading="lazy" decoding="async" style="width:20px;height:20px;display:block;" />`;
    }
    return this.escapeHtml(icon);
  }

  constructor(container: HTMLElement, getCtx: () => ViewContext) {
    this.container = container;
    this.getCtx = getCtx;
    window.addEventListener("hashchange", () => {
      this.handleRoute().catch(() => {
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

    // Backward-compatible aliases for renamed category IDs
    if (path === "druk-a4-a3-skan") {
      path = "druk-a4-a3";
      window.history.replaceState(null, "", "#/druk-a4-a3");
    }

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
      try {
        await view.mount(this.container, this.getCtx());
      } catch (err) {
        console.error("❌ View mount error:", err);
        this.container.innerHTML = `<div class="error">Błąd ładowania widoku: ${err}</div>`;
      }
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
          if (this.legacyScriptPages.has(path)) {
            try {
              const jsResp = await fetch(`categories/${path}.js`);
              if (jsResp.ok) {
                const script = document.createElement('script');
                script.textContent = await jsResp.text();
                this.container.appendChild(script);
              }
            } catch {}
          }
        } else {
          this.renderHome();
        }
      } catch {
        this.renderHome();
      }
    }
  }

  private renderHome() {
    const categoriesById = new Map(this.categories.map((cat: any) => [cat.id, cat]));
    const groupedHomeTiles: Array<{ title: string; ids: string[] }> = [
      {
        title: "Druk",
        ids: ["druk-a4-a3", "druk-cad", "cad-upload", "banner", "ulotki-cyfrowe", "wlepki-naklejki", "plakaty", "plakaty-a4-a3"]
      },

      {
        title: "Wykończenia",
        ids: ["laminowanie", "folia-szroniona", "wycinanie-folii", "canvas", "roll-up"]
      },
      {
        title: "Pozostałe",
        ids: ["wizytowki-druk-cyfrowy", "dyplomy", "zaproszenia-kreda", "vouchery", "artykuly-biurowe", "uslugi"]
      }
    ];

    const fallbackMeta: Record<string, { id: string; name: string; icon: string; implemented: boolean }> = {
      uslugi: { id: "uslugi", name: "Usługi", icon: "https://cdn.jsdelivr.net/npm/lucide-static@latest/icons/settings-2.svg", implemented: true }
    };

    const groupHtml = groupedHomeTiles.map((group) => {
      const tiles = group.ids
        .map((id) => categoriesById.get(id) ?? fallbackMeta[id])
        .filter(Boolean)
        .filter((cat: any) => cat.implemented !== false)
        .map((cat: any) => {
          const id = String(cat.id ?? "");
          const icon = String(cat.icon ?? "📁");
          const name = String(cat.name ?? id);
          const iconMarkup = this.renderCategoryIcon(icon, name);
          return `
            <a href="#/${id}" class="home-mini-tile" aria-label="Przejdź do ${name}">
              <span class="home-mini-icon">${iconMarkup}</span>
              <span class="home-mini-label">${name}</span>
            </a>
          `;
        })
        .join("");

      return `
        <section class="home-mini-group">
          <h3 class="home-mini-group-title">${group.title}</h3>
          <div class="home-mini-grid">${tiles}</div>
        </section>
      `;
    }).join("");

    this.container.innerHTML = `
      <div class="home-categories-shell">
        <h2 class="home-categories-title">Witaj w kalkulatorze — wybierz kategorię poniżej</h2>
        <div class="home-mini-groups">
          ${groupHtml}
        </div>
      </div>
    `;
  }

  start() {
    this.handleRoute();
  }
}
