// Core i18n setup and utilities
export { default as i18n, changeLanguage, getCurrentLanguage } from './i18n.js';

// React components and hooks
export { I18nProvider } from './I18nProvider.js';
export { useGameTranslation } from './useGameTranslation.js';

// Type definitions
export type {
  SupportedLanguage,
  NestedKeyOf,
  NestedValueOf,
  TranslationDict,
  TranslationResources,
  GameTranslationConfig,
  GameTranslationHook,
  I18nProviderProps,
} from './types.js';
