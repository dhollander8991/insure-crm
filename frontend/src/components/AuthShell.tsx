import { Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

import styles from "./AuthShell.module.css";

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
    <div className={styles.pageRoot}>
      <div className="mesh-bg">
        <div className="mesh-orb" />
      </div>
      <div className={styles.contentWrapper}>
        <Link to="/" className={styles.logoLink}>
          <div className={styles.logoIcon}>
            <ShieldCheck className="h-5 w-5" />
          </div>
          <span className={styles.logoText}>Aegis CRM</span>
        </Link>
        <div className={`glass-strong ${styles.formCard}`}>
          <div className={styles.formCardHeading}>
            <h1 className={styles.formCardTitle}>{title}</h1>
            {subtitle && <p className={styles.formCardSubtitle}>{subtitle}</p>}
          </div>
          {children}
        </div>
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>
  );
}
