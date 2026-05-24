import { motion } from "framer-motion";
import {
  DollarSign,
  FileText,
  ShieldAlert,
  UserPlus,
  Activity,
  Sparkles,
  TrendingUp,
  LayoutDashboard,
} from "lucide-react";

import styles from "./Dashboard.module.css";

import { EmptyState } from "@/components/EmptyState";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { PageTransition } from "@/components/PageTransition";
import { KpiCard } from "@/components/KpiCard";
import { RevenueAreaChart } from "@/components/charts/RevenueAreaChart";
import { PoliciesDonut } from "@/components/charts/PoliciesDonut";
import { ClaimsBarChart } from "@/components/charts/ClaimsBarChart";
import { PipelineFunnel } from "@/components/charts/PipelineFunnel";
import { LiveCoverageGlobe } from "@/components/charts/LiveCoverageGlobe";
import { KpiGridSkeleton, ChartSkeleton } from "@/components/Skeletons";
import { recentActivity } from "@/lib/mock-data";
import { useCustomersQuery } from "@/lib/queries/customers.queries";
import { usePoliciesQuery } from "@/lib/queries/policies.queries";

export function Dashboard() {
  const { data: customersData = [], isLoading: isCustomersLoading } =
    useCustomersQuery();
  const { data: policiesData = [], isLoading: isPoliciesLoading } =
    usePoliciesQuery();

  const isDataLoading = isCustomersLoading || isPoliciesLoading;

  const activePoliciesCount = policiesData.filter(
    (policy) => policy.status === "ACTIVE",
  ).length;
  const totalActivePremium = policiesData
    .filter((policy) => policy.status === "ACTIVE")
    .reduce((sum, policy) => sum + Number(policy.premium), 0);
  const newLeadsCount = customersData.filter(
    (customer) => customer.status === "PROSPECT",
  ).length;

  return (
    <PageTransition>
      <div data-testid="dashboard" className={styles.pageWrapper}>
        <div className="mesh-bg">
          <div className="mesh-orb" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative mb-8 flex flex-wrap items-end justify-between gap-4"
        >
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary backdrop-blur">
              <Sparkles className="h-3 w-3" /> Live insights · Updated just now
            </div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl lg:text-5xl">
              <span className="shimmer-text">Good morning</span>
            </h1>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              Your portfolio has{" "}
              <span className="font-semibold text-success">
                {activePoliciesCount} active policies
              </span>{" "}
              right now.
            </p>
          </div>
          <div className="glass-strong flex items-center gap-3 rounded-2xl px-4 py-3 shadow-[var(--shadow-elegant)]">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-glow text-primary-foreground">
              <TrendingUp className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Active Policies
              </p>
              <p className="text-lg font-semibold tabular-nums">
                {activePoliciesCount}
              </p>
            </div>
          </div>
        </motion.div>

        {isDataLoading ? (
          <KpiGridSkeleton count={4} />
        ) : !isDataLoading &&
          customersData.length === 0 &&
          policiesData.length === 0 ? (
          <EmptyState
            icon={LayoutDashboard}
            title="No data yet"
            description="Add clients and policies to see your dashboard metrics."
          />
        ) : (
          <div className={styles.kpiGrid}>
            <div data-testid="kpi-total-premium">
              <KpiCard
                label="Total Premium (Active)"
                value={totalActivePremium}
                prefix="₪"
                delta={0}
                icon={DollarSign}
                index={0}
              />
            </div>
            <div data-testid="kpi-active-policies">
              <KpiCard
                label="Active Policies"
                value={activePoliciesCount}
                delta={0}
                icon={FileText}
                index={1}
              />
            </div>
            <div data-testid="kpi-open-claims">
              <KpiCard
                label="Open Claims"
                value={0}
                delta={0}
                icon={ShieldAlert}
                index={2}
              />
            </div>
            <div data-testid="kpi-total-customers">
              <KpiCard
                label="New Leads"
                value={newLeadsCount}
                delta={0}
                icon={UserPlus}
                index={3}
              />
            </div>
          </div>
        )}

        <div className="relative mt-5 grid gap-4 lg:grid-cols-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.05 }}
            className="lg:col-span-4"
          >
            {isDataLoading ? (
              <ChartSkeleton height="h-72" />
            ) : (
              <Card className="ring-holo h-full overflow-hidden bg-card/70 backdrop-blur-xl">
                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                  <div>
                    <CardTitle className="text-lg">Revenue vs Claims</CardTitle>
                    <CardDescription>Last 12 months · live</CardDescription>
                  </div>
                  <div className="flex gap-2 text-[10px]">
                    <span className="flex items-center gap-1.5 rounded-full bg-primary/10 px-2 py-1 font-medium text-primary">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />{" "}
                      Premium
                    </span>
                    <span className="flex items-center gap-1.5 rounded-full bg-destructive/10 px-2 py-1 font-medium text-destructive">
                      <span className="h-1.5 w-1.5 rounded-full bg-destructive" />{" "}
                      Claims
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <RevenueAreaChart />
                </CardContent>
              </Card>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.08 }}
            className="lg:col-span-2"
          >
            {isDataLoading ? (
              <ChartSkeleton height="h-72" />
            ) : (
              <LiveCoverageGlobe />
            )}
          </motion.div>
        </div>

        <div className="relative mt-5 grid gap-4 lg:grid-cols-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.1 }}
            className="lg:col-span-2"
          >
            {isDataLoading ? (
              <ChartSkeleton height="h-56" />
            ) : (
              <Card className="h-full bg-card/70 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle>Policies by Type</CardTitle>
                  <CardDescription>Product mix</CardDescription>
                </CardHeader>
                <CardContent>
                  <PoliciesDonut />
                </CardContent>
              </Card>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.12 }}
            className="lg:col-span-2"
          >
            {isDataLoading ? (
              <ChartSkeleton height="h-56" />
            ) : (
              <Card className="h-full bg-card/70 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle>Claims by Status</CardTitle>
                  <CardDescription>Pipeline volume</CardDescription>
                </CardHeader>
                <CardContent>
                  <ClaimsBarChart />
                </CardContent>
              </Card>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.14 }}
            className="lg:col-span-2"
          >
            {isDataLoading ? (
              <ChartSkeleton height="h-56" />
            ) : (
              <Card className="h-full bg-card/70 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle>Lead Pipeline</CardTitle>
                  <CardDescription>Conversion funnel</CardDescription>
                </CardHeader>
                <CardContent>
                  <PipelineFunnel />
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.16 }}
          className="relative mt-5"
        >
          <Card className="bg-card/70 backdrop-blur-xl">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest events across your workspace
              </CardDescription>
            </CardHeader>
            <CardContent className={styles.activityGrid}>
              {recentActivity.map((activityItem, index) => (
                <motion.div
                  key={activityItem.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25, delay: 0.18 + index * 0.02 }}
                  className="flex items-start gap-3 rounded-xl border border-transparent p-3 transition-all hover:border-border hover:bg-muted/40"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 text-primary">
                    <Activity className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-snug">{activityItem.text}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {activityItem.time}
                    </p>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </PageTransition>
  );
}
