import { Link } from "react-router-dom";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";

import styles from "./auth.module.css";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { AuthShell } from "@/components/AuthShell";

const schema = z.string().trim().email("Enter a valid email").max(255);

export function ForgotPasswordPage() {
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
    toast.success("If an account exists, a reset link will be sent");
  };

  return (
    <AuthShell
      title="Forgot password"
      subtitle="Contact your administrator to reset your password"
      footer={
        <Link to="/login" className={styles.forgotFooterLink}>
          Back to sign in
        </Link>
      }
    >
      {sent ? (
        <p className={styles.successMessage}>
          Please contact your administrator to reset the password for{" "}
          <span className={styles.successEmail}>{emailInput}</span>.
        </p>
      ) : (
        <form onSubmit={onSubmit} className={styles.forgotForm}>
          <div className={styles.forgotField}>
            <Label htmlFor="email">Email</Label>
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
            Send reset request
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
