import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthShell } from "@/components/auth-shell";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Reset password — Aegis CRM" }] }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  return (
    <AuthShell
      title="Password reset"
      subtitle="Password reset is managed by your administrator"
      footer={
        <Link to="/login" className="font-medium text-primary hover:underline">Back to sign in</Link>
      }
    >
      <p className="rounded-lg border bg-muted/40 p-4 text-center text-sm text-muted-foreground">
        Please contact your administrator to set a new password.
      </p>
    </AuthShell>
  );
}
