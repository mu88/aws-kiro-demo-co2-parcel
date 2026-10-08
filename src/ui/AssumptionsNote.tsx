// AssumptionsNote: Prototyp- und Datenherkunft-Hinweis (Requirements 6.2, 6.3).
// Rein darstellende, wiederverwendbare Komponente. Sie wird zusammen mit jedem
// angezeigten CO2_Estimate und mit dem Total_Footprint eingebunden (Req 6.2).
//
// - Immer sichtbar: ein kurzer Hinweis, dass die CO2_Estimate-Werte indikative
//   Prototyp-Werte auf Basis gemockter Emission_Factor- und Route_Network-Daten
//   sind (Requirement 6.2).
// - Auf Anforderung: eine Beschreibung der Datenherkunft (reale, öffentlich
//   recherchierte Parcel_Center-Standorte vs. gemockte Distanzen und
//   Emission_Factor-Werte) über eine aufklappbare Sektion, sodass sie nur
//   "auf Anforderung" erscheint (Requirement 6.3).

import Alert from '@cloudscape-design/components/alert';
import ExpandableSection from '@cloudscape-design/components/expandable-section';

/** Immer sichtbarer Prototyp-Hinweis (Requirement 6.2). */
const PROTOTYPE_DISCLAIMER =
  'Die angezeigten CO2-Schätzwerte und Preise sind indikative Prototyp-Werte ' +
  'auf Basis gemockter Emissionsfaktoren, eines gemockten Paketzentren-Netzes ' +
  'und gemockter Preise. Sie sind keine zertifizierten CO2-Bilanzwerte und ' +
  'keine verbindlichen Tarife.';

/** Auf Anforderung sichtbare Datenherkunft-Beschreibung (Requirement 6.3). */
const DATA_PROVENANCE =
  'Die Standorte der Paketzentren beruhen auf öffentlich recherchierten realen ' +
  'Standorten der Schweizerischen Post (Härkingen, Daillens und Frauenfeld ' +
  'sowie regionale Paketzentren wie Ostermundigen und Cadenazzo). Die Distanzen ' +
  'zwischen den Zentren, die Emissionsfaktoren je Transportart sowie die Preise ' +
  'sind jedoch gemockt; die Preise orientieren sich lediglich grob an der ' +
  'Grössenordnung realer PostPac-Tarife.';

/**
 * Prototyp-/Datenherkunft-Hinweis zu einem CO2_Estimate oder Total_Footprint.
 *
 * Der Prototyp-Hinweis ist stets sichtbar; die Datenherkunft-Beschreibung wird
 * erst nach dem Aufklappen angezeigt ("auf Anforderung").
 */
export default function AssumptionsNote() {
  return (
    <Alert type="info" header="Hinweis zu den Schätzwerten">
      {PROTOTYPE_DISCLAIMER}
      <ExpandableSection headerText="Woher stammen die Daten?">
        {DATA_PROVENANCE}
      </ExpandableSection>
    </Alert>
  );
}
