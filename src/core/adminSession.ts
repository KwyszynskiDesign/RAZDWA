/**
 * Single source of truth for admin session keys and checks.
 * No DOM side effects beyond sessionStorage access.
 */

export const PIN_AUTH_KEY = "razdwa_pin_auth";
export const ADMIN_TOKEN_KEY = "adminSessionToken";

function readSession(key: string): string | null {
  try {
    if (typeof sessionStorage === "undefined") return null;
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

export function getAdminToken(): string | null {
  const token = readSession(ADMIN_TOKEN_KEY);
  return token && token.trim() ? token : null;
}

export function isAdminSession(): boolean {
  return readSession(PIN_AUTH_KEY) === "1" && getAdminToken() !== null;
}

export function setAdminSession(token?: string): void {
  try {
    if (typeof sessionStorage === "undefined") return;
    sessionStorage.setItem(PIN_AUTH_KEY, "1");
    if (token && token.trim()) sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
  } catch {}
}

export function clearAdminSession(): void {
  try {
    if (typeof sessionStorage === "undefined") return;
    sessionStorage.removeItem(PIN_AUTH_KEY);
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
  } catch {}
}
