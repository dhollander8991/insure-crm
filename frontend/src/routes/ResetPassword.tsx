import { Link } from "react-router-dom";

import styles from "./ResetPassword.module.css";

import { AuthShell } from "@/components/AuthShell";

export function ResetPasswordPage() {
  return (
    <AuthShell
      title="Password reset"
      subtitle="Password reset is managed by your administrator"
      footer={
        <Link to="/login" className={styles.footerLink}>
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
