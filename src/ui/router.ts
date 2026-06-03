import { View, ViewContext } from "./types";
import { VIPERPRINT_URL } from "../core/external-links";

export interface CategoryContext extends ViewContext {
  cart: {
    addItem: (item: any) => void;
  };
}

export interface CategoryModule {
  id: string;
  name: string;
  mount: (container: HTMLElement, ctx: CategoryContext) => void | Promise<void>;
  initLogic?: (container: HTMLElement, ctx: CategoryContext) => void;
  unmount?: () => void;
}

export class Router {
  private routes: Map<string, View> = new Map();
  private currentView: View | null = null;
  private container: HTMLElement;
  private getCtx: () => ViewContext;
  private categories: any[] = [];
  private legacyScriptPages: Set<string> = new Set(["plakaty", "ustawienia"]);
  private readonly SETTINGS_PIN_KEY = 'razdwa_pin';
  private readonly SETTINGS_AUTH_KEY = 'razdwa_pin_auth';

  private isSettingsAuthenticated(): boolean {
    return sessionStorage.getItem(this.SETTINGS_AUTH_KEY) === '1';
  }

  private renderSettingsPinGate(onSuccess: () => Promise<void>): void {
    const storedPin = localStorage.getItem(this.SETTINGS_PIN_KEY);
    this.container.innerHTML = `
      <div style="max-width:360px;margin:60px auto;padding:32px;background:var(--surface);border:1px solid var(--border);border-radius:16px;text-align:center;">
        <h2 style="margin:0 0 8px;font-size:1.3rem;">Panel ustawie&#x144; cen</h2>
        <p style="margin:0 0 20px;color:var(--text-secondary);font-size:14px;">Wprowad&#x17A; PIN, aby uzyska&#x107; dost&#x119;p.</p>
        <input type="password" id="gatePin" inputmode="numeric" maxlength="8" placeholder="PIN" autocomplete="current-password"
          style="width:100%;box-sizing:border-box;padding:10px 14px;font-size:16px;border:1px solid var(--border);border-radius:8px;margin-bottom:12px;background:var(--surface-alt,#fff);color:var(--text,#0f172a);">
        <button type="button" id="gatePinBtn"
          style="width:100%;padding:10px;font-size:15px;font-weight:600;background:var(--primary,#004080);color:#fff;border:none;border-radius:8px;cursor:pointer;">
          Zatwierd&#x17A;
        </button>
        <p id="gatePinErr" style="display:none;margin:10px 0 0;font-size:13px;color:#dc2626;">Nieprawid&#x142;owy PIN.</p>
      </div>
    `;

    const pinInput = this.container.querySelector<HTMLInputElement>('#gatePin');
    const submitBtn = this.container.querySelector<HTMLButtonElement>('#gatePinBtn');
    const errorEl = this.container.querySelector<HTMLElement>('#gatePinErr');

    pinInput?.focus();

    const attempt = () => {
      const val = pinInput?.value ?? '';
      if (val === storedPin) {
        sessionStorage.setItem(this.SETTINGS_AUTH_KEY, '1');
        if (pinInput) pinInput.value = '';
        onSuccess().catch(() => {});
      } else {
        if (errorEl) errorEl.style.display = 'block';
        if (pinInput) { pinInput.value = ''; pinInput.focus(); }
      }
    };

    submitBtn?.addEventListener('click', attempt);
    pinInput?.addEventListener('keydown', (e: KeyboardEvent) => { if (e.key === 'Enter') attempt(); });
  }

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
  
  private getCustomHomeIcon(id: string): string | null {
    if (id === "roll-up") {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h20"/><path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3"/><path d="M12 16v5"/><path d="M8 21h8"/></svg>`;
    }

    if (id === "laminowanie") {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6h4"/><path d="M2 10h4"/><path d="M2 14h4"/><path d="M2 18h4"/><rect width="16" height="20" x="4" y="2" rx="2"/><path d="M16 2v20"/></svg>`;
    }

    return null;
  }

  private renderCategoryIcon(icon: string, name: string, id?: string): string {
    if (id) {
      const customIcon = this.getCustomHomeIcon(id);
      if (customIcon) return customIcon;
    }

    if (this.isIconUrl(icon)) {
      const safeUrl = this.escapeHtml(icon);
      const safeAlt = this.escapeHtml(name);
      return `<img src="${safeUrl}" alt="Ikona ${safeAlt}" loading="lazy" decoding="async" />`;
    }
    return this.escapeHtml(icon);
  }

  private renderHomeTileLabel(id: string, name: string): string {
    const safeName = this.escapeHtml(name);

    if (id === "plakaty") {
      return "Plakaty<br>A3-A0";
    }

    if (id === "plakaty-a4-a3") {
      return "Plakaty<br>A4-A3";
    }

    if (id === "druk-cad") {
      return "Druk CAD<br><span class=\"home-tile-sublabel\">wielkoformatowy</span>";
    }

    if (id === "zamowienia-zewnetrzne") {
      return "ZAMÓWIENIA<br>ZEWNĘTRZNE";
    }

    return safeName;
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

    if (path === "pojedyncze-naklady") {
      path = "wydruki-specjalne";
      window.history.replaceState(null, "", "#/wydruki-specjalne");
    }

    if (!path) {
      this.renderHome();
      return;
    }

    if (!/^[a-z0-9][a-z0-9_-]*$/.test(path)) {
      this.renderNotFound(path);
      return;
    }

    if (path === "zamowienia-zewnetrzne") {
      window.open(VIPERPRINT_URL, "_blank", "noopener,noreferrer");
      window.location.hash = "#/";
      return;
    }

    if (path === 'ustawienia') {
      const storedPin = localStorage.getItem(this.SETTINGS_PIN_KEY);
      if (storedPin && !this.isSettingsAuthenticated()) {
        if (this.currentView?.unmount) {
          this.currentView.unmount();
          this.currentView = null;
        }
        this.renderSettingsPinGate(async () => {
          const view = this.routes.get('ustawienia');
          if (view) {
            this.currentView = view;
            try {
              await view.mount(this.container, this.getCtx());
            } catch (err) {
              this.container.innerHTML = `<div class="error">B&#x142;&#x105;d &#x142;adowania widoku: ${this.escapeHtml(String(err))}</div>`;
            }
          }
        });
        return;
      }
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
        this.container.innerHTML = `<div class="error">Błąd ładowania widoku: ${this.escapeHtml(String(err))}</div>`;
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
          this.renderNotFound(path);
        }
      } catch {
        this.renderNotFound(path);
      }
    }
  }

  renderNotFound(path: string) {
    const safePath = this.escapeHtml(path);
    this.container.innerHTML = `
      <div class="error-view">
        <p>Nie znaleziono kategorii „<strong>${safePath}</strong>".</p>
        <a href="#/">← Wróć do strony głównej</a>
      </div>
    `;
  }

  private renderHome() {
    const categoriesById = new Map(this.categories.map((cat: any) => [cat.id, cat]));
    const groupedHomeTiles: Array<{ title: string; ids: string[] }> = [
      {
        title: "Druk cyfrowy",
        ids: ["druk-a4-a3", "ulotki-cyfrowe", "wizytowki-druk-cyfrowy", "dyplomy", "zaproszenia-kreda", "vouchery", "plakaty-a4-a3", "broszury-katalogi"]
      },
      {
        title: "Ploter i wielki format",
        ids: ["druk-cad", "cad-upload", "plakaty", "banner", "canvas", "roll-up"]
      },
      {
        title: "Cięcie i folie",
        ids: ["wlepki-naklejki", "folia-szroniona", "wycinanie-folii"]
      },
      {
        title: "Wykończenie i inne",
        ids: ["laminowanie", "wydruki-specjalne", "artykuly-biurowe", "uslugi", "zamowienia-zewnetrzne"]
      }
    ];

    const fallbackMeta: Record<string, { id: string; name: string; icon: string; implemented: boolean }> = {
      uslugi: { id: "uslugi", name: "Usługi", icon: "https://cdn.jsdelivr.net/npm/lucide-static@latest/icons/handshake.svg", implemented: true },
      "zamowienia-zewnetrzne": {
        id: "zamowienia-zewnetrzne",
        name: "Zamówienia zewnętrzne",
        icon: "https://cdn.jsdelivr.net/npm/lucide-static@latest/icons/external-link.svg",
        implemented: true
      },
      "wydruki-specjalne": {
        id: "wydruki-specjalne",
        name: "Pojedyncze nakłady",
        icon: "https://cdn.jsdelivr.net/npm/lucide-static@latest/icons/file-text.svg",
        implemented: true
      }
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
          const iconMarkup = this.renderCategoryIcon(icon, name, id);
          const labelMarkup = this.renderHomeTileLabel(id, name);
          return `
            <a href="#/${id}" class="home-mini-tile" aria-label="Przejdź do ${name}">
              <span class="home-mini-icon">${iconMarkup}</span>
              <span class="home-mini-label">${labelMarkup}</span>
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
        <h2 class="home-categories-title">
          <span class="home-categories-title-main">Witaj w kalkulatorze</span>
          <span class="home-categories-title-sub">wybierz kategorię poniżej</span>
        </h2>
        <div class="home-mini-groups">
          ${groupHtml}
        </div>
      </div>
    `;
  }

  start() {
    this.handleRoute().catch((err) => {
      console.error("❌ Router initialization error:", err);
      this.renderHome();
    });
  }
}
