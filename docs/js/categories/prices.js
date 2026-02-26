import { drukCad as base } from '../prices.js';

export const drukCad = {
  ...base,
  prices: {
    'A4': { color: 1.5, bw: 0.5 },
    'A3': { color: 3.0, bw: 1.0 },
    'Custom': { color: 2.5, bw: 0.8 }
  }
};