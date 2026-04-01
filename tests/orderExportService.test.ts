import { describe, it, expect, beforeEach, vi } from "vitest";
import { buildOrderExportPayload, getOrderExportConfig, ORDER_EXPORT_CONFIG_KEY, sendOrderToAppsScript, setOrderExportConfig } from "../src/services/orderExportService";
import { CartItem, CustomerData } from "../src/core/types";

const sampleItems: CartItem[] = [
  {
    id: "1",
    category: "Wizytówki",
    name: "Wizytówki Standard",
    quantity: 100,
    unit: "szt",
    unitPrice: 75,
    isExpress: false,
    totalPrice: 75,
    optionsHint: "100 szt",
    payload: { paper: "kreda_350" },
  },
  {
    id: "2",
    category: "Ulotki",
    name: "Ulotki A5",
    quantity: 200,
    unit: "szt",
    unitPrice: 0.19,
    isExpress: true,
    totalPrice: 38,
    optionsHint: "200 szt, express",
    payload: { format: "A5" },
  },
];

const sampleCustomer: CustomerData = {
  name: "Jan Kowalski",
  phone: "+48 500 000 000",
  email: "jan@test.pl",
  priority: "Express",
  notes: "Do odbioru jutro",
};

describe("orderExportService", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    delete (globalThis as any).fetch;
    delete (globalThis as any).localStorage;
  });

  it("buildOrderExportPayload creates summary and items", () => {
    const payload = buildOrderExportPayload(sampleItems, sampleCustomer);

    expect(payload.source).toBe("razdwa-web");
    expect(payload.items).toHaveLength(2);
    expect(payload.summary.itemsCount).toBe(2);
    expect(payload.summary.total).toBe(113);
    expect(payload.summary.hasExpress).toBe(true);
    expect(payload.customer.name).toBe("Jan Kowalski");
  });

  it("set/get config persists to localStorage", () => {
    const stored: Record<string, string> = {};
    (globalThis as any).localStorage = {
      getItem: (k: string) => stored[k] ?? null,
      setItem: (k: string, v: string) => { stored[k] = v; },
      removeItem: (k: string) => { delete stored[k]; },
    };

    setOrderExportConfig({ appsScriptUrl: "https://script.google.com/macros/s/test/exec", enabled: true, timeoutMs: 9000 });
    const cfg = getOrderExportConfig();

    expect(cfg.enabled).toBe(true);
    expect(cfg.appsScriptUrl).toContain("script.google.com");
    expect(cfg.timeoutMs).toBe(9000);
    expect(stored[ORDER_EXPORT_CONFIG_KEY]).toBeTruthy();
  });

  it("sendOrderToAppsScript returns success for HTTP 200", async () => {
    (globalThis as any).fetch = vi.fn(async () => ({
      ok: false,
      status: 0,
      type: "opaque",
    }));

    const payload = buildOrderExportPayload(sampleItems, sampleCustomer);
    const result = await sendOrderToAppsScript(payload, {
      enabled: true,
      appsScriptUrl: "https://script.google.com/macros/s/test/exec",
      timeoutMs: 5000,
    });

    expect(result.ok).toBe(true);
    expect(result.status).toBe(0);
    expect(result.message).toMatch(/wysłane/i);
  });

  it("sendOrderToAppsScript returns failure when disabled", async () => {
    const payload = buildOrderExportPayload(sampleItems, sampleCustomer);
    const result = await sendOrderToAppsScript(payload, {
      enabled: false,
      appsScriptUrl: "https://script.google.com/macros/s/test/exec",
      timeoutMs: 5000,
    });

    expect(result.ok).toBe(false);
    expect(result.message).toMatch(/wyłączona/i);
  });
});
