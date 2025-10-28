/**
 * {{GAME_TITLE_EN}} - Main Entry Point
 * Author: {{AUTHOR}}
 * Created: {{CURRENT_YEAR}}
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from '@/App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
