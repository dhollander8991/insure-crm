import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
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

import styles from "./widgets.module.css";

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
  const { t } = useTranslation();
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { theme, toggle: toggleTheme } = useTheme();

  const { data: customersPage, isLoading: isCustomersLoading } =
    useCustomersQuery(0, 20, { enabled: isPaletteOpen, staleTime: 60_000 });

  const { data: policiesPage, isLoading: isPoliciesLoading } =
    usePoliciesQuery(0, 20, { enabled: isPaletteOpen, staleTime: 60_000 });

  const isSearchLoading = isCustomersLoading || isPoliciesLoading;

  const matchingCustomers = useMemo(() => {
    if (!searchQuery) return [];
    const queryLower = searchQuery.toLowerCase();
    return (customersPage?.content ?? [])
      .filter(
        (customer) =>
          `${customer.firstName} ${customer.lastName}`
            .toLowerCase()
            .includes(queryLower) ||
          customer.email.toLowerCase().includes(queryLower) ||
          customer.phone.includes(queryLower),
      )
      .slice(0, 5);
  }, [customersPage, searchQuery]);

  const matchingPolicies = useMemo(() => {
    if (!searchQuery) return [];
    const queryLower = searchQuery.toLowerCase();
    return (policiesPage?.content ?? [])
      .filter(
        (policy) =>
          policy.policyNumber.toLowerCase().includes(queryLower) ||
          policy.customerName.toLowerCase().includes(queryLower) ||
          policy.type.toLowerCase().includes(queryLower),
      )
      .slice(0, 5);
  }, [policiesPage, searchQuery]);

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
        placeholder={t("commandPalette.search")}
        value={searchQuery}
        onValueChange={setSearchQuery}
      />
      <CommandList>
        {hasActiveSearch && isSearchLoading ? (
          <div className={styles.paletteLoadingRow}>
            <Loader2 className={styles.paletteSpinner} />
            {t("commandPalette.searching")}
          </div>
        ) : (
          <>
            {hasActiveSearch && !hasSearchResults && (
              <CommandEmpty>{t("common.noResults")}</CommandEmpty>
            )}

            {hasActiveSearch && matchingCustomers.length > 0 && (
              <CommandGroup heading={t("commandPalette.clients")}>
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
              <CommandGroup heading={t("navigation.policies")}>
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
                <CommandEmpty>{t("common.noResults")}</CommandEmpty>
                <CommandGroup heading={t("commandPalette.navigate")}>
                  <CommandItem
                    onSelect={() => executeCommandAndClose(() => navigate("/"))}
                  >
                    <LayoutDashboard className={styles.commandIcon} /> {t("commandPalette.pages.dashboard")}
                    <CommandShortcut>G D</CommandShortcut>
                  </CommandItem>
                  <CommandItem
                    onSelect={() =>
                      executeCommandAndClose(() => navigate("/clients"))
                    }
                  >
                    <Users className={styles.commandIcon} /> {t("commandPalette.pages.clients")}
                    <CommandShortcut>G C</CommandShortcut>
                  </CommandItem>
                  <CommandItem
                    onSelect={() =>
                      executeCommandAndClose(() => navigate("/policies"))
                    }
                  >
                    <FileText className={styles.commandIcon} /> {t("commandPalette.pages.policies")}
                    <CommandShortcut>G P</CommandShortcut>
                  </CommandItem>
                  <CommandItem
                    onSelect={() =>
                      executeCommandAndClose(() => navigate("/claims"))
                    }
                  >
                    <ShieldAlert className={styles.commandIcon} /> {t("commandPalette.pages.claims")}
                    <CommandShortcut>G L</CommandShortcut>
                  </CommandItem>
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup heading={t("commandPalette.quickActions")}>
                  <CommandItem
                    onSelect={() =>
                      executeCommandAndClose(() => navigate("/clients?new=true"))
                    }
                  >
                    <PlusCircle className={styles.commandIcon} /> {t("commandPalette.newClient")}
                  </CommandItem>
                  <CommandItem
                    onSelect={() =>
                      executeCommandAndClose(() => navigate("/policies?new=true"))
                    }
                  >
                    <PlusCircle className={styles.commandIcon} /> {t("commandPalette.newPolicy")}
                  </CommandItem>
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup heading={t("commandPalette.preferences")}>
                  <CommandItem
                    onSelect={() => executeCommandAndClose(toggleTheme)}
                  >
                    {theme === "dark" ? (
                      <Sun className={styles.commandIcon} />
                    ) : (
                      <Moon className={styles.commandIcon} />
                    )}
                    {t("commandPalette.toggleTheme", { theme })}
                  </CommandItem>
                  <CommandItem
                    onSelect={() => executeCommandAndClose(handleSignOut)}
                  >
                    <LogOut className={styles.commandIcon} /> {t("commandPalette.signOut")}
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
