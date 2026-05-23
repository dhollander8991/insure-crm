import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, FileText, ShieldAlert, ShieldCheck } from "lucide-react";
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
} from "@/components/ui/sidebar";

const items = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Clients", url: "/clients", icon: Users },
  { title: "Policies", url: "/policies", icon: FileText },
  { title: "Claims", url: "/claims", icon: ShieldAlert },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const isActive = (path: string) => path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border group-data-[collapsible=icon]:p-0">
        <div className="flex items-center gap-2 px-2 py-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:py-2 group-data-[collapsible=icon]:gap-0">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-primary-foreground shadow-md"
            style={{ background: "var(--gradient-primary)" }}
          >
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="flex flex-col leading-tight overflow-hidden group-data-[collapsible=icon]:hidden">
            <span className="truncate text-sm font-semibold tracking-tight">Aegis CRM</span>
            <span className="truncate text-[11px] text-muted-foreground">Insurance Suite</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const active = isActive(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.title}
                      className="group/menu-button transition-all"
                    >
                      <Link to={item.url} className="flex items-center gap-2">
                        <item.icon
                          className={`h-4 w-4 transition-transform group-hover/menu-button:scale-110 ${
                            active ? "text-primary" : ""
                          }`}
                        />
                        {!collapsed && <span>{item.title}</span>}
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
