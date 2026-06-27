import type { PriceDataSource } from "../../core/contracts/PriceDataSource";

const FORBIDDEN_KEYS = new Set(["__proto__", "prototype", "constructor"]);

function isSafe(key: string): boolean {
  return Boolean(key) && !FORBIDDEN_KEYS.has(key);
}

export class JsonPriceSource implements PriceDataSource {
  constructor(private readonly getRoot: () => unknown) {}

  getPrice(path: string): unknown {
    const keys = path.split(".");
    if (keys.some((k) => !isSafe(k))) return undefined;
    let obj: unknown = this.getRoot();
    for (const key of keys) {
      if (obj == null || typeof obj !== "object") return undefined;
      obj = (obj as Record<string, unknown>)[key];
    }
    return obj;
  }
}
