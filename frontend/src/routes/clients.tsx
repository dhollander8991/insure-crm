import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Plus, Mail, Phone } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageTransition } from "@/components/page-transition";
import { TableSkeleton } from "@/components/skeletons";
import { customerApi, type CustomerResponse } from "@/lib/api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/clients")({
  head: () => ({
    meta: [
      { title: "Clients — Aegis CRM" },
      { name: "description", content: "Manage clients, leads, and customer relationships." },
    ],
  }),
  component: ClientsPage,
});

type ClientStatus = "Lead" | "Active" | "Churned";

const STATUS_MAP: Record<CustomerResponse["status"], ClientStatus> = {
  ACTIVE: "Active",
  INACTIVE: "Churned",
  PROSPECT: "Lead",
};

const statuses: (ClientStatus | "All")[] = ["All", "Lead", "Active", "Churned"];

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
}

function mapCustomer(c: CustomerResponse): MappedClient {
  return {
    id: c.id,
    name: `${c.firstName} ${c.lastName}`,
    email: c.email,
    phone: c.phone,
    status: STATUS_MAP[c.status] ?? "Lead",
  };
}

function ClientsPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof statuses)[number]>("All");

  const { data: customers = [], isLoading, isError } = useQuery({
    queryKey: ["customers"],
    queryFn: customerApi.getAll,
  });

  const clients = useMemo(() => customers.map(mapCustomer), [customers]);

  const filtered = useMemo(() => {
    return clients.filter((c) => {
      const matchesQuery = c.name.toLowerCase().includes(query.toLowerCase()) || c.email.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = filter === "All" || c.status === filter;
      return matchesQuery && matchesStatus;
    });
  }, [clients, query, filter]);

  return (
    <PageTransition>
      <div className="relative overflow-x-hidden px-4 py-6 md:px-6 lg:px-8">
        <div className="mesh-bg"><div className="mesh-orb" /></div>
        <div className="relative">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Clients</h1>
              <p className="text-sm text-muted-foreground">{filtered.length} of {clients.length} contacts</p>
            </div>
            <Button className="gap-2 shadow-[var(--shadow-elegant)]">
              <Plus className="h-4 w-4" /> Add Client
            </Button>
          </div>

          {isLoading ? (
            <TableSkeleton rows={7} cols={5} />
          ) : isError ? (
            <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-6 text-center text-sm text-destructive">
              Failed to load clients. Make sure customer-service is running.
            </div>
          ) : (
            <Card>
              <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full sm:max-w-xs">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or email…" className="pl-9" />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {statuses.map((s) => (
                    <button
                      key={s}
                      onClick={() => setFilter(s)}
                      className={cn(
                        "rounded-full border px-3 py-1 text-xs font-medium transition-all",
                        filter === s ? "border-primary bg-primary text-primary-foreground shadow-sm" : "border-border bg-background text-muted-foreground hover:bg-muted",
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Client</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((c, i) => (
                        <motion.tr
                          key={c.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.25, delay: Math.min(i * 0.03, 0.4) }}
                          className="border-b transition-colors hover:bg-muted/50"
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                                {c.name.split(" ").map((n) => n[0]).join("")}
                              </div>
                              <div>
                                <div className="font-medium">{c.name}</div>
                                <div className="text-xs text-muted-foreground">#{c.id}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-0.5 text-xs">
                              <span className="flex items-center gap-1.5"><Mail className="h-3 w-3 text-muted-foreground" />{c.email}</span>
                              <span className="flex items-center gap-1.5 text-muted-foreground"><Phone className="h-3 w-3" />{c.phone}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={cn("font-medium", statusStyles[c.status])}>{c.status}</Badge>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
