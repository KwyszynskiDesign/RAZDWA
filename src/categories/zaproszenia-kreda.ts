import { getPrice } from "../services/priceService";
import { resolveStoredPrice } from "../core/compat";

const pricingData: any = getPrice("zaproszeniaKreda");

export interface ZaproszeniaKredaOptions {
  format: string;
  qty: number;
  sides: number;
  isFolded: boolean;
  isSatin: boolean;
  isModigliani: boolean;
  express: boolean;
}

export interface ZaproszeniaKredaResult {
  basePrice: number;
  totalPrice: number;
}

function getBasePrice(format: string, qty: number, sides: number, isFolded: boolean, paperBase: "kreda" | "satyna"): number {
  const formats = pricingData.formats as Record<string, any>;
  const satynaFormats = pricingData.satynaFormats as Record<string, any> | undefined;
  const formatData = formats[format];
  if (!formatData) throw new Error(`Unknown format: ${format}`);

  const sidesKey = sides === 1 ? "single" : "double";
  const foldKey = isFolded ? "folded" : "normal";
  const tiers = (paperBase === "satyna"
    ? satynaFormats?.[format]?.[sidesKey]?.[foldKey]
    : formatData[sidesKey][foldKey]) as Record<string, number>;

  if (!tiers) {
    throw new Error(`Missing price tiers for ${format}/${sidesKey}/${foldKey}/${paperBase}`);
  }

  const sortedKeys = Object.keys(tiers)
    .map(Number)
    .sort((a, b) => a - b);

  let selectedTierQty = sortedKeys[0];
  let selectedPrice = tiers[String(selectedTierQty)];
  for (const tier of sortedKeys) {
    if (qty >= tier) {
      selectedTierQty = tier;
      selectedPrice = tiers[String(tier)];
    } else {
      break;
    }
  }

  const keyPrefix = paperBase === "satyna" ? "zaproszenia-satyna" : "zaproszenia";
  return resolveStoredPrice(`${keyPrefix}-${format.toLowerCase()}-${sidesKey}-${foldKey}-${selectedTierQty}`, selectedPrice);
}

export function calculateZaproszeniaKreda(options: ZaproszeniaKredaOptions): ZaproszeniaKredaResult {
  const paperBase: "kreda" | "satyna" = options.isSatin || options.isModigliani ? "satyna" : "kreda";
  const basePrice = getBasePrice(options.format, options.qty, options.sides, options.isFolded, paperBase);
  const modiglianiRate = resolveStoredPrice("modifier-modigliani", 0.20);
  const expressRate = resolveStoredPrice("modifier-express", pricingData.modifiers.express);

  let multiplier = 1;
  if (options.isModigliani) {
    multiplier += modiglianiRate;
  }
  if (options.express) multiplier += expressRate;

  const totalPrice = parseFloat((basePrice * multiplier).toFixed(2));
  return { basePrice, totalPrice };
}
