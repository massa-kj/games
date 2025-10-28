import { Button, GameHeader } from '@core/ui';
import { useSettings } from '@core/hooks';
import '@/styles.css';

// Import translations
import enTranslations from '@/data/locales/en.json';
import jaTranslations from '@/data/locales/ja.json';

export default function {{GAME_ID_PASCAL}}App() {
  const { settings } = useSettings();
  const currentLang = settings.lang;
  const translations = currentLang === 'en' ? enTranslations : jaTranslations;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <GameHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            {translations.title}
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            {translations.description}
          </p>
          <Button onClick={() => console.log('Game started!')}>
            {translations.startGame}
          </Button>
        </div>
      </main>
    </div>
  );
}
