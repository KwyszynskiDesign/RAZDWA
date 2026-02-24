import _config from "../../config/prices.json";

const pricingData: any = _config.zaproszeniaKreda;

export interface ZaproszeniaKredaOptions {
  format: string;
  qty: number;
  sides: number;
  isFolded: boolean;
  isSatin: boolean;
  express: boolean;
}

export interface ZaproszeniaKredaResult {
  basePrice: number;
  totalPrice: number;
}

function getBasePrice(format: string, qty: number, sides: number, isFolded: boolean): number {
  const formats = pricingData.formats as Record<string, any>;
  const formatData = formats[format];
  if (!formatData) throw new Error(`Unknown format: ${format}`);

  const sidesKey = sides === 1 ? "single" : "double";
  const foldKey = isFolded ? "folded" : "normal";
  const tiers = formatData[sidesKey][foldKey] as Record<string, number>;

  const sortedKeys = Object.keys(tiers)
    .map(Number)
    .sort((a, b) => a - b);

  let selectedPrice = tiers[String(sortedKeys[0])];
  for (const tier of sortedKeys) {
    if (qty >= tier) {
      selectedPrice = tiers[String(tier)];
    } else {
      break;
    }
  }

  return selectedPrice;
}

export function calculateZaproszeniaKreda(options: ZaproszeniaKredaOptions): ZaproszeniaKredaResult {
  const basePrice = getBasePrice(options.format, options.qty, options.sides, options.isFolded);

  let multiplier = 1;
  if (options.isSatin) multiplier += pricingData.modifiers.satin;
  if (options.express) multiplier += pricingData.modifiers.express;

  const totalPrice = parseFloat((basePrice * multiplier).toFixed(2));
  return { basePrice, totalPrice };
}
