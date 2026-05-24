import { Bell, Search, LogOut, User as UserIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { ThemeToggle } from "./ThemeToggle";
import styles from "./Topbar.module.css";

import { SidebarTrigger } from "@/components/ui/Sidebar";
import { Button } from "@/components/ui/Button";
import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { useAuth } from "@/hooks/use-auth";
import { tokenStorage, emailStorage } from "@/lib/api";

export function Topbar() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const displayName = user?.split("@")[0] ?? "User";
  const userInitials = displayName.slice(0, 2).toUpperCase();

  const handleSignOut = () => {
    tokenStorage.clear();
    emailStorage.clear();
    navigate("/login");
  };

  const openCommandPalette = () => {
    const shortcutEvent = new KeyboardEvent("keydown", {
      key: "k",
      metaKey: true,
      bubbles: true,
    });
    window.dispatchEvent(shortcutEvent);
  };

  return (
    <header className={styles.header}>
      <SidebarTrigger />
      <button
        type="button"
        onClick={openCommandPalette}
        className={styles.searchButton}
      >
        <Search className="h-4 w-4" />
        <span className="flex-1 truncate">
          Search clients, policies, claims…
        </span>
        <kbd className={styles.searchKbd}>⌘K</kbd>
      </button>
      <div className={styles.actions}>
        <ThemeToggle />
        <Button variant="ghost" size="icon" className={styles.bellButton}>
          <Bell className="h-4 w-4" />
          <span className={styles.bellDot} />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={styles.avatarTrigger}>
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className={styles.menuName}>
                <span className={styles.menuDisplayName}>{displayName}</span>
                <span className={styles.menuEmail}>{user}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>
              <UserIcon className="mr-2 h-4 w-4" /> Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
