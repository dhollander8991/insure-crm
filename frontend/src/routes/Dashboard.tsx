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
import { useCustomersQuery } from "@/lib/queries/customers.queries";
import { usePoliciesQuery } from "@/lib/queries/policies.queries";

const RECENT_ACTIVITY = [
  {
    id: 1,
    type: "policy",
    text: "New auto policy issued for Olivia Carter",
    time: "2m ago",
  },
  {
    id: 2,
    type: "claim",
    text: "Claim CLM-3012 approved — $4,200",
    time: "18m ago",
  },
  {
    id: 3,
    type: "lead",
    text: "New lead: Noah Bennett requested a quote",
    time: "1h ago",
  },
  {
    id: 4,
    type: "renewal",
    text: "Home policy POL-482910 renewed",
    time: "3h ago",
  },
  {
    id: 5,
    type: "claim",
    text: "Claim CLM-3007 moved to In Review",
    time: "5h ago",
  },
];

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
      <div data-testid="dashboard" className={styles.page}>
        <div className="mesh-bg">
          <div className="mesh-orb" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className={styles.pageHeader}
        >
          <div>
            <div className={styles.badgePill}>
              <Sparkles className="h-3 w-3" /> Live insights · Updated just now
            </div>
            <h1 className={styles.heading}>
              <span className="shimmer-text">Good morning</span>
            </h1>
            <p className={styles.headingSub}>
              Your portfolio has{" "}
              <span className={styles.headingHighlight}>
                {activePoliciesCount} active policies
              </span>{" "}
              right now.
            </p>
          </div>
          <div className={styles.metricBadge}>
            <div className={styles.metricIcon}>
              <TrendingUp className="h-4 w-4" />
            </div>
            <div>
              <p className={styles.metricLabel}>Active Policies</p>
              <p className={styles.metricValue}>{activePoliciesCount}</p>
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

        <div className={styles.chartGrid}>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.05 }}
            className={styles.chartCol4}
          >
            {isDataLoading ? (
              <ChartSkeleton height="h-72" />
            ) : (
              <Card className={styles.chartCard}>
                <CardHeader className={styles.chartCardHeader}>
                  <div>
                    <CardTitle className="text-lg">Revenue vs Claims</CardTitle>
                    <CardDescription>Last 12 months · live</CardDescription>
                  </div>
                  <div className={styles.legendRow}>
                    <span className={styles.legendPillPrimary}>
                      <span className={styles.legendDotPrimary} /> Premium
                    </span>
                    <span className={styles.legendPillDestructive}>
                      <span className={styles.legendDotDestructive} /> Claims
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
            className={styles.chartCol2}
          >
            {isDataLoading ? (
              <ChartSkeleton height="h-72" />
            ) : (
              <LiveCoverageGlobe />
            )}
          </motion.div>
        </div>

        <div className={styles.chartGrid}>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.1 }}
            className={styles.chartCol2}
          >
            {isDataLoading ? (
              <ChartSkeleton height="h-56" />
            ) : (
              <Card className={styles.chartCardSmall}>
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
            className={styles.chartCol2}
          >
            {isDataLoading ? (
              <ChartSkeleton height="h-56" />
            ) : (
              <Card className={styles.chartCardSmall}>
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
            className={styles.chartCol2}
          >
            {isDataLoading ? (
              <ChartSkeleton height="h-56" />
            ) : (
              <Card className={styles.chartCardSmall}>
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
          <Card className={styles.activityCard}>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest events across your workspace
              </CardDescription>
            </CardHeader>
            <CardContent className={styles.activityGrid}>
              {RECENT_ACTIVITY.map((activityItem, index) => (
                <motion.div
                  key={activityItem.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25, delay: 0.18 + index * 0.02 }}
                  className={styles.activityItem}
                >
                  <div className={styles.activityIcon}>
                    <Activity className="h-4 w-4" />
                  </div>
                  <div className={styles.activityTextGroup}>
                    <p className={styles.activityText}>{activityItem.text}</p>
                    <p className={styles.activityTime}>{activityItem.time}</p>
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
