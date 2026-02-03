/* Data and helpers from kalkulatorv2.html */

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
        { from: 500, to: 999, unit: 0.23 },
        { from: 1000, to: 4989, unit: 0.19 },
        { from: 1000, to: 9999, unit: 0.15 },
      ],
      A3: [
        { from: 1, to: 5, unit: 1.7 },
        { from: 6, to: 20, unit: 1.1 },
        { from: 21, to: 100, unit: 0.7 },
        { from: 101, to: 500, unit: 0.6 },
        { from: 500, to: 999, unit: 0.45 },
        { from: 1000, to: 4989, unit: 0.33 },
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
        { from: 1000, to: 4989, unit: 1.1 },
      ],
      A3: [
        { from: 1, to: 10, unit: 4.8 },
        { from: 11, to: 40, unit: 4.2 },
        { from: 41, to: 100, unit: 3.8 },
        { from: 101, to: 250, unit: 3.0 },
        { from: 251, to: 500, unit: 2.5 },
        { from: 501, to: 999, unit: 1.9 },
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
