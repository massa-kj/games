/**
 * Supported language codes for the application.
 */
export type SupportedLanguage = 'en' | 'ja';

/**
 * Type utility to extract nested keys from a translation object.
 * Supports dot notation for nested access (e.g., 'common.buttons.start').
 */
export type NestedKeyOf<T> = T extends Record<string, any>
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends Record<string, any>
          ? `${K}.${NestedKeyOf<T[K]>}`
          : K
        : never;
    }[keyof T]
  : never;

/**
 * Type utility to get the value type from a nested key path.
 */
export type NestedValueOf<T, K extends string> = K extends `${infer Head}.${infer Tail}`
  ? Head extends keyof T
    ? T[Head] extends Record<string, any>
      ? NestedValueOf<T[Head], Tail>
      : never
    : never
  : K extends keyof T
  ? T[K]
  : never;

/**
 * Translation dictionary structure for a single language.
 */
export interface TranslationDict extends Record<string, any> {}

/**
 * Translation resources for all supported languages.
 */
export type TranslationResources<T extends TranslationDict> = Record<SupportedLanguage, T>;

/**
 * Configuration options for game translation setup.
 */
export interface GameTranslationConfig<T extends TranslationDict> {
  /** Translation dictionaries for each supported language */
  resources: TranslationResources<T>;
  /** Fallback language when a key is not found */
  fallbackLanguage?: SupportedLanguage;
}

/**
 * Return type for the useGameTranslation hook.
 */
export interface GameTranslationHook<T extends TranslationDict> {
  /** Translation function with type-safe key completion */
  t: <K extends NestedKeyOf<T>>(key: K) => NestedValueOf<T, K>;
  /** Current active language */
  lang: SupportedLanguage;
  /** Change the current language */
  changeLang: (lang: SupportedLanguage) => void;
}

/**
 * Utility type to infer the translation dictionary type from a const assertion.
 * This helps TypeScript provide better IntelliSense for translation keys.
 */
export type InferTranslationDict<T> = T extends Record<SupportedLanguage, infer U>
  ? U extends TranslationDict
    ? U
    : never
  : never;

/**
 * Props for the I18nProvider component.
 */
export interface I18nProviderProps {
  /** React children to provide i18n context to */
  children: React.ReactNode;
}
