import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FileText,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import clsx from "clsx";
import { useTranslation } from "react-i18next";

import styles from "./layout.module.css";

import { useLanguageDirection } from "@/hooks/useLanguageDirection";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/Sidebar";

export function AppSidebar() {
  const { t } = useTranslation();
  const { isRTL } = useLanguageDirection();
  const { state, isMobile } = useSidebar();
  const isSidebarCollapsed = state === "collapsed" && !isMobile;
  const location = useLocation();

  const navigationItems = [
    { titleKey: "navigation.dashboard", url: "/", icon: LayoutDashboard },
    { titleKey: "navigation.clients", url: "/clients", icon: Users },
    { titleKey: "navigation.policies", url: "/policies", icon: FileText },
    { titleKey: "navigation.claims", url: "/claims", icon: ShieldAlert },
  ];

  const checkIsActiveRoute = (path: string) =>
    path === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(path);

  return (
    <Sidebar collapsible="icon" side={isRTL ? "right" : "left"}>
      <SidebarHeader
        className={clsx(
          styles.sidebarHeader,
          isSidebarCollapsed && styles.sidebarHeaderCollapsed,
        )}
      >
        <div className={styles.logoWrapper}>
          <div className={styles.logoIcon}>
            <ShieldCheck className={styles.shieldIcon} />
          </div>
          {!isSidebarCollapsed && (
            <div className={styles.logoTextGroup}>
              <span className={styles.logoTitle}>Aegis CRM</span>
              <span className={styles.logoSubtitle}>Insurance Suite</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          {!isSidebarCollapsed && (
            <SidebarGroupLabel>{t("navigation.workspace")}</SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((navItem) => {
                const isNavItemActive = checkIsActiveRoute(navItem.url);
                const label = t(navItem.titleKey);
                return (
                  <SidebarMenuItem key={navItem.titleKey}>
                    <SidebarMenuButton
                      asChild
                      isActive={isNavItemActive}
                      tooltip={label}
                      className={styles.menuButton}
                    >
                      <Link to={navItem.url} className={styles.navLink}>
                        <navItem.icon
                          className={clsx(
                            styles.navIcon,
                            isNavItemActive && styles.navIconActive,
                          )}
                        />
                        {!isSidebarCollapsed && <span>{label}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
