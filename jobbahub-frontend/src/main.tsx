import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app'; // Let op de kleine letter 'a' in bestandsnaam
import './index.css'; // Hier wordt de styling globaal geladen
import { LanguageProvider } from './context/LanguageContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </React.StrictMode>,
);