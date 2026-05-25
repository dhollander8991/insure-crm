import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import styles from "./auth.module.css";

import { useTranslation } from "react-i18next";
import { authApi, tokenStorage, emailStorage } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { AuthShell } from "@/components/AuthShell";

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(6, "At least 6 characters").max(72),
});

export function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLoginFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = loginSchema.safeParse({
      email: emailInput,
      password: passwordInput,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setIsSubmitting(true);
    try {
      const authResponse = await authApi.login(
        parsed.data.email,
        parsed.data.password,
      );
      tokenStorage.set(authResponse.token);
      emailStorage.set(authResponse.email);
      toast.success(t("auth.welcomeBack"));
      navigate("/");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      title={t("auth.signIn")}
      subtitle={t("auth.welcomeBack")}
      footer={
        <>
          {t("auth.newHere")}{" "}
          <Link to="/signup" className={styles.loginFooterLink}>
            {t("auth.createAccount")}
          </Link>
        </>
      }
    >
      <form onSubmit={handleLoginFormSubmit} className={styles.loginForm}>
        <div className={styles.loginField}>
          <Label htmlFor="email">{t("auth.email")}</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={emailInput}
            onChange={(event) => setEmailInput(event.target.value)}
            required
            data-testid="email-input"
          />
        </div>
        <div className={styles.loginField}>
          <div className={styles.passwordHeader}>
            <Label htmlFor="password">{t("auth.password")}</Label>
            <Link to="/forgot-password" className={styles.forgotLink}>
              {t("auth.forgotPassword")}
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            value={passwordInput}
            onChange={(event) => setPasswordInput(event.target.value)}
            required
            data-testid="password-input"
          />
        </div>
        <Button
          type="submit"
          className={styles.loginSubmit}
          disabled={isSubmitting}
          data-testid="login-button"
        >
          {isSubmitting && <Loader2 className={styles.loginSpinner} />}
          {t("auth.signIn")}
        </Button>
      </form>
    </AuthShell>
  );
}
