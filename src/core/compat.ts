/* Data and helpers from kalkulatorv2.html - cleaned up and synced with categories.json */

export function money(n: any) {
  return (Math.round((Number(n) || 0) * 100) / 100).toFixed(2);
}

export function pickTier(tiers: any[], qty: number) {
  return tiers.find((t) => qty >= t.from && qty <= t.to) || null;
}

export function pickNearestCeilKey(table: any, qty: number) {
  const keys = Object.keys(table || {})
    .map(Number)
    .filter(Number.isFinite)
    .sort((a, b) => a - b);
  if (!keys.length) return null;
  const k = keys.find((x) => qty <= x);
  return k == null ? null : k;
}

export const PRICE = {
  print: {
    bw: {
      A4: [
        { from: 1, to: 5, unit: 0.9 },
        { from: 6, to: 20, unit: 0.6 },
        { from: 21, to: 100, unit: 0.35 },
        { from: 101, to: 500, unit: 0.3 },
        { from: 501, to: 999, unit: 0.23 },
        { from: 1000, to: 4999, unit: 0.19 },
        { from: 5000, to: 99999, unit: 0.15 },
      ],
      A3: [
        { from: 1, to: 5, unit: 1.7 },
        { from: 6, to: 20, unit: 1.1 },
        { from: 21, to: 100, unit: 0.7 },
        { from: 101, to: 500, unit: 0.6 },
        { from: 501, to: 999, unit: 0.45 },
        { from: 1000, to: 99999, unit: 0.33 },
      ],
    },
    color: {
      A4: [
        { from: 1, to: 10, unit: 2.4 },
        { from: 11, to: 40, unit: 2.2 },
        { from: 41, to: 100, unit: 2.0 },
        { from: 101, to: 250, unit: 1.8 },
        { from: 251, to: 500, unit: 1.6 },
        { from: 501, to: 999, unit: 1.4 },
        { from: 1000, to: 99999, unit: 1.1 },
      ],
      A3: [
        { from: 1, to: 10, unit: 4.8 },
        { from: 11, to: 40, unit: 4.2 },
        { from: 41, to: 100, unit: 3.8 },
        { from: 101, to: 250, unit: 3.0 },
        { from: 251, to: 500, unit: 2.5 },
        { from: 501, to: 999, unit: 1.9 },
        { from: 1000, to: 99999, unit: 1.6 },
      ],
    },
  },
  scan: {
    auto: [
      { from: 1, to: 9, unit: 1.0 },
      { from: 10, to: 49, unit: 0.5 },
      { from: 50, to: 99, unit: 0.4 },
      { from: 100, to: 999999999, unit: 0.25 },
    ],
    manual: [
      { from: 1, to: 4, unit: 2.0 },
      { from: 5, to: 999999999, unit: 1.0 },
    ],
  },
  email_price: 1.0,
};

export const CAD_PRICE: any = {
  color: {
    formatowe: { A0p: 26.0, A0: 24.0, A1: 12.0, A2: 8.5, A3: 5.3 },
    mb: { A0p: 21.0, A0: 20.0, A1: 14.5, A2: 13.9, A3: 12.0, R1067: 30.0 },
  },
  bw: {
    formatowe: { A0p: 12.5, A0: 11.0, A1: 6.0, A2: 4.0, A3: 2.5 },
    mb: { A0p: 10.0, A0: 9.0, A1: 5.0, A2: 4.5, A3: 3.5, R1067: 12.5 },
  },
};

export const CAD_BASE: any = {
  A0p: { w: 914, l: 1292, label: "A0+" },
  A0: { w: 841, l: 1189, label: "A0" },
  A1: { w: 594, l: 841, label: "A1" },
  A2: { w: 420, l: 594, label: "A2" },
  A3: { w: 297, l: 420, label: "A3" },
  R1067: { w: 1067, l: 0, label: "Roll 1067" },
};

export const FORMAT_TOLERANCE_MM = 0.5;

export const FOLD_PRICE: any = {
  A0p: 4.0,
  A0: 3.0,
  A1: 2.0,
  A2: 1.5,
  A3: 1.0,
  A3L: 0.7,
};

export const WF_SCAN_PRICE_PER_CM = 0.08;

const _PRICES_KEY = "razdwa_prices";

/** Read user-overridden prices from localStorage. Returns empty object on error or if not set. */
export function readStoredPrices(): Record<string, number> {
  try {
    if (typeof localStorage === "undefined") return {};
    const raw = localStorage.getItem(_PRICES_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, number>;
    }
  } catch { /* ignore */ }
  return {};
}

/**
 * Resolve a single price from localStorage, falling back to defaultValue.
 * Use this for individual prices, modifiers and fixed fees.
 */
export function resolveStoredPrice(key: string, defaultValue: number): number {
  const stored = readStoredPrices();
  return typeof stored[key] === "number" ? stored[key] : defaultValue;
}

/**
 * Override tier prices from localStorage using the naming convention
 *   `{prefix}-{min}-{max}` or `{prefix}-{min}+` for open-ended tiers.
 * Returns a new array with overridden prices; original is not mutated.
 */
export function overrideTiersWithStoredPrices(
  prefix: string,
  tiers: Array<{ min: number; max: number | null; price: number }>
): Array<{ min: number; max: number | null; price: number }> {
  const stored = readStoredPrices();
  return tiers.map(tier => {
    const suffix = tier.max === null || tier.max > 50000
      ? `${tier.min}+`
      : `${tier.min}-${tier.max}`;
    const key = `${prefix}-${suffix}`;
    return typeof stored[key] === "number" ? { ...tier, price: stored[key] } : tier;
  });
}

// ---------------------------------------------------------------------------
// DEFAULT_PRICES – single source of truth for all price defaults.
// Used by the admin panel (ustawienia.ts) as the initial/reset values.
// ---------------------------------------------------------------------------
export const DEFAULT_PRICES: Record<string, number> = {
  // === DRUK CZARNO-BIAŁY A4 ===
  "druk-bw-a4-1-5": 0.90,
  "druk-bw-a4-6-20": 0.60,
  "druk-bw-a4-21-100": 0.35,
  "druk-bw-a4-101-500": 0.30,
  "druk-bw-a4-501-999": 0.23,
  "druk-bw-a4-1000-4999": 0.19,
  "druk-bw-a4-5000+": 0.15,
  // === DRUK CZARNO-BIAŁY A3 ===
  "druk-bw-a3-1-5": 1.70,
  "druk-bw-a3-6-20": 1.10,
  "druk-bw-a3-21-100": 0.70,
  "druk-bw-a3-101-500": 0.60,
  "druk-bw-a3-501-999": 0.45,
  "druk-bw-a3-1000-4999": 0.33,
  "druk-bw-a3-5000+": 0.30,
  // === DRUK KOLOROWY A4 ===
  "druk-kolor-a4-1-10": 2.40,
  "druk-kolor-a4-11-40": 2.20,
  "druk-kolor-a4-41-100": 2.00,
  "druk-kolor-a4-101-250": 1.80,
  "druk-kolor-a4-251-500": 1.60,
  "druk-kolor-a4-501-999": 1.40,
  "druk-kolor-a4-1000+": 1.10,
  // === DRUK KOLOROWY A3 ===
  "druk-kolor-a3-1-10": 4.80,
  "druk-kolor-a3-11-40": 4.20,
  "druk-kolor-a3-41-100": 3.80,
  "druk-kolor-a3-101-250": 3.00,
  "druk-kolor-a3-251-500": 2.50,
  "druk-kolor-a3-501-999": 1.90,
  "druk-kolor-a3-1000+": 1.60,
  // === SKANOWANIE AUTOMATYCZNE ===
  "skan-auto-1-9": 1.00,
  "skan-auto-10-49": 0.50,
  "skan-auto-50-99": 0.40,
  "skan-auto-100+": 0.25,
  // === SKANOWANIE RĘCZNE Z SZYBY ===
  "skan-reczne-1-4": 2.00,
  "skan-reczne-5+": 1.00,
  // === DOPŁATY DRUK ===
  "druk-email": 1.00,
  "modifier-druk-zadruk25": 0.50,
  // === DRUK CAD – KOLOROWY (formatowy) ===
  "druk-cad-kolor-fmt-a3": 5.30,
  "druk-cad-kolor-fmt-a2": 8.50,
  "druk-cad-kolor-fmt-a1": 12.00,
  "druk-cad-kolor-fmt-a0": 24.00,
  "druk-cad-kolor-fmt-a0plus": 26.00,
  // === DRUK CAD – KOLOROWY (metr bieżący) ===
  "druk-cad-kolor-mb-a3": 12.00,
  "druk-cad-kolor-mb-a2": 13.90,
  "druk-cad-kolor-mb-a1": 14.50,
  "druk-cad-kolor-mb-a0": 20.00,
  "druk-cad-kolor-mb-a0plus": 21.00,
  "druk-cad-kolor-mb-mb1067": 30.00,
  // === DRUK CAD – CZARNO-BIAŁY (formatowy) ===
  "druk-cad-bw-fmt-a3": 2.50,
  "druk-cad-bw-fmt-a2": 4.00,
  "druk-cad-bw-fmt-a1": 6.00,
  "druk-cad-bw-fmt-a0": 11.00,
  "druk-cad-bw-fmt-a0plus": 12.50,
  // === DRUK CAD – CZARNO-BIAŁY (metr bieżący) ===
  "druk-cad-bw-mb-a3": 3.50,
  "druk-cad-bw-mb-a2": 4.50,
  "druk-cad-bw-mb-a1": 5.00,
  "druk-cad-bw-mb-a0": 9.00,
  "druk-cad-bw-mb-a0plus": 10.00,
  "druk-cad-bw-mb-mb1067": 12.50,
  // === LAMINOWANIE A3 ===
  "laminowanie-a3-1-50": 7.00,
  "laminowanie-a3-51-100": 6.00,
  "laminowanie-a3-101-200": 5.00,
  // === LAMINOWANIE A4 ===
  "laminowanie-a4-1-50": 5.00,
  "laminowanie-a4-51-100": 4.50,
  "laminowanie-a4-101-200": 4.00,
  // === LAMINOWANIE A5 ===
  "laminowanie-a5-1-50": 4.00,
  "laminowanie-a5-51-100": 3.50,
  "laminowanie-a5-101-200": 3.00,
  // === LAMINOWANIE A6 ===
  "laminowanie-a6-1-50": 3.00,
  "laminowanie-a6-51-100": 2.50,
  "laminowanie-a6-101-200": 2.00,
  // === SOLWENT – PAPIER 150G PÓŁMAT ===
  "solwent-150g-1-3": 65.00,
  "solwent-150g-4-9": 60.00,
  "solwent-150g-10-20": 55.00,
  "solwent-150g-21-40": 50.00,
  "solwent-150g-41+": 42.00,
  // === SOLWENT – PAPIER 200G POŁYSK ===
  "solwent-200g-1-3": 70.00,
  "solwent-200g-4-9": 65.00,
  "solwent-200g-10-20": 59.00,
  "solwent-200g-21-40": 53.00,
  "solwent-200g-41+": 45.00,
  // === SOLWENT – PAPIER 115G MATOWY ===
  "solwent-115g-1-3": 45.00,
  "solwent-115g-4-19": 40.00,
  "solwent-115g-20+": 35.00,
  // === VOUCHERY ===
  "vouchery-1-jed": 20.00,
  "vouchery-2-jed": 29.00,
  "vouchery-3-jed": 30.00,
  "vouchery-4-jed": 32.00,
  "vouchery-5-jed": 35.00,
  "vouchery-6-jed": 39.00,
  "vouchery-7-jed": 41.00,
  "vouchery-8-jed": 45.00,
  "vouchery-9-jed": 48.00,
  "vouchery-10-jed": 52.00,
  "vouchery-15-jed": 60.00,
  "vouchery-20-jed": 67.00,
  "vouchery-25-jed": 74.00,
  "vouchery-30-jed": 84.00,
  "vouchery-1-dwu": 25.00,
  "vouchery-2-dwu": 32.00,
  "vouchery-3-dwu": 37.00,
  "vouchery-4-dwu": 39.00,
  "vouchery-5-dwu": 43.00,
  "vouchery-6-dwu": 45.00,
  "vouchery-7-dwu": 48.00,
  "vouchery-8-dwu": 50.00,
  "vouchery-9-dwu": 52.00,
  "vouchery-10-dwu": 58.00,
  "vouchery-15-dwu": 70.00,
  "vouchery-20-dwu": 82.00,
  "vouchery-25-dwu": 100.00,
  "vouchery-30-dwu": 120.00,
  // === BANNER – POWLEKANY ===
  "banner-powlekany-1-25": 53.00,
  "banner-powlekany-26-50": 49.00,
  "banner-powlekany-51+": 45.00,
  // === BANNER – BLOCKOUT ===
  "banner-blockout-1-25": 64.00,
  "banner-blockout-26-50": 59.00,
  "banner-blockout-51+": 55.00,
  "banner-oczkowanie": 2.50,
  // === ROLL-UP ===
  "rollup-85x200-1-5": 290.00,
  "rollup-85x200-6-10": 275.00,
  "rollup-100x200-1-5": 305.00,
  "rollup-100x200-6-10": 285.00,
  "rollup-120x200-1-5": 330.00,
  "rollup-120x200-6-10": 310.00,
  "rollup-150x200-1-5": 440.00,
  "rollup-150x200-6-10": 425.00,
  "rollup-wymiana-labor": 50.00,
  "rollup-wymiana-m2": 80.00,
  // === FOLIA SZRONIONA ===
  "folia-szroniona-wydruk-1-5": 65.00,
  "folia-szroniona-wydruk-6-25": 60.00,
  "folia-szroniona-wydruk-26-50": 56.00,
  "folia-szroniona-wydruk-51+": 51.00,
  "folia-szroniona-oklejanie-1-5": 140.00,
  "folia-szroniona-oklejanie-6-10": 130.00,
  "folia-szroniona-oklejanie-11-20": 120.00,
  // === WLEPKI – PO OBRYSIE (FOLIA) ===
  "wlepki-obrys-folia-1-5": 67.00,
  "wlepki-obrys-folia-6-25": 60.00,
  "wlepki-obrys-folia-26-50": 52.00,
  "wlepki-obrys-folia-51+": 48.00,
  // === WLEPKI – POLIPROPYLEN ===
  "wlepki-polipropylen-1-10": 50.00,
  "wlepki-polipropylen-11+": 42.00,
  // === WLEPKI – STANDARD FOLIA ===
  "wlepki-standard-folia-1-5": 54.00,
  "wlepki-standard-folia-6-25": 50.00,
  "wlepki-standard-folia-26-50": 46.00,
  "wlepki-standard-folia-51+": 42.00,
  "wlepki-modifier-arkusze": 2.00,
  "wlepki-modifier-pojedyncze": 10.00,
  "wlepki-modifier-mocny-klej": 0.12,
  // === WIZYTÓWKI 85×55 (CENA ZA NAKŁAD) ===
  "wizytowki-85x55-none-50szt": 65.00,
  "wizytowki-85x55-none-100szt": 75.00,
  "wizytowki-85x55-none-250szt": 110.00,
  "wizytowki-85x55-none-500szt": 170.00,
  "wizytowki-85x55-none-1000szt": 290.00,
  "wizytowki-85x55-matt_gloss-50szt": 160.00,
  "wizytowki-85x55-matt_gloss-100szt": 170.00,
  "wizytowki-85x55-matt_gloss-250szt": 200.00,
  "wizytowki-85x55-matt_gloss-500szt": 250.00,
  "wizytowki-85x55-matt_gloss-1000szt": 335.00,
  // === WIZYTÓWKI 90×50 (CENA ZA NAKŁAD) ===
  "wizytowki-90x50-none-50szt": 70.00,
  "wizytowki-90x50-none-100szt": 79.00,
  "wizytowki-90x50-none-250szt": 120.00,
  "wizytowki-90x50-none-500szt": 175.00,
  "wizytowki-90x50-none-1000szt": 300.00,
  "wizytowki-90x50-matt_gloss-50szt": 170.00,
  "wizytowki-90x50-matt_gloss-100szt": 180.00,
  "wizytowki-90x50-matt_gloss-250szt": 210.00,
  "wizytowki-90x50-matt_gloss-500szt": 260.00,
  "wizytowki-90x50-matt_gloss-1000szt": 345.00,
  // === MODYFIKATORY (procent jako ułamek dziesiętny) ===
  "modifier-satyna": 0.12,
  "modifier-express": 0.20,
};

export const BIZ: any = {
  cyfrowe: {
    standardPrices: {
      "85x55": {
        noLam: {
          50: 65,
          100: 75,
          150: 85,
          200: 96,
          250: 110,
          300: 126,
          400: 146,
          500: 170,
          1000: 290,
        },
        lam: {
          50: 160,
          100: 170,
          150: 180,
          200: 190,
          250: 200,
          300: 220,
          400: 240,
          500: 250,
          1000: 335,
        },
      },
      "90x50": {
        noLam: {
          50: 70,
          100: 79,
          150: 89,
          200: 99,
          250: 120,
          300: 129,
          400: 149,
          500: 175,
          1000: 300,
        },
        lam: {
          50: 170,
          100: 180,
          150: 190,
          200: 200,
          250: 210,
          300: 230,
          400: 250,
          500: 260,
          1000: 345,
        },
      },
    },
    softtouchPrices: {
      "85x55": {
        noLam: {
          50: 65,
          100: 75,
          150: 85,
          200: 96,
          250: 110,
          300: 126,
          400: 145,
          500: 170,
          1000: 290,
        },
        lam: {
          50: 170,
          100: 190,
          150: 210,
          200: 220,
          250: 230,
          300: 240,
          400: 260,
          500: 270,
          1000: 380,
        },
      },
      "90x50": {
        noLam: {
          50: 70,
          100: 79,
          150: 89,
          200: 99,
          250: 120,
          300: 129,
          400: 149,
          500: 175,
          1000: 300,
        },
        lam: {
          50: 170,
          100: 190,
          150: 210,
          200: 220,
          250: 230,
          300: 240,
          400: 260,
          500: 270,
          1000: 390,
        },
      },
    },
    deluxe: {
      leadTime: "4–5 dni roboczych",
      options: {
        uv3d_softtouch: {
          label: "Maker UV 3D + folia SOFTTOUCH",
          prices: { 50: 280, 100: 320, 200: 395, 250: 479, 400: 655, 500: 778 },
        },
        uv3d_gold_softtouch: {
          label: "Maker UV 3D + złocenie + folia SOFTTOUCH",
          prices: { 50: 450, 100: 550, 200: 650, 250: 720, 400: 850, 500: 905 },
        },
      },
    },
  },
};
