import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Heart, Car, Home, Stethoscope, Calendar, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageTransition } from "@/components/page-transition";
import { CardGridSkeleton } from "@/components/skeletons";
import { policyApi, type PolicyResponse } from "@/lib/api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/policies")({
  head: () => ({
    meta: [
      { title: "Policies — Aegis CRM" },
      { name: "description", content: "Manage active, pending, and expired insurance policies." },
    ],
  }),
  component: PoliciesPage,
});

type PolicyType = "Life" | "Auto" | "Home" | "Health";
type PolicyStatus = "Active" | "Pending" | "Expired";

const TYPE_MAP: Record<PolicyResponse["type"], PolicyType> = {
  CAR: "Auto",
  APARTMENT: "Home",
  LIFE: "Life",
  HEALTH: "Health",
};

const STATUS_MAP: Record<PolicyResponse["status"], PolicyStatus | "Expired"> = {
  ACTIVE: "Active",
  PENDING: "Pending",
  EXPIRED: "Expired",
  CANCELLED: "Expired",
};

interface MappedPolicy {
  id: number;
  policyNumber: string;
  clientName: string;
  type: PolicyType;
  status: PolicyStatus;
  premium: number;
  endDate: string;
}

function mapPolicy(p: PolicyResponse): MappedPolicy {
  return {
    id: p.id,
    policyNumber: p.policyNumber,
    clientName: p.customerName,
    type: TYPE_MAP[p.type] ?? "Life",
    status: (STATUS_MAP[p.status] as PolicyStatus) ?? "Expired",
    premium: p.premium,
    endDate: p.endDate,
  };
}

const typeIcons: Record<PolicyType, LucideIcon> = { Life: Heart, Auto: Car, Home: Home, Health: Stethoscope };
const typeColors: Record<PolicyType, string> = {
  Life: "from-rose-500/20 to-rose-500/5 text-rose-500",
  Auto: "from-sky-500/20 to-sky-500/5 text-sky-500",
  Home: "from-emerald-500/20 to-emerald-500/5 text-emerald-500",
  Health: "from-violet-500/20 to-violet-500/5 text-violet-500",
};
const statusStyles: Record<PolicyStatus, string> = {
  Active: "bg-success/15 text-success border-success/30",
  Pending: "bg-warning/15 text-warning border-warning/30",
  Expired: "bg-muted text-muted-foreground border-border",
};

const typeFilters: (PolicyType | "All")[] = ["All", "Life", "Auto", "Home", "Health"];
const statusFilters: (PolicyStatus | "All")[] = ["All", "Active", "Pending", "Expired"];

function PoliciesPage() {
  const [typeF, setTypeF] = useState<(typeof typeFilters)[number]>("All");
  const [statusF, setStatusF] = useState<(typeof statusFilters)[number]>("All");

  const { data: rawPolicies = [], isLoading, isError } = useQuery({
    queryKey: ["policies"],
    queryFn: policyApi.getAll,
  });

  const policies = useMemo(() => rawPolicies.map(mapPolicy), [rawPolicies]);

  const filtered = useMemo(
    () => policies.filter((p) => (typeF === "All" || p.type === typeF) && (statusF === "All" || p.status === statusF)),
    [policies, typeF, statusF],
  );

  const renewingSoon = policies.filter(
    (p) => p.status === "Active" && new Date(p.endDate).getTime() - Date.now() < 60 * 86400000,
  );

  return (
    <PageTransition>
      <div className="relative px-4 py-6 md:px-6 lg:px-8">
        <div className="mesh-bg"><div className="mesh-orb" /></div>
        <div className="relative">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight">Policies</h1>
            <p className="text-sm text-muted-foreground">{filtered.length} of {policies.length} policies</p>
          </div>

          {renewingSoon.length > 0 && (
            <Card className="mb-6 border-warning/40 bg-warning/5">
              <CardContent className="flex items-center gap-3 py-4">
                <Calendar className="h-5 w-5 text-warning" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{renewingSoon.length} policies renewing in the next 60 days</p>
                  <p className="text-xs text-muted-foreground">Reach out proactively to maximize retention.</p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="mb-4 flex flex-wrap gap-2">
            <div className="flex flex-wrap gap-1.5">
              {typeFilters.map((t) => (
                <button key={t} onClick={() => setTypeF(t)} className={cn("rounded-full border px-3 py-1 text-xs font-medium transition-all", typeF === t ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-muted-foreground hover:bg-muted")}>
                  {t}
                </button>
              ))}
            </div>
            <div className="mx-2 h-6 w-px bg-border" />
            <div className="flex flex-wrap gap-1.5">
              {statusFilters.map((s) => (
                <button key={s} onClick={() => setStatusF(s)} className={cn("rounded-full border px-3 py-1 text-xs font-medium transition-all", statusF === s ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-muted-foreground hover:bg-muted")}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <CardGridSkeleton count={8} />
          ) : isError ? (
            <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-6 text-center text-sm text-destructive">
              Failed to load policies. Make sure policy-service is running.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((p, i) => {
                const Icon = typeIcons[p.type];
                return (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: Math.min(i * 0.03, 0.5) }}
                    whileHover={{ y: -3 }}
                  >
                    <Card className="h-full overflow-hidden transition-shadow hover:shadow-[var(--shadow-elegant)]">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between">
                          <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br", typeColors[p.type])}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <Badge variant="outline" className={cn("text-[10px]", statusStyles[p.status])}>{p.status}</Badge>
                        </div>
                        <div className="mt-3">
                          <p className="text-xs text-muted-foreground">{p.type} · {p.policyNumber}</p>
                          <p className="mt-0.5 truncate text-sm font-semibold">{p.clientName}</p>
                        </div>
                        <div className="mt-4 flex items-end justify-between">
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Premium</p>
                            <p className="text-lg font-semibold">${p.premium}/mo</p>
                          </div>
                          <p className="text-[11px] text-muted-foreground">Renews {new Date(p.endDate).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
