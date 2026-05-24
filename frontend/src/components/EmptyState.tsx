import { type LucideIcon } from "lucide-react";

import styles from "./EmptyState.module.css";

import { Button } from "@/components/ui/Button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className={styles.root}>
      <div className={styles.iconWrap}>
        <Icon className={styles.icon} />
      </div>
      <h3 className={styles.title}>{title}</h3>
      {description && <p className={styles.description}>{description}</p>}
      {action && (
        <Button onClick={action.onClick} className={styles.actionButton}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
