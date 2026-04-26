import { CartItem, CustomerData } from "../core/types";

export const ORDER_EXPORT_CONFIG_KEY = "razdwa_order_export_config";

export interface OrderExportConfig {
  appsScriptUrl: string;
  timeoutMs: number;
  enabled: boolean;
}

const LEGACY_APPS_SCRIPT_URLS = [
  "https://script.google.com/macros/s/AKfycbwxTnDfsnV6QFwnN1DOX61In3Py_S3kedDOQbZ7F1XYcIlTVdYCzZ71ay1TPjV6l4rW/exec",
  "https://script.google.com/macros/s/AKfycbwFSyBg_ZtPgJYQKymNRDWNdX0XQit3G3jvxrQ2VOX-pE-R4rZuPwf6QqnkSe-xrbNy/exec",
] as const;
const CURRENT_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwgooc22YOYJEDsRVAzMR3Q6dU10W90ZHgW7fptIB-ibtqvx7fzd7T9E_-uOnovehm7/exec";

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

interface AppsScriptCompactRowPayload {
  "Data": string;
  "Godzina": string;
  "Firma": string;
  "Imię": string;
  "Nazwisko": string;
  "NIP": string;
  "Telefon": string;
  "Email": string;
  "Materiał": string;
  "jedno/dwustronne": string;
  "Produkt": string;
  "Ilosc sztuk": number;
  "Cena za sztukę": number;
  "Uwagi": string;
  "Suma (PLN)": number;
  "Priorytet": string;
  "Ekspres": "TAK" | "NIE";
}

type AppsScriptResponseBody = {
  ok?: boolean;
  message?: string;
  [key: string]: unknown;
};

const DEFAULT_CONFIG: OrderExportConfig = {
  appsScriptUrl: CURRENT_APPS_SCRIPT_URL,
  timeoutMs: 15000,
  enabled: true,
};

function splitCustomerName(fullName: string): { firstName: string; lastName: string } {
  const normalized = String(fullName ?? "").trim().replace(/\s+/g, " ");
  if (!normalized) return { firstName: "", lastName: "" };

  const [firstName, ...rest] = normalized.split(" ");
  return {
    firstName: firstName ?? "",
    lastName: rest.join(" "),
  };
}

function stripQuantityPrefix(hint: string): string {
  // Usuwa np. "100 szt, " / "10.5 m2, " / "50 str., " z początku
  return hint
    .trim()
    .replace(/^\d[\d\s,.]*\s*(szt\.?|str\.?|m2?|mb)\s*[,;]?\s*/i, "")
    .trim();
}

function extractMaterialFromItem(item: OrderExportPayload["items"][number]): string {
  const hint = String(item.optionsHint ?? "").trim();
  return stripQuantityPrefix(hint) || String(item.name ?? "") || "-";
}

function extractFormatFromItem(item: OrderExportPayload["items"][number]): string {
  const payload = item.payload;
  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    const p = payload as Record<string, unknown>;
    const val = String(p.format ?? "").trim();
    if (val) return val.toUpperCase();
  }

  const hint = String(item.optionsHint ?? "");
  const match = hint.match(/\b(A0\+?|A1\+?|A2|A3|A4|A5|A6|DL)\b/i);
  return match ? match[1].toUpperCase() : "";
}

function extractSidesFromItem(item: OrderExportPayload["items"][number]): string {
  const payload = item.payload;
  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    const p = payload as Record<string, unknown>;
    const sidesRaw = String(p.sides ?? "").toLowerCase();
    if (sidesRaw.includes("dwu")) return "Dwustronne";
    if (sidesRaw.includes("jedno")) return "Jednostronne";
  }

  const hint = String(item.optionsHint ?? "").toLowerCase();
  if (hint.includes("dwustron")) return "Dwustronne";
  if (hint.includes("jednostron")) return "Jednostronne";
  return "";
}

function buildProductLabel(item: OrderExportPayload["items"][number]): string {
  const category = String(item.category ?? "").trim();
  const name = String(item.name ?? "").trim();
  const format = extractFormatFromItem(item);

  if (/ulotk/i.test(category) || /ulotk/i.test(name)) {
    const base = "Ulotka";
    return [base, format].filter(Boolean).join(" ").trim();
  }

  return name || category || "Produkt";
}

function buildAppsScriptCompactRow(payload: OrderExportPayload): AppsScriptCompactRowPayload {
  const createdAt = payload.createdAt ? new Date(payload.createdAt) : new Date();
  const safeDate = Number.isNaN(createdAt.getTime()) ? new Date() : createdAt;
  const { firstName, lastName } = splitCustomerName(payload.customer.name);

  const date = new Intl.DateTimeFormat("pl-PL", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(safeDate);

  const time = new Intl.DateTimeFormat("pl-PL", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(safeDate);

  type ExportLine = { product: string; material: string; sides: string; quantity: number; unitPrice: number };
  const grouped = new Map<string, ExportLine>();

  payload.items.forEach((item) => {
    const product = buildProductLabel(item);
    const material = extractMaterialFromItem(item);
    const sides = extractSidesFromItem(item);
    const quantity = Math.max(0, Number(item.quantity || 0));
    const unitPrice = Number(item.unitPrice || 0);

    const key = `${product}|${material}|${unitPrice.toFixed(2)}`;
    const existing = grouped.get(key);
    if (existing) {
      existing.quantity += quantity;
      return;
    }

    grouped.set(key, { product, material, sides, quantity, unitPrice });
  });

  const packedLines = Array.from(grouped.values());
  const totalSum = parseFloat(Number(payload.summary.total || 0).toFixed(2));

  const products = packedLines.map(line => line.product).join(" | ");
  const materials = packedLines.map(line => line.material).join(" | ");

  // jedno/dwustronne: unikalne, niepuste wartości
  const uniqueSides = [...new Set(packedLines.map(l => l.sides).filter(Boolean))];
  const sidesStr = uniqueSides.join(", ");

  // Ilosc sztuk: zawsze liczba (suma wszystkich pozycji)
  const totalQty = packedLines.reduce((s, l) => s + l.quantity, 0);

  // Cena za sztukę: dokładna dla jednej grupy, suma/ilość dla mieszanych
  const effectiveUnitPrice = packedLines.length === 1
    ? parseFloat(packedLines[0].unitPrice.toFixed(2))
    : (totalQty > 0 ? parseFloat((totalSum / totalQty).toFixed(2)) : 0);

  return {
    "Data": date,
    "Godzina": time,
    "Firma": String(payload.customer.company ?? ""),
    "Imię": firstName,
    "Nazwisko": lastName,
    "NIP": String(payload.customer.nip ?? ""),
    "Telefon": String(payload.customer.phone ?? ""),
    "Email": String(payload.customer.email ?? ""),
    "Materiał": materials,
    "jedno/dwustronne": sidesStr,
    "Produkt": products,
    "Ilosc sztuk": totalQty,
    "Cena za sztukę": effectiveUnitPrice,
    "Uwagi": String(payload.customer.notes ?? ""),
    "Suma (PLN)": totalSum,
    "Priorytet": String(payload.customer.priority ?? ""),
    "Ekspres": payload.summary.hasExpress ? "TAK" : "NIE",
  };
}

export function getOrderExportConfig(): OrderExportConfig {
  try {
    if (typeof localStorage === "undefined") return DEFAULT_CONFIG;
    const raw = localStorage.getItem(ORDER_EXPORT_CONFIG_KEY);
    if (!raw) return DEFAULT_CONFIG;
    const parsed = JSON.parse(raw) as Partial<OrderExportConfig>;
    const parsedUrl = String(parsed.appsScriptUrl ?? "").trim();
    const migratedUrl = !parsedUrl || LEGACY_APPS_SCRIPT_URLS.includes(parsedUrl as (typeof LEGACY_APPS_SCRIPT_URLS)[number])
      ? CURRENT_APPS_SCRIPT_URL
      : parsedUrl;

    return {
      appsScriptUrl: migratedUrl,
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
  const compactPayload = buildAppsScriptCompactRow(payload);

  try {
    const response = await fetch(config.appsScriptUrl, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "text/plain",
      },
      body: JSON.stringify(compactPayload),
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
          body: JSON.stringify(compactPayload),
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
