import { useGameTranslation } from '@core/i18n';
import enTranslations from '../data/locales/en.json';
import jaTranslations from '../data/locales/ja.json';

// Create strongly typed translation resources with const assertion
const translations = {
  en: enTranslations,
  ja: jaTranslations,
} as const;

/**
 * Type-safe translation hook for Number Touch Game.
 *
 * This hook provides localized strings for the game with full TypeScript
 * intellisense and type safety. It supports nested translation keys using
 * dot notation (e.g., 'game.difficulty.easy').
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
 *       <h1>{t('game.title')}</h1>
 *       <button>{t('game.startGame')}</button>
 *       <p>{t('game.difficulty.easy')}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export const useL10n = () => useGameTranslation(translations);
