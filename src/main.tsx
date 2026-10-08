import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@cloudscape-design/global-styles/index.css';
// Offizielle Swiss Post Design-Tokens (für die PostLogo-Komponente).
import '@swisspost/design-system-styles/post-tokens-default.css';
// Offizielle Swiss Post Sans Schrift (von fonts.post.ch, autorisierte Quelle).
import '@swisspost/design-system-styles/components/fonts.css';
import App from './App.tsx';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root-Element #root wurde nicht gefunden.');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);


