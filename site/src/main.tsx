import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import '@core/themes/tokens.css';
import './index.css';

// Initialize i18n
import '@core/i18n/i18n.ts';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename="/games">
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
