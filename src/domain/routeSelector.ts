// RouteSelector: ermittelt die Transport_Route gemäss Service_Level-Regeln.
// Umsetzung gemäss Design-Abschnitt "RouteSelector" (Auswahlregeln) sowie den
// Correctness Properties 1–5 (swiss-post-co2-footprint).
// Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6.

import { computeCo2Grams } from './co2Calculator';
import type {
  EmissionFactorCatalog,
  RegionId,
  RouteSegment,
  ServiceLevel,
  TransportMode,
  TransportRoute,
} from './types';
import {
  findRegionById,
  routeNetwork as defaultNetwork,
  type NetworkLink,
  type RouteNetwork,
} from '../data/routeNetwork';

/** Transport_Mode der Kurier-Direktfahrt (Requirement 3.4). */
const COURIER_MODE: TransportMode = 'Car';

/**
 * Ein Schritt im Hauptlauf in Durchlaufrichtung: der genutzte NetworkLink
 * plus die konkrete Von/Nach-Orientierung (unabhaengig von link.a/link.b).
 */
interface DirectedStep {
  link: NetworkLink;
  from: string;
  to: string;
}

/**
 * Ermittelt die Transport_Route zwischen Origin und Destination gemäss dem
 * gewählten Service_Level und liefert letztlich die Route mit der geringsten
 * CO2-Gesamtemission (Requirement 3.1). Liefert `null`, wenn das Route_Network
 * keine Verbindung zwischen Origin und Destination enthält (Requirement 3.7).
 *
 * - Kurier: ein einziges Car-Segment direkt Origin→Destination (Requirement 3.4).
 * - Priority: bevorzugt die geringste Hauptlauf-Gesamtdistanz (Requirement 3.5).
 * - Economy: bevorzugt Rail im Hauptlauf, wenn das Netz Rail bietet (Requirement 3.6).
 */
export function selectRoute(
  serviceLevel: ServiceLevel,
  origin: RegionId,
  destination: RegionId,
  network: RouteNetwork = defaultNetwork,
  catalog: EmissionFactorCatalog,
): TransportRoute | null {
  const originRegion = findRegionById(origin, network);
  const destinationRegion = findRegionById(destination, network);
  if (!originRegion || !destinationRegion) {
    return null;
  }

  const entryCenter = originRegion.centerId;
  const exitCenter = destinationRegion.centerId;

  // Alle zyklenfreien Zentren-Pfade zwischen Eingangs- und Ausgangs-Zentrum.
  // Ohne Pfad existiert keine Verbindung (Requirement 3.7).
  const centerPaths = findAcyclicCenterPaths(entryCenter, exitCenter, network);
  if (centerPaths.length === 0) {
    return null;
  }

  if (serviceLevel === 'Kurier') {
    return buildCourierRoute(origin, destination, originRegion, destinationRegion, centerPaths);
  }

  // Economy/Priority: Aufgabe → Hauptlauf → Zustellung.
  const candidates = buildMainRunCandidates(
    origin,
    destination,
    originRegion,
    destinationRegion,
    centerPaths,
    serviceLevel,
  );

  return pickLowestCo2(candidates, catalog);
}

/**
 * Kurier-Direktfahrt: ein einziges Car-Segment direkt von der Origin-Region zur
 * Destination-Region (Requirement 3.4). Die Distanz ist ein deterministischer
 * geografischer Proxy aus den gemockten Netzdistanzen: Zugang Origin + kürzeste
 * Hauptlauf-Gesamtdistanz zwischen den Zentren + Zugang Destination. So bleibt
 * die Distanz stets > 0 (Property 3), auch wenn beide Regionen demselben Zentrum
 * zugeordnet sind.
 */
function buildCourierRoute(
  origin: RegionId,
  destination: RegionId,
  originRegion: { accessDistanceKm: number },
  destinationRegion: { accessDistanceKm: number },
  centerPaths: DirectedStep[][],
): TransportRoute {
  const shortestMainRunKm = Math.min(
    ...centerPaths.map((path) =>
      path.reduce((sum, step) => sum + step.link.distanceKm, 0),
    ),
  );
  const distanceKm =
    originRegion.accessDistanceKm + shortestMainRunKm + destinationRegion.accessDistanceKm;

  const segment: RouteSegment = {
    role: 'Aufgabe',
    fromId: origin,
    toId: destination,
    distanceKm,
    mode: COURIER_MODE,
  };
  return { segments: [segment] };
}

/**
 * Baut alle vollständigen Economy/Priority-Kandidatenrouten:
 * Aufgabe (Region → Eingangs-Zentrum) + Hauptlauf (je Link eine Transport_Mode)
 * + Zustellung (Ausgangs-Zentrum → Region). Die Service_Level-Regeln steuern,
 * welche Hauptlauf-Kandidaten gebildet werden (Priority: geringste Distanz;
 * Economy: Rail bevorzugen).
 */
function buildMainRunCandidates(
  origin: RegionId,
  destination: RegionId,
  originRegion: { centerId: string; accessDistanceKm: number; accessMode: TransportMode },
  destinationRegion: { centerId: string; accessDistanceKm: number; accessMode: TransportMode },
  centerPaths: DirectedStep[][],
  serviceLevel: ServiceLevel,
): TransportRoute[] {
  const pickupSegment: RouteSegment = {
    role: 'Aufgabe',
    fromId: origin,
    toId: originRegion.centerId,
    distanceKm: originRegion.accessDistanceKm,
    mode: originRegion.accessMode,
  };
  const deliverySegment: RouteSegment = {
    role: 'Zustellung',
    fromId: destinationRegion.centerId,
    toId: destination,
    distanceKm: destinationRegion.accessDistanceKm,
    mode: destinationRegion.accessMode,
  };

  // Priority: nur Pfade mit der geringsten Hauptlauf-Gesamtdistanz zulassen
  // (Requirement 3.5).
  const consideredPaths =
    serviceLevel === 'Priority'
      ? filterShortestMainRunPaths(centerPaths)
      : centerPaths;

  const routes: TransportRoute[] = [];
  for (const path of consideredPaths) {
    // Gleiches Eingangs-/Ausgangs-Zentrum: kein Hauptlauf-Segment.
    if (path.length === 0) {
      routes.push({ segments: [pickupSegment, deliverySegment] });
      continue;
    }

    const mainRunCombinations = expandMainRunModes(path, serviceLevel);
    for (const mainRunSegments of mainRunCombinations) {
      routes.push({
        segments: [pickupSegment, ...mainRunSegments, deliverySegment],
      });
    }
  }
  return routes;
}

/**
 * Expandiert einen Zentren-Pfad in konkrete Hauptlauf-Segmentfolgen, indem je
 * Link eine verfügbare Transport_Mode gewählt wird (kartesisches Produkt).
 * Für Economy wird Rail bevorzugt: bietet ein Link Rail an, wird für diesen Link
 * nur Rail betrachtet (Requirement 3.6).
 */
function expandMainRunModes(
  path: DirectedStep[],
  serviceLevel: ServiceLevel,
): RouteSegment[][] {
  let combinations: RouteSegment[][] = [[]];

  for (const step of path) {
    const modes = modesForLink(step.link, serviceLevel);
    const next: RouteSegment[][] = [];
    for (const partial of combinations) {
      for (const mode of modes) {
        next.push([
          ...partial,
          {
            role: 'Hauptlauf',
            // Orientierung in Durchlaufrichtung, nicht link.a/link.b.
            fromId: step.from,
            toId: step.to,
            distanceKm: step.link.distanceKm,
            mode,
          },
        ]);
      }
    }
    combinations = next;
  }
  return combinations;
}

/**
 * Liefert die fuer einen Link zu betrachtenden Transport_Mode-Werte je
 * Service_Level. Economy bevorzugt Rail (Requirement 3.6), Priority bevorzugt
 * die Strasse (Lkw, Requirement 3.5); so divergieren die beiden Service_Level
 * strukturell. Bietet der Link die bevorzugte Mode nicht an, stehen alle
 * verfuegbaren Modi zur Auswahl.
 */
function modesForLink(link: NetworkLink, serviceLevel: ServiceLevel): TransportMode[] {
  if (serviceLevel === 'Economy' && link.modes.includes('Rail')) {
    return ['Rail'];
  }
  if (serviceLevel === 'Priority' && link.modes.includes('Lkw')) {
    return ['Lkw'];
  }
  return link.modes;
}

/** Behält nur Pfade mit minimaler Hauptlauf-Gesamtdistanz (Requirement 3.5). */
function filterShortestMainRunPaths(paths: DirectedStep[][]): DirectedStep[][] {
  const totalKm = (path: DirectedStep[]): number =>
    path.reduce((sum, step) => sum + step.link.distanceKm, 0);
  const minKm = Math.min(...paths.map(totalKm));
  return paths.filter((path) => totalKm(path) === minKm);
}

/**
 * Wählt unter den Kandidatenrouten jene mit der geringsten CO2-Gesamtemission
 * (Requirement 3.1). Liefert `null` bei leerer Kandidatenliste.
 */
function pickLowestCo2(
  candidates: TransportRoute[],
  catalog: EmissionFactorCatalog,
): TransportRoute | null {
  let best: TransportRoute | null = null;
  let bestCo2 = Number.POSITIVE_INFINITY;
  for (const candidate of candidates) {
    const co2 = computeCo2Grams(1, candidate, catalog);
    if (co2 < bestCo2) {
      bestCo2 = co2;
      best = candidate;
    }
  }
  return best;
}

/**
 * Erschöpfende, zyklenfreie Pfadsuche (DFS) im Parcel_Center-Netz zwischen
 * Start- und Ziel-Zentrum. Liefert jede Verbindung als geordnete Liste der
 * genutzten NetworkLink-Elemente. Für identisches Start-/Ziel-Zentrum ist der
 * leere Pfad die einzige Lösung (kein Hauptlauf). Keine Lösung bedeutet keine
 * Verbindung (Requirement 3.7). Das Netz ist klein genug, dass eine einfache
 * erschöpfende Suche genügt (Design-Begründung Simplicity).
 */
function findAcyclicCenterPaths(
  start: string,
  goal: string,
  network: RouteNetwork,
): DirectedStep[][] {
  if (start === goal) {
    return [[]];
  }

  const results: DirectedStep[][] = [];
  const visited = new Set<string>([start]);

  // Nachbarn in Durchlaufrichtung: `to` ist das jeweils andere Center-Ende.
  const neighbours = (center: string): DirectedStep[] =>
    network.links
      .filter((link) => link.a === center || link.b === center)
      .map((link) => ({ link, from: center, to: link.a === center ? link.b : link.a }));

  const dfs = (current: string, pathSteps: DirectedStep[]): void => {
    if (current === goal) {
      results.push([...pathSteps]);
      return;
    }
    for (const step of neighbours(current)) {
      if (visited.has(step.to)) {
        continue;
      }
      visited.add(step.to);
      pathSteps.push(step);
      dfs(step.to, pathSteps);
      pathSteps.pop();
      visited.delete(step.to);
    }
  };

  dfs(start, []);
  return results;
}
