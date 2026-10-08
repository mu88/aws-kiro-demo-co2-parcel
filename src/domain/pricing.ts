// Pricing: reine Funktion, die den gemockten Preis eines Package aus
// Service_Level und Paketgewicht ermittelt. Nutzt die gemockte Preistabelle
// (data/pricing). Preise sind indikative Prototyp-Werte, keine verbindlichen
// Tarife (siehe data/pricing).

import { priceTableChf, priceTiers } from '../data/pricing';
import type { ServiceLevel } from './types';

/**
 * Liefert den gemockten Preis (CHF) für das gegebene Service_Level und
 * Paketgewicht. Es wird die erste Gewichtsstufe gewählt, deren Obergrenze das
 * Gewicht abdeckt. Liegt das Gewicht über der höchsten Stufe, wird der Preis der
 * höchsten Stufe verwendet. Gibt `null`, wenn für das Service_Level keine Preise
 * hinterlegt sind.
 */
export function priceForPackage(
  serviceLevel: ServiceLevel,
  weightGrams: number,
): number | null {
  const prices = priceTableChf[serviceLevel];
  if (!prices || prices.length === 0) {
    return null;
  }
  const tierIndex = priceTiers.findIndex(
    (tier) => weightGrams <= tier.maxWeightGrams,
  );
  const index = tierIndex === -1 ? prices.length - 1 : tierIndex;
  return prices[index] ?? null;
}

/** Formatiert einen CHF-Preis für die Anzeige (zwei Nachkommastellen). */
export function formatPriceChf(priceChf: number): string {
  return `CHF ${priceChf.toFixed(2)}`;
}
