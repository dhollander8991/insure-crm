import { Bell, Search, LogOut, User as UserIcon } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "./theme-toggle";
import { useAuth } from "@/hooks/use-auth";
import { tokenStorage, emailStorage } from "@/lib/api";

export function Topbar() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const displayName = user?.split("@")[0] ?? "User";
  const initials = displayName.slice(0, 2).toUpperCase();

  const onSignOut = () => {
    tokenStorage.clear();
    emailStorage.clear();
    navigate({ to: "/login" });
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-background/60 px-2 backdrop-blur-md sm:gap-3 sm:px-4">
      <SidebarTrigger />
      <button
        type="button"
        onClick={() => {
          const ev = new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true });
          window.dispatchEvent(ev);
        }}
        className="relative hidden flex-1 max-w-md items-center gap-2 rounded-md border border-transparent bg-muted/40 px-3 py-2 text-left text-sm text-muted-foreground transition hover:bg-muted/60 md:flex"
      >
        <Search className="h-4 w-4" />
        <span className="flex-1 truncate">Search clients, policies, claims…</span>
        <kbd className="pointer-events-none rounded border bg-background px-1.5 py-0.5 font-mono text-[10px] font-medium">⌘K</kbd>
      </button>
      <div className="ml-auto flex items-center gap-1">
        <ThemeToggle />
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="ml-1 rounded-full outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">{initials}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-sm font-medium leading-none">{displayName}</span>
                <span className="mt-1 text-xs font-normal text-muted-foreground">{user}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>
              <UserIcon className="mr-2 h-4 w-4" /> Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onSignOut}>
              <LogOut className="mr-2 h-4 w-4" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
