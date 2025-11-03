import { Button, GameHeader } from '@core/ui';
import { I18nProvider } from '@core/i18n';
import { useL10n } from '@/locales';
import '@/styles.css';

export default function {{GAME_ID_PASCAL}}App() {
  return (
    <I18nProvider>
      <GameContent />
    </I18nProvider>
  );
}

function GameContent() {
  const { t } = useL10n();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <GameHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            {t('title')}
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            {t('description')}
          </p>
          <Button onClick={() => console.log('Game started!')}>
            {t('ui.buttons.start')}
          </Button>
        </div>
      </main>
    </div>
  );
}
