import React from 'react';
import ReactDOM from 'react-dom';
import App from './app';

const ROOT_ID = 'root' as const;
const rootElement = document.getElementById(ROOT_ID);

if (!rootElement) throw new Error(`${ROOT_ID}の要素が見つかりません。`);

const root = ReactDOM.createRoot(rootElement);
root.render(<App />);
