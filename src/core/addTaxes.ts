/**
 * /src/core/addTaxes.ts
 * Handles tax calculation. Prices in RAZDWA are gross (VAT included),
 * so this function currently returns the price unchanged.
 */

export function addTaxes(price: number): number {
  return price;
}
