/**
 * Single source of truth for admin session state.
 *
 * Storage policy (C3):
 *   sessionStorage — auth only, cleared on logout via clearAdminSession():
 *     • razdwa_pin_auth   (PIN_AUTH_KEY)
 *     • adminSessionToken (ADMIN_TOKEN_KEY)
 *   localStorage — operational data only, never holds auth, never cleared on logout:
 *     prices, variants, sync status, order config, order history,
 *     migration state, draft/cart, UX state.
 *
 * clearAdminSession() is the single logout entrypoint for auth state.
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
