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

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PageTransition } from "@/components/PageTransition";
import { cn } from "@/lib/utils";
import { useCustomerByIdQuery } from "@/lib/queries/customers.queries";
import { usePoliciesByCustomerQuery } from "@/lib/queries/policies.queries";

const customerStatusStyles: Record<string, string> = {
  ACTIVE: "bg-success/15 text-success border-success/30",
  INACTIVE: "bg-muted text-muted-foreground border-border",
  PROSPECT: "bg-info/15 text-info border-info/30",
};

const policyStatusStyles: Record<string, string> = {
  ACTIVE: "bg-success/15 text-success border-success/30",
  PENDING: "bg-warning/15 text-warning border-warning/30",
  EXPIRED: "bg-muted text-muted-foreground border-border",
  CANCELLED: "bg-muted text-muted-foreground border-border",
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
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </PageTransition>
    );
  }

  if (isError || !customer) {
    return (
      <PageTransition>
        <div className="px-4 py-6 md:px-6 lg:px-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/clients")}
            className="mb-4 gap-2"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Clients
          </Button>
          <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-6 text-center text-sm text-destructive">
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
      <div className="relative px-4 py-6 md:px-6 lg:px-8">
        <div className="mesh-bg">
          <div className="mesh-orb" />
        </div>
        <div className="relative">
          <Button
            variant="ghost"
            onClick={() => navigate("/clients")}
            className="mb-6 gap-2"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Clients
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="grid gap-4 lg:grid-cols-3"
          >
            <div className="lg:col-span-1">
              <Card className="bg-card/70 backdrop-blur-xl">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
                      {initials}
                    </div>
                    <h1 className="mt-4 text-xl font-semibold">{fullName}</h1>
                    <Badge
                      variant="outline"
                      className={cn(
                        "mt-2 font-medium",
                        customerStatusStyles[customer.status],
                      )}
                    >
                      {customer.status}
                    </Badge>
                  </div>
                  <div className="mt-6 space-y-3 border-t pt-4">
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="break-all">{customer.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span>{customer.phone}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Hash className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span>ID: {customer.israeliId}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span>
                        DOB:{" "}
                        {new Date(customer.dateOfBirth).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <User className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="break-all">
                        Agent: {customer.agentEmail}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2">
              <Card className="bg-card/70 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" /> Policies (
                    {customerPolicies.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {customerPolicies.length === 0 ? (
                    <p className="text-center text-sm text-muted-foreground py-8">
                      No policies found for this client.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {customerPolicies.map((policy) => (
                        <Link
                          key={policy.id}
                          to={`/policies/${policy.id}`}
                          className="block"
                        >
                          <div className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/40">
                            <div>
                              <p className="text-sm font-semibold">
                                {policy.policyNumber}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {policy.type} · Renews{" "}
                                {new Date(policy.endDate).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-[10px]",
                                  policyStatusStyles[policy.status],
                                )}
                              >
                                {policy.status}
                              </Badge>
                              <p className="mt-1 text-sm font-semibold">
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
