import { calculateSolwentPlakaty } from "./categories/solwent-plakaty";
import { formatPLN } from "./core/money";

function main() {
  const inputs = [
    { areaM2: 0.5, material: "Papier 200g połysk", express: false },
    { areaM2: 5, material: "Papier 200g połysk", express: true },
    { areaM2: 50, material: "Blockout 200g satyna", express: false }
  ];

  console.log("--- Kalkulator Cen ---");
  for (const input of inputs) {
    try {
      const result = calculateSolwentPlakaty(input);
      console.log(`\nInput: ${input.areaM2}m2, ${input.material}${input.express ? " (EXPRESS)" : ""}`);
      console.log(`Cena jednostkowa: ${result.tierPrice} zł/m2`);
      console.log(`Ilość (efektywna): ${result.effectiveQuantity} m2`);
      console.log(`Cena bazowa: ${formatPLN(result.basePrice)}`);
      if (result.modifiersTotal > 0) {
        console.log(`Dopłaty: ${formatPLN(result.modifiersTotal)} (${result.appliedModifiers.join(", ")})`);
      }
      console.log(`SUMA BRUTTO: ${formatPLN(result.totalPrice)}`);
    } catch (error: any) {
      console.error(`Błąd: ${error.message}`);
    }
  }
}

// Check if running directly (node) or via ts-node
if (require.main === module) {
  main();
}

export { calculateSolwentPlakaty };
