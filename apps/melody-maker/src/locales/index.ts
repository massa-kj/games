import { useGameTranslation } from '@core/i18n';
import enTranslations from '../data/locales/en.json';
import jaTranslations from '../data/locales/ja.json';

// Create strongly typed translation resources
const translations = {
  en: enTranslations,
  ja: jaTranslations,
} as const;

/**
 * Type-safe translation hook for Melody Maker.
 *
 * This hook provides localized strings for the game with full TypeScript
 * intellisense and type safety. It supports nested translation keys using
 * dot notation (e.g., 'ui.buttons.start').
 *
 * @returns Translation function and language utilities with full IntelliSense
 *
 * @example
 * ```tsx
 * function GameComponent() {
 *   const { t, lang, changeLang } = useL10n();
 *
 *   return (
 *     <div>
 *       <h1>{t('title')}</h1>
 *       <button onClick={() => console.log('Start!')}>
 *         {t('ui.buttons.start')} // ← Full IntelliSense here!
 *       </button>
 *       <p>{t('game.states.loading')}</p> // ← And here!
 *     </div>
 *   );
 * }
 * ```
 */
export const useL10n = () => useGameTranslation(translations);
