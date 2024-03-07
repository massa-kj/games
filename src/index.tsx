import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app';

const ROOT_ID = 'root' as const;
const rootElement = document.getElementById(ROOT_ID);

if (!rootElement) throw new Error(`Not found ${ROOT_ID}.`);

const root = ReactDOM.createRoot(rootElement);
root.render(<App />);
