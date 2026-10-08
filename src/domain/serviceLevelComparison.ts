// ServiceLevelComparison: reine Logik, die für denselben Shipment_Attribute-Satz
// den CO2_Estimate je Service_Level gegenüberstellt. Nutzt die bestehende
// Estimation_Engine (keine Dupliierung der Routen-/CO2-Berechnung) und ermittelt
// das Service_Level mit der geringsten CO2-Emission.

import { estimate } from './estimationEngine';
import { emissionFactorCatalog } from '../data/emissionFactors';
import { routeNetwork } from '../data/routeNetwork';
import type {
  EstimationResult,
  ServiceLevel,
  ShipmentAttributes,
} from './types';

/** Alle vergleichbaren Service_Level in Anzeigereihenfolge. */
export const ALL_SERVICE_LEVELS: readonly ServiceLevel[] = [
  'Economy',
  'Priority',
  'Kurier',
];

/** Vergleichszeile: ein Service_Level mit seinem Schätzergebnis. */
export interface ServiceLevelComparisonRow {
  serviceLevel: ServiceLevel;
  result: EstimationResult;
  /** true, wenn dieses Service_Level den geringsten CO2_Estimate hat. */
  isLowest: boolean;
}

/**
 * Berechnet für denselben Shipment_Attribute-Satz den CO2_Estimate je
 * Service_Level und markiert das günstigste (geringster CO2_Estimate) unter den
 * Zeilen mit Ergebnis `ok`. Zeilen ohne gültiges Ergebnis (`no-route`,
 * `missing-factor`) werden mitgeführt, aber nie als günstigstes markiert.
 */
export function compareServiceLevels(
  attributes: ShipmentAttributes,
): ServiceLevelComparisonRow[] {
  const rows = ALL_SERVICE_LEVELS.map((serviceLevel) => ({
    serviceLevel,
    result: estimate(serviceLevel, attributes, routeNetwork, emissionFactorCatalog),
    isLowest: false,
  }));

  // Günstigstes 'ok'-Ergebnis bestimmen.
  let lowestIndex = -1;
  let lowestGrams = Number.POSITIVE_INFINITY;
  rows.forEach((row, index) => {
    if (row.result.kind === 'ok' && row.result.co2EstimateGrams < lowestGrams) {
      lowestGrams = row.result.co2EstimateGrams;
      lowestIndex = index;
    }
  });

  if (lowestIndex >= 0) {
    rows[lowestIndex].isLowest = true;
  }

  return rows;
}
