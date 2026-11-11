import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { HomeRedirect, ProtectedRoute, PublicOnlyRoute } from "@/routes/ProtectedRoute.jsx";
import RoleRoute from "@/routes/RoleRoute.jsx";
import ApprovalGate from "@/routes/ApprovalGate.jsx";
import { AuthLayout } from "@/components/layout/AuthLayout.jsx";
import { DashboardLayout } from "@/components/layout/DashboardLayout.jsx";

// Auth Pages
import SigninPage from "@/features/auth/pages/SigninPage.jsx";
import SignupPage from "@/features/auth/pages/SignupPage.jsx";
import VerifyOtpPage from "@/features/auth/pages/VerifyOtpPage.jsx";
import ForgotPasswordPage from "@/features/auth/pages/ForgotPasswordPage.jsx";
import ResetPasswordPage from "@/features/auth/pages/ResetPasswordPage.jsx";

// Admin Pages
import AdminDashboardPage from "@/features/admin/pages/AdminDashboardPage.jsx";
import AdminUnitsPage from "@/features/units/pages/AdminUnitsPage.jsx";
import AdminTenantsPage from "@/features/admin/pages/AdminTenantsPage.jsx";
import AdminPaymentsPage from "@/features/payments/pages/AdminPaymentsPage.jsx";
import AdminMaintenancePage from "@/features/maintenance/pages/AdminMaintenancePage.jsx";
import AdminReportsPage from "@/features/admin/pages/AdminReportsPage.jsx";

// Tenant Pages
import TenantDashboardPage from "@/features/tenants/pages/TenantDashboardPage.jsx";
import TenantUnitPage from "@/features/units/pages/TenantUnitPage.jsx";
import TenantPaymentsPage from "@/features/payments/pages/TenantPaymentsPage.jsx";
import TenantMaintenancePage from "@/features/maintenance/pages/TenantMaintenancePage.jsx";
import TenantAgreementPage from "@/features/tenants/pages/TenantAgreementPage.jsx";

// Shared Pages
import NoticesPage from "@/features/notices/pages/NoticesPage.jsx";
import NoticeDetailPage from "@/features/notices/pages/NoticeDetailPage.jsx";
import ProfilePage from "@/features/tenants/pages/ProfilePage.jsx";
import NotFoundPage from "@/app/NotFoundPage.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route element={<PublicOnlyRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/signin" element={<SigninPage />} />
          <Route path="/login" element={<Navigate to="/signin" replace />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/verify-otp" element={<VerifyOtpPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Route>
      </Route>

      {/* Admin Protected Workspace */}
      <Route element={<ProtectedRoute />}>
        <Route element={<RoleRoute role="admin" />}>
          <Route element={<DashboardLayout />}>
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/units" element={<AdminUnitsPage />} />
            <Route path="/admin/tenants" element={<AdminTenantsPage />} />
            <Route path="/admin/payments" element={<AdminPaymentsPage />} />
            <Route path="/admin/maintenance" element={<AdminMaintenancePage />} />
            <Route path="/admin/notices" element={<NoticesPage />} />
            <Route path="/admin/reports" element={<AdminReportsPage />} />
            <Route path="/admin/profile" element={<ProfilePage />} />
          </Route>
        </Route>
      </Route>

      {/* Tenant Protected Workspace */}
      <Route element={<ProtectedRoute />}>
        <Route element={<RoleRoute role="tenant" />}>
          <Route element={<ApprovalGate />}>
            <Route element={<DashboardLayout />}>
              <Route path="/tenant" element={<Navigate to="/tenant/dashboard" replace />} />
              <Route path="/tenant/dashboard" element={<TenantDashboardPage />} />
              <Route path="/tenant/unit" element={<TenantUnitPage />} />
              <Route path="/tenant/payments" element={<TenantPaymentsPage />} />
              <Route path="/tenant/maintenance" element={<TenantMaintenancePage />} />
              <Route path="/tenant/agreement" element={<TenantAgreementPage />} />
              <Route path="/tenant/notices" element={<NoticesPage />} />
              <Route path="/tenant/profile" element={<ProfilePage />} />
            </Route>
          </Route>
        </Route>
      </Route>

      {/* Shared Authenticated Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<ApprovalGate />}>
          <Route element={<DashboardLayout />}>
            <Route path="/notices" element={<NoticesPage />} />
            <Route path="/notices/:id" element={<NoticeDetailPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Route>
      </Route>

      {/* Default & Fallback Routes */}
      <Route path="/" element={<HomeRedirect />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
