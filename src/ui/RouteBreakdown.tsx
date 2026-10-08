// RouteBreakdown: zeigt die Transport_Route je Route_Segment auf. Nutzt die
// reine Funktion `buildRouteBreakdown`, um pro Segment die Transport_Mode, die
// Distanz in Kilometern und den angewandten Emission_Factor mit seiner
// Masseinheit (g CO2e/t·km) in einer Cloudscape `Table` darzustellen. Bei
// bekanntem Paketgewicht wird zusätzlich der CO2-Beitrag je Segment angezeigt.
// Umsetzung gemäss Design-Tabelle "RouteBreakdown" (swiss-post-co2-footprint).
// Requirements: 6.1, 6.4.

import Table from '@cloudscape-design/components/table';
import { buildRouteBreakdown, roleLabel } from '../domain/routeBreakdown';
import type { RouteBreakdownEntry } from '../domain/routeBreakdown';
import type { EmissionFactorCatalog, TransportRoute } from '../domain/types';

export interface RouteBreakdownProps {
  /** Die aufzuschlüsselnde Transport_Route. */
  route: TransportRoute;
  /** Optionaler Emission_Factor_Catalog; Standard ist der gemockte Katalog. */
  catalog?: EmissionFactorCatalog;
  /** Optionales Paketgewicht in Gramm; aktiviert die CO2-Beitragsspalte. */
  weightGrams?: number;
}

/** Formatiert den CO2-Beitrag eines Segments auf drei Nachkommastellen. */
function formatContribution(grams: number | null): string {
  if (grams === null) {
    return '–';
  }
  return `${grams.toFixed(3)} g CO2e`;
}

/**
 * Stellt die Route-Aufschlüsselung einer Transport_Route tabellarisch dar
 * (Requirement 6.1). Fehlt der Emission_Factor eines Segments im Katalog, wird
 * dies in der Faktor-Spalte ausgewiesen (Requirement 6.4). Ist `weightGrams`
 * gesetzt, zeigt eine zusätzliche Spalte den CO2-Beitrag je Segment.
 */
export default function RouteBreakdown({
  route,
  catalog,
  weightGrams,
}: RouteBreakdownProps): React.JSX.Element {
  const entries = buildRouteBreakdown(route, catalog, weightGrams);

  const columnDefinitions = [
    {
      id: 'section',
      header: 'Abschnitt',
      cell: (entry: RouteBreakdownEntry) => roleLabel(entry.role),
    },
    {
      id: 'route',
      header: 'Von → Nach',
      cell: (entry: RouteBreakdownEntry) => `${entry.fromLabel} → ${entry.toLabel}`,
    },
    {
      id: 'mode',
      header: 'Transportart',
      cell: (entry: RouteBreakdownEntry) => entry.mode,
    },
    {
      id: 'distance',
      header: 'Distanz',
      cell: (entry: RouteBreakdownEntry) => `${entry.distanceKm} km`,
    },
    {
      id: 'factor',
      header: 'Emissionsfaktor',
      cell: (entry: RouteBreakdownEntry) =>
        entry.emissionFactor === null
          ? 'nicht verfügbar'
          : `${entry.emissionFactor} ${entry.unit}`,
    },
  ];

  // CO2-Beitragsspalte nur anzeigen, wenn ein Gewicht bekannt ist.
  if (weightGrams !== undefined) {
    columnDefinitions.push({
      id: 'contribution',
      header: 'CO2-Beitrag',
      cell: (entry: RouteBreakdownEntry) =>
        formatContribution(entry.co2ContributionGrams),
    });
  }

  return (
    <Table<RouteBreakdownEntry>
      variant="embedded"
      items={entries}
      columnDefinitions={columnDefinitions}
    />
  );
}
