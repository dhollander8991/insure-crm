import { motion } from "framer-motion";

import styles from "./PipelineFunnel.module.css";

const PIPELINE_DATA = [
  { stage: "New Leads", count: 48 },
  { stage: "Contacted", count: 34 },
  { stage: "Qualified", count: 22 },
  { stage: "Proposal", count: 14 },
  { stage: "Won", count: 9 },
];

export function PipelineFunnel() {
  const max = Math.max(...PIPELINE_DATA.map((d) => d.count));
  return (
    <div className={styles.root}>
      {PIPELINE_DATA.map((d, i) => {
        const pct = (d.count / max) * 100;
        return (
          <div key={d.stage} className={styles.row}>
            <div className={styles.rowHeader}>
              <span className={styles.rowLabel}>{d.stage}</span>
              <span className={styles.rowCount}>{d.count}</span>
            </div>
            <div className={styles.track}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{
                  duration: 0.8,
                  delay: 0.3 + i * 0.1,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className={styles.fill}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
