import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  useNavigate,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect } from "react";

import appCss from "../styles.css?url";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Topbar } from "@/components/topbar";
import { ThemeProvider } from "@/components/theme-provider";
import { RouteProgress } from "@/components/route-progress";
import { Toaster } from "@/components/ui/sonner";
import { AuroraBackground } from "@/components/aurora-background";
import { CommandPalette } from "@/components/command-palette";
import { ChatWidget } from "@/components/chat-widget";
import { useAuth } from "@/hooks/use-auth";


function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Aegis CRM — Insurance Management Suite" },
      { name: "description", content: "Professional CRM for insurance teams: clients, policies, claims, and analytics." },
      { name: "author", content: "Aegis" },
      { property: "og:title", content: "Aegis CRM — Insurance Management Suite" },
      { property: "og:description", content: "Professional CRM for insurance teams: clients, policies, claims, and analytics." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="h-svh overflow-hidden">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

const AUTH_ROUTES = ["/login", "/signup", "/forgot-password", "/reset-password"];

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AppFrame />
        <Toaster richColors closeButton position="top-right" />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

function AppFrame() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const isAuthRoute = AUTH_ROUTES.some((p) => path.startsWith(p));
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user && !isAuthRoute) {
      navigate({ to: "/login" });
    }
  }, [loading, user, isAuthRoute, navigate]);

  if (isAuthRoute) {
    return <Outlet />;
  }

  if (loading || !user) {
    return (
      <div className="flex h-svh items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <SidebarProvider className="h-svh overflow-hidden">
      <AuroraBackground />
      <CommandPalette />
      <RouteProgress />
      <div className="flex h-full w-full text-foreground">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <Topbar />
          <main className="min-h-0 min-w-0 flex-1 overflow-y-auto">
            <Outlet />
          </main>
        </div>
        <ChatWidget />
      </div>
    </SidebarProvider>
  );
}
