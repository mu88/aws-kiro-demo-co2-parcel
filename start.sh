#!/usr/bin/env bash
# Installiert Abhaengigkeiten (falls noetig) und startet den Vite-Dev-Server.
set -euo pipefail

cd "$(dirname "$0")"

if [ ! -d "node_modules" ]; then
  echo "Installiere Abhaengigkeiten..."
  npm install
fi

echo "Starte Dev-Server..."
npm run dev
