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

import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  const { data: customersPage, isLoading: isCustomersLoading } =
    useCustomersQuery();
  const { data: policiesPage, isLoading: isPoliciesLoading } =
    usePoliciesQuery();

  const customers = customersPage?.content ?? [];
  const policies = policiesPage?.content ?? [];
  const isDataLoading = isCustomersLoading || isPoliciesLoading;

  const activePoliciesCount = policies.filter(
    (policy) => policy.status === "ACTIVE",
  ).length;
  const totalActivePremium = policies
    .filter((policy) => policy.status === "ACTIVE")
    .reduce((sum, policy) => sum + Number(policy.premium), 0);
  const newLeadsCount = customers.filter(
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
              <Sparkles className={styles.sparklesIcon} /> {t("dashboard.liveInsights")}
            </div>
            <h1 className={styles.heading}>
              <span className="shimmer-text">{t("dashboard.goodMorning")}</span>
            </h1>
            <p className={styles.headingSub}>
              {t("dashboard.portfolioHas")}{" "}
              <span className={styles.headingHighlight}>
                {activePoliciesCount} {t("dashboard.activePolicies")}
              </span>{" "}
              {t("dashboard.activePoliciesNow")}
            </p>
          </div>
          <div className={styles.metricBadge}>
            <div className={styles.metricIcon}>
              <TrendingUp className={styles.trendIcon} />
            </div>
            <div>
              <p className={styles.metricLabel}>{t("dashboard.activePolicies")}</p>
              <p className={styles.metricValue}>{activePoliciesCount}</p>
            </div>
          </div>
        </motion.div>

        {isDataLoading ? (
          <KpiGridSkeleton count={4} />
        ) : !isDataLoading &&
          customers.length === 0 &&
          policies.length === 0 ? (
          <EmptyState
            icon={LayoutDashboard}
            title={t("dashboard.noDataTitle")}
            description={t("dashboard.noDataDesc")}
          />
        ) : (
          <div className={styles.kpiGrid}>
            <div data-testid="kpi-total-premium">
              <KpiCard
                label={t("dashboard.totalPremium")}
                value={totalActivePremium}
                prefix="₪"
                delta={0}
                icon={DollarSign}
                index={0}
              />
            </div>
            <div data-testid="kpi-active-policies">
              <KpiCard
                label={t("dashboard.activePolicies")}
                value={activePoliciesCount}
                delta={0}
                icon={FileText}
                index={1}
              />
            </div>
            <div data-testid="kpi-open-claims">
              <KpiCard
                label={t("dashboard.openClaims")}
                value={0}
                delta={0}
                icon={ShieldAlert}
                index={2}
              />
            </div>
            <div data-testid="kpi-total-customers">
              <KpiCard
                label={t("dashboard.newLeads")}
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
                    <CardTitle className={styles.chartTitle}>{t("dashboard.revenueVsClaims")}</CardTitle>
                    <CardDescription>{t("dashboard.last12Months")}</CardDescription>
                  </div>
                  <div className={styles.legendRow}>
                    <span className={styles.legendPillPrimary}>
                      <span className={styles.legendDotPrimary} /> {t("dashboard.premium")}
                    </span>
                    <span className={styles.legendPillDestructive}>
                      <span className={styles.legendDotDestructive} /> {t("dashboard.claims")}
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
                  <CardTitle>{t("dashboard.policiesByType")}</CardTitle>
                  <CardDescription>{t("dashboard.productMix")}</CardDescription>
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
                  <CardTitle>{t("dashboard.claimsByStatus")}</CardTitle>
                  <CardDescription>{t("dashboard.pipelineVolume")}</CardDescription>
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
                  <CardTitle>{t("dashboard.leadPipeline")}</CardTitle>
                  <CardDescription>{t("dashboard.conversionFunnel")}</CardDescription>
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
          className={styles.activityWrapper}
        >
          <Card className={styles.activityCard}>
            <CardHeader>
              <CardTitle>{t("dashboard.recentActivity")}</CardTitle>
              <CardDescription>{t("dashboard.latestEvents")}</CardDescription>
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
                    <Activity className={styles.activityIconSvg} />
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
