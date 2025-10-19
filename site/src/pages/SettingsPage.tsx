import { useTranslation } from 'react-i18next';
import { useSettings } from '@core/hooks';
import { Button, Toggle } from '@core/ui';

function SettingsPage() {
  const { t, i18n } = useTranslation();
  const { settings, updateSettings } = useSettings();

  const handleLanguageChange = (lang: 'en' | 'ja') => {
    updateSettings({ lang });
    i18n.changeLanguage(lang);
  };

  const handleSoundToggle = () => {
    updateSettings({ sound: !settings.sound });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-text mb-8">
        {t('site.nav.settings')}
      </h1>

      <div className="space-y-8">
        {/* Language settings */}
        <section className="bg-surface rounded-xl p-6 shadow-card">
          <h2 className="text-xl font-semibold text-text mb-4">
            {t('site.settings.language')}
          </h2>
          <div className="flex gap-3">
            <Button
              variant={settings.lang === 'en' ? 'primary' : 'secondary'}
              onClick={() => handleLanguageChange('en')}
            >
              English
            </Button>
            <Button
              variant={settings.lang === 'ja' ? 'primary' : 'secondary'}
              onClick={() => handleLanguageChange('ja')}
            >
              日本語
            </Button>
          </div>
        </section>

        {/* Sound settings */}
        <section className="bg-surface rounded-xl p-6 shadow-card">
          <h2 className="text-xl font-semibold text-text mb-4">
            {t('site.settings.sound')}
          </h2>
          <div className="flex items-center justify-between">
            <span className="text-text">
              {t('site.settings.soundEnabled')}
            </span>
            <Toggle
              checked={settings.sound}
              onChange={handleSoundToggle}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

export default SettingsPage;
