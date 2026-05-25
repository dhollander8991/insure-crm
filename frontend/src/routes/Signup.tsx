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

const signupSchema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(6, "At least 6 characters").max(72),
});

export function SignupPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignupFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = signupSchema.safeParse({
      email: emailInput,
      password: passwordInput,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setIsSubmitting(true);
    try {
      const authResponse = await authApi.register(
        parsed.data.email,
        parsed.data.password,
      );
      tokenStorage.set(authResponse.token);
      emailStorage.set(authResponse.email);
      toast.success("Account created");
      navigate("/");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      title={t("auth.registerTitle")}
      subtitle={t("auth.registerSubtitle")}
      footer={
        <>
          {t("auth.alreadyHaveAccount")}{" "}
          <Link to="/login" className={styles.signupFooterLink}>
            {t("auth.signIn")}
          </Link>
        </>
      }
    >
      <form onSubmit={handleSignupFormSubmit} className={styles.signupForm}>
        <div className={styles.signupField}>
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
        <div className={styles.signupField}>
          <Label htmlFor="password">{t("auth.password")}</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            value={passwordInput}
            onChange={(event) => setPasswordInput(event.target.value)}
            required
          />
        </div>
        <Button
          type="submit"
          className={styles.signupSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting && <Loader2 className={styles.signupSpinner} />}
          {t("auth.createAccount")}
        </Button>
      </form>
    </AuthShell>
  );
}
