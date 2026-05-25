import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
import clsx from "clsx";

import styles from "./Policies.module.css";

import { useTranslation } from "react-i18next";
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

const typeClasses: Record<PolicyType, string> = {
  Life: styles.typeLife,
  Auto: styles.typeAuto,
  Home: styles.typeHome,
  Health: styles.typeHealth,
};

const statusClasses: Record<PolicyStatus, string> = {
  Active: styles.statusActive,
  Pending: styles.statusPending,
  Expired: styles.statusExpired,
  Cancelled: styles.statusCancelled,
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
}: {
  col: SortColumn;
  label: string;
  sortCol: SortColumn | null;
  sortDir: SortDirection;
  onSort: (column: SortColumn) => void;
}) {
  const isActive = sortCol === col;
  return (
    <button onClick={() => onSort(col)} className={styles.sortButton}>
      {label}
      {isActive ? (
        sortDir === "asc" ? (
          <ChevronUp className={styles.sortIconSm} />
        ) : (
          <ChevronDown className={styles.sortIconSm} />
        )
      ) : (
        <ChevronsUpDown className={styles.sortIconSmInactive} />
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
    <div className={styles.filterHeaderRow}>
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
            className={clsx(
              styles.filterPopoverTrigger,
              isActive && styles.filterPopoverTriggerActive,
            )}
          >
            <Filter className={styles.filterIcon} />
          </button>
        </PopoverTrigger>
        <PopoverContent className={styles.filterPopoverContent} align="start">
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
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeView, setActiveView] = useState<"table" | "cards">("table");
  const [isNewPolicyModalOpen, setIsNewPolicyModalOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get("new") === "true") {
      setIsNewPolicyModalOpen(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

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
            label: `${t("policies.premium")}: ₪${premiumMin || "0"}–₪${premiumMax || "∞"}`,
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
            label: `${t("forms.startDate")}: ${startDateFrom || t("common.any")} – ${startDateTo || t("common.any")}`,
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
            label: `${t("forms.endDate")}: ${endDateFrom || t("common.any")} – ${endDateTo || t("common.any")}`,
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
      <div className={styles.page}>
        <div className="mesh-bg">
          <div className="mesh-orb" />
        </div>
        <div className={styles.contentArea}>
          <div className={styles.pageHeader}>
            <div>
              <h1 className={styles.pageTitle}>{t("policies.title")}</h1>
              <p className={styles.pageSubtitle}>
                {filteredPolicies.length} {t("common.of")} {policies.length} {t("navigation.policies").toLowerCase()}
              </p>
            </div>
            <div className={styles.headerActions}>
              <div className={styles.viewToggleGroup}>
                <button
                  onClick={() => setActiveView("table")}
                  className={clsx(
                    styles.viewToggleBtn,
                    activeView === "table" && styles.viewToggleBtnActive,
                  )}
                  title="Table view"
                >
                  <Table2 className={styles.viewBtnIcon} />
                </button>
                <button
                  onClick={() => setActiveView("cards")}
                  className={clsx(
                    styles.viewToggleBtn,
                    activeView === "cards" && styles.viewToggleBtnActive,
                  )}
                  title="Card view"
                >
                  <LayoutGrid className={styles.viewBtnIcon} />
                </button>
              </div>
              <Button
                onClick={() => setIsNewPolicyModalOpen(true)}
                className={styles.addButton}
                data-testid="add-policy-button"
              >
                <Plus className={styles.addBtnIcon} /> {t("policies.addPolicy")}
              </Button>
            </div>
          </div>

          {renewingSoonPolicies.length > 0 && (
            <Card className={styles.renewalBanner}>
              <CardContent className={styles.renewalContent}>
                <Calendar className={styles.renewalIcon} />
                <div className={styles.renewalText}>
                  <p className={styles.renewalMessage}>
                    {t("policies.renewalBannerDesc", { count: renewingSoonPolicies.length })}
                  </p>
                  <p className={styles.renewalSub}>
                    {t("policies.renewalSub")}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {activeFilters.length > 0 && (
            <div className={styles.filterRow}>
              <span className={styles.filtersLabel}>{t("common.filters")}</span>
              {activeFilters.map((filterChip) => (
                <Badge
                  key={filterChip.key}
                  variant="secondary"
                  className={styles.filterChip}
                >
                  {filterChip.label}
                  <button
                    onClick={filterChip.onRemove}
                    className={styles.filterChipRemove}
                  >
                    <X className={styles.removeChipIcon} />
                  </button>
                </Badge>
              ))}
              <button
                onClick={clearAllFilters}
                className={styles.filterClearAll}
              >
                {t("common.clearAll")}
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
              {t("policies.failedToLoad")}
            </div>
          ) : policies.length === 0 ? (
            <EmptyState
              icon={FileText}
              title={t("policies.noPoliciesTitle")}
              description={t("policies.noPoliciesDesc")}
              action={{
                label: t("policies.addFirstPolicy"),
                onClick: () => setIsNewPolicyModalOpen(true),
              }}
            />
          ) : activeView === "table" ? (
            <Card>
              <CardContent className={styles.tableCardContent}>
                {filteredPolicies.length === 0 ? (
                  <EmptyState
                    icon={FileText}
                    title={t("policies.noMatchingTitle")}
                    description={t("policies.noMatchingDesc")}
                    action={
                      activeFilters.length > 0
                        ? { label: t("policies.clearFilters"), onClick: clearAllFilters }
                        : undefined
                    }
                  />
                ) : (
                  <div className={styles.tableWrapper}>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>
                            <SortHeader
                              col="policyNumber"
                              label={t("policies.policyNumber")}
                              sortCol={sortCol}
                              sortDir={sortDir}
                              onSort={handleColumnSort}
                            />
                          </TableHead>
                          <TableHead>
                            <SortHeader
                              col="clientName"
                              label={t("policies.customer")}
                              sortCol={sortCol}
                              sortDir={sortDir}
                              onSort={handleColumnSort}
                            />
                          </TableHead>
                          <TableHead>
                            <FilterHeader
                              col="type"
                              label={t("common.type")}
                              isActive={typeFilters.size > 0}
                              sortCol={sortCol}
                              sortDir={sortDir}
                              onSort={handleColumnSort}
                            >
                              <p className={styles.filterGroupTitle}>
                                {t("policies.filterByType")}
                              </p>
                              <div className={styles.filterCheckboxGroup}>
                                {ALL_TYPES.map((policyType) => (
                                  <div
                                    key={policyType}
                                    className={styles.filterCheckboxRow}
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
                                      className={styles.filterLabel}
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
                              label={t("common.status")}
                              isActive={statusFilters.size > 0}
                              sortCol={sortCol}
                              sortDir={sortDir}
                              onSort={handleColumnSort}
                            >
                              <p className={styles.filterGroupTitle}>
                                {t("policies.filterByStatus")}
                              </p>
                              <div className={styles.filterCheckboxGroup}>
                                {ALL_STATUSES.map((status) => (
                                  <div
                                    key={status}
                                    className={styles.filterCheckboxRow}
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
                                      className={styles.filterLabel}
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
                              label={`${t("policies.premium")} (₪)`}
                              isActive={hasPremiumFilter}
                              sortCol={sortCol}
                              sortDir={sortDir}
                              onSort={handleColumnSort}
                            >
                              <p className={styles.filterGroupTitle}>
                                {t("policies.premiumRange")} (₪)
                              </p>
                              <div className={styles.premiumRangeRow}>
                                <Input
                                  value={premiumMin}
                                  onChange={(event) =>
                                    setPremiumMin(event.target.value)
                                  }
                                  placeholder="Min"
                                  className={styles.filterInput}
                                  type="number"
                                  min="0"
                                />
                                <span className={styles.premiumSeparator}>–</span>
                                <Input
                                  value={premiumMax}
                                  onChange={(event) =>
                                    setPremiumMax(event.target.value)
                                  }
                                  placeholder="Max"
                                  className={styles.filterInput}
                                  type="number"
                                  min="0"
                                />
                              </div>
                            </FilterHeader>
                          </TableHead>
                          <TableHead>
                            <FilterHeader
                              col="startDate"
                              label={t("forms.startDate")}
                              isActive={hasStartDateFilter}
                              sortCol={sortCol}
                              sortDir={sortDir}
                              onSort={handleColumnSort}
                            >
                              <p className={styles.filterGroupTitle}>
                                {t("policies.startDateRange")}
                              </p>
                              <div className={styles.filterDateGroup}>
                                <Input
                                  value={startDateFrom}
                                  onChange={(event) =>
                                    setStartDateFrom(event.target.value)
                                  }
                                  placeholder="From"
                                  className={styles.filterInput}
                                  type="date"
                                />
                                <Input
                                  value={startDateTo}
                                  onChange={(event) =>
                                    setStartDateTo(event.target.value)
                                  }
                                  placeholder="To"
                                  className={styles.filterInput}
                                  type="date"
                                />
                              </div>
                            </FilterHeader>
                          </TableHead>
                          <TableHead>
                            <FilterHeader
                              col="endDate"
                              label={t("forms.endDate")}
                              isActive={hasEndDateFilter}
                              sortCol={sortCol}
                              sortDir={sortDir}
                              onSort={handleColumnSort}
                            >
                              <p className={styles.filterGroupTitle}>
                                {t("policies.endDateRange")}
                              </p>
                              <div className={styles.filterDateGroup}>
                                <Input
                                  value={endDateFrom}
                                  onChange={(event) =>
                                    setEndDateFrom(event.target.value)
                                  }
                                  placeholder="From"
                                  className={styles.filterInput}
                                  type="date"
                                />
                                <Input
                                  value={endDateTo}
                                  onChange={(event) =>
                                    setEndDateTo(event.target.value)
                                  }
                                  placeholder="To"
                                  className={styles.filterInput}
                                  type="date"
                                />
                              </div>
                            </FilterHeader>
                          </TableHead>
                          <TableHead className={styles.headMuted}>
                            {t("policies.agent")}
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
                                className={styles.tableRow}
                                onClick={() =>
                                  navigate(`/policies/${policy.id}`)
                                }
                              >
                                <TableCell className={styles.cellMono}>
                                  {policy.policyNumber}
                                </TableCell>
                                <TableCell className={styles.cellMedium}>
                                  {policy.clientName}
                                </TableCell>
                                <TableCell>
                                  <div className={styles.typeIconWrap}>
                                    <div
                                      className={clsx(
                                        styles.typeIcon,
                                        typeClasses[policy.type],
                                      )}
                                    >
                                      <TypeIcon className={styles.typeIconSm} />
                                    </div>
                                    <span>{t(`policies.type.${policy.type}`)}</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant="outline"
                                    className={clsx(
                                      styles.statusBadge,
                                      statusClasses[policy.status],
                                    )}
                                  >
                                    {t(`policies.status.${policy.status}`)}
                                  </Badge>
                                </TableCell>
                                <TableCell className={styles.cellPremium}>
                                  ₪{policy.premium.toLocaleString()}/mo
                                </TableCell>
                                <TableCell className={styles.cellMuted}>
                                  {formatDate(policy.startDate)}
                                </TableCell>
                                <TableCell className={styles.cellMuted}>
                                  {formatDate(policy.endDate)}
                                </TableCell>
                                <TableCell className={styles.cellAgent}>
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
              title={t("policies.noMatchingTitle")}
              description={t("policies.noMatchingDesc")}
              action={
                activeFilters.length > 0
                  ? { label: t("policies.clearFilters"), onClick: clearAllFilters }
                  : undefined
              }
            />
          ) : (
            <div className={styles.cardGrid}>
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
                    className={styles.cardCursor}
                    onClick={() => navigate(`/policies/${policy.id}`)}
                  >
                    <Card className={styles.cardRoot}>
                      <CardContent className={styles.cardContent}>
                        <div className={styles.cardHeader}>
                          <div
                            className={clsx(
                              styles.cardTypeIcon,
                              typeClasses[policy.type],
                            )}
                          >
                            <TypeIcon className={styles.typeIconLg} />
                          </div>
                          <Badge
                            variant="outline"
                            className={clsx(
                              styles.statusBadge,
                              statusClasses[policy.status],
                            )}
                          >
                            {t(`policies.status.${policy.status}`)}
                          </Badge>
                        </div>
                        <div className={styles.cardInfo}>
                          <p className={styles.cardType}>
                            {t(`policies.type.${policy.type}`)} · {policy.policyNumber}
                          </p>
                          <p className={styles.cardClient}>
                            {policy.clientName}
                          </p>
                        </div>
                        <div className={styles.cardFooter}>
                          <div>
                            <p className={styles.cardPremiumLabel}>{t("policies.premium")}</p>
                            <p className={styles.cardPremiumValue}>
                              ₪{policy.premium.toLocaleString()}/mo
                            </p>
                          </div>
                          <p className={styles.cardRenewal}>
                            {t("policies.renewsOn", { date: formatDate(policy.endDate) })}
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
