// InputValidator: validiert die Shipment_Attribute-Eingaben vor der Schätzung.
// Umsetzung gemäss Design-Abschnitt "InputValidator" und "Error Handling"
// (swiss-post-co2-footprint). Requirements 2.1, 2.2, 2.3, 2.6, 2.7, 4.5.

import type {
  RegionId,
  ShipmentAttributes,
  ShipmentInput,
  ValidationError,
  ValidationResult,
} from './types';

/** Zulässiger Paketgewichtsbereich in Gramm (Requirement 2.2). */
const MIN_WEIGHT_GRAMS = 1;
const MAX_WEIGHT_GRAMS = 30000;

/**
 * Gültige Route_Network-Regionen (Design "Region → Eingangs-/Ausgangs-Parcel_Center").
 * Fallback-Liste, solange `src/data/routeNetwork.ts` noch nicht vorhanden ist;
 * kann per Parameter überschrieben werden, sobald die Datenschicht steht.
 */
const DEFAULT_VALID_REGIONS: readonly RegionId[] = [
  'bern',
  'mittelland',
  'waadt',
  'ostschweiz',
  'tessin',
];

/**
 * Prüft eine rohe Shipment_Attribute-Eingabe.
 *
 * - Gewicht: muss vorhanden, numerisch, ganzzahlig und im Bereich 1..30000 g sein.
 * - Origin/Destination: müssen gesetzt und gültige Route_Network-Regionen sein.
 *
 * Bei Gültigkeit werden normalisierte `ShipmentAttributes` zurückgegeben
 * (Requirement 2.7); andernfalls eine feldbezogene `ValidationError`-Liste.
 *
 * @param input Rohe, unvalidierte Eingabe der Customer.
 * @param validRegions Zulässige Region-IDs; standardmässig die Route_Network-Regionen.
 */
export function validateShipment(
  input: ShipmentInput,
  validRegions: readonly RegionId[] = DEFAULT_VALID_REGIONS,
): ValidationResult {
  const errors: ValidationError[] = [];

  const weightResult = validateWeight(input.weightGrams);
  if (weightResult.error) {
    errors.push(weightResult.error);
  }

  const originError = validateRegion('origin', input.origin, validRegions);
  if (originError) {
    errors.push(originError);
  }

  const destinationError = validateRegion(
    'destination',
    input.destination,
    validRegions,
  );
  if (destinationError) {
    errors.push(destinationError);
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  const attributes: ShipmentAttributes = {
    weightGrams: weightResult.value as number,
    origin: input.origin as RegionId,
    destination: input.destination as RegionId,
  };

  return { valid: true, errors: [], attributes };
}

/**
 * Prüft das Paketgewicht und liefert bei Gültigkeit den normalisierten Zahlenwert.
 * Deckt leeres/fehlendes (2.6), nicht-numerisches (2.3) und ausserhalb des
 * Bereichs liegendes Gewicht (2.2) ab.
 */
function validateWeight(raw: ShipmentInput['weightGrams']): {
  value?: number;
  error?: ValidationError;
} {
  // Leer oder fehlend (Requirement 2.6).
  if (raw === undefined || raw === null) {
    return { error: { field: 'weightGrams', messageKey: 'weight.required' } };
  }

  let value: number;

  if (typeof raw === 'number') {
    if (!Number.isFinite(raw)) {
      return { error: { field: 'weightGrams', messageKey: 'weight.numeric' } };
    }
    value = raw;
  } else {
    const trimmed = raw.trim();
    // Leerer String zählt als fehlendes Gewicht (Requirement 2.6).
    if (trimmed === '') {
      return { error: { field: 'weightGrams', messageKey: 'weight.required' } };
    }
    // Nicht-numerischer String (Requirement 2.3).
    if (!/^[+-]?\d+(\.\d+)?$/.test(trimmed)) {
      return { error: { field: 'weightGrams', messageKey: 'weight.numeric' } };
    }
    value = Number(trimmed);
  }

  // Ganzzahliger Bereich 1..30000 (Requirements 2.2, 4.5).
  if (!Number.isInteger(value) || value < MIN_WEIGHT_GRAMS || value > MAX_WEIGHT_GRAMS) {
    return { error: { field: 'weightGrams', messageKey: 'weight.range' } };
  }

  return { value };
}

/**
 * Prüft, dass eine Region gesetzt und eine gültige Route_Network-Region ist
 * (Requirements 2.4, 2.5).
 */
function validateRegion(
  field: 'origin' | 'destination',
  raw: RegionId | null | undefined,
  validRegions: readonly RegionId[],
): ValidationError | undefined {
  if (raw === undefined || raw === null || raw === '') {
    return { field, messageKey: `${field}.required` };
  }
  if (!validRegions.includes(raw)) {
    return { field, messageKey: `${field}.invalid` };
  }
  return undefined;
}
