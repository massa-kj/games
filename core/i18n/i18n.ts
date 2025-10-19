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
    lng: localStorage.getItem('lang') ?? 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;

// Helper function to change language
export function changeLanguage(lang: 'en' | 'ja') {
  localStorage.setItem('lang', lang);
  i18n.changeLanguage(lang);
}

// Helper function to get current language
export function getCurrentLanguage(): 'en' | 'ja' {
  return (i18n.language as 'en' | 'ja') || 'en';
}
