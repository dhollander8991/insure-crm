import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { motion } from "framer-motion";

import styles from "../charts.module.css";

const REVENUE_DATA = [
  { month: "Jun", premiums: 88500, claims: 28000 },
  { month: "Jul", premiums: 93000, claims: 30500 },
  { month: "Aug", premiums: 97500, claims: 27000 },
  { month: "Sep", premiums: 102000, claims: 33000 },
  { month: "Oct", premiums: 106500, claims: 31000 },
  { month: "Nov", premiums: 111000, claims: 35000 },
  { month: "Dec", premiums: 115500, claims: 29500 },
  { month: "Jan", premiums: 120000, claims: 38000 },
  { month: "Feb", premiums: 124500, claims: 34000 },
  { month: "Mar", premiums: 129000, claims: 32000 },
  { month: "Apr", premiums: 133500, claims: 36000 },
  { month: "May", premiums: 138000, claims: 40000 },
];

export function RevenueAreaChart() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className={styles.revenueChart}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={REVENUE_DATA}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="premiums" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor="var(--color-primary)"
                stopOpacity={0.4}
              />
              <stop
                offset="100%"
                stopColor="var(--color-primary)"
                stopOpacity={0}
              />
            </linearGradient>
            <linearGradient id="claims" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor="var(--color-warning)"
                stopOpacity={0.3}
              />
              <stop
                offset="100%"
                stopColor="var(--color-warning)"
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--color-border)"
            vertical={false}
          />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip
            contentStyle={{
              background: "var(--color-popover)",
              border: "1px solid var(--color-border)",
              borderRadius: 8,
              fontSize: 12,
              color: "var(--color-popover-foreground)",
            }}
            formatter={(v: number) => `$${v.toLocaleString()}`}
          />
          <Area
            type="monotone"
            dataKey="premiums"
            stroke="var(--color-primary)"
            strokeWidth={2}
            fill="url(#premiums)"
          />
          <Area
            type="monotone"
            dataKey="claims"
            stroke="var(--color-warning)"
            strokeWidth={2}
            fill="url(#claims)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
