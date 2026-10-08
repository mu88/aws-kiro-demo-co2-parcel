// CO2Calculator: reine Funktionen zur Berechnung des CO2_Estimate eines
// Package aus seiner Transport_Route und dem Emission_Factor_Catalog.
// Definitionen folgen dem Abschnitt "CO2Calculator" sowie der
// "Einheiten-Begründung" des Designs (swiss-post-co2-footprint).

import type { EmissionFactorCatalog, TransportRoute } from './types';

/**
 * Berechnet den CO2_Estimate als Summe über alle Route_Segment-Elemente
 * (Requirement 4.2): je Segment Paketgewicht × Segment-Distanz × Emission_Factor
 * der Transport_Mode des Segments.
 *
 * Einheiten: Emission_Factor ist in g CO2e je Tonnen-km definiert, das
 * Paketgewicht liegt in Gramm vor. Die Umrechnung Gramm → Tonnen erfolgt mit
 * dem Faktor 1_000_000 (weightGrams/1000 × distanceKm × factor / 1000),
 * sodass das Ergebnis in Gramm CO2-Äquivalent vorliegt.
 *
 * Der zurückgegebene Wert ist UNGERUNDET; die Rundung auf das nächste ganze
 * Gramm erfolgt separat über {@link roundToGram}.
 */
export function computeCo2Grams(
  weightGrams: number,
  route: TransportRoute,
  catalog: EmissionFactorCatalog,
): number {
  return route.segments.reduce((sum, segment) => {
    const factor = catalog[segment.mode];
    return sum + ((weightGrams / 1000) * segment.distanceKm * factor) / 1000;
  }, 0);
}

/**
 * Kaufmännische Rundung auf das nächste ganze Gramm (Requirement 4.3):
 * Ein Bruchteil von genau 0,5 wird aufgerundet.
 */
export function roundToGram(grams: number): number {
  return Math.round(grams);
}
