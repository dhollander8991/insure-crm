import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";

import { tokenStorage } from "@/lib/api";
import { AppLayout } from "@/components/layout/AppLayout";
import { ErrorPage } from "@/routes/ErrorPage";
import { LoginPage } from "@/routes/Login";
import { SignupPage } from "@/routes/Signup";
import { ForgotPasswordPage } from "@/routes/ForgotPassword";
import { ResetPasswordPage } from "@/routes/ResetPassword";
import { Dashboard } from "@/routes/Dashboard";
import { ClientsPage } from "@/routes/Clients";
import { ClientDetailPage } from "@/routes/ClientDetail";
import { PoliciesPage } from "@/routes/Policies";
import { PolicyDetailPage } from "@/routes/PolicyDetail";
import { ClaimsPage } from "@/routes/Claims";

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
    errorElement: <ErrorPage />,
    children: [
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
            errorElement: <ErrorPage />,
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
    ],
  },
]);
