import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Topbar } from "@/components/topbar";
import { AuroraBackground } from "@/components/aurora-background";
import { CommandPalette } from "@/components/command-palette";
import { ChatWidget } from "@/components/chat-widget";
import { RouteProgress } from "@/components/route-progress";

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
