import { lazy } from "react";
import { Route, Routes } from "react-router-dom";
import AuthLayout from "./components/layout/AuthLayout.jsx";
import DashboardLayout from "./components/layout/DashboardLayout.jsx";
import { HomeRedirect, ProtectedRoute, PublicOnlyRoute } from "./routes/guards.jsx";
import ApprovalGate from "./routes/ApprovalGate.jsx";

// Every page is code-split and loaded on demand (Suspense lives in the layouts).
const LoginPage = lazy(() => import("./features/auth/pages/LoginPage.jsx"));
const SignupPage = lazy(() => import("./features/auth/pages/SignupPage.jsx"));
const VerifyOtpPage = lazy(() => import("./features/auth/pages/VerifyOtpPage.jsx"));
const ForgotPasswordPage = lazy(() => import("./features/auth/pages/ForgotPasswordPage.jsx"));
const ResetPasswordPage = lazy(() => import("./features/auth/pages/ResetPasswordPage.jsx"));

const ProfilePage = lazy(() => import("./features/shared/pages/ProfilePage.jsx"));
const NoticesPage = lazy(() => import("./features/shared/pages/NoticesPage.jsx"));
const NoticeDetailPage = lazy(() => import("./features/shared/pages/NoticeDetailPage.jsx"));
const NotFoundPage = lazy(() => import("./features/shared/pages/NotFoundPage.jsx"));

const AdminDashboardPage = lazy(() => import("./features/admin/pages/AdminDashboardPage.jsx"));
const AdminTenantsPage = lazy(() => import("./features/admin/pages/AdminTenantsPage.jsx"));
const AdminUnitsPage = lazy(() => import("./features/admin/pages/AdminUnitsPage.jsx"));
const AdminPaymentsPage = lazy(() => import("./features/admin/pages/AdminPaymentsPage.jsx"));
const AdminReportsPage = lazy(() => import("./features/admin/pages/AdminReportsPage.jsx"));
const AdminMaintenancePage = lazy(() => import("./features/admin/pages/AdminMaintenancePage.jsx"));

const TenantDashboardPage = lazy(() => import("./features/tenant/pages/TenantDashboardPage.jsx"));
const TenantUnitPage = lazy(() => import("./features/tenant/pages/TenantUnitPage.jsx"));
const TenantPaymentsPage = lazy(() => import("./features/tenant/pages/TenantPaymentsPage.jsx"));
const TenantMaintenancePage = lazy(() => import("./features/tenant/pages/TenantMaintenancePage.jsx"));

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />

      {/* Public */}
      <Route element={<PublicOnlyRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/verify-otp" element={<VerifyOtpPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Route>
      </Route>
      {/* Reset link from email works whether or not a session exists */}
      <Route element={<AuthLayout />}>
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      </Route>

      {/* Authenticated */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/notices" element={<NoticesPage />} />
          <Route path="/notices/:id" element={<NoticeDetailPage />} />

          <Route element={<ProtectedRoute role="admin" />}>
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/tenants" element={<AdminTenantsPage />} />
            <Route path="/admin/units" element={<AdminUnitsPage />} />
            <Route path="/admin/payments" element={<AdminPaymentsPage />} />
            <Route path="/admin/reports" element={<AdminReportsPage />} />
            <Route path="/admin/maintenance" element={<AdminMaintenancePage />} />
          </Route>

          <Route element={<ProtectedRoute role="tenant" />}>
            <Route element={<ApprovalGate />}>
              <Route path="/tenant/dashboard" element={<TenantDashboardPage />} />
              <Route path="/tenant/unit" element={<TenantUnitPage />} />
              <Route path="/tenant/payments" element={<TenantPaymentsPage />} />
              <Route path="/tenant/maintenance" element={<TenantMaintenancePage />} />
            </Route>
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
