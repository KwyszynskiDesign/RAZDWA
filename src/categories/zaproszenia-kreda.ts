// src/categories/zaproszenia-kreda.ts
export interface ZaproszeniaKredaOptions   {
  format: string; // "A6", "A5", "DL"
  qty: number;
  sides: number; // 1 or 2
  isFolded: boolean;
  isSatin: boolean;
  express: boolean;
}

export const KRED_PRICES = {
  'A4': {
    min: 0,
    max: null,
    price: 15.99 // New price for A4 kreda cards
  },
  // Other formats and their corresponding prices go here...
};
