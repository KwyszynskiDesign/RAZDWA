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
  verified?: boolean;
}

type AppsScriptResponseBody = {
  ok?: boolean;
  message?: string;
  [key: string]: unknown;
};

const DEFAULT_CONFIG: OrderExportConfig = {
  appsScriptUrl: "https://script.google.com/macros/s/AKfycbwxTnDfsnV6QFwnN1DOX61In3Py_S3kedDOQbZ7F1XYcIlTVdYCzZ71ay1TPjV6l4rW/exec",
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
      mode: "cors",
      headers: {
        "Content-Type": "text/plain",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    let responseBody: AppsScriptResponseBody | string | null = null;
    const contentType = response.headers?.get?.("content-type")?.toLowerCase() ?? "";

    if (contentType.includes("application/json")) {
      try {
        responseBody = await response.json();
      } catch {
        responseBody = null;
      }
    } else {
      try {
        const text = await response.text();
        if (text) {
          try {
            responseBody = JSON.parse(text) as AppsScriptResponseBody;
          } catch {
            responseBody = text;
          }
        }
      } catch {
        responseBody = null;
      }
    }

    const bodyMessage =
      responseBody && typeof responseBody === "object" && "message" in responseBody
        ? String((responseBody as AppsScriptResponseBody).message ?? "")
        : "";

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        message: bodyMessage || `Błąd HTTP ${response.status} podczas wysyłki do Apps Script.`,
        data: responseBody,
      };
    }

    if (
      responseBody &&
      typeof responseBody === "object" &&
      "ok" in responseBody &&
      (responseBody as AppsScriptResponseBody).ok === false
    ) {
      return {
        ok: false,
        status: response.status,
        message: bodyMessage || "Apps Script zwrócił błąd zapisu.",
        data: responseBody,
      };
    }

    return {
      ok: true,
      status: response.status,
      message: bodyMessage || "Zamówienie zapisane w arkuszu.",
      data: responseBody,
    };
  } catch (err) {
    const errorName = err instanceof Error ? err.name : "";
    const errorMessage = err instanceof Error ? err.message : "";
    const normalizedError = `${errorName} ${errorMessage}`.toLowerCase();
    const isCorsOrNetworkFailure =
      errorName !== "AbortError" &&
      (normalizedError.includes("failed to fetch") ||
        normalizedError.includes("networkerror") ||
        normalizedError.includes("load failed"));

    if (isCorsOrNetworkFailure) {
      try {
        await fetch(config.appsScriptUrl, {
          method: "POST",
          mode: "no-cors",
          headers: {
            "Content-Type": "text/plain",
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        return {
          ok: true,
          status: 0,
          verified: false,
          message: "Wysłano bez potwierdzenia odpowiedzi (ograniczenia CORS). Sprawdź czy rekord pojawił się w arkuszu.",
        };
      } catch {
        // continue to final error below
      }
    }

    const msg = err instanceof Error && err.name === "AbortError"
      ? "Przekroczono limit czasu wysyłki do Apps Script."
      : `Nie udało się wysłać danych: ${(err as Error)?.message ?? "nieznany błąd"}. Sprawdź URL Web App i uprawnienia wdrożenia.`;

    return { ok: false, message: msg, verified: false };
  } finally {
    clearTimeout(timeout);
  }
}
