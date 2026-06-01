import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Router } from "../src/ui/router";

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
