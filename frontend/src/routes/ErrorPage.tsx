import { useRouteError, isRouteErrorResponse, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import styles from "./ErrorPage.module.css";

export function ErrorPage() {
  const error = useRouteError();
  const navigate = useNavigate();
  const { t } = useTranslation();

  let message = t("error.defaultMessage", "An unexpected error occurred. Please try refreshing the page.");
  let status: number | undefined;

  if (isRouteErrorResponse(error)) {
    status = error.status;
    message = error.statusText || message;
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>
          {status === 404
            ? t("error.notFound", "Page not found")
            : t("error.title", "Something went wrong")}
        </h1>
        <p className={styles.message}>
          {status === 404
            ? t("error.notFoundMessage", "The page you're looking for doesn't exist.")
            : t("error.defaultMessage", "An unexpected error occurred. Please try refreshing the page.")}
        </p>
        {import.meta.env.DEV && status !== 404 && (
          <pre className={styles.details}>{message}</pre>
        )}
        <div className={styles.actions}>
          <button className={styles.button} onClick={() => navigate("/")}>
            {t("error.goHome", "Go home")}
          </button>
          <button className={styles.buttonSecondary} onClick={() => window.location.reload()}>
            {t("error.reload", "Reload page")}
          </button>
        </div>
      </div>
    </div>
  );
}
