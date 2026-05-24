import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState } from "react";
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
import { useNavigate } from "react-router-dom";

import styles from "./Clients.module.css";

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
import { cn } from "@/lib/utils";
import { useCustomersQuery } from "@/lib/queries/customers.queries";

type ClientStatus = "Lead" | "Active" | "Churned";

const STATUS_MAP: Record<CustomerResponse["status"], ClientStatus> = {
  ACTIVE: "Active",
  INACTIVE: "Churned",
  PROSPECT: "Lead",
};

const statusStyles: Record<ClientStatus, string> = {
  Lead: "bg-info/15 text-info border-info/30",
  Active: "bg-success/15 text-success border-success/30",
  Churned: "bg-muted text-muted-foreground border-border",
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
        "flex items-center gap-1 font-medium hover:text-foreground",
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

export function ClientsPage() {
  const navigate = useNavigate();
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);

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
      <div className={styles.pageWrapper}>
        <div className="mesh-bg">
          <div className="mesh-orb" />
        </div>
        <div className="relative">
          <div className={styles.pageHeader}>
            <div>
              <h1 className={styles.pageTitle}>Clients</h1>
              <p className={styles.pageSubtitle}>
                {filteredClients.length} of {clients.length} contacts
              </p>
            </div>
            <Button
              onClick={() => setIsNewClientModalOpen(true)}
              className="gap-2 shadow-[var(--shadow-elegant)]"
              data-testid="add-customer-button"
            >
              <Plus className="h-4 w-4" /> Add Client
            </Button>
          </div>

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
            <TableSkeleton rows={7} cols={5} />
          ) : isError ? (
            <div className={styles.errorMessage}>
              Failed to load clients. Make sure customer-service is running.
            </div>
          ) : clients.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No clients yet"
              description="Add your first client to get started tracking your book of business."
              action={{
                label: "+ Add your first client",
                onClick: () => setIsNewClientModalOpen(true),
              }}
            />
          ) : (
            <Card>
              <CardHeader className="pb-0">
                <div className="relative w-full sm:max-w-xs">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={nameFilter}
                    onChange={(event) => setNameFilter(event.target.value)}
                    placeholder="Search by name…"
                    className="pl-9"
                    data-testid="customer-search"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0 pt-2">
                {filteredClients.length === 0 ? (
                  <EmptyState
                    icon={Users}
                    title="No matching clients"
                    description="Try adjusting your filters."
                    action={
                      activeFilters.length > 0
                        ? { label: "Clear filters", onClick: clearAllFilters }
                        : undefined
                    }
                  />
                ) : (
                  <div className={styles.tableScrollWrapper}>
                    <Table data-testid="customers-table">
                      <TableHeader>
                        <TableRow>
                          <TableHead>
                            <FilterHeader
                              col="name"
                              label="Client"
                              isActive={!!nameFilter}
                              sortCol={sortCol}
                              sortDir={sortDir}
                              onSort={handleColumnSort}
                            >
                              <p className="mb-1.5 text-xs font-medium">
                                Filter by name
                              </p>
                              <Input
                                size={20}
                                value={nameFilter}
                                onChange={(event) =>
                                  setNameFilter(event.target.value)
                                }
                                placeholder="Search name…"
                                className="h-8 text-sm"
                              />
                            </FilterHeader>
                          </TableHead>
                          <TableHead>
                            <FilterHeader
                              col="email"
                              label="Email"
                              isActive={!!emailFilter}
                              sortCol={sortCol}
                              sortDir={sortDir}
                              onSort={handleColumnSort}
                            >
                              <p className="mb-1.5 text-xs font-medium">
                                Filter by email
                              </p>
                              <Input
                                value={emailFilter}
                                onChange={(event) =>
                                  setEmailFilter(event.target.value)
                                }
                                placeholder="Search email…"
                                className="h-8 text-sm"
                              />
                            </FilterHeader>
                          </TableHead>
                          <TableHead>
                            <SortHeader
                              col="phone"
                              label="Phone"
                              sortCol={sortCol}
                              sortDir={sortDir}
                              onSort={handleColumnSort}
                            />
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
                                      id={`status-${status}`}
                                      checked={statusFilters.has(status)}
                                      onCheckedChange={() =>
                                        toggleStatusFilter(status)
                                      }
                                    />
                                    <Label
                                      htmlFor={`status-${status}`}
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
                            <SortHeader
                              col="dateOfBirth"
                              label="Date of Birth"
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
                              className="border-b cursor-pointer transition-colors hover:bg-muted/50"
                              onClick={() => navigate(`/clients/${client.id}`)}
                            >
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary shrink-0">
                                    {client.name
                                      .split(" ")
                                      .map((namePart) => namePart[0])
                                      .join("")
                                      .slice(0, 2)}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="font-medium truncate">
                                      {client.name}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      #{client.id}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-xs">
                                <span className="flex items-center gap-1.5">
                                  <Mail className="h-3 w-3 text-muted-foreground shrink-0" />
                                  {client.email}
                                </span>
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground">
                                <span className="flex items-center gap-1.5">
                                  <Phone className="h-3 w-3 shrink-0" />
                                  {client.phone}
                                </span>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "font-medium",
                                    statusStyles[client.status],
                                  )}
                                >
                                  {client.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground">
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
