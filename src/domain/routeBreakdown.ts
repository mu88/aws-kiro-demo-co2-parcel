// RouteBreakdown: reines Darstellungs-Mapping einer Transport_Route auf eine
// je Route_Segment aufgeschlüsselte Sicht. Liefert für jedes Segment die
// Zwischenstationen (Von/Nach mit lesbarem Namen), die Rolle (Aufgabe,
// Hauptlauf, Zustellung ...), die Transport_Mode, die Distanz in Kilometern und
// den angewandten Emission_Factor samt Masseinheit (g CO2e/t·km). Optional – bei
// bekanntem Paketgewicht – auch den CO2-Beitrag dieses Segments. Definitionen
// folgen der Design-Komponente "RouteBreakdown" sowie Correctness Property 13
// (swiss-post-co2-footprint).

import {
  emissionFactorCatalog,
  emissionFactorUnit,
  findEmissionFactor,
} from '../data/emissionFactors';
import { findCenterById, findRegionById } from '../data/routeNetwork';
import type {
  EmissionFactorCatalog,
  SegmentRole,
  TransportMode,
  TransportRoute,
} from './types';

/**
 * Aufschlüsselung eines einzelnen Route_Segment für die Darstellung
 * (Requirement 6.1): Zwischenstationen (Von/Nach), Rolle, Transport_Mode,
 * Distanz in km sowie der angewandte Emission_Factor mit seiner Masseinheit. Bei
 * bekanntem Paketgewicht zusätzlich der (ungerundete) CO2-Beitrag dieses
 * Segments in Gramm CO2-Äquivalent.
 *
 * Fehlt der Emission_Factor für die Transport_Mode im Katalog, ist
 * `emissionFactor` null; der Primärfall ist ein vollständiger Katalog.
 */
export interface RouteBreakdownEntry {
  role: SegmentRole;
  fromLabel: string;
  toLabel: string;
  mode: TransportMode;
  distanceKm: number;
  emissionFactor: number | null;
  unit: typeof emissionFactorUnit;
  /** CO2-Beitrag dieses Segments in g CO2e; null, wenn Gewicht oder Faktor fehlt. */
  co2ContributionGrams: number | null;
}

/** Lesbare Bezeichnung der Rolle eines Route_Segment. */
const ROLE_LABELS: Record<SegmentRole, string> = {
  Aufgabe: 'Aufgabe',
  EingangsZentrum: 'Eingangszentrum',
  Hauptlauf: 'Hauptlauf',
  AusgangsZentrum: 'Ausgangszentrum',
  Zustellung: 'Zustellung',
};

/** Liefert die lesbare Bezeichnung einer Rolle. */
export function roleLabel(role: SegmentRole): string {
  return ROLE_LABELS[role];
}

/**
 * Bildet eine Region- oder Center-ID auf einen lesbaren Namen ab. Zuerst wird
 * eine Region gesucht (z. B. Aufgabe-/Zustellort), dann ein Parcel_Center
 * (Hauptlauf-Knoten); als Rückfall dient die ID selbst.
 */
function labelForId(id: string): string {
  return (
    findRegionById(id)?.name ?? findCenterById(id)?.name ?? id
  );
}

/**
 * Erzeugt die Route-Aufschlüsselung einer Transport_Route (Requirement 6.1):
 * je Route_Segment ein {@link RouteBreakdownEntry} mit Zwischenstationen, Rolle,
 * Transport_Mode, Distanz in km und angewandtem Emission_Factor samt Masseinheit.
 * Ist `weightGrams` gesetzt, wird je Segment der CO2-Beitrag mit derselben
 * Einheitenumrechnung wie in `computeCo2Grams` berechnet (Gramm → Tonnen). Reine
 * Funktion ohne Seiteneffekte; die Reihenfolge entspricht der Segmentreihenfolge.
 */
export function buildRouteBreakdown(
  route: TransportRoute,
  catalog: EmissionFactorCatalog = emissionFactorCatalog,
  weightGrams?: number,
): RouteBreakdownEntry[] {
  return route.segments.map((segment) => {
    const emissionFactor = findEmissionFactor(segment.mode, catalog) ?? null;
    const co2ContributionGrams =
      weightGrams !== undefined && emissionFactor !== null
        ? ((weightGrams / 1000) * segment.distanceKm * emissionFactor) / 1000
        : null;
    return {
      role: segment.role,
      fromLabel: labelForId(segment.fromId),
      toLabel: labelForId(segment.toId),
      mode: segment.mode,
      distanceKm: segment.distanceKm,
      emissionFactor,
      unit: emissionFactorUnit,
      co2ContributionGrams,
    };
  });
}
