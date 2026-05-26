import { Bell, Search, LogOut, User as UserIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { ThemeToggle } from "./ThemeToggle";
import { LanguageToggle } from "./LanguageToggle";
import styles from "./layout.module.css";

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
  const { t } = useTranslation();
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
        <Search className={styles.searchBtnIcon} />
        <span className={styles.searchText}>{t("topbar.searchPlaceholder")}</span>
        <kbd className={styles.searchKbd}>⌘K</kbd>
      </button>
      <div className={styles.actions}>
        <LanguageToggle />
        <ThemeToggle />
        <Button variant="ghost" size="icon" className={styles.bellButton} aria-label={t("topbar.notifications")}>
          <Bell className={styles.bellIcon} />
          <span className={styles.bellDot} />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={styles.avatarTrigger}>
              <Avatar className={styles.avatar}>
                <AvatarFallback className={styles.avatarFallback}>
                  {userInitials}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className={styles.dropdownContent}>
            <DropdownMenuLabel>
              <div className={styles.menuName}>
                <span className={styles.menuDisplayName}>{displayName}</span>
                <span className={styles.menuEmail}>{user}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>
              <UserIcon className={styles.menuIcon} /> {t("topbar.profile")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className={styles.menuIcon} /> {t("topbar.signOut")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
