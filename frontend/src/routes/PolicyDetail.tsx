import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, DollarSign, User, Hash } from "lucide-react";
import { clsx as cx } from "clsx";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PageTransition } from "@/components/PageTransition";
import { usePolicyByIdQuery } from "@/lib/queries/policies.queries";
import { useCustomerByIdQuery } from "@/lib/queries/customers.queries";

const policyStatusStyles: Record<string, string> = {
  ACTIVE: "bg-success/15 text-success border-success/30",
  PENDING: "bg-warning/15 text-warning border-warning/30",
  EXPIRED: "bg-muted text-muted-foreground border-border",
  CANCELLED: "bg-muted text-muted-foreground border-border",
};

const policyTypeColors: Record<string, string> = {
  CAR: "from-sky-500/20 to-sky-500/5 text-sky-500",
  APARTMENT: "from-emerald-500/20 to-emerald-500/5 text-emerald-500",
  LIFE: "from-rose-500/20 to-rose-500/5 text-rose-500",
  HEALTH: "from-violet-500/20 to-violet-500/5 text-violet-500",
};

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-center justify-between border-b py-3 last:border-0">
      <span className="text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span className="text-sm font-medium">{value}</span>
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
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </PageTransition>
    );
  }

  if (isError || !policy) {
    return (
      <PageTransition>
        <div className="px-4 py-6 md:px-6 lg:px-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/policies")}
            className="mb-4 gap-2"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Policies
          </Button>
          <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-6 text-center text-sm text-destructive">
            Policy not found or failed to load.
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="relative px-4 py-6 md:px-6 lg:px-8">
        <div className="mesh-bg">
          <div className="mesh-orb" />
        </div>
        <div className="relative">
          <Button
            variant="ghost"
            onClick={() => navigate("/policies")}
            className="mb-6 gap-2"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Policies
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="grid gap-4 lg:grid-cols-2"
          >
            <Card className="bg-card/70 backdrop-blur-xl">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Policy Number
                    </p>
                    <CardTitle className="mt-1 text-xl">
                      {policy.policyNumber}
                    </CardTitle>
                  </div>
                  <div
                    className={cx(
                      "flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-lg font-bold",
                      policyTypeColors[policy.type],
                    )}
                  >
                    {policy.type[0]}
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={cx(
                    "w-fit font-medium",
                    policyStatusStyles[policy.status],
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

            <Card className="bg-card/70 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" /> Policy Holder
                </CardTitle>
              </CardHeader>
              <CardContent>
                {policyHolder ? (
                  <Link to={`/clients/${policyHolder.id}`} className="block">
                    <div className="flex items-center gap-4 rounded-xl border p-4 transition-colors hover:bg-muted/40">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-base font-bold text-primary">
                        {policyHolder.firstName[0]}
                        {policyHolder.lastName[0]}
                      </div>
                      <div>
                        <p className="font-semibold">
                          {policyHolder.firstName} {policyHolder.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {policyHolder.email}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {policyHolder.phone}
                        </p>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Hash className="h-4 w-4 text-muted-foreground" />
                      <span>Customer ID: {policy.customerId}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{policy.customerName}</span>
                    </div>
                  </div>
                )}

                <div className="mt-6 space-y-3 border-t pt-4">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Expires{" "}
                      {new Date(policy.endDate).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <DollarSign className="h-4 w-4" />
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
