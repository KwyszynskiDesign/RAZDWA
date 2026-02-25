import { CategoryModule, CategoryContext } from "../ui/router";
import { calculatePrice } from "../core/pricing";
import { formatPLN } from "../core/money";
import { getPrice } from "../services/priceService";
import { PriceTable } from "../core/types";

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
  express?: boolean;
}

export interface PlakatyM2Result {
  materialName: string;
  effectiveM2: number;
  tierPrice: number;
  basePrice: number;
  modifiersTotal: number;
  totalPrice: number;
  appliedModifiers: string[];
}

export function calculatePlakatyM2(input: PlakatyM2Input): PlakatyM2Result {
  const data = fullData as any;
  const mat = data.solwent.materials.find((m: any) => m.id === input.materialId);
  if (!mat) throw new Error(`Unknown solwent material: ${input.materialId}`);

  const minM2: number = data.solwent.minimumM2 ?? 1;
  const effectiveM2 = Math.max(input.areaM2, minM2);

  // Find tier
  const tier = mat.tiers.find(
    (t: any) => effectiveM2 >= t.min && (t.max === null || effectiveM2 <= t.max)
  );
  if (!tier) throw new Error(`No tier for ${effectiveM2} m2`);

  const basePrice = parseFloat((effectiveM2 * tier.price).toFixed(2));

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
    effectiveM2,
    tierPrice: tier.price,
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
  express?: boolean;
}

export interface PlakatyFormatResult {
  materialName: string;
  formatKey: string;
  qty: number;
  unitPrice: number;
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

  const unitPrice: number = mat.prices[input.formatKey];
  if (unitPrice === undefined) throw new Error(`Unknown format: ${input.formatKey}`);

  // Find discount factor
  const discountGroup: string = mat.discountGroup;
  const discountTiers: any[] = data.formatowe.discounts[discountGroup] ?? [];
  const discountTier = discountTiers.find(
    (d: any) => input.qty >= d.min && (d.max === null || input.qty <= d.max)
  );
  const discountFactor: number = discountTier ? discountTier.factor : 1.0;
  const pricePerPiece = parseFloat((unitPrice * discountFactor).toFixed(2));
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
    discountFactor,
    pricePerPiece,
    basePrice,
    modifiersTotal,
    totalPrice: parseFloat((basePrice + modifiersTotal).toFixed(2)),
    appliedModifiers,
  };
}
