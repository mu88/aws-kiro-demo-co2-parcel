import { useCallback, useState } from 'react';
import AppLayout from '@cloudscape-design/components/app-layout';
import ContentLayout from '@cloudscape-design/components/content-layout';
import Container from '@cloudscape-design/components/container';
import Flashbar, {
  type FlashbarProps,
} from '@cloudscape-design/components/flashbar';
import Header from '@cloudscape-design/components/header';
import SpaceBetween from '@cloudscape-design/components/space-between';

import BrandHeader from './ui/BrandHeader';
import GuidedWizard from './ui/GuidedWizard';
import SessionList from './ui/SessionList';
import TotalFootprint from './ui/TotalFootprint';
import {
  addPackage as addPackageToList,
  removePackage as removePackageFromList,
} from './domain/sessionList';
import type { Package } from './domain/types';

/**
 * App-Grundgerüst für den Prototyp. Hält die Package-Sitzungsliste im
 * In-Memory-React-State und verdrahtet den geführten Ablauf (GuidedWizard) mit
 * der Sitzungsansicht (SessionList, TotalFootprint). Oben steht ein dezentes
 * Post-Branding (BrandHeader). Die add/remove-Handler delegieren an die reinen
 * Funktionen aus `domain/sessionList` (Requirement 5).
 */
export default function App() {
  const [packages, setPackages] = useState<Package[]>([]);
  // Hinweis bei erreichter Höchstzahl (Requirement 5.2). `null`, solange keine
  // Meldung ansteht.
  const [maxReached, setMaxReached] = useState(false);

  // Package über die reine Funktion sessionList.addPackage anhängen; erzwingt
  // die Höchstzahl von 50 (Requirement 5.1/5.2). Gibt zurück, ob aufgenommen
  // wurde, damit der ResultStep-Button entsprechend reagieren kann.
  const addPackage = useCallback((pkg: Package): { added: boolean } => {
    let added = false;
    setPackages((current) => {
      const result = addPackageToList(current, pkg);
      added = result.added;
      return result.list;
    });
    setMaxReached(!added);
    return { added };
  }, []);

  // Package anhand seiner id über sessionList.removePackage entfernen; der
  // Total_Footprint wird in TotalFootprint aus der Liste neu abgeleitet (Req 5.5).
  const removePackage = useCallback((id: string) => {
    setPackages((current) => removePackageFromList(current, id));
    setMaxReached(false);
  }, []);

  const flashItems: FlashbarProps.MessageDefinition[] = maxReached
    ? [
        {
          type: 'warning',
          header: 'Höchstzahl erreicht',
          content:
            'Die Sitzungsliste enthält bereits 50 Pakete. Das Hinzufügen weiterer ' +
            'Pakete ist nicht möglich.',
          dismissible: true,
          onDismiss: () => setMaxReached(false),
          id: 'max-packages',
        },
      ]
    : [];

  return (
    <>
      <BrandHeader />
      <AppLayout
        navigationHide
        toolsHide
        content={
          <ContentLayout
            header={
              <Header variant="h1" description="Prototyp – indikative, gemockte Werte">
                CO2-Fussabdruck Paketversand
              </Header>
            }
          >
            <SpaceBetween size="l">
              {flashItems.length > 0 && <Flashbar items={flashItems} />}

              <Container header={<Header variant="h2">Schätzung erstellen</Header>}>
                <GuidedWizard onAddPackage={addPackage} />
              </Container>

              <SessionList packages={packages} onRemove={removePackage} />
              <TotalFootprint packages={packages} />
            </SpaceBetween>
          </ContentLayout>
        }
      />
    </>
  );
}
