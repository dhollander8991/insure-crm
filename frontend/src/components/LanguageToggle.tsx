import { useTranslation } from "react-i18next";
import styles from "./layout.module.css";

export function LanguageToggle() {
  const { i18n } = useTranslation();
  const isHebrew = i18n.language === "he";

  return (
    <button
      type="button"
      className={styles.langToggle}
      onClick={() => i18n.changeLanguage(isHebrew ? "en" : "he")}
      aria-label="Toggle language"
    >
      {isHebrew ? "EN" : "עב"}
    </button>
  );
}
