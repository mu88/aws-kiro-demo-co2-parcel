# Implementation Plan: Swiss Post CO2-Fussabdruck

## Overview

Dieser Plan setzt den clientseitigen Prototyp (React + Cloudscape, reine TypeScript-Domänenlogik, gemockte Daten) schrittweise und testgetrieben um. Die Reihenfolge folgt der Schichtentrennung des Designs: zuerst Projektgerüst und Datenschicht, dann die reine Domänenlogik (Validierung, Routenwahl, CO2-Berechnung, Aggregation) mit ihren Property-Based-Tests, erst danach die UI (Wizard und Komponenten) und die abschliessende Verdrahtung. Jede Aufgabe baut auf den vorherigen auf und endet in einem lauffähigen, verifizierten Zustand.

**Property-Based-Testing:** Jede der 13 Correctness Properties aus dem Design wird durch genau einen Property-Test mit **fast-check** und mindestens **100 Iterationen** umgesetzt. Jeder Property-Test trägt den Referenz-Kommentar-Tag im Format `// Feature: swiss-post-co2-footprint, Property {Nummer}: {Property-Text}`.

**Verifikationsgate:** Jede Implementierungsaufgabe schliesst mit statischer Analyse (`tsc --noEmit`, ESLint) und der Ausführung der vorhandenen Tests ab. Aufgaben gelten erst als erledigt, wenn das Gate grün ist.

## Tasks

- [x] 1. Projektgerüst, Tooling und Datenschicht aufsetzen
  - [x] 1.1 Vite-React-TypeScript-Projekt mit Cloudscape, ESLint, Vitest und fast-check initialisieren
    - Vite-Projekt (React + TypeScript) im Workspace-Root anlegen, Abhängigkeiten `@cloudscape-design/components` und `@cloudscape-design/global-styles` ergänzen
    - Dev-Abhängigkeiten mit gepinnten Versionen ergänzen: `vitest`, `@testing-library/react`, `fast-check`, ESLint mit TypeScript-Plugin
    - `tsconfig.json` im strict-Modus, ESLint-Konfiguration und npm-Skripte einrichten: `dev`, `build`, `lint`, `typecheck` (`tsc --noEmit`), `test` (`vitest --run`)
    - `.gitignore` mit Standardwerten (node_modules, dist, Coverage, Editor-/OS-Dateien) anlegen
    - `README.md` mit Startanleitung (Installation, Start, Build, Tests) anlegen
    - Start-Skript anlegen (`start.sh` und/oder `start.ps1`), das Abhängigkeiten installiert und den Dev-Server startet
    - _Verifikationsgate: `npm run typecheck` und `npm run lint` laufen fehlerfrei_
    - _Requirements: Projekt-Setup gemäss Coding-Guidelines_

  - [x] 1.2 Domänentypen definieren
    - Datei `src/domain/types.ts` mit `ServiceLevel`, `TransportMode`, `RegionId`, `CenterId`, `SegmentRole`, `ShipmentAttributes`, `RouteSegment`, `TransportRoute`, `Package`, `ValidationError`, `ValidationResult`, `EstimationResult` anlegen
    - Typen exakt gemäss Abschnitt „Data Models" des Designs
    - _Verifikationsgate: `npm run typecheck` und `npm run lint` laufen fehlerfrei_
    - _Requirements: 1.1, 2.1, 3.2, 3.3, 4.3_

  - [x] 1.3 Gemockte Datensätze Route_Network und Emission_Factor_Catalog anlegen
    - Datei `src/data/routeNetwork.ts` mit `ParcelCenter`-, `Region`- und `NetworkLink`-Datensätzen exakt gemäss den Tabellen im Design
    - Datei `src/data/emissionFactors.ts` mit `EmissionFactorCatalog` (Rail 15, Lkw 95, E_Trike 5, Car 170)
    - Hilfsfunktionen für Zugriff bereitstellen (Region nach Id, bidirektionale Link-Suche)
    - _Verifikationsgate: `npm run typecheck` und `npm run lint` laufen fehlerfrei_
    - _Requirements: 2.4, 2.5, 3.3, 3.6, 4.2, 6.3_

- [x] 2. Eingabevalidierung (InputValidator) implementieren
  - [x] 2.1 `validateShipment` implementieren
    - Datei `src/domain/inputValidator.ts` mit `validateShipment(input): ValidationResult`
    - Gewicht prüfen (numerisch, nicht leer/fehlend, ganzzahliger Bereich 1..30000), Origin und Destination als gültige Route_Network-Regionen prüfen
    - Bei Gültigkeit normalisierte `ShipmentAttributes` zurückgeben; sonst feldbezogene `ValidationError`-Liste
    - _Verifikationsgate: `npm run typecheck`, `npm run lint`, `npm run test` laufen fehlerfrei_
    - _Requirements: 2.1, 2.2, 2.3, 2.6, 2.7, 4.5_

  - [ ]* 2.2 Property-Test: Ungültiges Paketgewicht wird abgelehnt
    - **Property 9: Ungültiges Paketgewicht wird abgelehnt**
    - **Validates: Requirements 2.2, 2.3, 4.5**
    - fast-check-Generator für Gewichte <1, >30000, nicht-numerische Strings und fehlende Werte; prüft ungültiges Ergebnis mit gewichtsbezogenem Fehler
    - mindestens 100 Iterationen, Referenz-Kommentar-Tag setzen
    - _Verifikationsgate: `npm run test` grün_

  - [ ]* 2.3 Property-Test: Gültiger Shipment_Attribute-Satz wird angenommen
    - **Property 10: Gültiger Shipment_Attribute-Satz wird angenommen**
    - **Validates: Requirements 2.7**
    - Generator für Gewicht 1..30000 und gültige Origin/Destination; prüft gültiges Ergebnis mit eingabetreuen, normalisierten Attributen
    - mindestens 100 Iterationen, Referenz-Kommentar-Tag setzen
    - _Verifikationsgate: `npm run test` grün_

- [x] 3. CO2-Berechnung (CO2Calculator) implementieren
  - [x] 3.1 `computeCo2Grams` und `roundToGram` implementieren
    - Datei `src/domain/co2Calculator.ts`
    - `computeCo2Grams`: Summe über alle Segmente aus Gewicht × Distanz × Emission_Factor mit konsistenter Einheitenumrechnung (Gramm → Tonnen) gemäss Design
    - `roundToGram`: kaufmännische Rundung auf das nächste ganze Gramm, 0,5 wird aufgerundet
    - _Verifikationsgate: `npm run typecheck`, `npm run lint`, `npm run test` laufen fehlerfrei_
    - _Requirements: 4.2, 4.3_

  - [ ]* 3.2 Property-Test: CO2_Estimate entspricht der Summenformel
    - **Property 6: CO2_Estimate entspricht der Summenformel**
    - **Validates: Requirements 4.2**
    - Generator für Gewicht 1..30000 und Routen mit vollständigem Katalog; Vergleich gegen unabhängige Referenzsumme
    - mindestens 100 Iterationen, Referenz-Kommentar-Tag setzen
    - _Verifikationsgate: `npm run test` grün_

  - [ ]* 3.3 Property-Test: CO2_Estimate ist linear im Paketgewicht
    - **Property 7: CO2_Estimate ist linear im Paketgewicht**
    - **Validates: Requirements 4.2**
    - Generator für Routen, Basisgewicht und Faktor k, sodass k × Gewicht im gültigen Bereich bleibt; prüft Linearität des ungerundeten Werts
    - mindestens 100 Iterationen, Referenz-Kommentar-Tag setzen
    - _Verifikationsgate: `npm run test` grün_

  - [ ]* 3.4 Property-Test: Rundung auf das nächste ganze Gramm
    - **Property 8: Rundung auf das nächste ganze Gramm**
    - **Validates: Requirements 4.3**
    - Generator für nichtnegative reelle Werte; prüft Ganzzahligkeit, |diff| ≤ 0,5 und Aufrundung bei exakt 0,5
    - mindestens 100 Iterationen, Referenz-Kommentar-Tag setzen
    - _Verifikationsgate: `npm run test` grün_

- [x] 4. Routenwahl (RouteSelector) implementieren
  - [x] 4.1 `selectRoute` mit erschöpfender Pfadsuche und Service_Level-Regeln implementieren
    - Datei `src/domain/routeSelector.ts`
    - Aufgabe- und Zustellung-Segmente aus Region-Zugang bilden; Hauptlauf über erschöpfende zyklenfreie Pfadsuche im Netz
    - Kurier → Einzelsegment Car direkt Origin↔Destination; Priority → geringste Hauptlauf-Gesamtdistanz; Economy → Rail im Hauptlauf bevorzugen, wenn das Netz Rail bietet
    - letztlich die Route mit geringster CO2-Gesamtemission zurückgeben; `null`, wenn keine Verbindung existiert
    - geordnete Segmentfolge Aufgabe → EingangsZentrum → Hauptlauf → AusgangsZentrum → Zustellung sicherstellen
    - _Verifikationsgate: `npm run typecheck`, `npm run lint`, `npm run test` laufen fehlerfrei_
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

  - [ ]* 4.2 Property-Test: Routenwahl minimiert die CO2-Gesamtemission
    - **Property 1: Routenwahl minimiert die CO2-Gesamtemission**
    - **Validates: Requirements 3.1**
    - Generator über Service_Level, Gewicht und Origin/Destination mit mindestens einer Route; prüft CO2 der gewählten Route ≤ jeder Kandidatenroute
    - mindestens 100 Iterationen, Referenz-Kommentar-Tag setzen
    - _Verifikationsgate: `npm run test` grün_

  - [ ]* 4.3 Property-Test: Routenstruktur-Invariante inklusive Kurier-Direktfahrt
    - **Property 2: Routenstruktur-Invariante inklusive Kurier-Direktfahrt**
    - **Validates: Requirements 3.2, 3.4**
    - prüft bei Kurier genau ein Car-Segment Origin→Destination; bei Economy/Priority feste Rollenreihenfolge
    - mindestens 100 Iterationen, Referenz-Kommentar-Tag setzen
    - _Verifikationsgate: `npm run test` grün_

  - [ ]* 4.4 Property-Test: Segment-Invariante für Distanz und Transport_Mode
    - **Property 3: Segment-Invariante für Distanz und Transport_Mode**
    - **Validates: Requirements 3.3**
    - prüft je Segment Distanz > 0 und genau eine im Netz (bzw. Region-Zugang) verfügbare Transport_Mode
    - mindestens 100 Iterationen, Referenz-Kommentar-Tag setzen
    - _Verifikationsgate: `npm run test` grün_

  - [ ]* 4.5 Property-Test: Priority bevorzugt die geringste Hauptlauf-Gesamtdistanz
    - **Property 4: Priority bevorzugt die geringste Hauptlauf-Gesamtdistanz**
    - **Validates: Requirements 3.5**
    - prüft für Priority die Hauptlauf-Gesamtdistanz der gewählten Route ≤ jeder anderen Zentren-Route
    - mindestens 100 Iterationen, Referenz-Kommentar-Tag setzen
    - _Verifikationsgate: `npm run test` grün_

  - [ ]* 4.6 Property-Test: Economy nutzt Rail, wenn verfügbar
    - **Property 5: Economy nutzt Rail, wenn verfügbar**
    - **Validates: Requirements 3.6**
    - prüft für Economy: wenn jede Hauptlauf-Verbindung Rail anbietet, haben alle Hauptlauf-Segmente Transport_Mode Rail
    - mindestens 100 Iterationen, Referenz-Kommentar-Tag setzen
    - _Verifikationsgate: `npm run test` grün_

- [x] 5. Checkpoint - Domänen-Berechnungskern verifizieren
  - Sicherstellen, dass alle Tests laufen; bei Fragen die Customer konsultieren.

- [x] 6. Estimation_Engine implementieren und Fehlerfälle abdecken
  - [x] 6.1 `estimate` implementieren
    - Datei `src/domain/estimationEngine.ts`
    - Routenwahl über `selectRoute`, CO2-Berechnung über `computeCo2Grams`/`roundToGram` orchestrieren
    - typisierte Rückgaben: `ok` mit Route und gerundetem CO2_Estimate, `no-route` bei fehlender Verbindung, `missing-factor` mit betroffener Transport_Mode bei unvollständigem Katalog
    - _Verifikationsgate: `npm run typecheck`, `npm run lint`, `npm run test` laufen fehlerfrei_
    - _Requirements: 3.1, 3.7, 4.1, 4.2, 4.3, 4.4_

  - [ ]* 6.2 Unit-Tests für Engine-Fehlerfälle
    - `no-route` bei konstruiertem Teilnetz ohne Verbindung (3.7); `missing-factor` bei unvollständigem Katalog (4.4)
    - Eingaben bleiben bei Fehlerfällen erhalten (Rückgabewert ohne Zustandsverlust)
    - _Verifikationsgate: `npm run test` grün_
    - _Requirements: 3.7, 4.4_

- [x] 7. Sitzungsliste und Total_Footprint (Aggregation) implementieren
  - [x] 7.1 Sitzungslisten-Logik implementieren
    - Datei `src/domain/sessionList.ts` mit reinen Funktionen `addPackage` (max. 50, sonst Ablehnung ohne Änderung) und `removePackage`
    - `computeTotalFootprint`: Summe aller CO2_Estimate-Werte, 0 bei leerer Liste
    - _Verifikationsgate: `npm run typecheck`, `npm run lint`, `npm run test` laufen fehlerfrei_
    - _Requirements: 5.1, 5.2, 5.4, 5.5, 5.6_

  - [ ]* 7.2 Property-Test: Total_Footprint ist die Summe der aktuellen Package-Elemente
    - **Property 11: Total_Footprint ist die Summe der aktuellen Package-Elemente**
    - **Validates: Requirements 5.1, 5.4, 5.5, 5.6**
    - Generator für add/remove-Operationsfolgen (max. 50); prüft Total == Summe der aktuellen Elemente, leere Liste → 0
    - mindestens 100 Iterationen, Referenz-Kommentar-Tag setzen
    - _Verifikationsgate: `npm run test` grün_

  - [ ]* 7.3 Unit-Test: Sitzungsliste genau am Höchstwert 50
    - Bestätigung eines 51. Package wird abgelehnt, Liste bleibt unverändert, Meldung „Höchstzahl erreicht"
    - _Verifikationsgate: `npm run test` grün_
    - _Requirements: 5.2_

- [x] 8. Route-Aufschlüsselung (Darstellungs-Mapping) implementieren
  - [x] 8.1 `buildRouteBreakdown` implementieren
    - Datei `src/domain/routeBreakdown.ts` mit reiner Funktion, die je Route_Segment Transport_Mode, Distanz in km und angewandten Emission_Factor samt Masseinheit (g CO2e/t·km) liefert
    - _Verifikationsgate: `npm run typecheck`, `npm run lint`, `npm run test` laufen fehlerfrei_
    - _Requirements: 6.1_

  - [ ]* 8.2 Property-Test: Route-Aufschlüsselung zeigt je Segment Transport_Mode, Distanz und Emission_Factor
    - **Property 13: Route-Aufschlüsselung zeigt je Segment Transport_Mode, Distanz und Emission_Factor**
    - **Validates: Requirements 6.1**
    - Generator für Transport_Route-Elemente; prüft, dass die Aufschlüsselung je Segment Mode, Distanz und Faktor mit Einheit enthält
    - mindestens 100 Iterationen, Referenz-Kommentar-Tag setzen
    - _Verifikationsgate: `npm run test` grün_

- [x] 9. Checkpoint - Gesamte Domänenlogik verifizieren
  - Sicherstellen, dass alle Tests laufen; bei Fragen die Customer konsultieren.

- [ ] 10. UI-Grundgerüst und Sitzungszustand (App) implementieren
  - [x] 10.1 `App` mit In-Memory-Sitzungszustand und Callbacks implementieren
    - Datei `src/App.tsx`; hält Package-Liste im React-State, reicht add/remove-Callbacks an die Komponenten durch
    - Cloudscape global-styles einbinden; Rohgerüst der Seitenstruktur anlegen
    - _Verifikationsgate: `npm run typecheck`, `npm run lint`, `npm run build` laufen fehlerfrei_
    - _Requirements: 5.1_

  - [x] 10.2 Wizard-Zustandsmodell für geführten Ablauf implementieren
    - Datei `src/ui/wizardState.ts` (bzw. Hook) mit Schrittfolge, weitestem abgeschlossenen Schritt, Service_Level- und Shipment_Attribute-Zustand
    - Service_Level-Wechsel und Rückkehr zu vorherigem Schritt lassen eingegebene Werte unverändert; Navigation über den weitesten Schritt hinaus blockiert
    - _Verifikationsgate: `npm run typecheck`, `npm run lint`, `npm run test` laufen fehlerfrei_
    - _Requirements: 1.3, 7.5, 7.6_

  - [ ]* 10.3 Property-Test: Eingaben bleiben über Navigation und Service_Level-Wechsel erhalten
    - **Property 12: Eingaben bleiben über Navigation und Service_Level-Wechsel erhalten**
    - **Validates: Requirements 1.3, 7.5**
    - Generator für Shipment_Attribute-Werte und Navigations-/Wechselfolgen; prüft Unveränderlichkeit der eingegebenen Werte
    - mindestens 100 Iterationen, Referenz-Kommentar-Tag setzen
    - _Verifikationsgate: `npm run test` grün_

- [ ] 11. Geführten Wizard und Schritt-Komponenten implementieren
  - [x] 11.1 `GuidedWizard` mit Cloudscape Wizard implementieren
    - Datei `src/ui/GuidedWizard.tsx`; Dreischritt-Folge in fester Reihenfolge, Schrittnummer/Gesamtzahl/verbleibende Schritte
    - Übergang nur bei bestandener Validierung freigeben; sonst blockieren und zu korrigierende Felder benennen; Navigation über den weitesten Schritt hinaus sperren
    - _Verifikationsgate: `npm run typecheck`, `npm run lint`, `npm run build` laufen fehlerfrei_
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.6_

  - [x] 11.2 `ServiceLevelStep` implementieren
    - Datei `src/ui/ServiceLevelStep.tsx`; genau drei Optionen (Economy, Priority, Kurier), keine Vorauswahl
    - nur die für das gewählte Service_Level geltenden Shipment_Attribute-Eingaben anzeigen; Fortfahren ohne Auswahl blockieren mit Meldung, Eingaben beibehalten
    - _Verifikationsgate: `npm run typecheck`, `npm run lint`, `npm run build` laufen fehlerfrei_
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [x] 11.3 `PackageDetailsStep` implementieren
    - Datei `src/ui/PackageDetailsStep.tsx`; Felder Gewicht (g), Origin, Destination mit genau den Route_Network-Regionen
    - Inline-Validierungsmeldungen über Cloudscape `FormField` auf Basis von `validateShipment`; ungültige/leere Eingaben ablehnen, Werte beibehalten
    - _Verifikationsgate: `npm run typecheck`, `npm run lint`, `npm run build` laufen fehlerfrei_
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

  - [ ]* 11.4 Beispiel-/Snapshot-Tests für Service- und Detailschritt
    - genau drei Optionen ohne Vorauswahl (1.1); nur gültige Attribute sichtbar (1.2); Fortfahren ohne Auswahl blockiert (1.4)
    - Origin/Destination zeigen genau die Route_Network-Regionen (2.4, 2.5); leeres/fehlendes Gewicht abgelehnt (2.6)
    - _Verifikationsgate: `npm run test` grün_
    - _Requirements: 1.1, 1.2, 1.4, 2.4, 2.5, 2.6_

- [ ] 12. Ergebnis-, Sitzungs- und Hinweis-Komponenten implementieren
  - [x] 12.1 `ResultStep` und `RouteBreakdown` implementieren
    - Dateien `src/ui/ResultStep.tsx` und `src/ui/RouteBreakdown.tsx`
    - `estimate` aufrufen; bei `ok` Route-Aufschlüsselung (je Segment Mode, Distanz, Emission_Factor + Einheit via `buildRouteBreakdown`) und gerundeten CO2_Estimate anzeigen, „Package hinzufügen" bereitstellen
    - bei `no-route` bzw. `missing-factor` die passende Meldung anzeigen und Eingaben beibehalten
    - _Verifikationsgate: `npm run typecheck`, `npm run lint`, `npm run build` laufen fehlerfrei_
    - _Requirements: 3.7, 4.1, 4.3, 4.4, 6.1, 6.4_

  - [x] 12.2 `SessionList` und `TotalFootprint` implementieren
    - Dateien `src/ui/SessionList.tsx` und `src/ui/TotalFootprint.tsx`
    - je Package Service_Level, Shipment_Attribute-Werte, Transport_Route und CO2_Estimate anzeigen, „Entfernen" anbieten
    - Total_Footprint als Summe (0 bei leerer Liste), Neuberechnung nach Entfernen
    - _Verifikationsgate: `npm run typecheck`, `npm run lint`, `npm run build` laufen fehlerfrei_
    - _Requirements: 5.3, 5.4, 5.5, 5.6_

  - [x] 12.3 `AssumptionsNote` implementieren
    - Datei `src/ui/AssumptionsNote.tsx`; Prototyp-Hinweis bei jedem CO2_Estimate und Total_Footprint; Datenherkunft-Beschreibung (reale Standorte, gemockte Distanzen und Emission_Factor-Werte) auf Anforderung
    - _Verifikationsgate: `npm run typecheck`, `npm run lint`, `npm run build` laufen fehlerfrei_
    - _Requirements: 6.2, 6.3_

  - [ ]* 12.4 Beispiel-/Snapshot-Tests für Ergebnis- und Sitzungsanzeige
    - Package-Darstellung mit allen Feldern (5.3); Sitzungsliste genau bei 50 Elementen (5.2)
    - Prototyp-/Datenherkunft-Hinweise sichtbar (6.2, 6.3)
    - _Verifikationsgate: `npm run test` grün_
    - _Requirements: 5.2, 5.3, 6.2, 6.3_

- [x] 13. Komponenten verdrahten und Ablauf vervollständigen
  - [x] 13.1 Wizard-Schritte, Ergebnisanzeige und Sitzungsansicht in `App` verbinden
    - `GuidedWizard` mit `ServiceLevelStep`, `PackageDetailsStep`, `ResultStep` sowie `SessionList`/`TotalFootprint`/`AssumptionsNote` in `App` zusammenführen
    - „Package hinzufügen" aus `ResultStep` an den Sitzungszustand anbinden (max. 50, Meldung bei Höchstzahl); „Entfernen" aktualisiert Total
    - keine verwaisten Komponenten; vollständiger Ablauf Schritt 1 → 3 → Sitzungsliste lauffähig
    - _Verifikationsgate: `npm run typecheck`, `npm run lint`, `npm run build` laufen fehlerfrei_
    - _Requirements: 5.1, 5.2, 7.1, 7.3_

  - [ ]* 13.2 Smoke-/Zeittest für repräsentative Berechnung und Neuberechnung
    - eine repräsentative Berechnung ≤ 2 s (4.1); Total-Neuberechnung nach Entfernen ≤ 1 s (5.5)
    - _Verifikationsgate: `npm run test` grün_
    - _Requirements: 4.1, 5.5_

- [x] 15. Service-Level-Vergleich implementieren
  - [x] 15.1 Vergleichslogik `compareServiceLevels` implementieren
    - Datei `src/domain/serviceLevelComparison.ts`; ruft je Service_Level `estimate` auf und markiert das günstigste `ok`-Ergebnis (geringster CO2_Estimate)
    - keine Dupliierung der Routen-/CO2-Logik; nutzt bestehende Estimation_Engine
    - _Verifikationsgate: `npm run typecheck`, `npm run lint` laufen fehlerfrei_
    - _Requirements: 8.1, 8.3, 8.4_

  - [x] 15.2 `ServiceLevelComparison`-Komponente und Einbindung in `ResultStep`
    - Datei `src/ui/ServiceLevelComparison.tsx`; Cloudscape-Tabelle je Service_Level mit CO2_Estimate, Transport_Route und „Dieses hinzufügen"
    - günstigstes Service_Level hervorheben; Fehlerfälle (`no-route`, `missing-factor`) je Zeile anzeigen und nicht als günstigstes markieren
    - `ResultStep` zeigt den Vergleich plus Routendetails des gewählten Service_Level; Auswahl fügt Package über bestehende Höchstzahl-Logik hinzu
    - _Verifikationsgate: `npm run typecheck`, `npm run lint`, `npm run build` laufen fehlerfrei_
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_
- [x] 14. Abschluss-Checkpoint - gesamte Anwendung verifizieren
  - `npm run typecheck`, `npm run lint`, `npm run build` und alle Tests laufen fehlerfrei; bei Fragen die Customer konsultieren.

## Notes

- Mit `*` markierte Sub-Tasks sind optional (Tests) und können für ein schnelleres MVP übersprungen werden; Kernimplementierungsaufgaben sind nie optional.
- Jede Aufgabe referenziert ihre Requirements für Nachverfolgbarkeit; Property-Tasks referenzieren zusätzlich die Design-Property.
- Jede der 13 Correctness Properties wird durch genau einen Property-Test mit fast-check (≥ 100 Iterationen) und Referenz-Kommentar-Tag umgesetzt.
- Checkpoints sichern inkrementelle Validierung an den Schichtgrenzen ab.
- Die Reihenfolge stellt sicher, dass die reine Domänenlogik samt Property-Tests vor der UI steht; die UI verdrahtet nur noch bereits verifizierte Funktionen.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2"] },
    { "id": 2, "tasks": ["1.3", "2.1", "3.1"] },
    { "id": 3, "tasks": ["2.2", "2.3", "3.2", "3.3", "3.4", "4.1"] },
    { "id": 4, "tasks": ["4.2", "4.3", "4.4", "4.5", "4.6", "6.1", "8.1"] },
    { "id": 5, "tasks": ["6.2", "7.1", "8.2", "10.1", "10.2"] },
    { "id": 6, "tasks": ["7.2", "7.3", "10.3", "11.1", "11.2", "11.3"] },
    { "id": 7, "tasks": ["11.4", "12.1", "12.2", "12.3"] },
    { "id": 8, "tasks": ["12.4", "13.1"] },
    { "id": 9, "tasks": ["13.2"] }
  ]
}
```

