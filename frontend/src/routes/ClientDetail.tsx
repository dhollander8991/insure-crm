import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Hash,
  User,
  FileText,
} from "lucide-react";
import clsx from "clsx";

import styles from "./ClientDetail.module.css";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PageTransition } from "@/components/PageTransition";
import { useCustomerByIdQuery } from "@/lib/queries/customers.queries";
import { usePoliciesByCustomerQuery } from "@/lib/queries/policies.queries";

const customerStatusClasses: Record<string, string> = {
  ACTIVE: styles.statusActive,
  INACTIVE: styles.statusInactive,
  PROSPECT: styles.statusProspect,
};

const policyStatusClasses: Record<string, string> = {
  ACTIVE: styles.policyStatusActive,
  PENDING: styles.policyStatusPending,
  EXPIRED: styles.policyStatusExpired,
  CANCELLED: styles.policyStatusCancelled,
};

export function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const customerId = Number(id);

  const {
    data: customer,
    isLoading,
    isError,
  } = useCustomerByIdQuery(customerId);
  const { data: customerPolicies = [] } =
    usePoliciesByCustomerQuery(customerId);

  if (isLoading) {
    return (
      <PageTransition>
        <div className={styles.loadingWrap}>
          <div className={styles.loadingSpinner} />
        </div>
      </PageTransition>
    );
  }

  if (isError || !customer) {
    return (
      <PageTransition>
        <div className={styles.errorWrap}>
          <Button
            variant="ghost"
            onClick={() => navigate("/clients")}
            className={styles.backButton}
          >
            <ArrowLeft className={styles.backIcon} /> Back to Clients
          </Button>
          <div className={styles.errorMessage}>
            Client not found or failed to load.
          </div>
        </div>
      </PageTransition>
    );
  }

  const fullName = `${customer.firstName} ${customer.lastName}`;
  const initials =
    `${customer.firstName[0]}${customer.lastName[0]}`.toUpperCase();

  return (
    <PageTransition>
      <div className={styles.page}>
        <div className="mesh-bg">
          <div className="mesh-orb" />
        </div>
        <div className={styles.contentArea}>
          <Button
            variant="ghost"
            onClick={() => navigate("/clients")}
            className={styles.backButton}
          >
            <ArrowLeft className={styles.backIcon} /> Back to Clients
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={styles.grid}
          >
            <div className={styles.profileCol}>
              <Card className={styles.profileCard}>
                <CardContent className={styles.profileCardContent}>
                  <div className={styles.profileCenter}>
                    <div className={styles.avatar}>{initials}</div>
                    <h1 className={styles.name}>{fullName}</h1>
                    <Badge
                      variant="outline"
                      className={clsx(
                        styles.statusBadge,
                        customerStatusClasses[customer.status],
                      )}
                    >
                      {customer.status}
                    </Badge>
                  </div>
                  <div className={styles.infoSection}>
                    <div className={styles.infoRow}>
                      <Mail className={styles.infoIcon} />
                      <span className={styles.infoBreak}>{customer.email}</span>
                    </div>
                    <div className={styles.infoRow}>
                      <Phone className={styles.infoIcon} />
                      <span>{customer.phone}</span>
                    </div>
                    <div className={styles.infoRow}>
                      <Hash className={styles.infoIcon} />
                      <span>ID: {customer.israeliId}</span>
                    </div>
                    <div className={styles.infoRow}>
                      <Calendar className={styles.infoIcon} />
                      <span>
                        DOB:{" "}
                        {new Date(customer.dateOfBirth).toLocaleDateString()}
                      </span>
                    </div>
                    <div className={styles.infoRow}>
                      <User className={styles.infoIcon} />
                      <span className={styles.infoBreak}>
                        Agent: {customer.agentEmail}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className={styles.policiesCol}>
              <Card className={styles.policiesCard}>
                <CardHeader>
                  <CardTitle className={styles.policiesTitle}>
                    <FileText className={styles.policiesTitleIcon} /> Policies (
                    {customerPolicies.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {customerPolicies.length === 0 ? (
                    <p className={styles.emptyPolicies}>
                      No policies found for this client.
                    </p>
                  ) : (
                    <div className={styles.policyList}>
                      {customerPolicies.map((policy) => (
                        <Link
                          key={policy.id}
                          to={`/policies/${policy.id}`}
                          className={styles.policyLink}
                        >
                          <div className={styles.policyCard}>
                            <div>
                              <p className={styles.policyNumber}>
                                {policy.policyNumber}
                              </p>
                              <p className={styles.policyMeta}>
                                {policy.type} · Renews{" "}
                                {new Date(policy.endDate).toLocaleDateString()}
                              </p>
                            </div>
                            <div className={styles.policyRight}>
                              <Badge
                                variant="outline"
                                className={clsx(
                                  styles.policyBadge,
                                  policyStatusClasses[policy.status],
                                )}
                              >
                                {policy.status}
                              </Badge>
                              <p className={styles.policyPremium}>
                                ${policy.premium}/mo
                              </p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}
