import { calculateSolwentPlakaty, SolwentPlakatyInput } from "./solwent-plakaty";
import { CalculationResult } from "../core/types";

export const categories = [
  {
    id: "solwent-plakaty",
    label: "SOLWENT - PLAKATY",
    calculate: (input: SolwentPlakatyInput): CalculationResult => calculateSolwentPlakaty(input)
  }
];
