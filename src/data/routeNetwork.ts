// Gemocktes Route_Network für den CO2-Fussabdruck-Prototyp.
// Datensätze folgen exakt den Tabellen im Abschnitt "Data Models" des Designs
// (swiss-post-co2-footprint): Parcel_Center, Region → Parcel_Center und die
// bidirektionalen Verbindungen (NetworkLink). Standorte beruhen auf real
// recherchierten Standorten der Schweizerischen Post; Distanzen sind gemockt
// (Requirement 6.3).

import type { CenterId, RegionId, TransportMode } from '../domain/types';

export interface ParcelCenter {
  id: CenterId;
  name: string;
  tier: 'national' | 'regional';
  /** Ungefaehre geografische Lage (WGS84) fuer die Kartendarstellung. */
  lat: number;
  lng: number;
}

export interface Region {
  id: RegionId;
  name: string;
  centerId: CenterId; // zugeordnetes Parcel_Center
  accessDistanceKm: number; // Distanz Region ↔ Zentrum (gemockt)
  accessMode: TransportMode; // i. d. R. 'Lkw' bzw. 'E_Trike' für Zustellung
  /** Ungefaehre geografische Lage (WGS84) fuer die Kartendarstellung. */
  lat: number;
  lng: number;
}

export interface NetworkLink {
  a: CenterId;
  b: CenterId;
  distanceKm: number;
  modes: TransportMode[]; // z. B. ['Lkw', 'Rail']
}

export interface RouteNetwork {
  centers: ParcelCenter[];
  regions: Region[];
  links: NetworkLink[];
}

// Parcel_Center (Design-Tabelle "Parcel_Center").
export const parcelCenters: ParcelCenter[] = [
  { id: 'haerkingen', name: 'Härkingen', tier: 'national', lat: 47.308, lng: 7.822 },
  { id: 'daillens', name: 'Daillens', tier: 'national', lat: 46.627, lng: 6.558 },
  { id: 'frauenfeld', name: 'Frauenfeld', tier: 'national', lat: 47.556, lng: 8.896 },
  { id: 'ostermundigen', name: 'Ostermundigen', tier: 'regional', lat: 46.956, lng: 7.489 },
  { id: 'cadenazzo', name: 'Cadenazzo', tier: 'regional', lat: 46.154, lng: 8.945 },
  { id: 'zuerich-muelligen', name: 'Zürich-Mülligen', tier: 'regional', lat: 47.391, lng: 8.489 },
];

// Region → Eingangs-/Ausgangs-Parcel_Center (Design-Tabelle "Region → ...").
export const regions: Region[] = [
  { id: 'bern', name: 'Bern', centerId: 'ostermundigen', accessDistanceKm: 8, accessMode: 'E_Trike', lat: 46.948, lng: 7.447 },
  { id: 'mittelland', name: 'Mittelland', centerId: 'haerkingen', accessDistanceKm: 15, accessMode: 'Lkw', lat: 47.200, lng: 7.900 },
  { id: 'waadt', name: 'Waadt', centerId: 'daillens', accessDistanceKm: 12, accessMode: 'Lkw', lat: 46.519, lng: 6.633 },
  { id: 'ostschweiz', name: 'Ostschweiz', centerId: 'frauenfeld', accessDistanceKm: 10, accessMode: 'Lkw', lat: 47.424, lng: 9.377 },
  { id: 'tessin', name: 'Tessin', centerId: 'cadenazzo', accessDistanceKm: 9, accessMode: 'E_Trike', lat: 46.011, lng: 8.961 },
  { id: 'zuerich', name: 'Zürich', centerId: 'zuerich-muelligen', accessDistanceKm: 7, accessMode: 'E_Trike', lat: 47.377, lng: 8.540 },
];

// Route_Network: Verbindungen (Design-Tabelle "Route_Network: Verbindungen").
// Jede Verbindung ist bidirektional.
export const networkLinks: NetworkLink[] = [
  { a: 'haerkingen', b: 'daillens', distanceKm: 95, modes: ['Lkw', 'Rail'] },
  { a: 'haerkingen', b: 'frauenfeld', distanceKm: 110, modes: ['Lkw', 'Rail'] },
  { a: 'haerkingen', b: 'ostermundigen', distanceKm: 55, modes: ['Lkw', 'Rail'] },
  { a: 'haerkingen', b: 'cadenazzo', distanceKm: 150, modes: ['Lkw'] },
  { a: 'daillens', b: 'ostermundigen', distanceKm: 85, modes: ['Lkw', 'Rail'] },
  { a: 'frauenfeld', b: 'cadenazzo', distanceKm: 220, modes: ['Lkw'] },
  { a: 'daillens', b: 'frauenfeld', distanceKm: 200, modes: ['Lkw'] },
  { a: 'daillens', b: 'cadenazzo', distanceKm: 210, modes: ['Lkw', 'Rail'] },
  { a: 'zuerich-muelligen', b: 'haerkingen', distanceKm: 70, modes: ['Lkw', 'Rail'] },
  { a: 'zuerich-muelligen', b: 'frauenfeld', distanceKm: 40, modes: ['Lkw', 'Rail'] },
];

// Gesamtes gemocktes Route_Network als ein Objekt für die Domänenlogik.
export const routeNetwork: RouteNetwork = {
  centers: parcelCenters,
  regions,
  links: networkLinks,
};

// --- Hilfsfunktionen für Zugriff ---

/** Liefert die Region zur gegebenen RegionId, sonst undefined. */
export function findRegionById(
  id: RegionId,
  network: RouteNetwork = routeNetwork,
): Region | undefined {
  return network.regions.find((region) => region.id === id);
}

/** Liefert das Parcel_Center zur gegebenen CenterId, sonst undefined. */
export function findCenterById(
  id: CenterId,
  network: RouteNetwork = routeNetwork,
): ParcelCenter | undefined {
  return network.centers.find((center) => center.id === id);
}

/**
 * Bidirektionale Link-Suche: findet die Verbindung zwischen zwei Parcel_Center
 * unabhängig von der Reihenfolge der IDs; undefined, wenn keine existiert.
 */
export function findLinkBetween(
  centerA: CenterId,
  centerB: CenterId,
  network: RouteNetwork = routeNetwork,
): NetworkLink | undefined {
  return network.links.find(
    (link) =>
      (link.a === centerA && link.b === centerB) ||
      (link.a === centerB && link.b === centerA),
  );
}

/** Geografische Koordinate (WGS84) fuer die Kartendarstellung. */
export interface GeoPoint {
  lat: number;
  lng: number;
}

/**
 * Loest eine Segment-Endpunkt-ID (Region ODER Parcel_Center) in Koordinaten auf.
 * Zuerst wird eine Region gesucht (Aufgabe-/Zustellort), dann ein Parcel_Center
 * (Hauptlauf-Knoten); undefined, wenn die ID unbekannt ist.
 */
export function coordinateForId(
  id: string,
  network: RouteNetwork = routeNetwork,
): GeoPoint | undefined {
  const region = findRegionById(id, network);
  if (region) {
    return { lat: region.lat, lng: region.lng };
  }
  const center = findCenterById(id, network);
  if (center) {
    return { lat: center.lat, lng: center.lng };
  }
  return undefined;
}


