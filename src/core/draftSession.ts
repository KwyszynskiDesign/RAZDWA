const TAB_ID_KEY = "razdwa_tab_id";
const CART_PREFIX = "razdwa-cart__";
const DRAFT_PREFIX = "razdwa_customer_draft__";
const ALIVE_PREFIX = "razdwa_draft_alive__";

function generateId(): string {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
  } catch {}
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function readSession(key: string): string | null {
  try { return sessionStorage.getItem(key); } catch { return null; }
}

function writeSession(key: string, value: string): void {
  try { sessionStorage.setItem(key, value); } catch {}
}

function readLocal(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}

function writeLocal(key: string, value: string): void {
  try { localStorage.setItem(key, value); } catch {}
}

function removeLocal(key: string): void {
  try { localStorage.removeItem(key); } catch {}
}

let tabId = readSession(TAB_ID_KEY);
if (!tabId) {
  tabId = generateId();
  writeSession(TAB_ID_KEY, tabId);
}

export function getTabId(): string {
  return tabId as string;
}

export function cartStorageKey(): string {
  return CART_PREFIX + getTabId();
}

export function customerDraftKey(): string {
  return DRAFT_PREFIX + getTabId();
}

export function touchDraftAlive(): void {
  writeLocal(ALIVE_PREFIX + getTabId(), String(Date.now()));
}

export function clearDraftSession(): void {
  const id = getTabId();
  removeLocal(CART_PREFIX + id);
  removeLocal(DRAFT_PREFIX + id);
  removeLocal(ALIVE_PREFIX + id);
}
