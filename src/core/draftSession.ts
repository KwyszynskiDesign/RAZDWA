const TAB_ID_KEY = "razdwa_tab_id";
const CART_PREFIX = "razdwa-cart__";
const DRAFT_PREFIX = "razdwa_customer_draft__";
const ALIVE_PREFIX = "razdwa_draft_alive__";
const LEGACY_CART_KEY = "razdwa-cart-v1";
const LEGACY_DRAFT_KEY = "razdwa_customer_draft";
const ORPHAN_THRESHOLD_MS = 30_000;

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

function parseSavedAt(raw: string | null): number {
  if (!raw) return 0;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      const savedAt = (parsed as { savedAt?: unknown }).savedAt;
      return typeof savedAt === "number" ? savedAt : 0;
    }
  } catch {}
  return 0;
}

interface OrphanCandidate {
  cartRaw: string | null;
  draftRaw: string | null;
  savedAt: number;
  keysToDelete: string[];
}

function collectKeys(): string[] {
  const keys: string[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k) keys.push(k);
    }
  } catch {}
  return keys;
}

function isAliveRecent(suffix: string, now: number): boolean {
  const raw = readLocal(ALIVE_PREFIX + suffix);
  if (!raw) return false;
  const ts = Number(raw);
  if (!Number.isFinite(ts)) return false;
  return now - ts < ORPHAN_THRESHOLD_MS;
}

function buildCandidates(now: number): OrphanCandidate[] {
  const keys = collectKeys();
  const suffixes = new Set<string>();
  for (const k of keys) {
    if (k.startsWith(CART_PREFIX)) suffixes.add(k.slice(CART_PREFIX.length));
    else if (k.startsWith(DRAFT_PREFIX)) suffixes.add(k.slice(DRAFT_PREFIX.length));
  }

  const candidates: OrphanCandidate[] = [];

  for (const suffix of suffixes) {
    if (isAliveRecent(suffix, now)) continue;
    const cartKey = CART_PREFIX + suffix;
    const draftKey = DRAFT_PREFIX + suffix;
    const aliveKey = ALIVE_PREFIX + suffix;
    const cartRaw = readLocal(cartKey);
    const draftRaw = readLocal(draftKey);
    if (!cartRaw && !draftRaw) continue;
    candidates.push({
      cartRaw,
      draftRaw,
      savedAt: Math.max(parseSavedAt(cartRaw), parseSavedAt(draftRaw)),
      keysToDelete: [cartKey, draftKey, aliveKey],
    });
  }

  const legacyCart = readLocal(LEGACY_CART_KEY);
  const legacyDraft = readSession(LEGACY_DRAFT_KEY);
  if (legacyCart || legacyDraft) {
    candidates.push({
      cartRaw: legacyCart,
      draftRaw: legacyDraft,
      savedAt: parseSavedAt(legacyCart),
      keysToDelete: [],
    });
  }

  return candidates;
}

function recover(tabId: string): void {
  const now = Date.now();
  const candidates = buildCandidates(now);
  if (candidates.length === 0) return;

  candidates.sort((a, b) => b.savedAt - a.savedAt);
  const winner = candidates[0];

  if (winner.cartRaw) writeLocal(CART_PREFIX + tabId, winner.cartRaw);
  if (winner.draftRaw) writeLocal(DRAFT_PREFIX + tabId, winner.draftRaw);

  for (const c of candidates) {
    for (const k of c.keysToDelete) removeLocal(k);
  }
  removeLocal(LEGACY_CART_KEY);
  try { sessionStorage.removeItem(LEGACY_DRAFT_KEY); } catch {}
}

let tabId = readSession(TAB_ID_KEY);
if (!tabId) {
  tabId = generateId();
  writeSession(TAB_ID_KEY, tabId);
  recover(tabId);
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
