import { describe, it, expect } from "vitest";
import { calculateDrukA4A3Skan } from "../src/categories/druk-a4-a3-skan";

describe("Druk A4/A3 - Weryfikacja dopłaty za zadruk >25%", () => {
  
  it("Przykład zgłoszony przez użytkownika: 20 stron, 10 z zadrukieniem >25%", () => {
    const result = calculateDrukA4A3Skan({
      mode: "bw",
      format: "A4",
      printQty: 20,
      email: false,
      surcharge: true,
      surchargeQty: 10,
      scanType: "none",
      scanQty: 0,
      express: false
    });

    console.log("\n=== Weryfikacja obliczeń ===");
    console.log(`Łączna ilość stron: 20`);
    console.log(`Stron z zadrukieniem >25%: 10`);
    console.log(`Cena jednostkowa (tier 6-20): 0.60 zł/str`);
    console.log(`\n--- Obliczenia ---`);
    console.log(`10 stron normalnych: 10 × 0.60 = 6.00 zł`);
    console.log(`10 stron zadrukowanych: 10 × 0.90 (150%) = 9.00 zł`);
    console.log(`RAZEM: 15.00 zł`);
    console.log(`\n--- Wynik z funkcji ---`);
    console.log(`unitPrintPrice: ${result.unitPrintPrice.toFixed(2)} zł/str`);
    console.log(`totalPrintPrice: ${result.totalPrintPrice.toFixed(2)} zł`);
    console.log(`surchargePrice (dopłata): ${result.surchargePrice.toFixed(2)} zł`);
    console.log(`totalPrice: ${result.totalPrice.toFixed(2)} zł`);

    // Weryfikacja poprawności
    expect(result.unitPrintPrice).toBe(0.60);
    expect(result.totalPrintPrice).toBe(15.00);
    expect(result.surchargePrice).toBeCloseTo(3.00, 2); // 10 stron × 0.30 dopłaty
    expect(result.totalPrice).toBe(15.00);
  });

  it("Przykład: 100 stron, 25 z zadrukieniem >25%", () => {
    const result = calculateDrukA4A3Skan({
      mode: "bw",
      format: "A4",
      printQty: 100,
      email: false,
      surcharge: true,
      surchargeQty: 25,
      scanType: "none",
      scanQty: 0,
      express: false
    });

    console.log("\n=== Weryfikacja obliczeń (100 stron) ===");
    console.log(`Łączna ilość stron: 100`);
    console.log(`Stron z zadrukieniem >25%: 25`);
    console.log(`Cena jednostkowa (tier 21-100): 0.35 zł/str`);
    console.log(`\n--- Obliczenia ---`);
    console.log(`75 stron normalnych: 75 × 0.35 = 26.25 zł`);
    console.log(`25 stron zadrukowanych: 25 × 0.525 (150%) = 13.125 zł`);
    console.log(`RAZEM: 39.375 zł → zaokrąglone 39.38 zł`);
    console.log(`\n--- Wynik z funkcji ---`);
    console.log(`unitPrintPrice: ${result.unitPrintPrice.toFixed(2)} zł/str`);
    console.log(`totalPrintPrice: ${result.totalPrintPrice.toFixed(2)} zł`);
    console.log(`surchargePrice (dopłata): ${result.surchargePrice.toFixed(2)} zł`);
    console.log(`totalPrice: ${result.totalPrice.toFixed(2)} zł`);

    // Weryfikacja poprawności
    expect(result.unitPrintPrice).toBe(0.35);
    expect(result.totalPrintPrice).toBe(39.38);
    expect(result.surchargePrice).toBeCloseTo(4.37, 2); // 25 stron × 0.175 dopłaty
    expect(result.totalPrice).toBe(39.38);
  });

  it("Przykład: wszystkie strony z zadrukieniem", () => {
    const result = calculateDrukA4A3Skan({
      mode: "color",
      format: "A4",
      printQty: 50,
      email: false,
      surcharge: true,
      surchargeQty: 50,
      scanType: "none",
      scanQty: 0,
      express: false
    });

    console.log("\n=== Weryfikacja obliczeń (100% zadruk) ===");
    console.log(`Łączna ilość stron: 50 (kolor)`);
    console.log(`Stron z zadrukieniem >25%: 50`);
    console.log(`Cena jednostkowa (tier 41-100 kolor): 2.00 zł/str`);
    console.log(`\n--- Obliczenia ---`);
    console.log(`0 stron normalnych: 0 × 2.00 = 0.00 zł`);
    console.log(`50 stron zadrukowanych: 50 × 3.00 (150%) = 150.00 zł`);
    console.log(`RAZEM: 150.00 zł`);
    console.log(`\n--- Wynik z funkcji ---`);
    console.log(`unitPrintPrice: ${result.unitPrintPrice.toFixed(2)} zł/str`);
    console.log(`totalPrintPrice: ${result.totalPrintPrice.toFixed(2)} zł`);
    console.log(`surchargePrice (dopłata): ${result.surchargePrice.toFixed(2)} zł`);
    console.log(`totalPrice: ${result.totalPrice.toFixed(2)} zł`);

    // Weryfikacja poprawności
    expect(result.unitPrintPrice).toBe(2.00);
    expect(result.totalPrintPrice).toBe(150.00);
    expect(result.surchargePrice).toBeCloseTo(50.00, 2); // 50 stron × 1.00 dopłaty
    expect(result.totalPrice).toBe(150.00);
  });
});
