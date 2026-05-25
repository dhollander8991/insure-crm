import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export function useLanguageDirection() {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === "he";
  const direction = isRTL ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.dir = direction;
    document.documentElement.lang = i18n.language;
  }, [direction, i18n.language]);

  return { isRTL, direction, language: i18n.language };
}
