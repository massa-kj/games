import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ja from '../../data/locales/ja.json';
import en from '../../data/locales/en.json';

// Initialize i18n
i18n
  .use(initReactI18next)
  .init({
    resources: {
      ja: { translation: ja },
      en: { translation: en },
    },
    lng: localStorage.getItem('lang') ?? 'ja',
    fallbackLng: 'ja',
    interpolation: {
      escapeValue: false, // React already escapes
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;

// Helper function to change language
export function changeLanguage(lang: 'ja' | 'en') {
  localStorage.setItem('lang', lang);
  i18n.changeLanguage(lang);
}

// Helper function to get current language
export function getCurrentLanguage(): 'ja' | 'en' {
  return (i18n.language as 'ja' | 'en') || 'ja';
}
