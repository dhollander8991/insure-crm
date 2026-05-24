import { Link } from "react-router-dom";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { AuthShell } from "@/components/AuthShell";

const schema = z.string().trim().email("Enter a valid email").max(255);

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(email);
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
        <Link to="/login" className="font-medium text-primary hover:underline">
          Back to sign in
        </Link>
      }
    >
      {sent ? (
        <p className="rounded-lg border bg-muted/40 p-4 text-center text-sm text-muted-foreground">
          Please contact your administrator to reset the password for{" "}
          <span className="font-medium text-foreground">{email}</span>.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Send reset request
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
