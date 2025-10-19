import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import SettingsPage from './pages/SettingsPage';
import AboutPage from './pages/AboutPage';

function App() {
  const { i18n } = useTranslation();

  // Update document language
  React.useEffect(() => {
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <div className="min-h-screen bg-bg">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
