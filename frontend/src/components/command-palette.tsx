import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
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
  Search,
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { tokenStorage, emailStorage } from "@/lib/api";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { theme, toggle: toggleTheme } = useTheme();

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
    setTimeout(fn, 0);
  };

  const signOut = () => {
    tokenStorage.clear();
    emailStorage.clear();
    navigate({ to: "/login" });
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search or jump to…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigate">
          <CommandItem onSelect={() => run(() => navigate({ to: "/" }))}>
            <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
            <CommandShortcut>G D</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => run(() => navigate({ to: "/clients" }))}>
            <Users className="mr-2 h-4 w-4" /> Clients
            <CommandShortcut>G C</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => run(() => navigate({ to: "/policies" }))}>
            <FileText className="mr-2 h-4 w-4" /> Policies
            <CommandShortcut>G P</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => run(() => navigate({ to: "/claims" }))}>
            <ShieldAlert className="mr-2 h-4 w-4" /> Claims
            <CommandShortcut>G L</CommandShortcut>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Quick actions">
          <CommandItem onSelect={() => run(() => navigate({ to: "/clients" }))}>
            <PlusCircle className="mr-2 h-4 w-4" /> New client
          </CommandItem>
          <CommandItem onSelect={() => run(() => navigate({ to: "/policies" }))}>
            <PlusCircle className="mr-2 h-4 w-4" /> New policy
          </CommandItem>
          <CommandItem onSelect={() => run(() => navigate({ to: "/claims" }))}>
            <PlusCircle className="mr-2 h-4 w-4" /> New claim
          </CommandItem>
          <CommandItem onSelect={() => run(() => navigate({ to: "/" }))}>
            <Search className="mr-2 h-4 w-4" /> Global search
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Preferences">
          <CommandItem onSelect={() => run(toggleTheme)}>
            {theme === "dark" ? (
              <Sun className="mr-2 h-4 w-4" />
            ) : (
              <Moon className="mr-2 h-4 w-4" />
            )}
            Toggle theme
          </CommandItem>
          <CommandItem onSelect={() => run(signOut)}>
            <LogOut className="mr-2 h-4 w-4" /> Sign out
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
