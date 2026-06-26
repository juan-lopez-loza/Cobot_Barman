// ============================================================
// main.tsx — Point d'entrée React
// ============================================================

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

const container = document.getElementById('root');

if (!container) {
  throw new Error('[Cobot Barman] Élément racine #root introuvable dans le DOM');
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
