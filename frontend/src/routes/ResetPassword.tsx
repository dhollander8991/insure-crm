import { Link } from "react-router-dom";

import styles from "./auth.module.css";

import { AuthShell } from "@/components/AuthShell";

export function ResetPasswordPage() {
  return (
    <AuthShell
      title="Password reset"
      subtitle="Password reset is managed by your administrator"
      footer={
        <Link to="/login" className={styles.resetFooterLink}>
          Back to sign in
        </Link>
      }
    >
      <p className={styles.message}>
        Please contact your administrator to set a new password.
      </p>
    </AuthShell>
  );
}
