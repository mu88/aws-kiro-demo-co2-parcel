// Gemockte Preisdaten für den Prototyp. Die Werte sind REPRÄSENTATIVE Mock-Preise
// in CHF, grob an der Grössenordnung und Gewichtsstufen-Struktur von PostPac
// orientiert (bis 2 kg, bis 10 kg, bis 30 kg), aber KEINE verbindlichen oder
// tagesaktuellen Tarife. Analog zu den Emissionsfaktoren sind sie indikativ und
// nicht zertifiziert (Prototyp, Mocking erlaubt).

import type { ServiceLevel } from '../domain/types';

/** Obergrenze einer Gewichtsstufe in Gramm und zugehöriger Preis je Service_Level. */
export interface PriceTier {
  maxWeightGrams: number;
  label: string;
}

/** Gewichtsstufen (gemockt), aufsteigend nach Obergrenze. */
export const priceTiers: PriceTier[] = [
  { maxWeightGrams: 2000, label: 'bis 2 kg' },
  { maxWeightGrams: 10000, label: 'bis 10 kg' },
  { maxWeightGrams: 30000, label: 'bis 30 kg' },
];

/**
 * Gemockte Preise in CHF je Service_Level und Gewichtsstufe. Reihenfolge der
 * Werte entspricht `priceTiers` (bis 2 kg, bis 10 kg, bis 30 kg).
 */
export const priceTableChf: Record<ServiceLevel, number[]> = {
  Economy: [9.0, 12.0, 21.0],
  Priority: [10.5, 13.5, 22.5],
  Kurier: [34.0, 42.0, 55.0],
};

/** Währungskennzeichnung der Preise. */
export const priceCurrency = 'CHF';
