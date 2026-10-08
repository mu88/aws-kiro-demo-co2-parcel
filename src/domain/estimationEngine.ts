// EstimationEngine: orchestriert Routenwahl (RouteSelector) und CO2-Berechnung
// (CO2Calculator) zu einem typisierten EstimationResult.
// Umsetzung gemäss Design-Abschnitten "EstimationEngine" und "Error Handling"
// (swiss-post-co2-footprint).
// Requirements 3.1, 3.7, 4.1, 4.2, 4.3, 4.4.

import { computeCo2Grams, roundToGram } from './co2Calculator';
import { selectRoute } from './routeSelector';
import type {
  EmissionFactorCatalog,
  EstimationResult,
  ServiceLevel,
  ShipmentAttributes,
  TransportMode,
} from './types';
import type { RouteNetwork } from '../data/routeNetwork';

/**
 * Schätzt den CO2_Fussabdruck für ein Package: wählt über {@link selectRoute}
 * die effizienteste Transport_Route und berechnet den CO2_Estimate über
 * {@link computeCo2Grams}/{@link roundToGram}.
 *
 * Fehler werden als typisierte Rückgabewerte modelliert (keine Exceptions),
 * damit die UI gezielt reagieren und Eingaben erhalten kann:
 * - `no-route`, wenn das Route_Network keine Verbindung Origin↔Destination
 *   enthält (Requirement 3.7);
 * - `missing-factor` mit der betroffenen Transport_Mode, wenn ein Segment der
 *   gewählten Route keinen Emission_Factor im Katalog hat (Requirement 4.4);
 * - sonst `ok` mit Route und gerundetem CO2_Estimate (Requirements 3.1, 4.2, 4.3).
 */
export function estimate(
  serviceLevel: ServiceLevel,
  attributes: ShipmentAttributes,
  network: RouteNetwork,
  catalog: EmissionFactorCatalog,
): EstimationResult {
  const route = selectRoute(
    serviceLevel,
    attributes.origin,
    attributes.destination,
    network,
    catalog,
  );

  // Keine Verbindung zwischen Origin und Destination (Requirement 3.7).
  if (route === null) {
    return { kind: 'no-route' };
  }

  // Unvollständiger Katalog: erste betroffene Transport_Mode melden
  // (Requirement 4.4).
  const missingMode = findMissingFactorMode(route.segments.map((segment) => segment.mode), catalog);
  if (missingMode !== undefined) {
    return { kind: 'missing-factor', mode: missingMode };
  }

  // Gültige Route mit vollständigem Katalog: CO2_Estimate berechnen und auf das
  // nächste ganze Gramm runden (Requirements 4.2, 4.3).
  const co2EstimateGrams = roundToGram(
    computeCo2Grams(attributes.weightGrams, route, catalog),
  );
  return { kind: 'ok', route, co2EstimateGrams };
}

/**
 * Liefert die erste Transport_Mode, für die der Katalog keinen (definierten)
 * Emission_Factor enthält, sonst undefined (Requirement 4.4).
 */
function findMissingFactorMode(
  modes: TransportMode[],
  catalog: EmissionFactorCatalog,
): TransportMode | undefined {
  return modes.find((mode) => catalog[mode] === undefined);
}
