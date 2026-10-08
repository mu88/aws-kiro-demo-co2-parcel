// BrandHeader: Branding mit dem offiziellen Swiss Post Design System.
// Das Logo stammt aus der offiziellen Komponente `PostLogo`
// (@swisspost/design-system-components-react) – also aus einer autorisierten
// Quelle der Schweizerischen Post, nicht aus einer eigenen Nachbildung.
// Layout und Farben orientieren sich am Post-Erscheinungsbild (helle Kopfleiste
// wie post.ch).

import { PostLogo } from '@swisspost/design-system-components-react';
import './brand.css';

export default function BrandHeader() {
  return (
    <header className="brand-header" aria-label="Die Post">
      {/* Offizielles Post-Logo aus dem Swiss Post Design System. */}
      <PostLogo url="https://www.post.ch/de" className="brand-header__logo">
        Die Post – zur Startseite
      </PostLogo>

      <span className="brand-header__product">
        <span className="brand-header__product-title">
          CO2-Fussabdruck Paketversand
        </span>
        <span className="brand-header__product-subtitle">
          Prototyp · indikative, gemockte Werte
        </span>
      </span>
    </header>
  );
}
