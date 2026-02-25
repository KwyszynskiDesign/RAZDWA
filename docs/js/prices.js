// prices.js – centralny cennik dla wszystkich 17 kategorii RAZDWA
// Źródło prawdy: /data/menu-razdwa-Arkusz1-1.csv

// ─── DRUK A4 / A3 ──────────────────────────────────────────────────────────
export const drukA4A3 = {
  bw: {
    A4: [[5, 0.90], [20, 0.60], [100, 0.35], [500, 0.30], [999, 0.23], [4999, 0.19], [Infinity, 0.15]],
    A3: [[5, 1.70], [20, 1.10], [100, 0.70], [500, 0.60], [999, 0.45], [4999, 0.33], [Infinity, 0.30]],
  },
  color: {
    A4: [[10, 2.40], [40, 2.20], [100, 2.00], [250, 1.80], [500, 1.60], [999, 1.40], [Infinity, 1.10]],
    A3: [[10, 4.80], [40, 4.20], [100, 3.80], [250, 3.00], [500, 2.50], [999, 1.90], [Infinity, 1.60]],
  },
  /** Skanowanie automatyczne: cena za stronę */
  skanAuto: [[9, 1.00], [49, 0.50], [99, 0.40], [Infinity, 0.25]],
  /** Skanowanie ręczne z szyby: cena za stronę */
  skanReczne: [[4, 2.00], [Infinity, 1.00]],
  email: 1.00,
  zadruk25percent: 0.50,
};

// ─── DRUK CAD ───────────────────────────────────────────────────────────────
export const drukCad = {
  /** Ceny formatowe (jeden arkusz) */
  formatowe: {
    bw:    { A3: 2.50, A2: 4.00, A1: 6.00, A0: 11.00, 'A0+': 12.50 },
    color: { A3: 5.30, A2: 8.50, A1: 12.00, A0: 24.00, 'A0+': 26.00 },
  },
  /** Ceny nieformatowe (za metr bieżący rolki) */
  metrBiezacy: {
    bw:    { 297: 3.50, 420: 4.50, 594: 5.00, 841: 9.00, 914: 10.00, 1067: 12.50 },
    color: { 297: 12.00, 420: 13.90, 594: 14.50, 841: 20.00, 914: 21.00, 1067: 30.00 },
  },
  /** Bazowe długości formatów (mm) */
  baseLengthMm: { A3: 420, A2: 594, A1: 841, A0: 1189, 'A0+': 1292 },
  /** Szerokości rolek (mm) */
  widths: { A3: 297, A2: 420, A1: 594, A0: 841, 'A0+': 914, 'MB1067': 1067 },
  skladanie: { A3: 1.00, 'A3-poprzeczne': 0.70, A2: 1.50, A1: 2.00, A0: 3.00, 'A0+': 4.00 },
  skanowanie: 0.08, // zł/mm
};

// ─── DYPLOMY ────────────────────────────────────────────────────────────────
/** Ceny netto dla danego progu ilościowego (interpolacja schodkowa) */
export const dyplomy = [
  { qty:   1, price: 20 },
  { qty:   2, price: 30 },
  { qty:   3, price: 32 },
  { qty:   4, price: 34 },
  { qty:   5, price: 35 },
  { qty:   6, price: 35 },
  { qty:   7, price: 36 },
  { qty:   8, price: 37 },
  { qty:   9, price: 39 },
  { qty:  10, price: 40 },
  { qty:  15, price: 45 },
  { qty:  20, price: 49 },
  { qty:  30, price: 58 },
  { qty:  40, price: 65 },
  { qty:  50, price: 75 },
  { qty: 100, price: 120 },
];

// ─── PLAKATY ────────────────────────────────────────────────────────────────
export const plakatyMaterialySolwent = {
  '200g-polysk': {
    name: '200g Połysk (solwent)',
    tiers: [
      { min: 1,  max: 3,    price: 70 },
      { min: 4,  max: 9,    price: 65 },
      { min: 10, max: 20,   price: 59 },
      { min: 21, max: 40,   price: 53 },
      { min: 41, max: null, price: 45 },
    ],
  },
  'blockout200g': {
    name: 'Blockout 200g Satyna (solwent)',
    tiers: [
      { min: 1,  max: 3,    price: 80 },
      { min: 4,  max: 9,    price: 75 },
      { min: 10, max: 20,   price: 70 },
      { min: 21, max: 40,   price: 65 },
      { min: 41, max: null, price: 60 },
    ],
  },
  '150g-polmat': {
    name: '150g Półmat (solwent)',
    tiers: [
      { min: 1,  max: 3,    price: 65 },
      { min: 4,  max: 9,    price: 60 },
      { min: 10, max: 20,   price: 55 },
      { min: 21, max: 40,   price: 50 },
      { min: 41, max: null, price: 42 },
    ],
  },
  '115g-mat': {
    name: '115g Matowy (solwent)',
    tiers: [
      { min: 1,  max: 3,    price: 45 },
      { min: 4,  max: 19,   price: 40 },
      { min: 20, max: null, price: 35 },
    ],
  },
};

export const plakatyMaterialyFormat = {
  '120g-formatowe': {
    name: '120g Formatowe',
    discountGroup: '120g',
    prices: { '297x420': 9, '420x594': 12, '594x841': 18, '841x1189': 28, '914x1189': 34, '914x1292': 50, 'rolka1067': 68 },
  },
  '120g-nieformatowe': {
    name: '120g Nieformatowe',
    discountGroup: '120g',
    prices: { '297x420': 28, '420x594': 30, '594x841': 33, '841x1189': 35, '914x1292': 50, 'rolka1067': 63 },
  },
  '260g-satyna-formatowe': {
    name: '260g Satyna Formatowe (fotoplakaty)',
    discountGroup: '260g',
    prices: { '297x420': 23, '420x594': 39, '594x841': 50, '841x1189': 80, '914x1292': 88 },
  },
  '260g-satyna-nieformatowe': {
    name: '260g Satyna Nieformatowe (fotoplakaty)',
    discountGroup: '260g',
    prices: { '297x420': 27, '420x594': 36, '594x841': 39.50, '841x1189': 66.70, '914x1292': 75.30 },
  },
  '180g-pp-formatowe': {
    name: '180g PP Formatowe',
    discountGroup: '120g',
    prices: { '297x420': 18, '420x594': 37, '610x841': 45, '841x1189': 70, '914x1292': 74 },
  },
  '180g-pp-nieformatowe': {
    name: '180g PP Nieformatowe',
    discountGroup: '120g',
    prices: { '297x420': 23, '420x594': 31, '610x841': 34, '841x1189': 62, '914x1292': 70.50 },
  },
};

export const plakatyRabaty = {
  '120g': [
    { min: 2,  max: 5,    factor: 0.95 },
    { min: 6,  max: 20,   factor: 0.92 },
    { min: 21, max: 30,   factor: 0.87 },
  ],
  '260g': [
    { min: 9,  max: 20,   factor: 0.93 },
    { min: 21, max: 30,   factor: 0.88 },
  ],
};

// ─── SOLWENT PLAKATY ────────────────────────────────────────────────────────
export const solwent = {
  '200g': [
    { min: 1,  max: 3,    price: 70 },
    { min: 4,  max: 9,    price: 65 },
    { min: 10, max: 20,   price: 59 },
    { min: 21, max: 40,   price: 53 },
    { min: 41, max: null, price: 45 },
  ],
  '200g-blockout': [
    { min: 1,  max: 3,    price: 80 },
    { min: 4,  max: 9,    price: 75 },
    { min: 10, max: 20,   price: 70 },
    { min: 21, max: 40,   price: 65 },
    { min: 41, max: null, price: 60 },
  ],
  '150g': [
    { min: 1,  max: 3,    price: 65 },
    { min: 4,  max: 9,    price: 60 },
    { min: 10, max: 20,   price: 55 },
    { min: 21, max: 40,   price: 50 },
    { min: 41, max: null, price: 42 },
  ],
};

// ─── BANNER ─────────────────────────────────────────────────────────────────
export const banner = {
  powlekany: [
    { min: 1,  max: 25, price: 53 },
    { min: 26, max: 50, price: 49 },
    { min: 51, max: null, price: 45 },
  ],
  blockout: [
    { min: 1,  max: 25, price: 64 },
    { min: 26, max: 50, price: 59 },
    { min: 51, max: null, price: 55 },
  ],
  oczkowanie: 2.50, // zł/m²
};

// ─── LAMINOWANIE ────────────────────────────────────────────────────────────
export const laminowanie = {
  A3: [[50, 7.00], [100, 6.00], [200, 5.00]],
  A4: [[50, 5.00], [100, 4.50], [200, 4.00]],
  A5: [[50, 4.00], [100, 3.50], [200, 3.00]],
  A6: [[50, 3.00], [100, 2.50], [200, 2.00]],
};

// ─── ROLL-UP ─────────────────────────────────────────────────────────────────
export const rollUp = {
  full: {
    '85x200':  [[5, 290], [10, 275], [Infinity, 260]],
    '100x200': [[5, 305], [10, 285], [Infinity, 270]],
    '120x200': [[5, 330], [10, 310], [Infinity, 295]],
    '150x200': [[5, 440], [10, 425], [Infinity, 410]],
  },
  replacement: {
    labor: 50,   // zł
    m2:    80,   // zł/m²
  },
};

// ─── FOLIA SZRONIONA ────────────────────────────────────────────────────────
export const foliaS = {
  wydruk: [
    { min: 1,  max: 5,    price: 65 },
    { min: 6,  max: 25,   price: 60 },
    { min: 26, max: 50,   price: 56 },
    { min: 51, max: null, price: 51 },
  ],
  oklejanie: [
    { min: 1,  max: 5,    price: 140 },
    { min: 6,  max: 10,   price: 130 },
    { min: 11, max: null, price: 120 },
  ],
};

// ─── WLEPKI / NAKLEJKI ──────────────────────────────────────────────────────
export const wlepki = {
  wlepki_obrys_folia: [
    { min: 1,  max: 5,    price: 67 },
    { min: 6,  max: 25,   price: 60 },
    { min: 26, max: 50,   price: 52 },
    { min: 51, max: null, price: 48 },
  ],
  wlepki_polipropylen: [
    { min: 1,  max: 10,   price: 50 },
    { min: 11, max: null, price: 42 },
  ],
  wlepki_standard_folia: [
    { min: 1,  max: 5,    price: 54 },
    { min: 6,  max: 25,   price: 50 },
    { min: 26, max: 50,   price: 46 },
    { min: 51, max: null, price: 42 },
  ],
  modifiers: {
    arkusze:     2.00,   // zł/m²
    pojedyncze: 10.00,   // zł/m²
    mocnyKlej:   0.12,   // % ceny bazowej
  },
};

// ─── WIZYTÓWKI ───────────────────────────────────────────────────────────────
// Wszystkie ceny BRUTTO (z VAT)
export const wizytowki = {
  '85x55': {
    none: {
      50:   65, 100:  75, 150:  85, 200:  96,
      250: 110, 300: 126, 400: 146, 500: 170, 1000: 290,
    },
    matt_gloss: {
      50:  160, 100: 170, 150: 180, 200: 190,
      250: 200, 300: 220, 400: 240, 500: 250, 1000: 335,
    },
  },
  '90x50': {
    none: {
      50:   70, 100:  79, 150:  89, 200:  99,
      250: 120, 300: 129, 400: 149, 500: 175, 1000: 300,
    },
    matt_gloss: {
      50:  170, 100: 180, 150: 190, 200: 200,
      250: 210, 300: 230, 400: 250, 500: 260, 1000: 345,
    },
  },
  softtouch: {
    '85x55': {
      50: 170, 100: 190, 150: 210, 200: 220,
      250: 230, 300: 240, 400: 260, 500: 270, 1000: 380,
    },
    '90x50': {
      50: 170, 100: 190, 150: 210, 200: 220,
      250: 230, 300: 240, 400: 260, 500: 270, 1000: 390,
    },
  },
  deluxe: {
    uv3d_softtouch:      { 50: 280, 100: 320, 200: 395, 250: 479, 400: 655, 500: 778 },
    uv3d_gold_softtouch: { 50: 450, 100: 550, 200: 650, 250: 720, 400: 850, 500: 905 },
  },
};

// ─── VOUCHERY A4 ─────────────────────────────────────────────────────────────
/** Tabela zawiera ceny netto dla wydruków jednostronnych i dwustronnych */
export const vouchery = [
  { qty:  1, single: 20, double: 25 },
  { qty:  2, single: 29, double: 32 },
  { qty:  3, single: 30, double: 37 },
  { qty:  4, single: 32, double: 39 },
  { qty:  5, single: 35, double: 43 },
  { qty:  6, single: 39, double: 45 },
  { qty:  7, single: 41, double: 48 },
  { qty:  8, single: 45, double: 50 },
  { qty:  9, single: 48, double: 52 },
  { qty: 10, single: 52, double: 58 },
  { qty: 15, single: 60, double: 70 },
  { qty: 20, single: 67, double: 82 },
  { qty: 25, single: 74, double: 100 },
  { qty: 30, single: 84, double: 120 },
];

// ─── ULOTKI CYFROWE ──────────────────────────────────────────────────────────
export const ulotki = {
  jednostronne: [
    { qty:  100, price: 22.00 },
    { qty:  200, price: 28.00 },
    { qty:  500, price: 38.00 },
    { qty: 1000, price: 60.00 },
    { qty: 2000, price: 89.00 },
    { qty: 5000, price: 175.00 },
  ],
  dwustronne: [
    { qty:  100, price: 25.00 },
    { qty:  200, price: 32.00 },
    { qty:  500, price: 49.00 },
    { qty: 1000, price: 75.00 },
    { qty: 2000, price: 110.00 },
    { qty: 5000, price: 215.00 },
  ],
};

// ─── ZAPROSZENIA KREDA ───────────────────────────────────────────────────────
export const zaproszeniaKreda = {
  A6: {
    jedno:  [[10, 30], [24, 40], [50, 50], [100, 68], [150, 79]],
    dwu:    [[10, 36], [24, 48], [50, 60], [100, 82], [150, 95]],
  },
  A5: {
    jedno:  [[10, 40], [24, 55], [50, 70], [100, 95], [150, 115]],
    dwu:    [[10, 48], [24, 66], [50, 84], [100, 114], [150, 138]],
  },
  DL: {
    jedno:  [[10, 35], [24, 45], [50, 55], [100, 75], [150, 90]],
    dwu:    [[10, 42], [24, 54], [50, 66], [100, 90], [150, 108]],
  },
};

// ─── MODYFIKATORY GLOBALNE ───────────────────────────────────────────────────
export const modifiers = {
  satyna:  0.12,  // +12% za papier satynowy
  express: 0.20,  // +20% tryb express (domyślny)
  expressVouchery: 0.30,
  voucherDwustronne: 0.80,
  voucher300g: 0.25,
  vat: 0.23,
};
