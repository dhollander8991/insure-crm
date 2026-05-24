import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  Car,
  Home,
  Stethoscope,
  Calendar,
  Plus,
  LayoutGrid,
  Table2,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Filter,
  X,
  FileText,
  type LucideIcon,
} from "lucide-react";

import styles from "./Policies.module.css";

import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import { Label } from "@/components/ui/Label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";
import { PageTransition } from "@/components/PageTransition";
import { EmptyState } from "@/components/EmptyState";
import { CardGridSkeleton, TableSkeleton } from "@/components/Skeletons";
import { type PolicyResponse } from "@/lib/api";
import { NewPolicyDialog } from "@/components/forms/NewPolicyDialog";
import { cn } from "@/lib/utils";
import { usePoliciesQuery } from "@/lib/queries/policies.queries";

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

function mapPolicyToDisplay(policy: PolicyResponse): MappedPolicy {
  return {
    id: policy.id,
    policyNumber: policy.policyNumber,
    clientName: policy.customerName,
    type: TYPE_MAP[policy.type] ?? "Life",
    status: STATUS_MAP[policy.status] ?? "Expired",
    premium: policy.premium,
    startDate: policy.startDate,
    endDate: policy.endDate,
    agentEmail: policy.agentEmail,
  };
}

const typeIcons: Record<PolicyType, LucideIcon> = {
  Life: Heart,
  Auto: Car,
  Home: Home,
  Health: Stethoscope,
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
const ALL_STATUSES: PolicyStatus[] = [
  "Active",
  "Pending",
  "Expired",
  "Cancelled",
];

type SortColumn =
  | "policyNumber"
  | "clientName"
  | "type"
  | "status"
  | "premium"
  | "startDate"
  | "endDate";
type SortDirection = "asc" | "desc";

function SortHeader({
  col,
  label,
  sortCol,
  sortDir,
  onSort,
  className,
}: {
  col: SortColumn;
  label: string;
  sortCol: SortColumn | null;
  sortDir: SortDirection;
  onSort: (column: SortColumn) => void;
  className?: string;
}) {
  const isActive = sortCol === col;
  return (
    <button
      onClick={() => onSort(col)}
      className={cn(
        "flex items-center gap-1 font-medium hover:text-foreground whitespace-nowrap",
        className,
      )}
    >
      {label}
      {isActive ? (
        sortDir === "asc" ? (
          <ChevronUp className="h-3 w-3" />
        ) : (
          <ChevronDown className="h-3 w-3" />
        )
      ) : (
        <ChevronsUpDown className="h-3 w-3 opacity-40" />
      )}
    </button>
  );
}

function FilterHeader({
  col,
  label,
  isActive,
  sortCol,
  sortDir,
  onSort,
  children,
}: {
  col: SortColumn;
  label: string;
  isActive: boolean;
  sortCol: SortColumn | null;
  sortDir: SortDirection;
  onSort: (column: SortColumn) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-1">
      <SortHeader
        col={col}
        label={label}
        sortCol={sortCol}
        sortDir={sortDir}
        onSort={onSort}
      />
      <Popover>
        <PopoverTrigger asChild>
          <button
            className={cn(
              "rounded p-0.5 hover:bg-muted",
              isActive && "text-primary",
            )}
          >
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

function formatDate(dateString: string) {
  return dateString
    ? new Date(dateString).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";
}

export function PoliciesPage() {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<"table" | "cards">("table");
  const [isNewPolicyModalOpen, setIsNewPolicyModalOpen] = useState(false);

  const [sortCol, setSortCol] = useState<SortColumn | null>(null);
  const [sortDir, setSortDir] = useState<SortDirection>("asc");

  const [typeFilters, setTypeFilters] = useState<Set<PolicyType>>(new Set());
  const [statusFilters, setStatusFilters] = useState<Set<PolicyStatus>>(
    new Set(),
  );
  const [premiumMin, setPremiumMin] = useState("");
  const [premiumMax, setPremiumMax] = useState("");
  const [startDateFrom, setStartDateFrom] = useState("");
  const [startDateTo, setStartDateTo] = useState("");
  const [endDateFrom, setEndDateFrom] = useState("");
  const [endDateTo, setEndDateTo] = useState("");

  const { data: rawPolicies = [], isLoading, isError } = usePoliciesQuery();

  const policies = useMemo(
    () => rawPolicies.map(mapPolicyToDisplay),
    [rawPolicies],
  );

  const handleColumnSort = (column: SortColumn) => {
    if (sortCol === column) {
      if (sortDir === "asc") setSortDir("desc");
      else setSortCol(null);
    } else {
      setSortCol(column);
      setSortDir("asc");
    }
  };

  const toggleTypeFilter = (policyType: PolicyType) =>
    setTypeFilters((previousFilters) => {
      const nextFilters = new Set(previousFilters);
      if (nextFilters.has(policyType)) {
        nextFilters.delete(policyType);
      } else {
        nextFilters.add(policyType);
      }
      return nextFilters;
    });

  const toggleStatusFilter = (status: PolicyStatus) =>
    setStatusFilters((previousFilters) => {
      const nextFilters = new Set(previousFilters);
      if (nextFilters.has(status)) {
        nextFilters.delete(status);
      } else {
        nextFilters.add(status);
      }
      return nextFilters;
    });

  const filteredPolicies = useMemo(() => {
    let result = policies.filter((policy) => {
      if (typeFilters.size > 0 && !typeFilters.has(policy.type)) return false;
      if (statusFilters.size > 0 && !statusFilters.has(policy.status))
        return false;
      if (premiumMin && policy.premium < Number(premiumMin)) return false;
      if (premiumMax && policy.premium > Number(premiumMax)) return false;
      if (startDateFrom && policy.startDate < startDateFrom) return false;
      if (startDateTo && policy.startDate > startDateTo) return false;
      if (endDateFrom && policy.endDate < endDateFrom) return false;
      if (endDateTo && policy.endDate > endDateTo) return false;
      return true;
    });

    if (sortCol) {
      result = [...result].sort((aPolicy, bPolicy) => {
        const aValue = aPolicy[sortCol] ?? "";
        const bValue = bPolicy[sortCol] ?? "";
        const comparison =
          sortCol === "premium"
            ? Number(aValue) - Number(bValue)
            : String(aValue).localeCompare(String(bValue), undefined, {
                numeric: true,
              });
        return sortDir === "asc" ? comparison : -comparison;
      });
    }

    return result;
  }, [
    policies,
    typeFilters,
    statusFilters,
    premiumMin,
    premiumMax,
    startDateFrom,
    startDateTo,
    endDateFrom,
    endDateTo,
    sortCol,
    sortDir,
  ]);

  const renewingSoonPolicies = policies.filter(
    (policy) =>
      policy.status === "Active" &&
      new Date(policy.endDate).getTime() - Date.now() < 60 * 86400000,
  );

  const hasPremiumFilter = !!premiumMin || !!premiumMax;
  const hasStartDateFilter = !!startDateFrom || !!startDateTo;
  const hasEndDateFilter = !!endDateFrom || !!endDateTo;

  const activeFilters: Array<{
    key: string;
    label: string;
    onRemove: () => void;
  }> = [
    ...[...typeFilters].map((policyType) => ({
      key: `type-${policyType}`,
      label: policyType,
      onRemove: () => toggleTypeFilter(policyType),
    })),
    ...[...statusFilters].map((status) => ({
      key: `status-${status}`,
      label: status,
      onRemove: () => toggleStatusFilter(status),
    })),
    ...(hasPremiumFilter
      ? [
          {
            key: "premium",
            label: `Premium: ₪${premiumMin || "0"}–₪${premiumMax || "∞"}`,
            onRemove: () => {
              setPremiumMin("");
              setPremiumMax("");
            },
          },
        ]
      : []),
    ...(hasStartDateFilter
      ? [
          {
            key: "start",
            label: `Start: ${startDateFrom || "any"} – ${startDateTo || "any"}`,
            onRemove: () => {
              setStartDateFrom("");
              setStartDateTo("");
            },
          },
        ]
      : []),
    ...(hasEndDateFilter
      ? [
          {
            key: "end",
            label: `End: ${endDateFrom || "any"} – ${endDateTo || "any"}`,
            onRemove: () => {
              setEndDateFrom("");
              setEndDateTo("");
            },
          },
        ]
      : []),
  ];

  const clearAllFilters = () => {
    setTypeFilters(new Set());
    setStatusFilters(new Set());
    setPremiumMin("");
    setPremiumMax("");
    setStartDateFrom("");
    setStartDateTo("");
    setEndDateFrom("");
    setEndDateTo("");
  };

  return (
    <PageTransition>
      <div className={styles.pageWrapper}>
        <div className="mesh-bg">
          <div className="mesh-orb" />
        </div>
        <div className="relative">
          <div className={styles.pageHeader}>
            <div>
              <h1 className={styles.pageTitle}>Policies</h1>
              <p className={styles.pageSubtitle}>
                {filteredPolicies.length} of {policies.length} policies
              </p>
            </div>
            <div className={styles.viewToggleWrapper}>
              <div className={styles.viewToggleGroup}>
                <button
                  onClick={() => setActiveView("table")}
                  className={cn(
                    "rounded px-2 py-1 transition-colors",
                    activeView === "table"
                      ? "bg-muted shadow-sm"
                      : "hover:bg-muted/50",
                  )}
                  title="Table view"
                >
                  <Table2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setActiveView("cards")}
                  className={cn(
                    "rounded px-2 py-1 transition-colors",
                    activeView === "cards"
                      ? "bg-muted shadow-sm"
                      : "hover:bg-muted/50",
                  )}
                  title="Card view"
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
              </div>
              <Button
                onClick={() => setIsNewPolicyModalOpen(true)}
                className="gap-2 shadow-[var(--shadow-elegant)]"
                data-testid="add-policy-button"
              >
                <Plus className="h-4 w-4" /> New Policy
              </Button>
            </div>
          </div>

          {renewingSoonPolicies.length > 0 && (
            <Card className="mb-6 border-warning/40 bg-warning/5">
              <CardContent className="flex items-center gap-3 py-4">
                <Calendar className="h-5 w-5 text-warning shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {renewingSoonPolicies.length} policies renewing in the next
                    60 days
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Reach out proactively to maximize retention.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {activeFilters.length > 0 && (
            <div className={styles.filterChipsRow}>
              <span className={styles.filterChipsLabel}>Filters:</span>
              {activeFilters.map((filterChip) => (
                <Badge
                  key={filterChip.key}
                  variant="secondary"
                  className="gap-1 pr-1 text-xs font-normal"
                >
                  {filterChip.label}
                  <button
                    onClick={filterChip.onRemove}
                    className="ml-1 rounded hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              <button
                onClick={clearAllFilters}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Clear all
              </button>
            </div>
          )}

          {isLoading ? (
            activeView === "table" ? (
              <TableSkeleton rows={8} cols={7} />
            ) : (
              <CardGridSkeleton count={8} />
            )
          ) : isError ? (
            <div className={styles.errorMessage}>
              Failed to load policies. Make sure policy-service is running.
            </div>
          ) : policies.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No policies yet"
              description="Create your first insurance policy to get started."
              action={{
                label: "+ Add your first policy",
                onClick: () => setIsNewPolicyModalOpen(true),
              }}
            />
          ) : activeView === "table" ? (
            <Card>
              <CardContent className="p-0">
                {filteredPolicies.length === 0 ? (
                  <EmptyState
                    icon={FileText}
                    title="No matching policies"
                    description="Try adjusting your filters."
                    action={
                      activeFilters.length > 0
                        ? { label: "Clear filters", onClick: clearAllFilters }
                        : undefined
                    }
                  />
                ) : (
                  <div className={styles.tableScrollWrapper}>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>
                            <SortHeader
                              col="policyNumber"
                              label="Policy #"
                              sortCol={sortCol}
                              sortDir={sortDir}
                              onSort={handleColumnSort}
                            />
                          </TableHead>
                          <TableHead>
                            <SortHeader
                              col="clientName"
                              label="Customer"
                              sortCol={sortCol}
                              sortDir={sortDir}
                              onSort={handleColumnSort}
                            />
                          </TableHead>
                          <TableHead>
                            <FilterHeader
                              col="type"
                              label="Type"
                              isActive={typeFilters.size > 0}
                              sortCol={sortCol}
                              sortDir={sortDir}
                              onSort={handleColumnSort}
                            >
                              <p className="mb-2 text-xs font-medium">
                                Filter by type
                              </p>
                              <div className="space-y-2">
                                {ALL_TYPES.map((policyType) => (
                                  <div
                                    key={policyType}
                                    className="flex items-center gap-2"
                                  >
                                    <Checkbox
                                      id={`type-${policyType}`}
                                      checked={typeFilters.has(policyType)}
                                      onCheckedChange={() =>
                                        toggleTypeFilter(policyType)
                                      }
                                    />
                                    <Label
                                      htmlFor={`type-${policyType}`}
                                      className="text-sm font-normal cursor-pointer"
                                    >
                                      {policyType}
                                    </Label>
                                  </div>
                                ))}
                              </div>
                            </FilterHeader>
                          </TableHead>
                          <TableHead>
                            <FilterHeader
                              col="status"
                              label="Status"
                              isActive={statusFilters.size > 0}
                              sortCol={sortCol}
                              sortDir={sortDir}
                              onSort={handleColumnSort}
                            >
                              <p className="mb-2 text-xs font-medium">
                                Filter by status
                              </p>
                              <div className="space-y-2">
                                {ALL_STATUSES.map((status) => (
                                  <div
                                    key={status}
                                    className="flex items-center gap-2"
                                  >
                                    <Checkbox
                                      id={`pstatus-${status}`}
                                      checked={statusFilters.has(status)}
                                      onCheckedChange={() =>
                                        toggleStatusFilter(status)
                                      }
                                    />
                                    <Label
                                      htmlFor={`pstatus-${status}`}
                                      className="text-sm font-normal cursor-pointer"
                                    >
                                      {status}
                                    </Label>
                                  </div>
                                ))}
                              </div>
                            </FilterHeader>
                          </TableHead>
                          <TableHead>
                            <FilterHeader
                              col="premium"
                              label="Premium (₪)"
                              isActive={hasPremiumFilter}
                              sortCol={sortCol}
                              sortDir={sortDir}
                              onSort={handleColumnSort}
                            >
                              <p className="mb-2 text-xs font-medium">
                                Premium range (₪)
                              </p>
                              <div className="flex items-center gap-2">
                                <Input
                                  value={premiumMin}
                                  onChange={(event) =>
                                    setPremiumMin(event.target.value)
                                  }
                                  placeholder="Min"
                                  className="h-8 text-sm"
                                  type="number"
                                  min="0"
                                />
                                <span className="text-muted-foreground">–</span>
                                <Input
                                  value={premiumMax}
                                  onChange={(event) =>
                                    setPremiumMax(event.target.value)
                                  }
                                  placeholder="Max"
                                  className="h-8 text-sm"
                                  type="number"
                                  min="0"
                                />
                              </div>
                            </FilterHeader>
                          </TableHead>
                          <TableHead>
                            <FilterHeader
                              col="startDate"
                              label="Start Date"
                              isActive={hasStartDateFilter}
                              sortCol={sortCol}
                              sortDir={sortDir}
                              onSort={handleColumnSort}
                            >
                              <p className="mb-2 text-xs font-medium">
                                Start date range
                              </p>
                              <div className="space-y-1.5">
                                <Input
                                  value={startDateFrom}
                                  onChange={(event) =>
                                    setStartDateFrom(event.target.value)
                                  }
                                  placeholder="From"
                                  className="h-8 text-sm"
                                  type="date"
                                />
                                <Input
                                  value={startDateTo}
                                  onChange={(event) =>
                                    setStartDateTo(event.target.value)
                                  }
                                  placeholder="To"
                                  className="h-8 text-sm"
                                  type="date"
                                />
                              </div>
                            </FilterHeader>
                          </TableHead>
                          <TableHead>
                            <FilterHeader
                              col="endDate"
                              label="End Date"
                              isActive={hasEndDateFilter}
                              sortCol={sortCol}
                              sortDir={sortDir}
                              onSort={handleColumnSort}
                            >
                              <p className="mb-2 text-xs font-medium">
                                End date range
                              </p>
                              <div className="space-y-1.5">
                                <Input
                                  value={endDateFrom}
                                  onChange={(event) =>
                                    setEndDateFrom(event.target.value)
                                  }
                                  placeholder="From"
                                  className="h-8 text-sm"
                                  type="date"
                                />
                                <Input
                                  value={endDateTo}
                                  onChange={(event) =>
                                    setEndDateTo(event.target.value)
                                  }
                                  placeholder="To"
                                  className="h-8 text-sm"
                                  type="date"
                                />
                              </div>
                            </FilterHeader>
                          </TableHead>
                          <TableHead className="text-xs text-muted-foreground">
                            Agent
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <AnimatePresence initial={false}>
                          {filteredPolicies.map((policy, index) => {
                            const TypeIcon = typeIcons[policy.type];
                            return (
                              <motion.tr
                                key={policy.id}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{
                                  duration: 0.2,
                                  delay: Math.min(index * 0.02, 0.3),
                                }}
                                className="border-b cursor-pointer transition-colors hover:bg-muted/50"
                                onClick={() =>
                                  navigate(`/policies/${policy.id}`)
                                }
                              >
                                <TableCell className="font-mono text-xs">
                                  {policy.policyNumber}
                                </TableCell>
                                <TableCell className="font-medium">
                                  {policy.clientName}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1.5">
                                    <div
                                      className={cn(
                                        "flex h-6 w-6 items-center justify-center rounded bg-gradient-to-br",
                                        typeColors[policy.type],
                                      )}
                                    >
                                      <TypeIcon className="h-3.5 w-3.5" />
                                    </div>
                                    <span className="text-sm">
                                      {policy.type}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant="outline"
                                    className={cn(
                                      "text-[10px]",
                                      statusStyles[policy.status],
                                    )}
                                  >
                                    {policy.status}
                                  </Badge>
                                </TableCell>
                                <TableCell className="font-semibold tabular-nums">
                                  ₪{policy.premium.toLocaleString()}/mo
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground">
                                  {formatDate(policy.startDate)}
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground">
                                  {formatDate(policy.endDate)}
                                </TableCell>
                                <TableCell className="max-w-[120px] truncate text-xs text-muted-foreground">
                                  {policy.agentEmail}
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
          ) : filteredPolicies.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No matching policies"
              description="Try adjusting your filters."
              action={
                activeFilters.length > 0
                  ? { label: "Clear filters", onClick: clearAllFilters }
                  : undefined
              }
            />
          ) : (
            <div className={styles.cardsGrid}>
              {filteredPolicies.map((policy, index) => {
                const TypeIcon = typeIcons[policy.type];
                return (
                  <motion.div
                    key={policy.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.3,
                      delay: Math.min(index * 0.03, 0.5),
                    }}
                    whileHover={{ y: -3 }}
                    className="cursor-pointer"
                    onClick={() => navigate(`/policies/${policy.id}`)}
                  >
                    <Card className="h-full overflow-hidden transition-shadow hover:shadow-[var(--shadow-elegant)]">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between">
                          <div
                            className={cn(
                              "flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br",
                              typeColors[policy.type],
                            )}
                          >
                            <TypeIcon className="h-5 w-5" />
                          </div>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px]",
                              statusStyles[policy.status],
                            )}
                          >
                            {policy.status}
                          </Badge>
                        </div>
                        <div className="mt-3">
                          <p className="text-xs text-muted-foreground">
                            {policy.type} · {policy.policyNumber}
                          </p>
                          <p className="mt-0.5 truncate text-sm font-semibold">
                            {policy.clientName}
                          </p>
                        </div>
                        <div className="mt-4 flex items-end justify-between">
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                              Premium
                            </p>
                            <p className="text-lg font-semibold">
                              ₪{policy.premium.toLocaleString()}/mo
                            </p>
                          </div>
                          <p className="text-[11px] text-muted-foreground">
                            Renews {formatDate(policy.endDate)}
                          </p>
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

      <NewPolicyDialog
        open={isNewPolicyModalOpen}
        onOpenChange={setIsNewPolicyModalOpen}
      />
    </PageTransition>
  );
}
