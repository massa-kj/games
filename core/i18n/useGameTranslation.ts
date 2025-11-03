import { useTranslation } from 'react-i18next';
import type {
  SupportedLanguage,
  TranslationDict,
  TranslationResources,
  GameTranslationHook,
  NestedKeyOf,
  NestedValueOf,
} from './types';

/**
 * Type-safe hook for game-specific translations with nested key support.
 *
 * This hook provides a translation function that supports dot notation for nested keys
 * (e.g., 'ui.buttons.start') with full TypeScript intellisense and type safety.
 * It integrates with the global i18n system while maintaining game-specific translation isolation.
 *
 * For optimal type inference, use `as const` when defining your translation resources:
 * ```typescript
 * const translations = { en, ja } as const;
 * export const useL10n = () => useGameTranslation(translations);
 * ```
 *
 * @template T - The shape of the translation dictionary (inferred from resources)
 * @param resources - Translation dictionaries for each supported language
 * @param fallbackLanguage - Language to use when current language dictionary is missing (defaults to 'ja')
 *
 * @returns Object containing translation function, current language, and language change function
 *
 * @example
 * ```typescript
 * // In your game's locales/index.ts
 * import enTranslations from '../data/locales/en.json';
 * import jaTranslations from '../data/locales/ja.json';
 *
 * const translations = { en: enTranslations, ja: jaTranslations } as const;
 * export const useL10n = () => useGameTranslation(translations);
 *
 * // In your components - IntelliSense will show all available keys
 * function GameComponent() {
 *   const { t, lang, changeLang } = useL10n();
 *
 *   return (
 *     <div>
 *       <h1>{t('title')}</h1>
 *       <button onClick={() => console.log('start')}>
 *         {t('ui.buttons.start')}
 *       </button>
 *       <p>{t('game.states.loading')}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useGameTranslation<T extends TranslationDict>(
  resources: TranslationResources<T>,
  fallbackLanguage: SupportedLanguage = 'ja'
): GameTranslationHook<T> {
  const { i18n } = useTranslation();
  const currentLang = (i18n.language as SupportedLanguage) || fallbackLanguage;

  // Get the appropriate dictionary, falling back as needed
  const dict = resources[currentLang] || resources[fallbackLanguage];

  /**
   * Get a nested value from an object using dot notation.
   * @param obj - The object to traverse
   * @param path - Dot-separated path to the desired value
   * @returns The value at the specified path, or the path itself if not found
   */
  const getNestedValue = (obj: any, path: string): any => {
    return path.split('.').reduce((current, key) => {
      return current && typeof current === 'object' ? current[key] : undefined;
    }, obj);
  };

  /**
   * Type-safe translation function with nested key support.
   * Supports dot notation for accessing nested translation keys.
   */
  const t = <K extends NestedKeyOf<T>>(key: K): NestedValueOf<T, K> => {
    const value = getNestedValue(dict, key as string);

    // Return the value if found, otherwise return the key as fallback
    return (value !== undefined ? value : key) as NestedValueOf<T, K>;
  };

  /**
   * Change the current language and update localStorage.
   * This will trigger a re-render with the new language dictionary.
   */
  const changeLang = (lang: SupportedLanguage): void => {
    i18n.changeLanguage(lang);
    localStorage.setItem('lang', lang);
  };

  return {
    t,
    lang: currentLang,
    changeLang,
  };
}
