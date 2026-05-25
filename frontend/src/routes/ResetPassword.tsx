import { Link } from "react-router-dom";

import styles from "./auth.module.css";

import { useTranslation } from "react-i18next";
import { AuthShell } from "@/components/AuthShell";

export function ResetPasswordPage() {
  const { t } = useTranslation();
  return (
    <AuthShell
      title={t("auth.resetTitle")}
      subtitle={t("auth.resetSubtitle")}
      footer={
        <Link to="/login" className={styles.resetFooterLink}>
          {t("auth.backToSignIn")}
        </Link>
      }
    >
      <p className={styles.message}>{t("auth.resetMessage")}</p>
    </AuthShell>
  );
}
