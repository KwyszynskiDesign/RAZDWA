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
  interpolated: boolean;
}

function getBasePrice(
  format: string,
  qty: number,
  sides: number,
  isFolded: boolean,
  paperBase: "kreda" | "satyna"
): { price: number; interpolated: boolean } {
  const formats = pricingData.formats as Record<string, any>;
  const satynaFormats = pricingData.satynaFormats as Record<string, any> | undefined;
  const formatData = formats[format];
  if (!formatData) throw new Error(`Unknown format: ${format}`);

  const sidesKey = sides === 1 ? "single" : "double";
  const foldKey = isFolded ? "folded" : "normal";
  const foldStorageKey = isFolded ? "skladane" : "normal";
  const rawTiers = (paperBase === "satyna"
    ? (satynaFormats?.[format]?.[sidesKey]?.[foldKey] ?? satynaFormats?.[format]?.[sidesKey]?.["skladane"])
    : (formatData[sidesKey][foldKey] ?? formatData[sidesKey]["skladane"])) as Record<string, number>;

  if (!rawTiers) {
    throw new Error(`Missing price tiers for ${format}/${sidesKey}/${foldKey}/${paperBase}`);
  }

  const keyPrefix = paperBase === "satyna" ? "zaproszenia-satyna" : "zaproszenia";

  const resolvedTiers = Object.keys(rawTiers)
    .map(Number)
    .sort((a, b) => a - b)
    .map((tierQty) => ({
      qty: tierQty,
      price: resolveStoredPrice(
        `${keyPrefix}-${format.toLowerCase()}-${sidesKey}-${foldStorageKey}-${tierQty}`,
        rawTiers[String(tierQty)]
      ),
    }));

  if (qty <= resolvedTiers[0].qty) return { price: resolvedTiers[0].price, interpolated: false };
  if (qty >= resolvedTiers[resolvedTiers.length - 1].qty) return { price: resolvedTiers[resolvedTiers.length - 1].price, interpolated: false };

  const upperIdx = resolvedTiers.findIndex((t) => t.qty > qty);
  const lower = resolvedTiers[upperIdx - 1];
  const upper = resolvedTiers[upperIdx];

  if (lower.qty === qty) return { price: lower.price, interpolated: false };

  const ratio = (qty - lower.qty) / (upper.qty - lower.qty);
  const interpolated = parseFloat((lower.price + ratio * (upper.price - lower.price)).toFixed(2));
  return { price: interpolated, interpolated: true };
}

export function calculateZaproszeniaKreda(options: ZaproszeniaKredaOptions): ZaproszeniaKredaResult {
  const paperBase: "kreda" | "satyna" = options.isSatin || options.isModigliani ? "satyna" : "kreda";
  const { price: basePrice, interpolated } = getBasePrice(options.format, options.qty, options.sides, options.isFolded, paperBase);
  const modiglianiRate = resolveStoredPrice("modifier-modigliani", 0.20);
  const expressRate = resolveStoredPrice("modifier-express", pricingData.modifiers.express);

  let multiplier = 1;
  if (options.isModigliani) multiplier += modiglianiRate;
  if (options.express) multiplier += expressRate;

  const totalPrice = parseFloat((basePrice * multiplier).toFixed(2));
  return { basePrice, totalPrice, interpolated };
}
