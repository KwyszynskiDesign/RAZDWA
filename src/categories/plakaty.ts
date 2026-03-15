import { CategoryModule, CategoryContext } from "../ui/router";
import { calculatePrice } from "../core/pricing";
import { formatPLN } from "../core/money";
import { getPrice } from "../services/priceService";
import { PriceTable } from "../core/types";
import { resolveStoredPrice } from "../core/compat";

const plakatyData: any = (getPrice("plakaty") as any).legacy200g;
const fullData: any = getPrice("plakaty") as any;

// ---------------------------------------------------------------------------
// Legacy CategoryModule export kept for backward compatibility
// ---------------------------------------------------------------------------
export const plakatyCategory: CategoryModule = {
  id: "solwent-plakaty",
  name: "Solwent - Plakaty",
  mount: (container: HTMLElement, ctx: CategoryContext) => {
    const table = getPrice('solwent-plakaty-200g') as PriceTable;

    container.innerHTML = `
      <div class="category-view">
        <h2>${table.title}</h2>
        <div class="form" style="display: grid; gap: 15px;">
          <div class="row" style="display: flex; justify-content: space-between; align-items: center;">
            <label>Powierzchnia (m2)</label>
            <input type="number" id="plakatyQty" value="1" min="0.1" step="0.1" style="width: 100px;">
          </div>
          <div class="row" style="display: flex; align-items: center; gap: 10px;">
            <input type="checkbox" id="plakatyExpress" style="width: auto;">
            <label for="plakatyExpress">Tryb EXPRESS (+20%)</label>
          </div>

          <div class="divider"></div>

          <div class="summary-box" style="background: rgba(0,0,0,0.2); padding: 15px; border-radius: 10px;">
            <div style="display: flex; justify-content: space-between;">
              <span>Cena:</span>
              <strong id="plakatyResult">0,00 zł</strong>
            </div>
          </div>

          <div class="actions">
            <button id="addPlakatyBtn" class="primary" style="width: 100%;">Dodaj do zamówienia</button>
          </div>
        </div>
      </div>
    `;

    const qtyInput = container.querySelector("#plakatyQty") as HTMLInputElement;
    const expressCheck = container.querySelector("#plakatyExpress") as HTMLInputElement;
    const resultEl = container.querySelector("#plakatyResult") as HTMLElement;
    const addBtn = container.querySelector("#addPlakatyBtn") as HTMLButtonElement;

    function update() {
      const qty = parseFloat(qtyInput.value) || 0;
      const mods = expressCheck.checked ? ["EXPRESS"] : [];
      try {
        const res = calculatePrice(qty, table, mods);
        resultEl.textContent = formatPLN(res.totalPrice);
      } catch (e) {
        resultEl.textContent = "Błąd";
      }
    }

    qtyInput.addEventListener("input", update);
    expressCheck.addEventListener("change", update);

    addBtn.addEventListener("click", () => {
      const qty = parseFloat(qtyInput.value) || 0;
      const mods = expressCheck.checked ? ["EXPRESS"] : [];
      const res = calculatePrice(qty, table, mods);

      ctx.cart.addItem({
        categoryId: table.id,
        categoryName: table.title,
        details: { qty: `${qty} m2`, express: expressCheck.checked },
        price: res.totalPrice
      });
    });

    update();
  }
};

// ---------------------------------------------------------------------------
// Full Plakaty calculator – m² solwent materials
// ---------------------------------------------------------------------------

export interface PlakatyM2Input {
  materialId: string;
  areaM2: number;
  qty?: number;
  express?: boolean;
}

export interface PlakatyM2Result {
  materialName: string;
  qty: number;
  areaPerPieceM2: number;
  totalAreaM2: number;
  effectiveM2: number;
  tierPrice: number;
  basePrice: number;
  modifiersTotal: number;
  totalPrice: number;
  appliedModifiers: string[];
}

function resolveSolwentTierPrice(materialId: string, tier: { min: number; max: number | null; price: number }): number {
  const suffix = tier.max === null ? `${tier.min}+` : `${tier.min}-${tier.max}`;
  const knownPrefix: Record<string, string> = {
    "200g-polysk": "solwent-200g",
    "150g-polmat": "solwent-150g",
    "115g-mat": "solwent-115g",
    "blockout200g": "plakaty-blockout200g",
  };
  const key = `${knownPrefix[materialId] ?? `plakaty-${materialId}`}-${suffix}`;
  return resolveStoredPrice(key, tier.price);
}

export function calculatePlakatyM2(input: PlakatyM2Input): PlakatyM2Result {
  const data = fullData as any;
  const mat = data.solwent.materials.find((m: any) => m.id === input.materialId);
  if (!mat) throw new Error(`Unknown solwent material: ${input.materialId}`);

  const minM2: number = data.solwent.minimumM2 ?? 1;
  const qty = Math.max(1, Math.floor(input.qty ?? 1));
  const areaPerPieceM2 = Math.max(0, input.areaM2);
  const totalAreaM2 = parseFloat((areaPerPieceM2 * qty).toFixed(4));
  const effectiveM2 = Math.max(totalAreaM2, minM2);

  // Find tier
  const tier = mat.tiers.find(
    (t: any) => effectiveM2 >= t.min && (t.max === null || effectiveM2 <= t.max)
  );
  if (!tier) throw new Error(`No tier for ${effectiveM2} m2`);

  const tierPrice = resolveSolwentTierPrice(input.materialId, tier);

  const basePrice = parseFloat((effectiveM2 * tierPrice).toFixed(2));

  let modifiersTotal = 0;
  const appliedModifiers: string[] = [];
  if (input.express) {
    const mod = data.modifiers.find((m: any) => m.id === "express");
    if (mod) {
      modifiersTotal = parseFloat((basePrice * mod.value).toFixed(2));
      appliedModifiers.push(mod.name);
    }
  }

  return {
    materialName: mat.name,
    qty,
    areaPerPieceM2,
    totalAreaM2,
    effectiveM2,
    tierPrice,
    basePrice,
    modifiersTotal,
    totalPrice: parseFloat((basePrice + modifiersTotal).toFixed(2)),
    appliedModifiers,
  };
}

// ---------------------------------------------------------------------------
// Full Plakaty calculator – per-format szt materials
// ---------------------------------------------------------------------------

export interface PlakatyFormatInput {
  materialId: string;
  formatKey: string;
  qty: number;
  customLengthMm?: number;
  express?: boolean;
}

export interface PlakatyFormatResult {
  materialName: string;
  formatKey: string;
  qty: number;
  unitPrice: number;
  baseLengthMm: number | null;
  customLengthMm: number | null;
  lengthFactor: number;
  effectiveUnitPrice: number;
  discountFactor: number;
  pricePerPiece: number;
  basePrice: number;
  modifiersTotal: number;
  totalPrice: number;
  appliedModifiers: string[];
}

export function calculatePlakatyFormat(input: PlakatyFormatInput): PlakatyFormatResult {
  const data = fullData as any;
  const mat = data.formatowe.materials.find((m: any) => m.id === input.materialId);
  if (!mat) throw new Error(`Unknown format material: ${input.materialId}`);

  const baseUnitPrice: number = mat.prices[input.formatKey];
  if (baseUnitPrice === undefined) throw new Error(`Unknown format: ${input.formatKey}`);
  const unitPrice = resolveStoredPrice(
    `plakaty-format-${input.materialId}-${input.formatKey}`,
    baseUnitPrice
  );

  const dimsMatch = input.formatKey.match(/^(\d+)x(\d+)$/);
  const baseLengthMm = dimsMatch ? parseInt(dimsMatch[2], 10) : null;
  const customLengthMm =
    baseLengthMm !== null && input.customLengthMm && input.customLengthMm > 0
      ? input.customLengthMm
      : baseLengthMm;
  const lengthFactor =
    baseLengthMm !== null && customLengthMm !== null
      ? parseFloat((customLengthMm / baseLengthMm).toFixed(6))
      : 1;
  const effectiveUnitPrice = parseFloat((unitPrice * lengthFactor).toFixed(2));

  // Find discount factor
  const discountGroup: string = mat.discountGroup;
  const discountTiers: any[] = data.formatowe.discounts[discountGroup] ?? [];
  const discountTier = discountTiers.find(
    (d: any) => input.qty >= d.min && (d.max === null || input.qty <= d.max)
  );
  const discountFactor: number = discountTier ? discountTier.factor : 1.0;
  const pricePerPiece = parseFloat((effectiveUnitPrice * discountFactor).toFixed(2));
  const basePrice = parseFloat((pricePerPiece * input.qty).toFixed(2));

  let modifiersTotal = 0;
  const appliedModifiers: string[] = [];
  if (input.express) {
    const mod = data.modifiers.find((m: any) => m.id === "express");
    if (mod) {
      modifiersTotal = parseFloat((basePrice * mod.value).toFixed(2));
      appliedModifiers.push(mod.name);
    }
  }

  return {
    materialName: mat.name,
    formatKey: input.formatKey,
    qty: input.qty,
    unitPrice,
    baseLengthMm,
    customLengthMm,
    lengthFactor,
    effectiveUnitPrice,
    discountFactor,
    pricePerPiece,
    basePrice,
    modifiersTotal,
    totalPrice: parseFloat((basePrice + modifiersTotal).toFixed(2)),
    appliedModifiers,
  };
}

export interface PlakatyMalyCanonInput {
  variantId: string;
  format: "A4" | "A3";
  qty: number;
  express?: boolean;
}

export interface PlakatyMalyCanonResult {
  variantName: string;
  format: "A4" | "A3";
  qty: number;
  tierPrice: number;
  singleTierPrice: number;
  basePrice: number;
  modifiersTotal: number;
  totalPrice: number;
  appliedModifiers: string[];
}

export function calculatePlakatyMalyCanon(input: PlakatyMalyCanonInput): PlakatyMalyCanonResult {
  const data = fullData as any;
  const canon = data.malyCanon;
  const variant = canon?.variants?.find((v: any) => v.id === input.variantId);
  if (!variant) throw new Error(`Unknown mały canon variant: ${input.variantId}`);

  const qty = Math.max(1, Math.floor(input.qty));
  if (qty > (canon.maxQty ?? 9)) {
    throw new Error(`Maksymalna ilość dla małego Canon: ${canon.maxQty ?? 9} szt.`);
  }

  const tier = variant.tiers.find((t: any) => qty >= t.min && (t.max === null || qty <= t.max));
  if (!tier) throw new Error(`Brak progu dla ${qty} szt.`);

  const suffix = tier.max === null ? `${tier.min}+` : `${tier.min}-${tier.max}`;
  const tierPrice = resolveStoredPrice(`plakaty-maly-canon-${input.variantId}-${suffix}`, tier.price);

  const singleTier = variant.tiers.find((t: any) => 1 >= t.min && (t.max === null || 1 <= t.max));
  const singleSuffix = singleTier ? (singleTier.max === null ? `${singleTier.min}+` : `${singleTier.min}-${singleTier.max}`) : suffix;
  const singleTierPrice = singleTier
    ? resolveStoredPrice(`plakaty-maly-canon-${input.variantId}-${singleSuffix}`, singleTier.price)
    : tierPrice;

  const basePrice = parseFloat((qty * tierPrice).toFixed(2));

  let modifiersTotal = 0;
  const appliedModifiers: string[] = [];
  if (input.express) {
    const mod = data.modifiers.find((m: any) => m.id === "express");
    if (mod) {
      modifiersTotal = parseFloat((basePrice * mod.value).toFixed(2));
      appliedModifiers.push(mod.name);
    }
  }

  return {
    variantName: variant.name,
    format: input.format,
    qty,
    tierPrice,
    singleTierPrice,
    basePrice,
    modifiersTotal,
    totalPrice: parseFloat((basePrice + modifiersTotal).toFixed(2)),
    appliedModifiers,
  };
}
