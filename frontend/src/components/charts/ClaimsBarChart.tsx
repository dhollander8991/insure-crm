import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import { motion } from "framer-motion";

const CLAIM_STATUS_DATA = [
  { status: "Open", count: 6 },
  { status: "In Review", count: 4 },
  { status: "Approved", count: 7 },
  { status: "Rejected", count: 5 },
];

const COLORS: Record<string, string> = {
  Open: "var(--color-info)",
  "In Review": "var(--color-warning)",
  Approved: "var(--color-success)",
  Rejected: "var(--color-destructive)",
};

export function ClaimsBarChart() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="h-72 w-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={CLAIM_STATUS_DATA}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--color-border)"
            vertical={false}
          />
          <XAxis
            dataKey="status"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
          />
          <Tooltip
            cursor={{ fill: "var(--color-muted)", opacity: 0.4 }}
            contentStyle={{
              background: "var(--color-popover)",
              border: "1px solid var(--color-border)",
              borderRadius: 8,
              fontSize: 12,
              color: "var(--color-popover-foreground)",
            }}
          />
          <Bar dataKey="count" radius={[8, 8, 0, 0]}>
            {CLAIM_STATUS_DATA.map((d) => (
              <Cell key={d.status} fill={COLORS[d.status]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
