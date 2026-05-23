import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Search, Plus, Mail, Phone, ChevronUp, ChevronDown,
  ChevronsUpDown, Filter, X, Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { TableSkeleton } from "@/components/skeletons";
import { customerApi, type CustomerResponse } from "@/lib/api";
import { NewClientDialog } from "@/components/forms/new-client-dialog";
import { cn } from "@/lib/utils";

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

function mapCustomer(c: CustomerResponse): MappedClient {
  return {
    id: c.id,
    name: `${c.firstName} ${c.lastName}`,
    email: c.email,
    phone: c.phone,
    status: STATUS_MAP[c.status] ?? "Lead",
    dateOfBirth: c.dateOfBirth,
  };
}

type SortColumn = "name" | "email" | "phone" | "status" | "dateOfBirth";
type SortDir = "asc" | "desc";

const ALL_STATUSES: ClientStatus[] = ["Active", "Lead", "Churned"];

// ── Column header with sort arrow ────────────────────────────────────────────
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
      className={cn("flex items-center gap-1 font-medium hover:text-foreground", className)}
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

// ── Column header with filter popover ───────────────────────────────────────
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

export function ClientsPage() {
  const navigate = useNavigate();
  const [showNewClient, setShowNewClient] = useState(false);

  // Sort state
  const [sortCol, setSortCol] = useState<SortColumn | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  // Filter state
  const [nameFilter, setNameFilter] = useState("");
  const [emailFilter, setEmailFilter] = useState("");
  const [statusFilters, setStatusFilters] = useState<Set<ClientStatus>>(new Set());

  const { data: customers = [], isLoading, isError } = useQuery({
    queryKey: ["customers"],
    queryFn: customerApi.getAll,
  });

  const clients = useMemo(() => customers.map(mapCustomer), [customers]);

  const handleSort = (col: SortColumn) => {
    if (sortCol === col) {
      if (sortDir === "asc") setSortDir("desc");
      else setSortCol(null);
    } else {
      setSortCol(col);
      setSortDir("asc");
    }
  };

  const toggleStatus = (s: ClientStatus) => {
    setStatusFilters((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s); else next.add(s);
      return next;
    });
  };

  const filtered = useMemo(() => {
    let result = clients.filter((c) => {
      if (nameFilter && !c.name.toLowerCase().includes(nameFilter.toLowerCase())) return false;
      if (emailFilter && !c.email.toLowerCase().includes(emailFilter.toLowerCase())) return false;
      if (statusFilters.size > 0 && !statusFilters.has(c.status)) return false;
      return true;
    });

    if (sortCol) {
      result = [...result].sort((a, b) => {
        const av = a[sortCol] ?? "";
        const bv = b[sortCol] ?? "";
        const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
        return sortDir === "asc" ? cmp : -cmp;
      });
    }

    return result;
  }, [clients, nameFilter, emailFilter, statusFilters, sortCol, sortDir]);

  // Active filter chips
  const activeFilters: Array<{ key: string; label: string; onRemove: () => void }> = [
    ...(nameFilter ? [{ key: "name", label: `Name: "${nameFilter}"`, onRemove: () => setNameFilter("") }] : []),
    ...(emailFilter ? [{ key: "email", label: `Email: "${emailFilter}"`, onRemove: () => setEmailFilter("") }] : []),
    ...[...statusFilters].map((s) => ({
      key: `status-${s}`, label: s,
      onRemove: () => toggleStatus(s),
    })),
  ];

  const clearAllFilters = () => {
    setNameFilter("");
    setEmailFilter("");
    setStatusFilters(new Set());
  };

  return (
    <PageTransition>
      <div className="relative px-4 py-6 md:px-6 lg:px-8">
        <div className="mesh-bg"><div className="mesh-orb" /></div>
        <div className="relative">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Clients</h1>
              <p className="text-sm text-muted-foreground">
                {filtered.length} of {clients.length} contacts
              </p>
            </div>
            <Button onClick={() => setShowNewClient(true)} className="gap-2 shadow-[var(--shadow-elegant)]" data-testid="add-customer-button">
              <Plus className="h-4 w-4" /> Add Client
            </Button>
          </div>

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
            <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-6 text-center text-sm text-destructive">
              Failed to load clients. Make sure customer-service is running.
            </div>
          ) : clients.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No clients yet"
              description="Add your first client to get started tracking your book of business."
              action={{ label: "+ Add your first client", onClick: () => setShowNewClient(true) }}
            />
          ) : (
            <Card>
              <CardHeader className="pb-0">
                {/* Global search bar */}
                <div className="relative w-full sm:max-w-xs">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={nameFilter}
                    onChange={(e) => setNameFilter(e.target.value)}
                    placeholder="Search by name…"
                    className="pl-9"
                    data-testid="customer-search"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0 pt-2">
                {filtered.length === 0 ? (
                  <EmptyState
                    icon={Users}
                    title="No matching clients"
                    description="Try adjusting your filters."
                    action={activeFilters.length > 0 ? { label: "Clear filters", onClick: clearAllFilters } : undefined}
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <Table data-testid="customers-table">
                      <TableHeader>
                        <TableRow>
                          <TableHead>
                            <FilterHeader
                              col="name" label="Client"
                              isActive={!!nameFilter}
                              sortCol={sortCol} sortDir={sortDir} onSort={handleSort}
                            >
                              <p className="mb-1.5 text-xs font-medium">Filter by name</p>
                              <Input
                                size={20}
                                value={nameFilter}
                                onChange={(e) => setNameFilter(e.target.value)}
                                placeholder="Search name…"
                                className="h-8 text-sm"
                              />
                            </FilterHeader>
                          </TableHead>
                          <TableHead>
                            <FilterHeader
                              col="email" label="Email"
                              isActive={!!emailFilter}
                              sortCol={sortCol} sortDir={sortDir} onSort={handleSort}
                            >
                              <p className="mb-1.5 text-xs font-medium">Filter by email</p>
                              <Input
                                value={emailFilter}
                                onChange={(e) => setEmailFilter(e.target.value)}
                                placeholder="Search email…"
                                className="h-8 text-sm"
                              />
                            </FilterHeader>
                          </TableHead>
                          <TableHead>
                            <SortHeader col="phone" label="Phone" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                          </TableHead>
                          <TableHead>
                            <FilterHeader
                              col="status" label="Status"
                              isActive={statusFilters.size > 0}
                              sortCol={sortCol} sortDir={sortDir} onSort={handleSort}
                            >
                              <p className="mb-2 text-xs font-medium">Filter by status</p>
                              <div className="space-y-2">
                                {ALL_STATUSES.map((s) => (
                                  <div key={s} className="flex items-center gap-2">
                                    <Checkbox
                                      id={`status-${s}`}
                                      checked={statusFilters.has(s)}
                                      onCheckedChange={() => toggleStatus(s)}
                                    />
                                    <Label htmlFor={`status-${s}`} className="text-sm font-normal cursor-pointer">
                                      {s}
                                    </Label>
                                  </div>
                                ))}
                              </div>
                            </FilterHeader>
                          </TableHead>
                          <TableHead>
                            <SortHeader col="dateOfBirth" label="Date of Birth" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <AnimatePresence initial={false}>
                          {filtered.map((c, i) => (
                            <motion.tr
                              key={c.id}
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.2, delay: Math.min(i * 0.02, 0.3) }}
                              className="border-b cursor-pointer transition-colors hover:bg-muted/50"
                              onClick={() => navigate(`/clients/${c.id}`)}
                            >
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary shrink-0">
                                    {c.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="font-medium truncate">{c.name}</div>
                                    <div className="text-xs text-muted-foreground">#{c.id}</div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-xs">
                                <span className="flex items-center gap-1.5">
                                  <Mail className="h-3 w-3 text-muted-foreground shrink-0" />
                                  {c.email}
                                </span>
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground">
                                <span className="flex items-center gap-1.5">
                                  <Phone className="h-3 w-3 shrink-0" />
                                  {c.phone}
                                </span>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className={cn("font-medium", statusStyles[c.status])}>
                                  {c.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground">
                                {c.dateOfBirth
                                  ? new Date(c.dateOfBirth).toLocaleDateString(undefined, {
                                      year: "numeric", month: "short", day: "numeric",
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

      <NewClientDialog open={showNewClient} onOpenChange={setShowNewClient} />
    </PageTransition>
  );
}
