import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, DollarSign, User, Hash } from "lucide-react";
import clsx from "clsx";

import styles from "./PolicyDetail.module.css";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PageTransition } from "@/components/PageTransition";
import { usePolicyByIdQuery } from "@/lib/queries/policies.queries";
import { useCustomerByIdQuery } from "@/lib/queries/customers.queries";

const policyStatusClasses: Record<string, string> = {
  ACTIVE: styles.statusActive,
  PENDING: styles.statusPending,
  EXPIRED: styles.statusExpired,
  CANCELLED: styles.statusCancelled,
};

const policyTypeClasses: Record<string, string> = {
  CAR: styles.typeCAR,
  APARTMENT: styles.typeAPARTMENT,
  LIFE: styles.typeLIFE,
  HEALTH: styles.typeHEALTH,
};

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className={styles.detailRow}>
      <span className={styles.detailLabel}>{label}</span>
      <span className={styles.detailValue}>{value}</span>
    </div>
  );
}

export function PolicyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const policyId = Number(id);

  const { data: policy, isLoading, isError } = usePolicyByIdQuery(policyId);
  const { data: policyHolder } = useCustomerByIdQuery(policy?.customerId ?? 0);

  if (isLoading) {
    return (
      <PageTransition>
        <div className={styles.loadingWrap}>
          <div className={styles.loadingSpinner} />
        </div>
      </PageTransition>
    );
  }

  if (isError || !policy) {
    return (
      <PageTransition>
        <div className={styles.errorWrap}>
          <Button
            variant="ghost"
            onClick={() => navigate("/policies")}
            className={styles.backButton}
          >
            <ArrowLeft className="h-4 w-4" /> Back to Policies
          </Button>
          <div className={styles.errorMessage}>
            Policy not found or failed to load.
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className={styles.page}>
        <div className="mesh-bg">
          <div className="mesh-orb" />
        </div>
        <div className="relative">
          <Button
            variant="ghost"
            onClick={() => navigate("/policies")}
            className={styles.backButton}
          >
            <ArrowLeft className="h-4 w-4" /> Back to Policies
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={styles.grid}
          >
            <Card className={styles.card}>
              <CardHeader>
                <div className={styles.policyHeader}>
                  <div>
                    <p className={styles.policyMeta}>Policy Number</p>
                    <CardTitle className={styles.policyNumber}>
                      {policy.policyNumber}
                    </CardTitle>
                  </div>
                  <div
                    className={clsx(
                      styles.typeIcon,
                      policyTypeClasses[policy.type],
                    )}
                  >
                    {policy.type[0]}
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={clsx(
                    styles.statusBadge,
                    policyStatusClasses[policy.status],
                  )}
                >
                  {policy.status}
                </Badge>
              </CardHeader>
              <CardContent>
                <DetailRow label="Type" value={policy.type} />
                <DetailRow label="Premium" value={`$${policy.premium}/mo`} />
                <DetailRow
                  label="Start Date"
                  value={new Date(policy.startDate).toLocaleDateString()}
                />
                <DetailRow
                  label="End Date"
                  value={new Date(policy.endDate).toLocaleDateString()}
                />
                <DetailRow label="Agent" value={policy.agentEmail} />
              </CardContent>
            </Card>

            <Card className={styles.card}>
              <CardHeader>
                <CardTitle className={styles.holderTitle}>
                  <User className="h-5 w-5" /> Policy Holder
                </CardTitle>
              </CardHeader>
              <CardContent>
                {policyHolder ? (
                  <Link
                    to={`/clients/${policyHolder.id}`}
                    className={styles.holderLink}
                  >
                    <div className={styles.holderCard}>
                      <div className={styles.holderAvatar}>
                        {policyHolder.firstName[0]}
                        {policyHolder.lastName[0]}
                      </div>
                      <div>
                        <p className={styles.holderName}>
                          {policyHolder.firstName} {policyHolder.lastName}
                        </p>
                        <p className={styles.holderEmail}>
                          {policyHolder.email}
                        </p>
                        <p className={styles.holderPhone}>
                          {policyHolder.phone}
                        </p>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div className={styles.holderFallback}>
                    <div className={styles.holderFallbackRow}>
                      <Hash className={styles.holderFallbackIcon} />
                      <span>Customer ID: {policy.customerId}</span>
                    </div>
                    <div className={styles.holderFallbackRow}>
                      <User className={styles.holderFallbackIcon} />
                      <span>{policy.customerName}</span>
                    </div>
                  </div>
                )}

                <div className={styles.infoSection}>
                  <div className={styles.infoRow}>
                    <Calendar className={styles.infoIcon} />
                    <span>
                      Expires{" "}
                      {new Date(policy.endDate).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <div className={styles.infoRow}>
                    <DollarSign className={styles.infoIcon} />
                    <span>${policy.premium} / month</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}
