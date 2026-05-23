import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Heart, Car, Home, Stethoscope, Calendar, Plus, LayoutGrid, Table2,
  ChevronUp, ChevronDown, ChevronsUpDown, Filter, X, FileText,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { PageTransition } from "@/components/page-transition";
import { EmptyState } from "@/components/empty-state";
import { CardGridSkeleton, TableSkeleton } from "@/components/skeletons";
import { policyApi, type PolicyResponse } from "@/lib/api";
import { NewPolicyDialog } from "@/components/forms/new-policy-dialog";
import { cn } from "@/lib/utils";

type PolicyType = "Life" | "Auto" | "Home" | "Health";
type PolicyStatus = "Active" | "Pending" | "Expired" | "Cancelled";

const TYPE_MAP: Record<PolicyResponse["type"], PolicyType> = {
  CAR: "Auto",
  APARTMENT: "Home",
  LIFE: "Life",
  HEALTH: "Health",
};

const STATUS_MAP: Record<PolicyResponse["status"], PolicyStatus> = {
  ACTIVE: "Active",
  PENDING: "Pending",
  EXPIRED: "Expired",
  CANCELLED: "Cancelled",
};

interface MappedPolicy {
  id: number;
  policyNumber: string;
  clientName: string;
  type: PolicyType;
  status: PolicyStatus;
  premium: number;
  startDate: string;
  endDate: string;
  agentEmail: string;
}

function mapPolicy(p: PolicyResponse): MappedPolicy {
  return {
    id: p.id,
    policyNumber: p.policyNumber,
    clientName: p.customerName,
    type: TYPE_MAP[p.type] ?? "Life",
    status: STATUS_MAP[p.status] ?? "Expired",
    premium: p.premium,
    startDate: p.startDate,
    endDate: p.endDate,
    agentEmail: p.agentEmail,
  };
}

const typeIcons: Record<PolicyType, LucideIcon> = {
  Life: Heart, Auto: Car, Home: Home, Health: Stethoscope,
};
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
  Cancelled: "bg-destructive/10 text-destructive border-destructive/30",
};

const ALL_TYPES: PolicyType[] = ["Life", "Auto", "Home", "Health"];
const ALL_STATUSES: PolicyStatus[] = ["Active", "Pending", "Expired", "Cancelled"];

type SortColumn = "policyNumber" | "clientName" | "type" | "status" | "premium" | "startDate" | "endDate";
type SortDir = "asc" | "desc";

function SortHeader({
  col, label, sortCol, sortDir, onSort, className,
}: {
  col: SortColumn; label: string;
  sortCol: SortColumn | null; sortDir: SortDir;
  onSort: (c: SortColumn) => void; className?: string;
}) {
  const active = sortCol === col;
  return (
    <button
      onClick={() => onSort(col)}
      className={cn("flex items-center gap-1 font-medium hover:text-foreground whitespace-nowrap", className)}
    >
      {label}
      {active ? (
        sortDir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
      ) : (
        <ChevronsUpDown className="h-3 w-3 opacity-40" />
      )}
    </button>
  );
}

function FilterHeader({
  col, label, isActive, sortCol, sortDir, onSort, children,
}: {
  col: SortColumn; label: string; isActive: boolean;
  sortCol: SortColumn | null; sortDir: SortDir;
  onSort: (c: SortColumn) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-1">
      <SortHeader col={col} label={label} sortCol={sortCol} sortDir={sortDir} onSort={onSort} />
      <Popover>
        <PopoverTrigger asChild>
          <button className={cn("rounded p-0.5 hover:bg-muted", isActive && "text-primary")}>
            <Filter className="h-3 w-3" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3" align="start">
          {children}
        </PopoverContent>
      </Popover>
    </div>
  );
}

function fmtDate(d: string) {
  return d ? new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "—";
}

export function PoliciesPage() {
  const navigate = useNavigate();
  const [view, setView] = useState<"table" | "cards">("table");
  const [showNewPolicy, setShowNewPolicy] = useState(false);

  // Sort
  const [sortCol, setSortCol] = useState<SortColumn | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  // Filters
  const [typeFilters, setTypeFilters] = useState<Set<PolicyType>>(new Set());
  const [statusFilters, setStatusFilters] = useState<Set<PolicyStatus>>(new Set());
  const [premiumMin, setPremiumMin] = useState("");
  const [premiumMax, setPremiumMax] = useState("");
  const [startDateFrom, setStartDateFrom] = useState("");
  const [startDateTo, setStartDateTo] = useState("");
  const [endDateFrom, setEndDateFrom] = useState("");
  const [endDateTo, setEndDateTo] = useState("");

  const { data: rawPolicies = [], isLoading, isError } = useQuery({
    queryKey: ["policies"],
    queryFn: policyApi.getAll,
  });

  const policies = useMemo(() => rawPolicies.map(mapPolicy), [rawPolicies]);

  const handleSort = (col: SortColumn) => {
    if (sortCol === col) {
      if (sortDir === "asc") setSortDir("desc");
      else setSortCol(null);
    } else {
      setSortCol(col);
      setSortDir("asc");
    }
  };

  const toggleType = (t: PolicyType) =>
    setTypeFilters((prev) => { const n = new Set(prev); n.has(t) ? n.delete(t) : n.add(t); return n; });
  const toggleStatus = (s: PolicyStatus) =>
    setStatusFilters((prev) => { const n = new Set(prev); n.has(s) ? n.delete(s) : n.add(s); return n; });

  const filtered = useMemo(() => {
    let result = policies.filter((p) => {
      if (typeFilters.size > 0 && !typeFilters.has(p.type)) return false;
      if (statusFilters.size > 0 && !statusFilters.has(p.status)) return false;
      if (premiumMin && p.premium < Number(premiumMin)) return false;
      if (premiumMax && p.premium > Number(premiumMax)) return false;
      if (startDateFrom && p.startDate < startDateFrom) return false;
      if (startDateTo && p.startDate > startDateTo) return false;
      if (endDateFrom && p.endDate < endDateFrom) return false;
      if (endDateTo && p.endDate > endDateTo) return false;
      return true;
    });

    if (sortCol) {
      result = [...result].sort((a, b) => {
        const av = a[sortCol] ?? "";
        const bv = b[sortCol] ?? "";
        const cmp = sortCol === "premium"
          ? Number(av) - Number(bv)
          : String(av).localeCompare(String(bv), undefined, { numeric: true });
        return sortDir === "asc" ? cmp : -cmp;
      });
    }

    return result;
  }, [policies, typeFilters, statusFilters, premiumMin, premiumMax, startDateFrom, startDateTo, endDateFrom, endDateTo, sortCol, sortDir]);

  const renewingSoon = policies.filter(
    (p) => p.status === "Active" && new Date(p.endDate).getTime() - Date.now() < 60 * 86400000,
  );

  const hasPremiumFilter = !!premiumMin || !!premiumMax;
  const hasStartFilter = !!startDateFrom || !!startDateTo;
  const hasEndFilter = !!endDateFrom || !!endDateTo;

  const activeFilters: Array<{ key: string; label: string; onRemove: () => void }> = [
    ...[...typeFilters].map((t) => ({ key: `type-${t}`, label: t, onRemove: () => toggleType(t) })),
    ...[...statusFilters].map((s) => ({ key: `status-${s}`, label: s, onRemove: () => toggleStatus(s) })),
    ...(hasPremiumFilter ? [{ key: "premium", label: `Premium: ₪${premiumMin || "0"}–₪${premiumMax || "∞"}`, onRemove: () => { setPremiumMin(""); setPremiumMax(""); } }] : []),
    ...(hasStartFilter ? [{ key: "start", label: `Start: ${startDateFrom || "any"} – ${startDateTo || "any"}`, onRemove: () => { setStartDateFrom(""); setStartDateTo(""); } }] : []),
    ...(hasEndFilter ? [{ key: "end", label: `End: ${endDateFrom || "any"} – ${endDateTo || "any"}`, onRemove: () => { setEndDateFrom(""); setEndDateTo(""); } }] : []),
  ];

  const clearAllFilters = () => {
    setTypeFilters(new Set());
    setStatusFilters(new Set());
    setPremiumMin(""); setPremiumMax("");
    setStartDateFrom(""); setStartDateTo("");
    setEndDateFrom(""); setEndDateTo("");
  };

  return (
    <PageTransition>
      <div className="relative px-4 py-6 md:px-6 lg:px-8">
        <div className="mesh-bg"><div className="mesh-orb" /></div>
        <div className="relative">
          {/* Header */}
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Policies</h1>
              <p className="text-sm text-muted-foreground">
                {filtered.length} of {policies.length} policies
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* View toggle */}
              <div className="flex rounded-lg border bg-background p-0.5">
                <button
                  onClick={() => setView("table")}
                  className={cn("rounded px-2 py-1 transition-colors", view === "table" ? "bg-muted shadow-sm" : "hover:bg-muted/50")}
                  title="Table view"
                >
                  <Table2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setView("cards")}
                  className={cn("rounded px-2 py-1 transition-colors", view === "cards" ? "bg-muted shadow-sm" : "hover:bg-muted/50")}
                  title="Card view"
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
              </div>
              <Button onClick={() => setShowNewPolicy(true)} className="gap-2 shadow-[var(--shadow-elegant)]" data-testid="add-policy-button">
                <Plus className="h-4 w-4" /> New Policy
              </Button>
            </div>
          </div>

          {renewingSoon.length > 0 && (
            <Card className="mb-6 border-warning/40 bg-warning/5">
              <CardContent className="flex items-center gap-3 py-4">
                <Calendar className="h-5 w-5 text-warning shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{renewingSoon.length} policies renewing in the next 60 days</p>
                  <p className="text-xs text-muted-foreground">Reach out proactively to maximize retention.</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Active filter chips */}
          {activeFilters.length > 0 && (
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground">Filters:</span>
              {activeFilters.map((f) => (
                <Badge key={f.key} variant="secondary" className="gap-1 pr-1 text-xs font-normal">
                  {f.label}
                  <button onClick={f.onRemove} className="ml-1 rounded hover:text-foreground">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              <button onClick={clearAllFilters} className="text-xs text-muted-foreground hover:text-foreground">
                Clear all
              </button>
            </div>
          )}

          {isLoading ? (
            view === "table" ? <TableSkeleton rows={8} cols={7} /> : <CardGridSkeleton count={8} />
          ) : isError ? (
            <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-6 text-center text-sm text-destructive">
              Failed to load policies. Make sure policy-service is running.
            </div>
          ) : policies.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No policies yet"
              description="Create your first insurance policy to get started."
              action={{ label: "+ Add your first policy", onClick: () => setShowNewPolicy(true) }}
            />
          ) : view === "table" ? (
            /* ── TABLE VIEW ─────────────────────────────────────────────── */
            <Card>
              <CardContent className="p-0">
                {filtered.length === 0 ? (
                  <EmptyState
                    icon={FileText}
                    title="No matching policies"
                    description="Try adjusting your filters."
                    action={activeFilters.length > 0 ? { label: "Clear filters", onClick: clearAllFilters } : undefined}
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>
                            <SortHeader col="policyNumber" label="Policy #" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                          </TableHead>
                          <TableHead>
                            <SortHeader col="clientName" label="Customer" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                          </TableHead>
                          <TableHead>
                            <FilterHeader col="type" label="Type" isActive={typeFilters.size > 0}
                              sortCol={sortCol} sortDir={sortDir} onSort={handleSort}>
                              <p className="mb-2 text-xs font-medium">Filter by type</p>
                              <div className="space-y-2">
                                {ALL_TYPES.map((t) => (
                                  <div key={t} className="flex items-center gap-2">
                                    <Checkbox id={`type-${t}`} checked={typeFilters.has(t)} onCheckedChange={() => toggleType(t)} />
                                    <Label htmlFor={`type-${t}`} className="text-sm font-normal cursor-pointer">{t}</Label>
                                  </div>
                                ))}
                              </div>
                            </FilterHeader>
                          </TableHead>
                          <TableHead>
                            <FilterHeader col="status" label="Status" isActive={statusFilters.size > 0}
                              sortCol={sortCol} sortDir={sortDir} onSort={handleSort}>
                              <p className="mb-2 text-xs font-medium">Filter by status</p>
                              <div className="space-y-2">
                                {ALL_STATUSES.map((s) => (
                                  <div key={s} className="flex items-center gap-2">
                                    <Checkbox id={`pstatus-${s}`} checked={statusFilters.has(s)} onCheckedChange={() => toggleStatus(s)} />
                                    <Label htmlFor={`pstatus-${s}`} className="text-sm font-normal cursor-pointer">{s}</Label>
                                  </div>
                                ))}
                              </div>
                            </FilterHeader>
                          </TableHead>
                          <TableHead>
                            <FilterHeader col="premium" label="Premium (₪)" isActive={hasPremiumFilter}
                              sortCol={sortCol} sortDir={sortDir} onSort={handleSort}>
                              <p className="mb-2 text-xs font-medium">Premium range (₪)</p>
                              <div className="flex items-center gap-2">
                                <Input value={premiumMin} onChange={(e) => setPremiumMin(e.target.value)}
                                  placeholder="Min" className="h-8 text-sm" type="number" min="0" />
                                <span className="text-muted-foreground">–</span>
                                <Input value={premiumMax} onChange={(e) => setPremiumMax(e.target.value)}
                                  placeholder="Max" className="h-8 text-sm" type="number" min="0" />
                              </div>
                            </FilterHeader>
                          </TableHead>
                          <TableHead>
                            <FilterHeader col="startDate" label="Start Date" isActive={hasStartFilter}
                              sortCol={sortCol} sortDir={sortDir} onSort={handleSort}>
                              <p className="mb-2 text-xs font-medium">Start date range</p>
                              <div className="space-y-1.5">
                                <Input value={startDateFrom} onChange={(e) => setStartDateFrom(e.target.value)}
                                  placeholder="From" className="h-8 text-sm" type="date" />
                                <Input value={startDateTo} onChange={(e) => setStartDateTo(e.target.value)}
                                  placeholder="To" className="h-8 text-sm" type="date" />
                              </div>
                            </FilterHeader>
                          </TableHead>
                          <TableHead>
                            <FilterHeader col="endDate" label="End Date" isActive={hasEndFilter}
                              sortCol={sortCol} sortDir={sortDir} onSort={handleSort}>
                              <p className="mb-2 text-xs font-medium">End date range</p>
                              <div className="space-y-1.5">
                                <Input value={endDateFrom} onChange={(e) => setEndDateFrom(e.target.value)}
                                  placeholder="From" className="h-8 text-sm" type="date" />
                                <Input value={endDateTo} onChange={(e) => setEndDateTo(e.target.value)}
                                  placeholder="To" className="h-8 text-sm" type="date" />
                              </div>
                            </FilterHeader>
                          </TableHead>
                          <TableHead className="text-xs text-muted-foreground">Agent</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <AnimatePresence initial={false}>
                          {filtered.map((p, i) => {
                            const Icon = typeIcons[p.type];
                            return (
                              <motion.tr
                                key={p.id}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2, delay: Math.min(i * 0.02, 0.3) }}
                                className="border-b cursor-pointer transition-colors hover:bg-muted/50"
                                onClick={() => navigate(`/policies/${p.id}`)}
                              >
                                <TableCell className="font-mono text-xs">{p.policyNumber}</TableCell>
                                <TableCell className="font-medium">{p.clientName}</TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1.5">
                                    <div className={cn("flex h-6 w-6 items-center justify-center rounded bg-gradient-to-br", typeColors[p.type])}>
                                      <Icon className="h-3.5 w-3.5" />
                                    </div>
                                    <span className="text-sm">{p.type}</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className={cn("text-[10px]", statusStyles[p.status])}>
                                    {p.status}
                                  </Badge>
                                </TableCell>
                                <TableCell className="font-semibold tabular-nums">₪{p.premium.toLocaleString()}/mo</TableCell>
                                <TableCell className="text-xs text-muted-foreground">{fmtDate(p.startDate)}</TableCell>
                                <TableCell className="text-xs text-muted-foreground">{fmtDate(p.endDate)}</TableCell>
                                <TableCell className="max-w-[120px] truncate text-xs text-muted-foreground">
                                  {p.agentEmail}
                                </TableCell>
                              </motion.tr>
                            );
                          })}
                        </AnimatePresence>
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            /* ── CARD VIEW ──────────────────────────────────────────────── */
            filtered.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No matching policies"
                description="Try adjusting your filters."
                action={activeFilters.length > 0 ? { label: "Clear filters", onClick: clearAllFilters } : undefined}
              />
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
                      className="cursor-pointer"
                      onClick={() => navigate(`/policies/${p.id}`)}
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
                              <p className="text-lg font-semibold">₪{p.premium.toLocaleString()}/mo</p>
                            </div>
                            <p className="text-[11px] text-muted-foreground">
                              Renews {fmtDate(p.endDate)}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )
          )}
        </div>
      </div>

      <NewPolicyDialog open={showNewPolicy} onOpenChange={setShowNewPolicy} />
    </PageTransition>
  );
}
