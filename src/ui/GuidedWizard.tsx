// GuidedWizard: geführter Dreischritt-Ablauf auf Basis der Cloudscape
// `Wizard`-Komponente. Umsetzung gemäss Design-Abschnitt "GuidedWizard" und
// "Error Handling" (swiss-post-co2-footprint).
//
// Diese Komponente liefert das strukturelle Wizard-Verhalten und bindet die
// Schritt-Komponenten ein (Aufgabe 13.1):
//   - feste Dreischritt-Folge in fester Reihenfolge (Requirement 7.1),
//   - Schrittnummer, Gesamtzahl (3) und verbleibende Schritte (Requirement 7.2),
//   - Freigabe des Übergangs nur bei bestandener Validierung (Requirement 7.3),
//   - Blockieren mit Benennung der zu korrigierenden Eingaben (Requirement 7.4),
//   - Sperre der Navigation über den weitesten abgeschlossenen Schritt hinaus
//     (Requirement 7.6).
//
// Schritt 1 rendert ServiceLevelStep, Schritt 2 PackageDetailsStep und Schritt 3
// ResultStep. Für Schritt 3 werden die rohen Eingaben erneut über
// validateShipment zu normalisierten ShipmentAttributes verdichtet; da Schritt 3
// nur nach bestandener Validierung erreichbar ist, liegt dort stets ein gültiger
// Satz vor. Das Hinzufügen eines berechneten Package wird über die Prop
// `onAddPackage` an den Sitzungszustand in `App` gereicht.

import { useMemo, useState } from 'react';
import Wizard, { type WizardProps } from '@cloudscape-design/components/wizard';
import Alert from '@cloudscape-design/components/alert';
import SpaceBetween from '@cloudscape-design/components/space-between';
import TextContent from '@cloudscape-design/components/text-content';
import Box from '@cloudscape-design/components/box';

import type { Package, ServiceLevel } from '../domain/types';
import { validateShipment } from '../domain/inputValidator';
import { regions } from '../data/routeNetwork';
import ServiceLevelStep from './ServiceLevelStep';
import PackageDetailsStep from './PackageDetailsStep';
import ResultStep from './ResultStep';
import {
  TOTAL_STEPS,
  WizardStep,
  remainingSteps,
  useWizardState,
} from './wizardState';

/**
 * Gültige Region-IDs aus dem Route_Network. Dienen der Validierung in Schritt 2
 * (Felder-Gate) und der Ableitung der normalisierten Attribute für Schritt 3.
 */
const VALID_REGION_IDS = regions.map((region) => region.id);

/**
 * Lokalisierte Meldungstexte für die feldbezogenen ValidationError-Schlüssel
 * aus dem InputValidator (Requirement 7.4: zu korrigierende Felder benennen).
 */
const FIELD_MESSAGES: Record<string, string> = {
  'weight.required': 'Paketgewicht angeben (1 bis 30000 Gramm).',
  'weight.numeric': 'Paketgewicht muss ein numerischer Wert sein.',
  'weight.range': 'Paketgewicht muss zwischen 1 und 30000 Gramm liegen.',
  'origin.required': 'Herkunftsgebiet (Origin) wählen.',
  'origin.invalid': 'Gewähltes Herkunftsgebiet (Origin) ist ungültig.',
  'destination.required': 'Zielgebiet (Destination) wählen.',
  'destination.invalid': 'Gewähltes Zielgebiet (Destination) ist ungültig.',
};

/** Übersetzt einen ValidationError-Schlüssel in einen anzeigbaren Text. */
function messageForKey(key: string): string {
  return FIELD_MESSAGES[key] ?? key;
}

export interface GuidedWizardProps {
  /**
   * Übernimmt ein berechnetes Package in die Sitzungsliste (App). Gibt zurück,
   * ob das Package aufgenommen wurde (`false` bei erreichter Höchstzahl, Req 5.2).
   */
  onAddPackage: (pkg: Package) => { added: boolean };
}

export default function GuidedWizard({ onAddPackage }: GuidedWizardProps) {
  const wizard = useWizardState();
  const { state } = wizard;

  // Blockiermeldung des aktuellen Schritts (Requirement 7.4). `null`, solange
  // kein Übergang blockiert wurde.
  const [stepError, setStepError] = useState<string | null>(null);
  const remaining = remainingSteps(state);

  // Validierung der aktuellen Shipment_Attribute-Eingaben. Dient sowohl dem
  // Weiter-Gate (Req 7.3/7.4) als auch den feldbezogenen Inline-Meldungen in
  // Schritt 2 (Req 2.x). Rein, verändert keinen Zustand.
  const validation = useMemo(
    () => validateShipment(state.input, VALID_REGION_IDS),
    [state.input],
  );

  // i18n-Strings der Cloudscape-Wizard-Komponente. `stepNumberLabel` und
  // `collapsedStepsLabel` liefern Schrittnummer und Gesamtzahl nativ
  // (Requirement 7.2).
  const i18nStrings: WizardProps.I18nStrings = useMemo(
    () => ({
      stepNumberLabel: (stepNumber) => `Schritt ${stepNumber}`,
      collapsedStepsLabel: (stepNumber, stepsCount) =>
        `Schritt ${stepNumber} von ${stepsCount}`,
      navigationAriaLabel: 'Schritte',
      cancelButton: 'Abbrechen',
      previousButton: 'Zurück',
      nextButton: 'Weiter',
      optional: 'optional',
    }),
    [],
  );

  /**
   * Prüft, ob der Übergang vom aktuellen Schritt zum nächsten freigegeben ist.
   * Gibt bei blockiertem Übergang die zu korrigierende Meldung zurück, sonst
   * `null` (Requirements 7.3, 7.4). Verändert keinen Zustand.
   */
  function validateCurrentStep(): string | null {
    if (state.currentStep === WizardStep.ServiceLevel) {
      // Schritt 1: ein Service_Level muss gewählt sein (Requirement 1.4/7.4).
      if (state.serviceLevel === null) {
        return 'Bitte ein Service-Level wählen, bevor Sie fortfahren.';
      }
      return null;
    }

    if (state.currentStep === WizardStep.PackageDetails) {
      // Schritt 2: Shipment_Attribute über validateShipment prüfen
      // (Requirements 7.3, 7.4). Eingegebene Werte bleiben erhalten, da die
      // Validierung rein ist und den Zustand nicht verändert.
      if (!validation.valid) {
        const fields = validation.errors.map((error) =>
          messageForKey(error.messageKey),
        );
        return `Bitte korrigieren Sie folgende Eingaben: ${fields.join(' ')}`;
      }
      return null;
    }

    // Letzter Schritt: kein Vorwärts-Übergang.
    return null;
  }

  function handleNavigate(
    event: Parameters<NonNullable<WizardProps['onNavigate']>>[0],
  ) {
    const { requestedStepIndex, reason } = event.detail;

    if (reason === 'next') {
      // Übergang nur bei bestandener Validierung freigeben (Requirement 7.3);
      // sonst blockieren und zu korrigierende Felder benennen (Requirement 7.4).
      const error = validateCurrentStep();
      if (error !== null) {
        setStepError(error);
        return;
      }
      setStepError(null);
      wizard.completeStep();
      return;
    }

    if (reason === 'previous' || reason === 'step') {
      // Rückkehr/Sprung: goToStep blockiert jede Navigation über den weitesten
      // abgeschlossenen Schritt hinaus (Requirement 7.6) und lässt eingegebene
      // Werte unverändert (Requirement 7.5).
      setStepError(null);
      wizard.goToStep(requestedStepIndex);
      return;
    }

    // 'skip' tritt nicht auf, da keine optionalen Schritte definiert sind.
  }

  /**
   * Nimmt ein berechnetes Package über die App-Prop in die Sitzungsliste auf.
   * Bei erreichter Höchstzahl (Req 5.2) meldet App selbst. Im Vergleich kann die
   * Customer mehrere Service_Level hinzufügen, daher kein dauerhaftes Sperren.
   */
  function handleAddPackage(pkg: Package): void {
    onAddPackage(pkg);
  }

  // Schritt 3 wird nur nach bestandener Validierung erreicht; `validation` ist
  // dann gültig und liefert normalisierte Attribute (Req 2.7).
  const resultContent =
    state.serviceLevel !== null && validation.valid && validation.attributes ? (
      <ResultStep
        serviceLevel={state.serviceLevel}
        attributes={validation.attributes}
        onAddPackage={handleAddPackage}
      />
    ) : (
      <TextContent>
        <p>Bitte vervollständigen Sie zuerst die vorherigen Schritte.</p>
      </TextContent>
    );

  const steps: WizardProps.Step[] = [
    {
      title: 'Service-Level wählen',
      description: 'Wählen Sie die Versandstufe für Ihr Paket.',
      content: (
        <ServiceLevelStep
          serviceLevel={state.serviceLevel}
          onServiceLevelChange={(serviceLevel: ServiceLevel) => {
            setStepError(null);
            wizard.setServiceLevel(serviceLevel);
          }}
          {...(stepError !== null ? { validationMessage: stepError } : {})}
        />
      ),
    },
    {
      title: 'Paketdetails eingeben',
      description: 'Geben Sie Paketgewicht, Origin und Destination an.',
      content: (
        <PackageDetailsStep
          input={state.input}
          onFieldChange={(field, value) => {
            setStepError(null);
            wizard.setField(field, value);
          }}
          {...(stepError !== null ? { errors: validation.errors } : {})}
        />
      ),
    },
    {
      title: 'Transportroute und CO2-Schätzung ansehen',
      description: 'Ergebnis der Schätzung.',
      content: <SpaceBetween size="l">{resultContent}</SpaceBetween>,
    },
  ];

  return (
    <SpaceBetween size="m">
      {/* Zusätzliche Anzeige der verbleibenden Schritte (Requirement 7.2);
          Cloudscape zeigt "Schritt X von 3" bereits nativ an. */}
      <Box color="text-body-secondary" fontSize="body-s">
        Noch {remaining} von {TOTAL_STEPS - 1}{' '}
        {remaining === 1 ? 'verbleibender Schritt' : 'verbleibenden Schritten'}.
      </Box>

      {stepError !== null && (
        <Alert type="error" header="Übergang blockiert">
          {stepError}
        </Alert>
      )}

      <Wizard
        steps={steps}
        activeStepIndex={state.currentStep}
        onNavigate={handleNavigate}
        onSubmit={() => {
          // Abschluss des letzten Schritts; die Package-Übernahme in die
          // Sitzungsliste erfolgt über den "Package hinzufügen"-Button im
          // ResultStep (handleAddPackage → App).
          setStepError(null);
        }}
        submitButtonText="Abschliessen"
        i18nStrings={i18nStrings}
      />
    </SpaceBetween>
  );
}



