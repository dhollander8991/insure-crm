import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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

import styles from "./CommandPalette.module.css";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/Command";
import { useTheme } from "@/components/ThemeProvider";
import { tokenStorage, emailStorage } from "@/lib/api";
import { useCustomersQuery } from "@/lib/queries/customers.queries";
import { usePoliciesQuery } from "@/lib/queries/policies.queries";

export function CommandPalette() {
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { theme, toggle: toggleTheme } = useTheme();

  const { data: customersData = [], isLoading: isCustomersLoading } =
    useCustomersQuery({
      enabled: isPaletteOpen,
      staleTime: 60_000,
    });

  const { data: policiesData = [], isLoading: isPoliciesLoading } =
    usePoliciesQuery({
      enabled: isPaletteOpen,
      staleTime: 60_000,
    });

  const isSearchLoading = isCustomersLoading || isPoliciesLoading;

  const matchingCustomers = useMemo(() => {
    if (!searchQuery) return [];
    const queryLower = searchQuery.toLowerCase();
    return customersData
      .filter(
        (customer) =>
          `${customer.firstName} ${customer.lastName}`
            .toLowerCase()
            .includes(queryLower) ||
          customer.email.toLowerCase().includes(queryLower) ||
          customer.phone.includes(queryLower),
      )
      .slice(0, 5);
  }, [customersData, searchQuery]);

  const matchingPolicies = useMemo(() => {
    if (!searchQuery) return [];
    const queryLower = searchQuery.toLowerCase();
    return policiesData
      .filter(
        (policy) =>
          policy.policyNumber.toLowerCase().includes(queryLower) ||
          policy.customerName.toLowerCase().includes(queryLower) ||
          policy.type.toLowerCase().includes(queryLower),
      )
      .slice(0, 5);
  }, [policiesData, searchQuery]);

  useEffect(() => {
    const handleCommandPaletteShortcut = (event: KeyboardEvent) => {
      if (
        (event.key === "k" || event.key === "K") &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault();
        setIsPaletteOpen((previousOpen) => !previousOpen);
      }
    };
    window.addEventListener("keydown", handleCommandPaletteShortcut);
    return () =>
      window.removeEventListener("keydown", handleCommandPaletteShortcut);
  }, []);

  const executeCommandAndClose = (commandFn: () => void) => {
    setIsPaletteOpen(false);
    setSearchQuery("");
    setTimeout(commandFn, 0);
  };

  const handleSignOut = () => {
    tokenStorage.clear();
    emailStorage.clear();
    navigate("/login");
  };

  const hasActiveSearch = searchQuery.length > 0;
  const hasSearchResults =
    matchingCustomers.length > 0 || matchingPolicies.length > 0;

  return (
    <CommandDialog
      open={isPaletteOpen}
      onOpenChange={(isOpen) => {
        setIsPaletteOpen(isOpen);
        if (!isOpen) setSearchQuery("");
      }}
    >
      <CommandInput
        placeholder="Search clients, policies, or jump to…"
        value={searchQuery}
        onValueChange={setSearchQuery}
      />
      <CommandList>
        {hasActiveSearch && isSearchLoading ? (
          <div className={styles.loadingRow}>
            <Loader2 className={styles.spinner} />
            Searching…
          </div>
        ) : (
          <>
            {hasActiveSearch && !hasSearchResults && (
              <CommandEmpty>No results found.</CommandEmpty>
            )}

            {hasActiveSearch && matchingCustomers.length > 0 && (
              <CommandGroup heading="Clients">
                {matchingCustomers.map((customer) => (
                  <CommandItem
                    key={customer.id}
                    value={`client-${customer.id}-${customer.firstName}-${customer.lastName}-${customer.email}`}
                    onSelect={() =>
                      executeCommandAndClose(() =>
                        navigate(`/clients/${customer.id}`),
                      )
                    }
                  >
                    <User className={styles.commandIcon} />
                    <span className={styles.resultName}>
                      {customer.firstName} {customer.lastName}
                    </span>
                    <span className={styles.resultMeta}>
                      {customer.email}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {hasActiveSearch && matchingPolicies.length > 0 && (
              <CommandGroup heading="Policies">
                {matchingPolicies.map((policy) => (
                  <CommandItem
                    key={policy.id}
                    value={`policy-${policy.id}-${policy.policyNumber}-${policy.customerName}`}
                    onSelect={() =>
                      executeCommandAndClose(() =>
                        navigate(`/policies/${policy.id}`),
                      )
                    }
                  >
                    <FileText className={styles.commandIcon} />
                    <span className={styles.resultName}>{policy.policyNumber}</span>
                    <span className={styles.resultMeta}>
                      {policy.customerName} · {policy.type}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {!hasActiveSearch && (
              <>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup heading="Navigate">
                  <CommandItem
                    onSelect={() => executeCommandAndClose(() => navigate("/"))}
                  >
                    <LayoutDashboard className={styles.commandIcon} /> Dashboard
                    <CommandShortcut>G D</CommandShortcut>
                  </CommandItem>
                  <CommandItem
                    onSelect={() =>
                      executeCommandAndClose(() => navigate("/clients"))
                    }
                  >
                    <Users className={styles.commandIcon} /> Clients
                    <CommandShortcut>G C</CommandShortcut>
                  </CommandItem>
                  <CommandItem
                    onSelect={() =>
                      executeCommandAndClose(() => navigate("/policies"))
                    }
                  >
                    <FileText className={styles.commandIcon} /> Policies
                    <CommandShortcut>G P</CommandShortcut>
                  </CommandItem>
                  <CommandItem
                    onSelect={() =>
                      executeCommandAndClose(() => navigate("/claims"))
                    }
                  >
                    <ShieldAlert className={styles.commandIcon} /> Claims
                    <CommandShortcut>G L</CommandShortcut>
                  </CommandItem>
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup heading="Quick actions">
                  <CommandItem
                    onSelect={() =>
                      executeCommandAndClose(() => navigate("/clients?new=true"))
                    }
                  >
                    <PlusCircle className={styles.commandIcon} /> New client
                  </CommandItem>
                  <CommandItem
                    onSelect={() =>
                      executeCommandAndClose(() => navigate("/policies?new=true"))
                    }
                  >
                    <PlusCircle className={styles.commandIcon} /> New policy
                  </CommandItem>
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup heading="Preferences">
                  <CommandItem
                    onSelect={() => executeCommandAndClose(toggleTheme)}
                  >
                    {theme === "dark" ? (
                      <Sun className={styles.commandIcon} />
                    ) : (
                      <Moon className={styles.commandIcon} />
                    )}
                    Toggle theme
                  </CommandItem>
                  <CommandItem
                    onSelect={() => executeCommandAndClose(handleSignOut)}
                  >
                    <LogOut className={styles.commandIcon} /> Sign out
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
