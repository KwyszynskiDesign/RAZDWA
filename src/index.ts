import { calculateSolwentPlakaty } from "./categories/solwent-plakaty";
import { formatPLN } from "./core/money";

function getSampleData() {
  return [
    { areaM2: 0.5, material: "Papier 200g połysk", express: false },
    { areaM2: 5, material: "Papier 200g połysk", express: true },
    { areaM2: 50, material: "Blockout 200g satyna", express: false }
  ];
}

function renderResults() {
  const resultsElement = document.getElementById("results");
  if (!resultsElement) return;

  const inputs = getSampleData();
  let html = "";

  for (const input of inputs) {
    try {
      const result = calculateSolwentPlakaty(input);
      html += `
        <div class="result-item">
          <strong>${input.areaM2}m2, ${input.material}${input.express ? " (EXPRESS)" : ""}</strong><br>
          Cena jednostkowa: ${result.tierPrice} zł/m2<br>
          Ilość (efektywna): ${result.effectiveQuantity} m2<br>
          Cena bazowa: ${formatPLN(result.basePrice)}<br>
          ${result.modifiersTotal > 0 ? `Dopłaty: ${formatPLN(result.modifiersTotal)} (${result.appliedModifiers.join(", ")})<br>` : ""}
          <span class="price-total">SUMA BRUTTO: ${formatPLN(result.totalPrice)}</span>
        </div>
      `;
    } catch (error: any) {
      html += `<div class="result-item" style="color: red;">Błąd: ${error.message}</div>`;
    }
  }

  resultsElement.innerHTML = html;
}

// Browser entry point
if (typeof document !== "undefined") {
  if (document.readyState === 'loading') {
    document.addEventListener("DOMContentLoaded", renderResults);
  } else {
    renderResults();
  }
}

export { calculateSolwentPlakaty };
