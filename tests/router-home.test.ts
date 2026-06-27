import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Router } from "../src/ui/router";

beforeEach(() => {
  vi.stubGlobal("window", {
    addEventListener: vi.fn(),
    location: { hash: "" },
    history: { replaceState: vi.fn() },
    open: vi.fn(),
  });
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({ ok: false, text: async () => "" }))
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function makeRouter() {
  const container = { innerHTML: "" } as unknown as HTMLElement;
  const ctx = () => ({
    cart: { addItem: vi.fn() },
    addToBasket: vi.fn(),
    expressMode: false,
    updateLastCalculated: vi.fn(),
  });
  const router = new Router(container, ctx);
  return { router, container: container as unknown as { innerHTML: string } };
}

describe("Router home screen – ekran startowy", () => {
  it("renderuje pełny ekran startowy (home-categories-shell) gdy hash jest pusty", async () => {
    const { router, container } = makeRouter();
    (window as any).location.hash = "";
    await router.handleRoute();
    expect(container.innerHTML).toContain("home-categories-shell");
  });

  it("renderuje pełny ekran startowy gdy hash to #/", async () => {
    const { router, container } = makeRouter();
    (window as any).location.hash = "#/";
    await router.handleRoute();
    expect(container.innerHTML).toContain("home-categories-shell");
  });

  it("po start() z pustym hashem widać home-categories-shell, nie emptyState", async () => {
    const { router, container } = makeRouter();
    (window as any).location.hash = "";
    router.start();
    await new Promise((r) => setTimeout(r, 0));
    expect(container.innerHTML).toContain("home-categories-shell");
    expect(container.innerHTML).not.toContain("emptyState");
  });

  it("renderuje grupy kafelków (home-mini-group)", async () => {
    const { router, container } = makeRouter();
    (window as any).location.hash = "#/";
    await router.handleRoute();
    expect(container.innerHTML).toContain("home-mini-group");
  });

  it("renderuje tytuł strony głównej", async () => {
    const { router, container } = makeRouter();
    (window as any).location.hash = "#/";
    await router.handleRoute();
    expect(container.innerHTML).toContain("Witaj w kalkulatorze");
  });

  it("nie renderuje widoku kategorii (error-view) dla pustego hasha", async () => {
    const { router, container } = makeRouter();
    (window as any).location.hash = "";
    await router.handleRoute();
    expect(container.innerHTML).not.toContain("error-view");
  });

  it("start() z hashem #/ nie wywołuje fetch", async () => {
    const { router } = makeRouter();
    (window as any).location.hash = "#/";
    router.start();
    await new Promise((r) => setTimeout(r, 0));
    expect(fetch).not.toHaveBeenCalled();
  });
});
