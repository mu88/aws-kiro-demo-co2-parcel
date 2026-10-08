// PackageDetailsStep: Schritt 2 des geführten Ablaufs. Erfasst Paketgewicht
// (in Gramm), Origin und Destination und zeigt feldbezogene Inline-
// Validierungsmeldungen über Cloudscape `FormField`-Fehlertexte an.
// Umsetzung gemäss Design-Tabelle "PackageDetailsStep" und Abschnitt
// "Error Handling" (swiss-post-co2-footprint).
// Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7.

import FormField from '@cloudscape-design/components/form-field';
import Input from '@cloudscape-design/components/input';
import Select from '@cloudscape-design/components/select';
import SpaceBetween from '@cloudscape-design/components/space-between';
import type { SelectProps } from '@cloudscape-design/components/select';

import type { ShipmentField } from './wizardState';
import type { ShipmentInput, ValidationError } from '../domain/types';
import { regions } from '../data/routeNetwork';

/**
 * Abbildung der messageKeys aus `validateShipment` auf deutsche, der Customer
 * angezeigte Meldungen (Design "Error Handling"). Nur die für diesen Schritt
 * relevanten Felder (Gewicht, Origin, Destination) sind enthalten.
 */
const MESSAGES: Record<string, string> = {
  'weight.required': 'Bitte ein Paketgewicht angeben.',
  'weight.numeric': 'Bitte einen numerischen Wert eingeben.',
  'weight.range': 'Zulässig sind 1 bis 30000 Gramm.',
  'origin.required': 'Bitte ein Herkunftsgebiet wählen.',
  'origin.invalid': 'Bitte ein gültiges Herkunftsgebiet wählen.',
  'destination.required': 'Bitte ein Zielgebiet wählen.',
  'destination.invalid': 'Bitte ein gültiges Zielgebiet wählen.',
};

/**
 * Select-Optionen für Origin und Destination: exakt die Route_Network-Regionen
 * (Label = Region-Name, Wert = Region-ID) gemäss Requirements 2.4 und 2.5.
 */
const regionOptions: SelectProps.Option[] = regions.map((region) => ({
  label: region.name,
  value: region.id,
}));

export interface PackageDetailsStepProps {
  /** Aktuelle, im Wizard-State gehaltene Shipment_Attribute-Eingaben (Req 2.7). */
  input: ShipmentInput;
  /** Callback für Feldänderungen; der Wizard-State bleibt Quelle der Wahrheit. */
  onFieldChange: (field: ShipmentField, value: ShipmentInput[ShipmentField]) => void;
  /** Vom Wizard-Gate übergebene Validierungsfehler (aus `validateShipment`). */
  errors?: ValidationError[];
}

/**
 * Liefert den deutschen Fehlertext für ein Feld oder `undefined`, wenn kein
 * Fehler vorliegt. Unbekannte messageKeys werden auf den Schlüssel selbst
 * zurückgefallen, damit keine Meldung verloren geht.
 */
function errorTextFor(
  field: ValidationError['field'],
  errors: ValidationError[] | undefined,
): string | undefined {
  const match = errors?.find((error) => error.field === field);
  if (!match) {
    return undefined;
  }
  return MESSAGES[match.messageKey] ?? match.messageKey;
}

/**
 * Findet die Select-Option zur aktuell gewählten Region-ID; `null`, solange
 * keine Auswahl getroffen wurde.
 */
function selectedOption(value: ShipmentInput['origin']): SelectProps.Option | null {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  return regionOptions.find((option) => option.value === value) ?? null;
}

/**
 * Präsentationskomponente für die Paketdetails. Blockiert die Navigation nicht
 * selbst (das übernimmt das Wizard-Gate via `validateShipment`), zeigt aber die
 * übergebenen Fehler inline an und hält die eingegebenen Werte unverändert.
 */
export default function PackageDetailsStep({
  input,
  onFieldChange,
  errors,
}: PackageDetailsStepProps): React.JSX.Element {
  const weightValue =
    input.weightGrams === undefined || input.weightGrams === null
      ? ''
      : String(input.weightGrams);

  return (
    <SpaceBetween size="l">
      <FormField
        label="Paketgewicht (Gramm)"
        description="Zulässig sind 1 bis 30000 Gramm."
        errorText={errorTextFor('weightGrams', errors)}
      >
        <Input
          type="number"
          inputMode="numeric"
          value={weightValue}
          placeholder="z. B. 500"
          onChange={({ detail }) => onFieldChange('weightGrams', detail.value)}
        />
      </FormField>

      <FormField label="Herkunftsgebiet" errorText={errorTextFor('origin', errors)}>
        <Select
          selectedOption={selectedOption(input.origin)}
          options={regionOptions}
          placeholder="Herkunftsgebiet wählen"
          onChange={({ detail }) =>
            onFieldChange('origin', detail.selectedOption.value ?? null)
          }
        />
      </FormField>

      <FormField label="Zielgebiet" errorText={errorTextFor('destination', errors)}>
        <Select
          selectedOption={selectedOption(input.destination)}
          options={regionOptions}
          placeholder="Zielgebiet wählen"
          onChange={({ detail }) =>
            onFieldChange('destination', detail.selectedOption.value ?? null)
          }
        />
      </FormField>
    </SpaceBetween>
  );
}
