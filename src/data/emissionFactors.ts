// Gemockter Emission_Factor_Catalog für den CO2-Fussabdruck-Prototyp.
// Werte in Gramm CO2-Äquivalent je Tonnen-Kilometer (g CO2e/t·km) exakt gemäss
// Design-Tabelle "Emission_Factor_Catalog" (Requirements 4.2, 6.1, 6.3).

import type { TransportMode } from '../domain/types';

export type EmissionFactorCatalog = Record<TransportMode, number>;

/** Masseinheit der Emission_Factor-Werte (Requirement 6.1). */
export const emissionFactorUnit = 'g CO2e/t·km';

// Emission_Factor je Transport_Mode (Design-Tabelle).
export const emissionFactorCatalog: EmissionFactorCatalog = {
  Rail: 15,
  Lkw: 95,
  E_Trike: 5,
  Car: 170,
};

// --- Hilfsfunktion für Zugriff ---

/**
 * Liefert den Emission_Factor der gegebenen Transport_Mode, sonst undefined
 * (ermöglicht die missing-factor-Behandlung in der Estimation_Engine).
 */
export function findEmissionFactor(
  mode: TransportMode,
  catalog: EmissionFactorCatalog = emissionFactorCatalog,
): number | undefined {
  return catalog[mode];
}
