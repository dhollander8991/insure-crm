import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import styles from "./Login.module.css";

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
      toast.success("Welcome back");
      navigate("/");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Sign in"
      subtitle="Welcome back to Aegis"
      footer={
        <>
          New here?{" "}
          <Link to="/signup" className={styles.footerLink}>
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleLoginFormSubmit} className={styles.form}>
        <div className={styles.field}>
          <Label htmlFor="email">Email</Label>
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
        <div className={styles.field}>
          <div className={styles.passwordHeader}>
            <Label htmlFor="password">Password</Label>
            <Link to="/forgot-password" className={styles.forgotLink}>
              Forgot?
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
          className={styles.submitButton}
          disabled={isSubmitting}
          data-testid="login-button"
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Sign in
        </Button>
      </form>
    </AuthShell>
  );
}
