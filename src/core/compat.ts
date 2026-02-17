import { priceStore } from "./price-store";

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

// Helper to register and return tiers
const getPrintTiers = (id: string, cat: string, defaults: any[]) => {
  return priceStore.registerTiers(id, cat, defaults);
};

export const PRICE: any = {
  get print() {
    return {
      bw: {
        A4: getPrintTiers('print-bw-a4', 'Druk A4/A3', [
          { from: 1, to: 5, unit: 0.9 },
          { from: 6, to: 20, unit: 0.6 },
          { from: 21, to: 100, unit: 0.35 },
          { from: 101, to: 500, unit: 0.3 },
          { from: 501, to: 999, unit: 0.23 },
          { from: 1000, to: 4999, unit: 0.19 },
          { from: 5000, to: 99999, unit: 0.15 },
        ]),
        A3: getPrintTiers('print-bw-a3', 'Druk A4/A3', [
          { from: 1, to: 5, unit: 1.7 },
          { from: 6, to: 20, unit: 1.1 },
          { from: 21, to: 100, unit: 0.7 },
          { from: 101, to: 500, unit: 0.6 },
          { from: 501, to: 999, unit: 0.45 },
          { from: 1000, to: 99999, unit: 0.33 },
        ]),
      },
      color: {
        A4: getPrintTiers('print-color-a4', 'Druk A4/A3', [
          { from: 1, to: 10, unit: 2.4 },
          { from: 11, to: 40, unit: 2.2 },
          { from: 41, to: 100, unit: 2.0 },
          { from: 101, to: 250, unit: 1.8 },
          { from: 251, to: 500, unit: 1.6 },
          { from: 501, to: 999, unit: 1.4 },
          { from: 1000, to: 99999, unit: 1.1 },
        ]),
        A3: getPrintTiers('print-color-a3', 'Druk A4/A3', [
          { from: 1, to: 10, unit: 4.8 },
          { from: 11, to: 40, unit: 4.2 },
          { from: 41, to: 100, unit: 3.8 },
          { from: 101, to: 250, unit: 3.0 },
          { from: 251, to: 500, unit: 2.5 },
          { from: 501, to: 999, unit: 1.9 },
          { from: 1000, to: 99999, unit: 1.6 },
        ]),
      },
    };
  },
  get scan() {
    return {
      auto: getPrintTiers('scan-auto', 'Skany', [
        { from: 1, to: 9, unit: 1.0 },
        { from: 10, to: 49, unit: 0.5 },
        { from: 50, to: 99, unit: 0.4 },
        { from: 100, to: 999999999, unit: 0.25 },
      ]),
      manual: getPrintTiers('scan-manual', 'Skany', [
        { from: 1, to: 4, unit: 2.0 },
        { from: 5, to: 999999999, unit: 1.0 },
      ]),
    };
  },
  get email_price() {
    return priceStore.get('email-price', 1.0);
  }
};

export const CAD_PRICE: any = {
  get color() {
    return {
      formatowe: {
        A0p: priceStore.get('cad-color-f-a0p', 26.0),
        A0: priceStore.get('cad-color-f-a0', 24.0),
        A1: priceStore.get('cad-color-f-a1', 12.0),
        A2: priceStore.get('cad-color-f-a2', 8.5),
        A3: priceStore.get('cad-color-f-a3', 5.3)
      },
      mb: {
        A0p: priceStore.get('cad-color-m-a0p', 21.0),
        A0: priceStore.get('cad-color-m-a0', 20.0),
        A1: priceStore.get('cad-color-m-a1', 14.5),
        A2: priceStore.get('cad-color-m-a2', 13.9),
        A3: priceStore.get('cad-color-m-a3', 12.0),
        R1067: priceStore.get('cad-color-m-r1067', 30.0)
      },
    };
  },
  get bw() {
    return {
      formatowe: {
        A0p: priceStore.get('cad-bw-f-a0p', 12.5),
        A0: priceStore.get('cad-bw-f-a0', 11.0),
        A1: priceStore.get('cad-bw-f-a1', 6.0),
        A2: priceStore.get('cad-bw-f-a2', 4.0),
        A3: priceStore.get('cad-bw-f-a3', 2.5)
      },
      mb: {
        A0p: priceStore.get('cad-bw-m-a0p', 10.0),
        A0: priceStore.get('cad-bw-m-a0', 9.0),
        A1: priceStore.get('cad-bw-m-a1', 5.0),
        A2: priceStore.get('cad-bw-m-a2', 4.5),
        A3: priceStore.get('cad-bw-m-a3', 3.5),
        R1067: priceStore.get('cad-bw-m-r1067', 12.5)
      },
    };
  }
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
  get A0p() { return priceStore.get('fold-a0p', 4.0); },
  get A0() { return priceStore.get('fold-a0', 3.0); },
  get A1() { return priceStore.get('fold-a1', 2.0); },
  get A2() { return priceStore.get('fold-a2', 1.5); },
  get A3() { return priceStore.get('fold-a3', 1.0); },
  get A3L() { return priceStore.get('fold-a3l', 0.7); },
};

export const WF_SCAN_PRICE_CM = {
  get value() { return priceStore.get('wf-scan-cm', 0.08); }
};

const bizHelper = (group: string, format: string, type: string, prices: Record<number, number>) => {
  const result: any = {};
  for (const [qty, price] of Object.entries(prices)) {
    const id = `biz-${group}-${format}-${type}-${qty}`;
    const name = `Wizytówki ${format} ${type} ${qty} szt`;
    result[qty] = priceStore.register(id, 'Wizytówki', name, price as number);
  }
  return result;
};

export const BIZ: any = {
  get cyfrowe() {
    return {
      standardPrices: {
        "85x55": {
          noLam: bizHelper('std', '85x55', 'bez lami', { 50: 65, 100: 75, 150: 85, 200: 96, 250: 110, 300: 126, 400: 146, 500: 170, 1000: 290 }),
          lam: bizHelper('std', '85x55', 'lami', { 50: 160, 100: 170, 150: 180, 200: 190, 250: 200, 300: 220, 400: 240, 500: 250, 1000: 335 }),
        },
        "90x50": {
          noLam: bizHelper('std', '90x50', 'bez lami', { 50: 70, 100: 79, 150: 89, 200: 99, 250: 120, 300: 129, 400: 149, 500: 175, 1000: 300 }),
          lam: bizHelper('std', '90x50', 'lami', { 50: 170, 100: 180, 150: 190, 200: 200, 250: 210, 300: 230, 400: 250, 500: 260, 1000: 345 }),
        },
      },
      softtouchPrices: {
        "85x55": {
          noLam: bizHelper('st', '85x55', 'bez lami', { 50: 65, 100: 75, 150: 85, 200: 96, 250: 110, 300: 126, 400: 145, 500: 170, 1000: 290 }),
          lam: bizHelper('st', '85x55', 'lami', { 50: 170, 100: 190, 150: 210, 200: 220, 250: 230, 300: 240, 400: 260, 500: 270, 1000: 380 }),
        },
        "90x50": {
          noLam: bizHelper('st', '90x50', 'bez lami', { 50: 70, 100: 79, 150: 89, 200: 99, 250: 120, 300: 129, 400: 149, 500: 175, 1000: 300 }),
          lam: bizHelper('st', '90x50', 'lami', { 50: 170, 100: 190, 150: 210, 200: 220, 250: 230, 300: 240, 400: 260, 500: 270, 1000: 390 }),
        },
      },
      deluxe: {
        leadTime: "4–5 dni roboczych",
        options: {
          uv3d_softtouch: {
            label: "Maker UV 3D + folia SOFTTOUCH",
            prices: bizHelper('deluxe', 'UV 3D', 'Softtouch', { 50: 280, 100: 320, 200: 395, 250: 479, 400: 655, 500: 778 }),
          },
          uv3d_gold_softtouch: {
            label: "Maker UV 3D + złocenie + folia SOFTTOUCH",
            prices: bizHelper('deluxe', 'UV 3D Gold', 'Softtouch', { 50: 450, 100: 550, 200: 650, 250: 720, 400: 850, 500: 905 }),
          },
        },
      },
    };
  }
};

// Initial registration call to ensure all IDs exist in registry
const initRegistry = () => {
  // Call getters once to trigger registration
  const p = PRICE.print;
  const s = PRICE.scan;
  const e = PRICE.email_price;
  const c = CAD_PRICE.color;
  const b = CAD_PRICE.bw;
  const f = FOLD_PRICE.A0;
  const w = WF_SCAN_PRICE_CM.value;
  const biz = BIZ.cyfrowe;
};

initRegistry();

export function money(n: any) {
  return (Math.round((Number(n) || 0) * 100) / 100).toFixed(2);
}
