// ServiceLevelComparison: Vergleichsansicht, die für dasselbe Paket den
// CO2_Estimate und den (gemockten) Preis je Service_Level (Economy, Priority,
// Kurier) nebeneinander zeigt. Umsetzung als Cloudscape `Cards`: jede Karte ist
// in sich abgeschlossen, sodass der Hinzufügen-Button zuverlässig auf einer
// eigenen Zeile steht (kein zeichenweiser Umbruch wie in einer schmalen
// Tabellenspalte). Das günstigste Service_Level wird hervorgehoben.

import Badge from '@cloudscape-design/components/badge';
import Box from '@cloudscape-design/components/box';
import Button from '@cloudscape-design/components/button';
import Cards from '@cloudscape-design/components/cards';
import SpaceBetween from '@cloudscape-design/components/space-between';

import { compareServiceLevels } from '../domain/serviceLevelComparison';
import type { ServiceLevelComparisonRow } from '../domain/serviceLevelComparison';
import { buildRouteBreakdown } from '../domain/routeBreakdown';
import { formatPriceChf, priceForPackage } from '../domain/pricing';
import type { Package, ServiceLevel, ShipmentAttributes } from '../domain/types';

export interface ServiceLevelComparisonProps {
  /** Shipment_Attribute-Satz, für den alle Service_Level verglichen werden. */
  attributes: ShipmentAttributes;
  /** Übernimmt das gewählte Service_Level als Package in die Sitzungsliste. */
  onAddPackage: (pkg: Package) => void;
  /** Aktuell für die Routendetails ausgewähltes Service_Level (Karten-Auswahl). */
  selectedServiceLevel: ServiceLevel;
  /** Meldet die Auswahl eines Service_Level per Karten-Klick nach aussen. */
  onSelectServiceLevel: (serviceLevel: ServiceLevel) => void;
}

/** Kurzbeschreibung einer Transport_Route (Mode + Distanz je Segment). */
function routeSummary(row: ServiceLevelComparisonRow): string {
  if (row.result.kind !== 'ok') {
    return '–';
  }
  return buildRouteBreakdown(row.result.route)
    .map((entry) => `${entry.mode} ${entry.distanceKm} km`)
    .join(' → ');
}

/** Anzeigetext des CO2_Estimate oder der Fehlermeldung je Zeile. */
function co2Text(row: ServiceLevelComparisonRow): string {
  switch (row.result.kind) {
    case 'ok':
      return `${row.result.co2EstimateGrams} g CO2e`;
    case 'no-route':
      return 'Keine Route verfügbar';
    case 'missing-factor':
      return `Kein Faktor für ${row.result.mode}`;
  }
}

/** Lesbarer Service_Level-Name inklusive Post-Angebotsbezug. */
function serviceLevelLabel(serviceLevel: ServiceLevel): string {
  switch (serviceLevel) {
    case 'Economy':
      return 'Economy (PostPac Economy)';
    case 'Priority':
      return 'Priority (PostPac Priority)';
    case 'Kurier':
      return 'Kurier';
  }
}

export default function ServiceLevelComparison({
  attributes,
  onAddPackage,
  selectedServiceLevel,
  onSelectServiceLevel,
}: ServiceLevelComparisonProps) {
  const rows = compareServiceLevels(attributes);
  const selectedRow = rows.find((row) => row.serviceLevel === selectedServiceLevel);

  function handleAdd(row: ServiceLevelComparisonRow): void {
    if (row.result.kind !== 'ok') {
      return;
    }
    const pkg: Package = {
      id: crypto.randomUUID(),
      serviceLevel: row.serviceLevel,
      attributes,
      route: row.result.route,
      co2EstimateGrams: row.result.co2EstimateGrams,
    };
    onAddPackage(pkg);
  }

  return (
    <Cards<ServiceLevelComparisonRow>
      items={rows}
      trackBy={(row) => row.serviceLevel}
      cardsPerRow={[{ cards: 1 }, { minWidth: 700, cards: 3 }]}
      selectionType="single"
      selectedItems={selectedRow ? [selectedRow] : []}
      onSelectionChange={({ detail }) => {
        const picked = detail.selectedItems[0];
        if (picked) {
          onSelectServiceLevel(picked.serviceLevel);
        }
      }}
      ariaLabels={{
        selectionGroupLabel: 'Service-Level auswählen',
        itemSelectionLabel: (_sel, row) => serviceLevelLabel(row.serviceLevel),
      }}
      cardDefinition={{
        header: (row) => (
          <SpaceBetween size="xs" direction="horizontal">
            <span>{serviceLevelLabel(row.serviceLevel)}</span>
            {row.isLowest && <Badge color="green">Geringster CO2</Badge>}
          </SpaceBetween>
        ),
        sections: [
          {
            id: 'co2',
            header: 'CO2-Schätzung',
            content: (row) =>
              row.isLowest ? (
                <Box fontWeight="bold">{co2Text(row)}</Box>
              ) : (
                co2Text(row)
              ),
          },
          {
            id: 'price',
            header: 'Preis (gemockt)',
            content: (row) => {
              const price = priceForPackage(row.serviceLevel, attributes.weightGrams);
              return price === null ? '–' : formatPriceChf(price);
            },
          },
          {
            id: 'route',
            header: 'Transportroute',
            content: (row) => routeSummary(row),
          },
          {
            id: 'action',
            content: (row) => (
              <Button
                variant={row.isLowest ? 'primary' : 'normal'}
                disabled={row.result.kind !== 'ok'}
                onClick={() => handleAdd(row)}
              >
                Hinzufügen
              </Button>
            ),
          },
        ],
      }}
    />
  );
}
