// SessionList: reine Funktionen zur Verwaltung der Sitzungsliste von
// Package-Elementen und zur Aggregation des Total_Footprint.
// Definitionen folgen dem Abschnitt "Data Models", der "Error Handling"-Tabelle
// (Zeile "Sitzungsliste voll (50)") sowie Correctness Property 11 des Designs
// (swiss-post-co2-footprint).

import type { Package } from './types';

/** Höchstzahl der Package-Elemente in einer Sitzungsliste (Requirement 5.1, 5.2). */
export const MAX_PACKAGES = 50;

/** Ergebnis von {@link addPackage}: enthält die (ggf. unveränderte) Liste und ob hinzugefügt wurde. */
export interface AddPackageResult {
  list: Package[];
  added: boolean;
}

/**
 * Fügt ein Package der Sitzungsliste hinzu (Requirement 5.1).
 *
 * Enthält die Liste bereits {@link MAX_PACKAGES} Elemente, wird das Hinzufügen
 * abgelehnt: Die bestehende Liste wird unverändert zurückgegeben und `added`
 * ist `false` (Requirement 5.2, Error-Handling "Sitzungsliste voll (50)").
 * Andernfalls wird eine neue Liste mit dem angehängten Package zurückgegeben
 * und `added` ist `true`. Die Eingabeliste wird nie mutiert.
 */
export function addPackage(list: Package[], pkg: Package): AddPackageResult {
  if (list.length >= MAX_PACKAGES) {
    return { list, added: false };
  }
  return { list: [...list, pkg], added: true };
}

/**
 * Entfernt das Package mit der angegebenen id aus der Sitzungsliste
 * (Requirement 5.5). Gibt eine neue Liste ohne das betroffene Package zurück;
 * ist keine passende id vorhanden, bleibt der Inhalt unverändert. Die
 * Eingabeliste wird nie mutiert.
 */
export function removePackage(list: Package[], id: string): Package[] {
  return list.filter((pkg) => pkg.id !== id);
}

/**
 * Berechnet den Total_Footprint als Summe der CO2_Estimate-Werte aller aktuell
 * in der Liste enthaltenen Package-Elemente (Requirement 5.4). Bei leerer Liste
 * ist das Ergebnis 0 (Requirement 5.6).
 */
export function computeTotalFootprint(list: Package[]): number {
  return list.reduce((sum, pkg) => sum + pkg.co2EstimateGrams, 0);
}
