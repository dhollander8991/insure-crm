import styles from "./AuroraBackground.module.css";

export function AuroraBackground() {
  return (
    <div aria-hidden className={styles.root}>
      <div className={styles.base} />
      <div
        className={styles.blobA}
        style={{
          background:
            "radial-gradient(circle at 30% 30%, color-mix(in oklab, var(--primary) 55%, transparent), transparent 65%)",
        }}
      />
      <div
        className={styles.blobB}
        style={{
          background:
            "radial-gradient(circle at 60% 40%, color-mix(in oklab, var(--info) 60%, transparent), transparent 65%)",
        }}
      />
      <div
        className={styles.blobC}
        style={{
          background:
            "radial-gradient(circle at 50% 50%, color-mix(in oklab, var(--accent-foreground) 45%, transparent), transparent 65%)",
        }}
      />
      <div className={styles.grain} />
    </div>
  );
}
