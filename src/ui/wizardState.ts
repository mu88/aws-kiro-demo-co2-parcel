// Wizard-Zustandsmodell für den geführten Dreischritt-Ablauf.
// Umsetzung gemäss Design-Abschnitt "GuidedWizard" und "Error Handling"
// (swiss-post-co2-footprint). Die Zustandslogik ist als reiner Reducer mit
// reinen Übergangsfunktionen umgesetzt, damit sie ohne React-Rendering prüfbar
// ist (Correctness Property 12). Ein optionaler Hook (useWizardState) verdrahtet
// den Reducer mit useReducer für die UI.
// Requirements: 1.3, 7.5, 7.6.

import { useReducer } from 'react';
import type { ServiceLevel, ShipmentInput } from '../domain/types';

/** Gesamtzahl der Schritte des geführten Ablaufs (Requirement 7.1). */
export const TOTAL_STEPS = 3;

/**
 * Schrittindizes der festen Dreischritt-Folge (Requirement 7.1):
 * 0 = Service_Level wählen, 1 = Paketdetails eingeben, 2 = Ergebnis ansehen.
 */
export const WizardStep = {
  ServiceLevel: 0,
  PackageDetails: 1,
  Result: 2,
} as const;

export type WizardStepIndex = (typeof WizardStep)[keyof typeof WizardStep];

/**
 * Reiner Wizard-Zustand. Enthält den aktuellen Schritt, den weitesten bereits
 * erreichten Schritt sowie den gewählten Service_Level und die rohen
 * Shipment_Attribute-Eingaben. Der Service_Level ist zunächst nicht
 * vorausgewählt (Requirement 1.1).
 */
export interface WizardState {
  /** Aktuell angezeigter Schritt (0..TOTAL_STEPS-1). */
  currentStep: number;
  /** Weitester bereits erreichter/abgeschlossener Schritt (Navigationsgrenze, Req 7.6). */
  furthestCompletedStep: number;
  /** Gewählter Service_Level; `null` solange keine Auswahl getroffen wurde. */
  serviceLevel: ServiceLevel | null;
  /** Rohe, noch nicht validierte Shipment_Attribute-Eingaben. */
  input: ShipmentInput;
}

/** Erzeugt den initialen Wizard-Zustand ohne Vorauswahl (Requirement 1.1). */
export function initialWizardState(): WizardState {
  return {
    currentStep: WizardStep.ServiceLevel,
    furthestCompletedStep: WizardStep.ServiceLevel,
    serviceLevel: null,
    input: { weightGrams: null, origin: null, destination: null },
  };
}

/** Einzelnes bearbeitbares Feld der rohen Shipment_Attribute-Eingaben. */
export type ShipmentField = keyof ShipmentInput;

export type WizardAction =
  | { type: 'setServiceLevel'; serviceLevel: ServiceLevel }
  | { type: 'setField'; field: ShipmentField; value: ShipmentInput[ShipmentField] }
  | { type: 'goToStep'; target: number }
  | { type: 'completeStep' };

/**
 * Setzt den gewählten Service_Level. Die zuvor eingegebenen
 * Shipment_Attribute-Werte bleiben dabei unverändert (Requirement 1.3).
 */
export function setServiceLevel(
  state: WizardState,
  serviceLevel: ServiceLevel,
): WizardState {
  return { ...state, serviceLevel };
}

/**
 * Aktualisiert einen einzelnen Shipment_Attribute-Eingabewert. Übrige Felder
 * und der Service_Level bleiben unverändert.
 */
export function setField(
  state: WizardState,
  field: ShipmentField,
  value: ShipmentInput[ShipmentField],
): WizardState {
  return { ...state, input: { ...state.input, [field]: value } };
}

/**
 * Navigiert zu einem Zielschritt. Eine Navigation über den weitesten bereits
 * erreichten Schritt hinaus wird blockiert; der Zustand bleibt dann auf dem
 * aktuellen Schritt (Requirement 7.6). Die Rückkehr zu einem bereits erreichten
 * Schritt ist erlaubt und lässt alle eingegebenen Werte unverändert
 * (Requirement 7.5). Zielwerte ausserhalb des gültigen Bereichs werden ignoriert.
 */
export function goToStep(state: WizardState, target: number): WizardState {
  if (!Number.isInteger(target) || target < 0 || target >= TOTAL_STEPS) {
    return state;
  }
  if (target > state.furthestCompletedStep) {
    return state;
  }
  return { ...state, currentStep: target };
}

/**
 * Schliesst den aktuellen Schritt ab und geht zum nächsten Schritt über. Der
 * weiteste erreichte Schritt wird entsprechend erhöht. Auf dem letzten Schritt
 * bleibt der Zustand unverändert. Eingegebene Werte bleiben erhalten.
 */
export function completeStep(state: WizardState): WizardState {
  if (state.currentStep >= TOTAL_STEPS - 1) {
    return state;
  }
  const next = state.currentStep + 1;
  return {
    ...state,
    currentStep: next,
    furthestCompletedStep: Math.max(state.furthestCompletedStep, next),
  };
}

/** Reiner Reducer für den Wizard-Zustand. */
export function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case 'setServiceLevel':
      return setServiceLevel(state, action.serviceLevel);
    case 'setField':
      return setField(state, action.field, action.value);
    case 'goToStep':
      return goToStep(state, action.target);
    case 'completeStep':
      return completeStep(state);
    default:
      return state;
  }
}

/**
 * Anzahl der nach dem aktuellen Schritt verbleibenden Schritte (Requirement 7.2).
 */
export function remainingSteps(state: WizardState): number {
  return TOTAL_STEPS - 1 - state.currentStep;
}

/** Rückgabewert des Hooks: Zustand plus gebundene Übergangs-Aktionen. */
export interface UseWizardState {
  state: WizardState;
  setServiceLevel: (serviceLevel: ServiceLevel) => void;
  setField: (field: ShipmentField, value: ShipmentInput[ShipmentField]) => void;
  goToStep: (target: number) => void;
  completeStep: () => void;
}

/**
 * Optionaler React-Hook, der den reinen Reducer mit `useReducer` verdrahtet.
 * Die reinen Funktionen oben bleiben die testbare Quelle der Wahrheit; dieser
 * Hook ist nur eine dünne UI-Anbindung.
 */
export function useWizardState(): UseWizardState {
  const [state, dispatch] = useReducer(wizardReducer, undefined, initialWizardState);

  return {
    state,
    setServiceLevel: (serviceLevel) => dispatch({ type: 'setServiceLevel', serviceLevel }),
    setField: (field, value) => dispatch({ type: 'setField', field, value }),
    goToStep: (target) => dispatch({ type: 'goToStep', target }),
    completeStep: () => dispatch({ type: 'completeStep' }),
  };
}
