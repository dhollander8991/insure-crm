import { Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

import styles from "./forms.module.css";

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
    <div className={styles.authRoot}>
      <div className="mesh-bg">
        <div className="mesh-orb" />
      </div>
      <div className={styles.authContentWrapper}>
        <Link to="/" className={styles.authLogoLink}>
          <div className={styles.authLogoIcon}>
            <ShieldCheck className={styles.authShieldIcon} />
          </div>
          <span className={styles.authLogoText}>Aegis CRM</span>
        </Link>
        <div className={styles.authCard}>
          <div className={styles.authCardHeader}>
            <h1 className={styles.authCardTitle}>{title}</h1>
            {subtitle && <p className={styles.authCardSubtitle}>{subtitle}</p>}
          </div>
          {children}
        </div>
        {footer && <div className={styles.authFooter}>{footer}</div>}
      </div>
    </div>
  );
}
