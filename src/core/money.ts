export function formatPLN(amount: number): string { return new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN" }).format(amount); }
