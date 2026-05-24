import { Outlet } from "react-router-dom";

import { SidebarProvider } from "@/components/ui/Sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Topbar } from "@/components/Topbar";
import { AuroraBackground } from "@/components/AuroraBackground";
import { CommandPalette } from "@/components/CommandPalette";
import { ChatWidget } from "@/components/ChatWidget";
import { RouteProgress } from "@/components/RouteProgress";

export function AppLayout() {
  return (
    <SidebarProvider className="h-svh overflow-hidden">
      <AuroraBackground />
      <CommandPalette />
      <RouteProgress />
      <div className="flex h-full w-full max-w-full overflow-x-hidden text-foreground">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <Topbar />
          <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
            <Outlet />
          </main>
        </div>
        <ChatWidget />
      </div>
    </SidebarProvider>
  );
}
