export function parsePrice(priceStr: string): number {
  const normalized = priceStr
    .replace("zł", "")
    .replace("/", "")
    .replace("m2", "")
    .replace("szt", "")
    .replace(" ", "")
    .replace(",", ".")
    .trim();
  return parseFloat(normalized);
}

export function parseTierRange(rangeStr: string): { min: number, max: number | null } {
  const parts = rangeStr.split("-").map(p => p.trim());
  const min = parseFloat(parts[0]);
  let max: number | null = null;

  if (parts.length > 1) {
    if (parts[1].includes("więcej")) {
      max = null;
    } else {
      max = parseFloat(parts[1]);
    }
  }

  return { min, max };
}
