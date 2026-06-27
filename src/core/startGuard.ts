import { APP_ENV, GAS_URL, CLIENT_ID } from "./env";

export type GuardResult = { ok: true } | { ok: false; reason: string; fatal: boolean };

const VALID_ENVS = ["dev", "staging", "client"] as const;

function isValidGasUrl(url: string): boolean {
  return url.startsWith("https://script.google.com/") && url.endsWith("/exec");
}

export function checkStartupConfig(): GuardResult {
  if (!(VALID_ENVS as readonly string[]).includes(APP_ENV)) {
    return {
      ok: false,
      reason: `Nieznane środowisko: "${APP_ENV}". Oczekiwane: dev | staging | client.`,
      fatal: true,
    };
  }
  if (APP_ENV !== "dev" && !isValidGasUrl(GAS_URL)) {
    const clientHint = CLIENT_ID ? ` [${CLIENT_ID}]` : "";
    return {
      ok: false,
      reason: `Brak poprawnego GOOGLE_APPS_SCRIPT_URL dla środowiska "${APP_ENV}"${clientHint}. Skonfiguruj sekret i przebuduj aplikację.`,
      fatal: true,
    };
  }
  if (APP_ENV === "dev" && !isValidGasUrl(GAS_URL)) {
    console.warn(
      "[startGuard] Brak GOOGLE_APPS_SCRIPT_URL — eksport zamówień niedostępny w trybie dev."
    );
  }
  return { ok: true };
}
