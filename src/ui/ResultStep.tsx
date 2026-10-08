// ResultStep: Dritter Schritt des geführten Ablaufs. Zeigt für denselben
// Shipment_Attribute-Satz den CO2_Estimate und (gemockten) Preis je
// Service_Level (Economy, Priority, Kurier) als Vergleichs-Karten. Ein Klick auf
// eine Karte wählt dieses Service_Level aus und aktualisiert die Routendetails
// darunter. Je Karte kann das zugehörige Package in die Sitzungsliste
// übernommen werden. Umsetzung gemäss Design-Tabelle "ResultStep" und Abschnitt
// "Error Handling" (swiss-post-co2-footprint).
// Requirements: 3.7, 4.1, 4.3, 4.4, 6.1, 6.4; Vergleich: Service-Level umschalten.

import { useState } from 'react';
import Alert from '@cloudscape-design/components/alert';
import Box from '@cloudscape-design/components/box';
import Header from '@cloudscape-design/components/header';
import SpaceBetween from '@cloudscape-design/components/space-between';
import RouteBreakdown from './RouteBreakdown';
import RouteMap from './RouteMap';
import AssumptionsNote from './AssumptionsNote';
import ServiceLevelComparison from './ServiceLevelComparison';
import { estimate } from '../domain/estimationEngine';
import { emissionFactorCatalog } from '../data/emissionFactors';
import { routeNetwork } from '../data/routeNetwork';
import { formatPriceChf, priceForPackage } from '../domain/pricing';
import type {
  Package,
  ServiceLevel,
  ShipmentAttributes,
} from '../domain/types';

export interface ResultStepProps {
  /** Im Wizard gewähltes Service_Level; initial für die Detailansicht verwendet. */
  serviceLevel: ServiceLevel;
  /** Validierte Shipment_Attribute-Werte aus dem vorherigen Schritt. */
  attributes: ShipmentAttributes;
  /** Callback zum Hinzufügen eines berechneten Package zur Sitzungsliste (Req 4.1). */
  onAddPackage: (pkg: Package) => void;
}

/**
 * Zeigt den Service-Level-Vergleich für die aktuelle Eingabe sowie die
 * Detail-Route des aktuell ausgewählten Service_Level an. Die Auswahl folgt dem
 * Klick auf eine Vergleichs-Karte; Startwert ist das im Wizard gewählte Level.
 */
export default function ResultStep({
  serviceLevel,
  attributes,
  onAddPackage,
}: ResultStepProps): React.JSX.Element {
  // Für die Routendetails ausgewähltes Service_Level (per Karten-Klick änderbar).
  const [detailServiceLevel, setDetailServiceLevel] =
    useState<ServiceLevel>(serviceLevel);

  const selectedResult = estimate(
    detailServiceLevel,
    attributes,
    routeNetwork,
    emissionFactorCatalog,
  );

  // Gemockter Preis des ausgewählten Service_Level für das Paketgewicht.
  const selectedPrice = priceForPackage(detailServiceLevel, attributes.weightGrams);
  const priceLabel = selectedPrice === null ? '-' : formatPriceChf(selectedPrice);

  return (
    <SpaceBetween size="l">
      <Box variant="h3">Service-Level im Vergleich</Box>
      <Box color="text-body-secondary" fontSize="body-s">
        Gleiches Paket, alle Service-Level gegenübergestellt. Das günstigste ist
        hervorgehoben. Klicken Sie eine Karte an, um die Routendetails unten zu
        sehen, oder fügen Sie ein Service-Level direkt hinzu.
      </Box>
      <ServiceLevelComparison
        attributes={attributes}
        onAddPackage={onAddPackage}
        selectedServiceLevel={detailServiceLevel}
        onSelectServiceLevel={setDetailServiceLevel}
      />

      {/* Detailaufschlüsselung des aktuell ausgewählten Service_Level. */}
      <Header variant="h3">Routendetails: {detailServiceLevel}</Header>
      <Box color="text-body-secondary" fontSize="body-s">
        Paketgewicht: {attributes.weightGrams} g | Herkunft: {attributes.origin} | Ziel: {attributes.destination}
      </Box>
      {selectedResult.kind === 'no-route' && (
        <Alert type="warning" header="Keine Route verfügbar">
          Für diese Kombination aus Herkunfts- und Zielgebiet ist im Route-Network
          keine Verbindung verfügbar. Bitte passen Sie Herkunft oder Ziel an.
        </Alert>
      )}
      {selectedResult.kind === 'missing-factor' && (
        <Alert type="warning" header="Keine Schätzung verfügbar">
          Für die Transportart {selectedResult.mode} ist kein Emissionsfaktor
          hinterlegt; es kann keine Schätzung berechnet werden.
        </Alert>
      )}
      {selectedResult.kind === 'ok' && (
        <>
          <RouteBreakdown route={selectedResult.route} catalog={emissionFactorCatalog} weightGrams={attributes.weightGrams} />
          <RouteMap route={selectedResult.route} />
          <div>
            <Box variant="awsui-key-label">Geschätzter CO2-Fussabdruck</Box>
            <Box variant="h2">{selectedResult.co2EstimateGrams} g CO2e</Box>
          </div>
          <div>
            <Box variant="awsui-key-label">Preis (gemockt)</Box>
            <Box variant="h2">{priceLabel}</Box>
          </div>
        </>
      )}

      {/* Prototyp-/Datenherkunft-Hinweis bei jedem CO2_Estimate (Req 6.2, 6.3). */}
      <AssumptionsNote />
    </SpaceBetween>
  );
}
