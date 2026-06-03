import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Router } from "../src/ui/router";
import type { View } from "../src/ui/types";

beforeEach(() => {
  vi.stubGlobal("window", {
    addEventListener: vi.fn(),
    location: { hash: "#/" },
    history: { replaceState: vi.fn() },
    open: vi.fn(),
  });
  vi.stubGlobal("fetch", vi.fn(async () => ({ ok: false, text: async () => "" })));
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function makeRouter(): { router: Router; container: { innerHTML: string } } {
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

describe("Router.renderNotFound", () => {
  it("shows the unknown path name in output", () => {
    const { router, container } = makeRouter();
    router.renderNotFound("nieznana-kategoria");
    expect(container.innerHTML).toContain("nieznana-kategoria");
  });

  it("contains a link back to home (#/)", () => {
    const { router, container } = makeRouter();
    router.renderNotFound("test-path");
    expect(container.innerHTML).toContain('href="#/"');
  });

  it("escapes HTML in path to prevent XSS", () => {
    const { router, container } = makeRouter();
    router.renderNotFound("<script>alert(1)</script>");
    expect(container.innerHTML).not.toContain("<script>");
    expect(container.innerHTML).toContain("&lt;script&gt;");
  });

  it("escapes double quotes in path", () => {
    const { router, container } = makeRouter();
    router.renderNotFound('path"with"quotes');
    expect(container.innerHTML).not.toContain('"with"');
    expect(container.innerHTML).toContain("&quot;with&quot;");
  });
});

describe("Router path validation (whitelist)", () => {
  it("blocks path traversal ../config/prices without calling fetch", async () => {
    const { router, container } = makeRouter();
    (window as any).location.hash = "#/../config/prices";
    await router.handleRoute();
    expect(container.innerHTML).toContain("error-view");
    expect(fetch).not.toHaveBeenCalled();
  });

  it("blocks encoded traversal %2e%2e without calling fetch", async () => {
    const { router, container } = makeRouter();
    (window as any).location.hash = "#/%2e%2e/config";
    await router.handleRoute();
    expect(container.innerHTML).toContain("error-view");
    expect(fetch).not.toHaveBeenCalled();
  });

  it("blocks <script> injection in path without calling fetch", async () => {
    const { router, container } = makeRouter();
    (window as any).location.hash = "#/<script>alert(1)</script>";
    await router.handleRoute();
    expect(container.innerHTML).toContain("error-view");
    expect(fetch).not.toHaveBeenCalled();
  });

  it("allows valid path ulotki-cyfrowe to reach fetch", async () => {
    const { router } = makeRouter();
    (window as any).location.hash = "#/ulotki-cyfrowe";
    await router.handleRoute();
    expect(fetch).toHaveBeenCalledWith("categories/ulotki-cyfrowe.html");
  });

  it("allows valid path druk-a4-a3 to reach fetch", async () => {
    const { router } = makeRouter();
    (window as any).location.hash = "#/druk-a4-a3";
    await router.handleRoute();
    expect(fetch).toHaveBeenCalledWith("categories/druk-a4-a3.html");
  });
});

describe("Router error rendering (escapeHtml)", () => {
  it("escapes XSS payload thrown by a view mount", async () => {
    const { router, container } = makeRouter();
    const evilView: View = {
      id: "evil",
      name: "Evil",
      mount: async () => { throw new Error('<img src=x onerror=alert(1)>'); },
    };
    router.addRoute(evilView);
    (window as any).location.hash = "#/evil";
    await router.handleRoute();
    const html = (container as unknown as { innerHTML: string }).innerHTML;
    expect(html).not.toContain('<img src=x onerror=alert(1)>');
    expect(html).toContain("&lt;img");
  });
});
