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
          <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
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
                    <User className="mr-2 h-4 w-4" />
                    <span className="font-medium">
                      {customer.firstName} {customer.lastName}
                    </span>
                    <span className="ml-2 text-xs text-muted-foreground">
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
                    <FileText className="mr-2 h-4 w-4" />
                    <span className="font-medium">{policy.policyNumber}</span>
                    <span className="ml-2 text-xs text-muted-foreground">
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
                    <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                    <CommandShortcut>G D</CommandShortcut>
                  </CommandItem>
                  <CommandItem
                    onSelect={() =>
                      executeCommandAndClose(() => navigate("/clients"))
                    }
                  >
                    <Users className="mr-2 h-4 w-4" /> Clients
                    <CommandShortcut>G C</CommandShortcut>
                  </CommandItem>
                  <CommandItem
                    onSelect={() =>
                      executeCommandAndClose(() => navigate("/policies"))
                    }
                  >
                    <FileText className="mr-2 h-4 w-4" /> Policies
                    <CommandShortcut>G P</CommandShortcut>
                  </CommandItem>
                  <CommandItem
                    onSelect={() =>
                      executeCommandAndClose(() => navigate("/claims"))
                    }
                  >
                    <ShieldAlert className="mr-2 h-4 w-4" /> Claims
                    <CommandShortcut>G L</CommandShortcut>
                  </CommandItem>
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup heading="Quick actions">
                  <CommandItem
                    onSelect={() =>
                      executeCommandAndClose(() => navigate("/clients"))
                    }
                  >
                    <PlusCircle className="mr-2 h-4 w-4" /> New client
                  </CommandItem>
                  <CommandItem
                    onSelect={() =>
                      executeCommandAndClose(() => navigate("/policies"))
                    }
                  >
                    <PlusCircle className="mr-2 h-4 w-4" /> New policy
                  </CommandItem>
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup heading="Preferences">
                  <CommandItem
                    onSelect={() => executeCommandAndClose(toggleTheme)}
                  >
                    {theme === "dark" ? (
                      <Sun className="mr-2 h-4 w-4" />
                    ) : (
                      <Moon className="mr-2 h-4 w-4" />
                    )}
                    Toggle theme
                  </CommandItem>
                  <CommandItem
                    onSelect={() => executeCommandAndClose(handleSignOut)}
                  >
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
