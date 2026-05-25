import { Link } from "react-router-dom";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";

import styles from "./auth.module.css";

import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { AuthShell } from "@/components/AuthShell";

const schema = z.string().trim().email("Enter a valid email").max(255);

export function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [emailInput, setEmailInput] = useState("");
  const [sent, setSent] = useState(false);

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = schema.safeParse(emailInput);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSent(true);
    toast.success(t("auth.sendResetRequest"));
  };

  return (
    <AuthShell
      title={t("auth.forgotTitle")}
      subtitle={t("auth.forgotSubtitle")}
      footer={
        <Link to="/login" className={styles.forgotFooterLink}>
          {t("auth.backToSignIn")}
        </Link>
      }
    >
      {sent ? (
        <p className={styles.successMessage}>
          {t("auth.contactAdmin")}{" "}
          <span className={styles.successEmail}>{emailInput}</span>.
        </p>
      ) : (
        <form onSubmit={onSubmit} className={styles.forgotForm}>
          <div className={styles.forgotField}>
            <Label htmlFor="email">{t("auth.email")}</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={emailInput}
              onChange={(event) => setEmailInput(event.target.value)}
              required
            />
          </div>
          <Button type="submit" className={styles.forgotSubmit}>
            {t("auth.sendResetRequest")}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
