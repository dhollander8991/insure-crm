import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { motion } from "framer-motion";

import styles from "../charts.module.css";

const POLICY_TYPE_DATA = [
  { type: "Life", count: 10 },
  { type: "Auto", count: 13 },
  { type: "Home", count: 9 },
  { type: "Health", count: 8 },
];

const COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
];

export function PoliciesDonut() {
  const total = POLICY_TYPE_DATA.reduce((s, d) => s + d.count, 0);
  return (
    <div className={styles.donutRoot}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className={styles.chartWrap}
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={POLICY_TYPE_DATA}
              dataKey="count"
              nameKey="type"
              innerRadius={70}
              outerRadius={100}
              paddingAngle={3}
              strokeWidth={0}
            >
              {POLICY_TYPE_DATA.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "var(--color-popover)",
                border: "1px solid var(--color-border)",
                borderRadius: 8,
                fontSize: 12,
                color: "var(--color-popover-foreground)",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className={styles.centerLabel}>
          <span className={styles.centerValue}>{total}</span>
          <span className={styles.centerSubtitle}>Total Policies</span>
        </div>
      </motion.div>
      <div className={styles.legend}>
        {POLICY_TYPE_DATA.map((d, i) => (
          <div key={d.type} className={styles.legendItem}>
            <span
              className={styles.legendDot}
              style={{ background: COLORS[i] }}
            />
            <span className={styles.legendType}>{d.type}</span>
            <span className={styles.legendCount}>{d.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
