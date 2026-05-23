import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import {
  LayoutDashboard,
  Users,
  FileText,
  ShieldAlert,
  PlusCircle,
  LogOut,
  Sun,
  Moon,
  User,
  Loader2,
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { tokenStorage, emailStorage, customerApi, policyApi } from "@/lib/api";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { theme, toggle: toggleTheme } = useTheme();

  const { data: customers = [], isLoading: loadingCustomers } = useQuery({
    queryKey: ["customers"],
    queryFn: customerApi.getAll,
    enabled: open,
    staleTime: 60_000,
  });

  const { data: policies = [], isLoading: loadingPolicies } = useQuery({
    queryKey: ["policies"],
    queryFn: policyApi.getAll,
    enabled: open,
    staleTime: 60_000,
  });

  const isLoading = loadingCustomers || loadingPolicies;

  const filteredCustomers = useMemo(() => {
    if (!query) return [];
    const q = query.toLowerCase();
    return customers
      .filter(
        (c) =>
          `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.phone.includes(q),
      )
      .slice(0, 5);
  }, [customers, query]);

  const filteredPolicies = useMemo(() => {
    if (!query) return [];
    const q = query.toLowerCase();
    return policies
      .filter(
        (p) =>
          p.policyNumber.toLowerCase().includes(q) ||
          p.customerName.toLowerCase().includes(q) ||
          p.type.toLowerCase().includes(q),
      )
      .slice(0, 5);
  }, [policies, query]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const run = (fn: () => void) => {
    setOpen(false);
    setQuery("");
    setTimeout(fn, 0);
  };

  const signOut = () => {
    tokenStorage.clear();
    emailStorage.clear();
    navigate("/login");
  };

  const showSearch = query.length > 0;
  const hasResults = filteredCustomers.length > 0 || filteredPolicies.length > 0;

  return (
    <CommandDialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setQuery("");
      }}
    >
      <CommandInput
        placeholder="Search clients, policies, or jump to…"
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {showSearch && isLoading ? (
          <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Searching…
          </div>
        ) : (
          <>
            {showSearch && !hasResults && <CommandEmpty>No results found.</CommandEmpty>}

            {showSearch && filteredCustomers.length > 0 && (
              <CommandGroup heading="Clients">
                {filteredCustomers.map((c) => (
                  <CommandItem
                    key={c.id}
                    value={`client-${c.id}-${c.firstName}-${c.lastName}-${c.email}`}
                    onSelect={() => run(() => navigate(`/clients/${c.id}`))}
                  >
                    <User className="mr-2 h-4 w-4" />
                    <span className="font-medium">
                      {c.firstName} {c.lastName}
                    </span>
                    <span className="ml-2 text-xs text-muted-foreground">{c.email}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {showSearch && filteredPolicies.length > 0 && (
              <CommandGroup heading="Policies">
                {filteredPolicies.map((p) => (
                  <CommandItem
                    key={p.id}
                    value={`policy-${p.id}-${p.policyNumber}-${p.customerName}`}
                    onSelect={() => run(() => navigate(`/policies/${p.id}`))}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    <span className="font-medium">{p.policyNumber}</span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      {p.customerName} · {p.type}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {!showSearch && (
              <>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup heading="Navigate">
                  <CommandItem onSelect={() => run(() => navigate("/"))}>
                    <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                    <CommandShortcut>G D</CommandShortcut>
                  </CommandItem>
                  <CommandItem onSelect={() => run(() => navigate("/clients"))}>
                    <Users className="mr-2 h-4 w-4" /> Clients
                    <CommandShortcut>G C</CommandShortcut>
                  </CommandItem>
                  <CommandItem onSelect={() => run(() => navigate("/policies"))}>
                    <FileText className="mr-2 h-4 w-4" /> Policies
                    <CommandShortcut>G P</CommandShortcut>
                  </CommandItem>
                  <CommandItem onSelect={() => run(() => navigate("/claims"))}>
                    <ShieldAlert className="mr-2 h-4 w-4" /> Claims
                    <CommandShortcut>G L</CommandShortcut>
                  </CommandItem>
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup heading="Quick actions">
                  <CommandItem onSelect={() => run(() => navigate("/clients"))}>
                    <PlusCircle className="mr-2 h-4 w-4" /> New client
                  </CommandItem>
                  <CommandItem onSelect={() => run(() => navigate("/policies"))}>
                    <PlusCircle className="mr-2 h-4 w-4" /> New policy
                  </CommandItem>
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup heading="Preferences">
                  <CommandItem onSelect={() => run(toggleTheme)}>
                    {theme === "dark" ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
                    Toggle theme
                  </CommandItem>
                  <CommandItem onSelect={() => run(signOut)}>
                    <LogOut className="mr-2 h-4 w-4" /> Sign out
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
