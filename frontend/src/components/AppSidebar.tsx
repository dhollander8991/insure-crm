import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FileText,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import clsx from "clsx";

import styles from "./layout.module.css";

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

const navigationItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Clients", url: "/clients", icon: Users },
  { title: "Policies", url: "/policies", icon: FileText },
  { title: "Claims", url: "/claims", icon: ShieldAlert },
];

export function AppSidebar() {
  const { state, isMobile } = useSidebar();
  const isSidebarCollapsed = state === "collapsed" && !isMobile;
  const location = useLocation();

  const checkIsActiveRoute = (path: string) =>
    path === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(path);

  return (
    <Sidebar collapsible="icon">
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
            <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((navItem) => {
                const isNavItemActive = checkIsActiveRoute(navItem.url);
                return (
                  <SidebarMenuItem key={navItem.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isNavItemActive}
                      tooltip={navItem.title}
                      className={styles.menuButton}
                    >
                      <Link to={navItem.url} className={styles.navLink}>
                        <navItem.icon
                          className={clsx(
                            styles.navIcon,
                            isNavItemActive && styles.navIconActive,
                          )}
                        />
                        {!isSidebarCollapsed && <span>{navItem.title}</span>}
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
