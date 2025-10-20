import { useTranslation } from "react-i18next";
import { useSettings } from "./useSettings";

export function useLocale() {
  const { t, i18n } = useTranslation();
  const { settings, setLanguage } = useSettings();

  const switchLang = (lang: "en" | "ja") => {
    i18n.changeLanguage(lang);
    setLanguage(lang);
  };

  return { t, lang: settings.lang, switchLang };
}
