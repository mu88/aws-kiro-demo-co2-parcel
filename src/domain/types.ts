// Domänentypen für den CO2-Fussabdruck-Prototyp der Schweizerischen Post.
// Definitionen folgen dem Abschnitt "Data Models" sowie "Components and
// Interfaces" des Designs (swiss-post-co2-footprint).

export type ServiceLevel = 'Economy' | 'Priority' | 'Kurier';

export type TransportMode = 'Lkw' | 'Rail' | 'E_Trike' | 'Car';

/** Herkunfts-/Zielgebiet, z. B. 'bern', 'tessin'. */
export type RegionId = string;

/** Parcel_Center, z. B. 'haerkingen'. */
export type CenterId = string;

export type SegmentRole =
  | 'Aufgabe'
  | 'EingangsZentrum'
  | 'Hauptlauf'
  | 'AusgangsZentrum'
  | 'Zustellung';

export interface ShipmentAttributes {
  weightGrams: number; // 1..30000 (nach Validierung)
  origin: RegionId;
  destination: RegionId;
}

/**
 * Rohe, noch nicht validierte Shipment_Attribute-Eingabe der Customer.
 * Das Gewicht kann als String (Formularfeld) oder Zahl vorliegen und fehlen;
 * Origin/Destination sind Region-IDs, solange nicht gewählt ggf. undefined.
 */
export interface ShipmentInput {
  weightGrams?: string | number | null;
  origin?: RegionId | null;
  destination?: RegionId | null;
}

export interface RouteSegment {
  role: SegmentRole;
  fromId: string; // Region- oder Center-ID
  toId: string;
  distanceKm: number; // > 0, aus Route_Network
  mode: TransportMode;
}

export interface TransportRoute {
  segments: RouteSegment[]; // geordnet; Reihenfolge gemäss Requirement 3.2
}

export interface Package {
  id: string;
  serviceLevel: ServiceLevel;
  attributes: ShipmentAttributes;
  route: TransportRoute;
  co2EstimateGrams: number; // gerundet (Requirement 4.3)
}

export interface ValidationError {
  field: 'serviceLevel' | 'weightGrams' | 'origin' | 'destination';
  messageKey: string; // Schlüssel für lokalisierte Meldung
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  // Bei valid === true: normalisierte, typisierte Attribute
  attributes?: ShipmentAttributes;
}

/** Ordnet jeder Transport_Mode ihren Emission_Factor (g CO2e/t·km) zu. */
export type EmissionFactorCatalog = Record<TransportMode, number>;

export type EstimationResult =
  | { kind: 'ok'; route: TransportRoute; co2EstimateGrams: number }
  | { kind: 'no-route' } // Requirement 3.7
  | { kind: 'missing-factor'; mode: TransportMode }; // Requirement 4.4
