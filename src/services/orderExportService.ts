import { CartItem, CustomerData } from "../core/types";

export const ORDER_EXPORT_CONFIG_KEY = "razdwa_order_export_config";

export interface OrderExportConfig {
  appsScriptUrl: string;
  timeoutMs: number;
  enabled: boolean;
}

export interface OrderExportPayload {
  source: "razdwa-web";
  createdAt: string;
  customer: CustomerData & { notes?: string };
  summary: {
    itemsCount: number;
    total: number;
    hasExpress: boolean;
  };
  items: Array<{
    category: string;
    name: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    totalPrice: number;
    isExpress: boolean;
    optionsHint: string;
    payload: unknown;
  }>;
}

export interface OrderExportResult {
  ok: boolean;
  status?: number;
  message?: string;
  data?: unknown;
}

const DEFAULT_CONFIG: OrderExportConfig = {
  appsScriptUrl: "https://script.google.com/macros/s/AKfycbwbZDEjSt4hGTfD7F1QaAzDm_Cb0Vf-Nk7dsJ_XNwaHVgMW7-bA-A8O8KlBYVDKjH53/exec",
  timeoutMs: 15000,
  enabled: true,
};

export function getOrderExportConfig(): OrderExportConfig {
  try {
    if (typeof localStorage === "undefined") return DEFAULT_CONFIG;
    const raw = localStorage.getItem(ORDER_EXPORT_CONFIG_KEY);
    if (!raw) return DEFAULT_CONFIG;
    const parsed = JSON.parse(raw) as Partial<OrderExportConfig>;

    return {
      appsScriptUrl: String(parsed.appsScriptUrl ?? DEFAULT_CONFIG.appsScriptUrl).trim() || DEFAULT_CONFIG.appsScriptUrl,
      timeoutMs: Number(parsed.timeoutMs) > 0 ? Number(parsed.timeoutMs) : DEFAULT_CONFIG.timeoutMs,
      enabled: typeof parsed.enabled === "boolean" ? parsed.enabled : DEFAULT_CONFIG.enabled,
    };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function setOrderExportConfig(config: Partial<OrderExportConfig>): OrderExportConfig {
  const merged: OrderExportConfig = {
    ...getOrderExportConfig(),
    ...config,
    appsScriptUrl: String(config.appsScriptUrl ?? getOrderExportConfig().appsScriptUrl ?? "").trim(),
  };

  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(ORDER_EXPORT_CONFIG_KEY, JSON.stringify(merged));
    }
  } catch {
    // ignore storage errors
  }

  return merged;
}

export function buildOrderExportPayload(
  cartItems: CartItem[],
  customer: CustomerData & { notes?: string }
): OrderExportPayload {
  const itemsCount = cartItems.length;
  const total = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const hasExpress = cartItems.some(i => !!i.isExpress);

  return {
    source: "razdwa-web",
    createdAt: new Date().toISOString(),
    customer,
    summary: {
      itemsCount,
      total,
      hasExpress,
    },
    items: cartItems.map(item => ({
      category: item.category,
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
      isExpress: !!item.isExpress,
      optionsHint: item.optionsHint,
      payload: item.payload,
    })),
  };
}

export async function sendOrderToAppsScript(
  payload: OrderExportPayload,
  config: OrderExportConfig = getOrderExportConfig()
): Promise<OrderExportResult> {
  if (!config.enabled) {
    return { ok: false, message: "Wysyłka do Apps Script jest wyłączona." };
  }

  if (!config.appsScriptUrl) {
    return { ok: false, message: "Brak URL Apps Script Web App." };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.timeoutMs);

  try {
    const response = await fetch(config.appsScriptUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const text = await response.text();
    let parsed: unknown = text;
    try {
      parsed = JSON.parse(text);
    } catch {
      // keep plain text response
    }

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        message: typeof parsed === "object" && parsed && "message" in (parsed as Record<string, unknown>)
          ? String((parsed as Record<string, unknown>).message)
          : `Błąd HTTP ${response.status}`,
        data: parsed,
      };
    }

    return {
      ok: true,
      status: response.status,
      message: typeof parsed === "object" && parsed && "message" in (parsed as Record<string, unknown>)
        ? String((parsed as Record<string, unknown>).message)
        : "Zamówienie wysłane do arkusza.",
      data: parsed,
    };
  } catch (err) {
    const msg = err instanceof Error && err.name === "AbortError"
      ? "Przekroczono limit czasu wysyłki do Apps Script."
      : `Nie udało się wysłać danych: ${(err as Error)?.message ?? "nieznany błąd"}`;

    return { ok: false, message: msg };
  } finally {
    clearTimeout(timeout);
  }
}
