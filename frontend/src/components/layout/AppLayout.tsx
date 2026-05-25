import { Outlet } from "react-router-dom";

import styles from "../layout.module.css";
import { useLanguageDirection } from "@/hooks/useLanguageDirection";

import { SidebarProvider } from "@/components/ui/Sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Topbar } from "@/components/Topbar";
import { AuroraBackground } from "@/components/AuroraBackground";
import { CommandPalette } from "@/components/CommandPalette";
import { ChatWidget } from "@/components/ChatWidget";
import { RouteProgress } from "@/components/RouteProgress";

export function AppLayout() {
  const { direction } = useLanguageDirection();
  return (
    <SidebarProvider className="h-svh overflow-hidden">
      <AuroraBackground />
      <CommandPalette />
      <RouteProgress />
      <div dir={direction} className={styles.container}>
        <AppSidebar />
        <div className={styles.sidebar}>
          <Topbar />
          <main className={styles.main}>
            <Outlet />
          </main>
        </div>
        <ChatWidget />
      </div>
    </SidebarProvider>
  );
}
