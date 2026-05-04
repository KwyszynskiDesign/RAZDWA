import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

describe("Breakdown panel layout coverage", () => {
  it("applies global CSS hooks for all categories with 'Jak liczona jest cena'", () => {
    const categoriesDir = resolve(process.cwd(), "docs/categories");
    const files = readdirSync(categoriesDir).filter((name) => name.endsWith(".html"));

    const filesWithBreakdownHeading: string[] = [];

    for (const file of files) {
      const fullPath = resolve(categoriesDir, file);
      const content = readFileSync(fullPath, "utf8");

      if (!content.includes("Jak liczona jest cena")) continue;
      filesWithBreakdownHeading.push(file);

      const hasSupportedContainer =
        /id="[^"]*(Breakdown|breakdown-display)[^"]*"/i.test(content) ||
        /class="[^"]*d-breakdown-box[^"]*"/i.test(content);

      expect(hasSupportedContainer, `${file} should expose a supported breakdown container`).toBe(true);
    }

    expect(filesWithBreakdownHeading.length).toBeGreaterThan(0);

    const stylesPath = resolve(process.cwd(), "docs/assets/styles.css");
    const styles = readFileSync(stylesPath, "utf8");

    expect(styles).toContain('.category-view .card[id*="Breakdown"]');
    expect(styles).toContain('.category-view .card[id*="breakdown-display"]');
    expect(styles).toContain('.category-view [id*="breakdown-lines"]');
  });
});
