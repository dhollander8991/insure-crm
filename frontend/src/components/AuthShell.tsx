import { Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="auth-page-root bg-background py-10">
      <div className="mesh-bg">
        <div className="mesh-orb" />
      </div>
      <div className="auth-content-wrapper">
        <Link
          to="/"
          className="mb-6 flex items-center justify-center gap-2 no-underline"
        >
          <div className="auth-logo-icon">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold tracking-tight">
            Aegis CRM
          </span>
        </Link>
        <div className="glass-strong auth-form-card">
          <div className="mb-6 text-center">
            <h1 className="auth-card-title">{title}</h1>
            {subtitle && <p className="auth-card-subtitle">{subtitle}</p>}
          </div>
          {children}
        </div>
        {footer && <div className="auth-footer">{footer}</div>}
      </div>
    </div>
  );
}
