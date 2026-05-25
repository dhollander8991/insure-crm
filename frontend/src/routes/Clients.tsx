import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Mail,
  Phone,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Filter,
  X,
  Users,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import clsx from "clsx";

import styles from "./Clients.module.css";
import { useTranslation } from "react-i18next";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
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
import { TableSkeleton } from "@/components/Skeletons";
import { type CustomerResponse } from "@/lib/api";
import { NewClientDialog } from "@/components/forms/NewClientDialog";
import { useCustomersQuery } from "@/lib/queries/customers.queries";

type ClientStatus = "Lead" | "Active" | "Churned";

const STATUS_MAP: Record<CustomerResponse["status"], ClientStatus> = {
  ACTIVE: "Active",
  INACTIVE: "Churned",
  PROSPECT: "Lead",
};

const statusClasses: Record<ClientStatus, string> = {
  Lead: styles.statusLead,
  Active: styles.statusActive,
  Churned: styles.statusChurned,
};

interface MappedClient {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: ClientStatus;
  dateOfBirth: string;
}

function mapCustomerToClient(customer: CustomerResponse): MappedClient {
  return {
    id: customer.id,
    name: `${customer.firstName} ${customer.lastName}`,
    email: customer.email,
    phone: customer.phone,
    status: STATUS_MAP[customer.status] ?? "Lead",
    dateOfBirth: customer.dateOfBirth,
  };
}

type SortColumn = "name" | "email" | "phone" | "status" | "dateOfBirth";
type SortDirection = "asc" | "desc";

const ALL_STATUSES: ClientStatus[] = ["Active", "Lead", "Churned"];

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

export function ClientsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get("new") === "true") {
      setIsNewClientModalOpen(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const [sortCol, setSortCol] = useState<SortColumn | null>(null);
  const [sortDir, setSortDir] = useState<SortDirection>("asc");

  const [nameFilter, setNameFilter] = useState("");
  const [emailFilter, setEmailFilter] = useState("");
  const [statusFilters, setStatusFilters] = useState<Set<ClientStatus>>(
    new Set(),
  );

  const { data: customersData = [], isLoading, isError } = useCustomersQuery();

  const clients = useMemo(
    () => customersData.map(mapCustomerToClient),
    [customersData],
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

  const toggleStatusFilter = (status: ClientStatus) => {
    setStatusFilters((previousFilters) => {
      const nextFilters = new Set(previousFilters);
      if (nextFilters.has(status)) nextFilters.delete(status);
      else nextFilters.add(status);
      return nextFilters;
    });
  };

  const filteredClients = useMemo(() => {
    let result = clients.filter((client) => {
      if (
        nameFilter &&
        !client.name.toLowerCase().includes(nameFilter.toLowerCase())
      )
        return false;
      if (
        emailFilter &&
        !client.email.toLowerCase().includes(emailFilter.toLowerCase())
      )
        return false;
      if (statusFilters.size > 0 && !statusFilters.has(client.status))
        return false;
      return true;
    });

    if (sortCol) {
      result = [...result].sort((aClient, bClient) => {
        const aValue = aClient[sortCol] ?? "";
        const bValue = bClient[sortCol] ?? "";
        const comparison = String(aValue).localeCompare(
          String(bValue),
          undefined,
          { numeric: true },
        );
        return sortDir === "asc" ? comparison : -comparison;
      });
    }

    return result;
  }, [clients, nameFilter, emailFilter, statusFilters, sortCol, sortDir]);

  const activeFilters: Array<{
    key: string;
    label: string;
    onRemove: () => void;
  }> = [
    ...(nameFilter
      ? [
          {
            key: "name",
            label: `Name: "${nameFilter}"`,
            onRemove: () => setNameFilter(""),
          },
        ]
      : []),
    ...(emailFilter
      ? [
          {
            key: "email",
            label: `Email: "${emailFilter}"`,
            onRemove: () => setEmailFilter(""),
          },
        ]
      : []),
    ...[...statusFilters].map((status) => ({
      key: `status-${status}`,
      label: status,
      onRemove: () => toggleStatusFilter(status),
    })),
  ];

  const clearAllFilters = () => {
    setNameFilter("");
    setEmailFilter("");
    setStatusFilters(new Set());
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
              <h1 className={styles.pageTitle}>{t("customers.title")}</h1>
              <p className={styles.pageSubtitle}>
                {filteredClients.length} {t("common.of")} {clients.length} {t("common.contacts")}
              </p>
            </div>
            <Button
              onClick={() => setIsNewClientModalOpen(true)}
              className={styles.addButton}
              data-testid="add-customer-button"
            >
              <Plus className={styles.addBtnIcon} /> {t("customers.addClient")}
            </Button>
          </div>

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
            <TableSkeleton rows={7} cols={5} />
          ) : isError ? (
            <div className={styles.errorMessage}>
              {t("customers.failedToLoad")}
            </div>
          ) : clients.length === 0 ? (
            <EmptyState
              icon={Users}
              title={t("customers.noClientsTitle")}
              description={t("customers.noClientsDesc")}
              action={{
                label: t("customers.addFirstClient"),
                onClick: () => setIsNewClientModalOpen(true),
              }}
            />
          ) : (
            <Card>
              <CardHeader className={styles.cardHeaderNoPb}>
                <div className={styles.searchWrapper}>
                  <Search className={styles.searchIcon} />
                  <Input
                    value={nameFilter}
                    onChange={(event) => setNameFilter(event.target.value)}
                    placeholder={t("customers.searchByName")}
                    className={styles.searchInput}
                    data-testid="customer-search"
                  />
                </div>
              </CardHeader>
              <CardContent className={styles.cardContentPadded}>
                {filteredClients.length === 0 ? (
                  <EmptyState
                    icon={Users}
                    title={t("customers.noMatchingTitle")}
                    description={t("customers.noMatchingDesc")}
                    action={
                      activeFilters.length > 0
                        ? { label: t("customers.clearFilters"), onClick: clearAllFilters }
                        : undefined
                    }
                  />
                ) : (
                  <div className={styles.tableWrapper}>
                    <Table data-testid="customers-table">
                      <TableHeader>
                        <TableRow>
                          <TableHead>
                            <FilterHeader
                              col="name"
                              label={t("customers.client")}
                              isActive={!!nameFilter}
                              sortCol={sortCol}
                              sortDir={sortDir}
                              onSort={handleColumnSort}
                            >
                              <p className={styles.filterGroupTitleSm}>
                                {t("customers.filterByName")}
                              </p>
                              <Input
                                size={20}
                                value={nameFilter}
                                onChange={(event) =>
                                  setNameFilter(event.target.value)
                                }
                                placeholder={t("customers.searchName")}
                                className={styles.filterInput}
                              />
                            </FilterHeader>
                          </TableHead>
                          <TableHead>
                            <FilterHeader
                              col="email"
                              label={t("common.email")}
                              isActive={!!emailFilter}
                              sortCol={sortCol}
                              sortDir={sortDir}
                              onSort={handleColumnSort}
                            >
                              <p className={styles.filterGroupTitleSm}>
                                {t("customers.filterByEmail")}
                              </p>
                              <Input
                                value={emailFilter}
                                onChange={(event) =>
                                  setEmailFilter(event.target.value)
                                }
                                placeholder={t("customers.searchEmail")}
                                className={styles.filterInput}
                              />
                            </FilterHeader>
                          </TableHead>
                          <TableHead>
                            <SortHeader
                              col="phone"
                              label={t("common.phone")}
                              sortCol={sortCol}
                              sortDir={sortDir}
                              onSort={handleColumnSort}
                            />
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
                                {t("customers.filterByStatus")}
                              </p>
                              <div className={styles.filterCheckboxGroup}>
                                {ALL_STATUSES.map((status) => (
                                  <div
                                    key={status}
                                    className={styles.filterCheckboxRow}
                                  >
                                    <Checkbox
                                      id={`status-${status}`}
                                      checked={statusFilters.has(status)}
                                      onCheckedChange={() =>
                                        toggleStatusFilter(status)
                                      }
                                    />
                                    <Label
                                      htmlFor={`status-${status}`}
                                      className={styles.filterLabel}
                                    >
                                      {t(`customers.status.${status}`)}
                                    </Label>
                                  </div>
                                ))}
                              </div>
                            </FilterHeader>
                          </TableHead>
                          <TableHead>
                            <SortHeader
                              col="dateOfBirth"
                              label={t("customers.dateOfBirth")}
                              sortCol={sortCol}
                              sortDir={sortDir}
                              onSort={handleColumnSort}
                            />
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <AnimatePresence initial={false}>
                          {filteredClients.map((client, index) => (
                            <motion.tr
                              key={client.id}
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0 }}
                              transition={{
                                duration: 0.2,
                                delay: Math.min(index * 0.02, 0.3),
                              }}
                              className={styles.tableRow}
                              onClick={() => navigate(`/clients/${client.id}`)}
                            >
                              <TableCell>
                                <div className={styles.avatarCell}>
                                  <div className={styles.avatarCircle}>
                                    {client.name
                                      .split(" ")
                                      .map((namePart) => namePart[0])
                                      .join("")
                                      .slice(0, 2)}
                                  </div>
                                  <div className={styles.avatarTextGroup}>
                                    <div className={styles.avatarName}>
                                      {client.name}
                                    </div>
                                    <div className={styles.avatarId}>
                                      #{client.id}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className={styles.cellXs}>
                                <span className={styles.cellIconText}>
                                  <Mail className={styles.cellMailIcon} />
                                  {client.email}
                                </span>
                              </TableCell>
                              <TableCell className={styles.cellXsMuted}>
                                <span className={styles.cellIconText}>
                                  <Phone className={styles.cellPhoneIcon} />
                                  {client.phone}
                                </span>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={statusClasses[client.status]}
                                >
                                  {client.status}
                                </Badge>
                              </TableCell>
                              <TableCell className={styles.cellXsMuted}>
                                {client.dateOfBirth
                                  ? new Date(
                                      client.dateOfBirth,
                                    ).toLocaleDateString(undefined, {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                    })
                                  : "—"}
                              </TableCell>
                            </motion.tr>
                          ))}
                        </AnimatePresence>
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <NewClientDialog
        open={isNewClientModalOpen}
        onOpenChange={setIsNewClientModalOpen}
      />
    </PageTransition>
  );
}
