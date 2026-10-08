// SessionList: Darstellende Komponente der Sitzungsliste. Zeigt je Package
// seinen Service_Level, seine Shipment_Attribute-Werte (Gewicht in g, Origin,
// Destination), seine Transport_Route (kompakte Segment-Aufschlüsselung) und
// seinen CO2_Estimate in g CO2e an und bietet je Zeile "Entfernen" an.
// Umsetzung gemäss Design-Tabelle "SessionList" (swiss-post-co2-footprint).
// Requirements: 5.3, 5.5.

import Box from '@cloudscape-design/components/box';
import Button from '@cloudscape-design/components/button';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import SpaceBetween from '@cloudscape-design/components/space-between';

import { buildRouteBreakdown } from '../domain/routeBreakdown';
import { regions } from '../data/routeNetwork';
import type { Package, RegionId } from '../domain/types';

export interface SessionListProps {
  /** Aktuelle Package-Elemente der Sitzung. */
  packages: Package[];
  /** Callback zum Entfernen eines Package anhand seiner id (Req 5.5). */
  onRemove: (id: string) => void;
}

/** Abbildung Region-ID → Anzeigename gemäss Route_Network. */
const REGION_NAMES: Record<RegionId, string> = Object.fromEntries(
  regions.map((region) => [region.id, region.name]),
);

/** Liefert den Anzeigenamen einer Region, ersatzweise die ID. */
function regionName(id: RegionId): string {
  return REGION_NAMES[id] ?? id;
}

/**
 * Kompakte Darstellung der Transport_Route: je Segment Transport_Mode und
 * Distanz in km, über die Segmentreihenfolge verkettet (Req 5.3).
 */
function routeSummary(pkg: Package): string {
  return buildRouteBreakdown(pkg.route)
    .map((entry) => `${entry.mode} ${entry.distanceKm} km`)
    .join(' → ');
}

/**
 * Darstellende Sitzungsliste. Bei leerer Liste wird ein Hinweis angezeigt; der
 * Total_Footprint wird separat über die Komponente TotalFootprint dargestellt.
 */
export default function SessionList({
  packages,
  onRemove,
}: SessionListProps): React.JSX.Element {
  return (
    <Container header={<Header variant="h2">Sitzungsliste</Header>}>
      {packages.length === 0 ? (
        <Box color="text-body-secondary">Noch keine Pakete hinzugefügt.</Box>
      ) : (
        <SpaceBetween size="m">
          {packages.map((pkg) => (
            <Container
              key={pkg.id}
              header={
                <Header
                  variant="h3"
                  actions={
                    <Button onClick={() => onRemove(pkg.id)}>Entfernen</Button>
                  }
                >
                  {pkg.serviceLevel}
                </Header>
              }
            >
              <SpaceBetween size="xs">
                <Box>
                  <Box variant="awsui-key-label">Gewicht</Box>
                  {pkg.attributes.weightGrams} g
                </Box>
                <Box>
                  <Box variant="awsui-key-label">Herkunft → Ziel</Box>
                  {regionName(pkg.attributes.origin)} →{' '}
                  {regionName(pkg.attributes.destination)}
                </Box>
                <Box>
                  <Box variant="awsui-key-label">Transport_Route</Box>
                  {routeSummary(pkg)}
                </Box>
                <Box>
                  <Box variant="awsui-key-label">CO2_Estimate</Box>
                  {pkg.co2EstimateGrams} g CO2e
                </Box>
              </SpaceBetween>
            </Container>
          ))}
        </SpaceBetween>
      )}
    </Container>
  );
}
