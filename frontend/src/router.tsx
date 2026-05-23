import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { tokenStorage } from "@/lib/api";
import { AppLayout } from "@/components/layout/app-layout";
import { LoginPage } from "@/routes/login";
import { SignupPage } from "@/routes/signup";
import { ForgotPasswordPage } from "@/routes/forgot-password";
import { ResetPasswordPage } from "@/routes/reset-password";
import { Dashboard } from "@/routes/index";
import { ClientsPage } from "@/routes/clients";
import { ClientDetailPage } from "@/routes/client-detail";
import { PoliciesPage } from "@/routes/policies";
import { PolicyDetailPage } from "@/routes/policy-detail";
import { ClaimsPage } from "@/routes/claims";

function ProtectedRoute() {
  const token = tokenStorage.get();
  if (!token) return <Navigate to="/login" replace />;
  return <Outlet />;
}

function PublicRoute() {
  const token = tokenStorage.get();
  if (token) return <Navigate to="/" replace />;
  return <Outlet />;
}

export const router = createBrowserRouter([
  {
    element: <PublicRoute />,
    children: [
      { path: "/login", element: <LoginPage /> },
      { path: "/signup", element: <SignupPage /> },
      { path: "/forgot-password", element: <ForgotPasswordPage /> },
      { path: "/reset-password", element: <ResetPasswordPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/", element: <Dashboard /> },
          { path: "/clients", element: <ClientsPage /> },
          { path: "/clients/:id", element: <ClientDetailPage /> },
          { path: "/policies", element: <PoliciesPage /> },
          { path: "/policies/:id", element: <PolicyDetailPage /> },
          { path: "/claims", element: <ClaimsPage /> },
        ],
      },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);
