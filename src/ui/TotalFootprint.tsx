// TotalFootprint: Darstellende Komponente für den Total_Footprint. Zeigt die
// Summe aller CO2_Estimate-Werte der aktuellen Package-Elemente in g CO2e an;
// bei leerer Liste ist der Wert 0. Da der Wert aus der aktuellen Liste über
// computeTotalFootprint abgeleitet wird, erfolgt die Neuberechnung nach dem
// Entfernen automatisch. Umsetzung gemäss Design-Tabelle "TotalFootprint"
// (swiss-post-co2-footprint). Requirements: 5.4, 5.5, 5.6.

import Box from '@cloudscape-design/components/box';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';

import { computeTotalFootprint } from '../domain/sessionList';
import type { Package } from '../domain/types';

export interface TotalFootprintProps {
  /** Aktuelle Package-Elemente; die Summe wird daraus berechnet (Req 5.4, 5.6). */
  packages: Package[];
}

/**
 * Darstellende Komponente des Total_Footprint. Der angezeigte Wert ist die
 * Summe der CO2_Estimate-Werte der übergebenen Package-Elemente (0 bei leerer
 * Liste); er wird bei jeder Listenänderung neu abgeleitet (Req 5.5).
 */
export default function TotalFootprint({
  packages,
}: TotalFootprintProps): React.JSX.Element {
  const totalGrams = computeTotalFootprint(packages);

  return (
    <Container header={<Header variant="h2">Total_Footprint</Header>}>
      <Box variant="awsui-value-large">{totalGrams} g CO2e</Box>
    </Container>
  );
}
