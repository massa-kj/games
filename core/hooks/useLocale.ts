import { useTranslation } from "react-i18next";
import { useSettings } from "./useSettings";

export function useLocale() {
  const { i18n } = useTranslation();
  const { settings, setLanguage } = useSettings();

  const switchLang = (lang: "en" | "ja") => {
    i18n.changeLanguage(lang);
    setLanguage(lang);
  };

  return { lang: settings.lang, switchLang };
}
