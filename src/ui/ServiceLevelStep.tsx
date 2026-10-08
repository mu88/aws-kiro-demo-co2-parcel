// ServiceLevelStep: Erster Schritt des geführten Ablaufs (Requirement 1).
// Zeigt genau drei Service_Level-Optionen (Economy, Priority, Kurier) ohne
// Vorauswahl an (Requirement 1.1). Rein darstellend: Der gewählte Wert und die
// Validierungsmeldung kommen über Props; die Zustandshaltung (Service_Level und
// Shipment_Attribute-Werte) liegt im Wizard (siehe ui/wizardState.ts), sodass
// eingegebene Werte beim Wechsel erhalten bleiben (Requirements 1.3, 1.4).

import FormField from '@cloudscape-design/components/form-field';
import Tiles from '@cloudscape-design/components/tiles';
import type { ServiceLevel } from '../domain/types';

/**
 * Die drei auswählbaren Service_Level-Optionen mit Beschreibung.
 * Reihenfolge und Bezeichnungen gemäss Requirement 1.1.
 */
const SERVICE_LEVEL_OPTIONS: ReadonlyArray<{
  value: ServiceLevel;
  label: string;
  description: string;
}> = [
  {
    value: 'Economy',
    label: 'Economy',
    description: 'PostPac Economy – bevorzugt die Bahn im Hauptlauf.',
  },
  {
    value: 'Priority',
    label: 'Priority',
    description: 'PostPac Priority – kürzeste Distanz zwischen den Paketzentren.',
  },
  {
    value: 'Kurier',
    label: 'Kurier',
    description: 'Pkw-Direktfahrt zwischen Herkunfts- und Zielgebiet.',
  },
];

export interface ServiceLevelStepProps {
  /** Aktuell gewählter Service_Level; `null` bedeutet keine Vorauswahl (Req 1.1). */
  serviceLevel: ServiceLevel | null;
  /** Callback bei Auswahl eines Service_Level. */
  onServiceLevelChange: (serviceLevel: ServiceLevel) => void;
  /**
   * Validierungsmeldung, wenn ohne Auswahl fortgefahren werden soll (Req 1.4).
   * Der Wizard besitzt das "Weiter"-Gate und reicht die Meldung hier herein.
   */
  validationMessage?: string;
}

/**
 * Darstellender Schritt zur Service_Level-Auswahl.
 *
 * Hinweis zu Requirement 1.2: In diesem Prototyp verwenden alle drei
 * Service_Level dieselben Shipment_Attribute-Eingaben (Gewicht, Origin,
 * Destination). Deshalb ist hier kein service-level-abhängiges Ein-/Ausblenden
 * von Eingaben nötig; die Detaileingaben liegen im PackageDetailsStep.
 */
export default function ServiceLevelStep({
  serviceLevel,
  onServiceLevelChange,
  validationMessage,
}: ServiceLevelStepProps) {
  return (
    <FormField
      label="Service-Level"
      description="Wählen Sie die Versandstufe für Ihr Paket."
      errorText={validationMessage}
    >
      <Tiles
        // Leerer String steht für "keine Vorauswahl" (Requirement 1.1).
        value={serviceLevel ?? ''}
        onChange={({ detail }) =>
          onServiceLevelChange(detail.value as ServiceLevel)
        }
        items={SERVICE_LEVEL_OPTIONS.map((option) => ({
          label: option.label,
          value: option.value,
          description: option.description,
        }))}
      />
    </FormField>
  );
}
