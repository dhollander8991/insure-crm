import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FileText,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";

import styles from "./AppSidebar.module.css";

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
      <SidebarHeader className="border-b border-sidebar-border group-data-[collapsible=icon]:p-0">
        <div className="flex items-center gap-2 px-2 py-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:py-2 group-data-[collapsible=icon]:gap-0">
          <div className={styles.logoIcon}>
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="flex flex-col leading-tight overflow-hidden group-data-[collapsible=icon]:hidden">
            <span className={styles.logoTitle}>Aegis CRM</span>
            <span className={styles.logoSubtitle}>Insurance Suite</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">
            Workspace
          </SidebarGroupLabel>
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
                      className="group/menu-button transition-all"
                    >
                      <Link
                        to={navItem.url}
                        className="flex items-center gap-2"
                      >
                        <navItem.icon
                          className={`${styles.navIcon} group-hover/menu-button:scale-110 ${
                            isNavItemActive ? styles.navIconActive : ""
                          }`}
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
