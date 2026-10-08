# Swiss Post CO2-Fussabdruck (Prototyp)

Clientseitiger Prototyp zur Schätzung des CO2-Fussabdrucks des Paketversands der
Schweizerischen Post. Die Kundin oder der Kunde wählt ein Service-Level
(Economy, Priority, Kurier), gibt Paketgewicht, Herkunfts- und Zielgebiet an und
erhält eine geschätzte CO2-Emission pro Paket sowie einen Gesamtwert.

> **Hinweis:** Dies ist ein Prototyp. Emissionsfaktoren, Transportarten,
> Distanzen und das Paketzentren-Netz sind mit repräsentativen Werten **gemockt**
> und stammen nicht aus produktiven Systemen. Die Schätzungen sind indikativ und
> keine zertifizierten CO2-Bilanzwerte.

## Technologie

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) (strict)
- [Vite](https://vite.dev/) als Build- und Dev-Server
- [Cloudscape Design System](https://cloudscape.design/) für die UI
- [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/) für Tests
- [fast-check](https://fast-check.dev/) für Property-Based-Tests
- [ESLint](https://eslint.org/) mit TypeScript-Plugin für statische Analyse

## Voraussetzungen

- [Node.js](https://nodejs.org/) 20 oder neuer
- npm (wird mit Node.js installiert)

## Installation

```bash
npm install
```

## Starten (Entwicklung)

Startet den Vite-Dev-Server mit Hot-Reload:

```bash
npm run dev
```

Alternativ über die Start-Skripte, die zusätzlich die Abhängigkeiten
installieren:

```bash
# Linux / macOS
./start.sh

# Windows (PowerShell)
./start.ps1
```

Der Dev-Server gibt die lokale URL (standardmässig <http://localhost:5173>) in
der Konsole aus.

## Build (Produktion)

Erzeugt ein optimiertes Bundle im Ordner `dist/`:

```bash
npm run build
```

Vorschau des Produktions-Builds:

```bash
npm run preview
```

## Qualitätssicherung

```bash
# Statische Typprüfung (tsc --noEmit)
npm run typecheck

# Linting
npm run lint

# Tests (einmalig, inkl. Property-Based-Tests)
npm run test
```

## Projektstruktur

```
src/
  domain/   Reine TypeScript-Domänenlogik (Validierung, Routenwahl, CO2-Berechnung)
  data/     Gemockte Datensätze (Route_Network, Emission_Factor_Catalog)
  ui/       React-/Cloudscape-Komponenten (Wizard, Schritte, Ergebnisanzeige)
  test/     Test-Setup
  App.tsx   Anwendungs-Grundgerüst
  main.tsx  Einstiegspunkt
```

Die Domänenlogik ist frei von React-Abhängigkeiten und dadurch direkt
testbar. Details zum Entwurf finden sich unter
`.kiro/specs/swiss-post-co2-footprint/`.
