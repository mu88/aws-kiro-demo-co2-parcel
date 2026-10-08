#!/usr/bin/env pwsh
# Installiert Abhaengigkeiten (falls noetig) und startet den Vite-Dev-Server.
$ErrorActionPreference = 'Stop'

Set-Location -Path $PSScriptRoot

if (-not (Test-Path -Path 'node_modules')) {
    Write-Host 'Installiere Abhaengigkeiten...'
    npm install
}

Write-Host 'Starte Dev-Server...'
npm run dev
