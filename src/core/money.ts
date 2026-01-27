export function formatPLN(amount: number): string {
  return amount.toFixed(2).replace(".", ",") + " zł";
}
