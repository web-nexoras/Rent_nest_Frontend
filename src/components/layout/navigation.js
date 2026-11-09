import {
  BarChart3,
  Bell,
  Building2,
  ClipboardList,
  CreditCard,
  Home,
  LayoutDashboard,
  Megaphone,
  UserCircle,
  Users,
  Wrench,
} from "lucide-react";

export const ADMIN_NAV_GROUPS = [
  {
    title: "Overview",
    items: [
      { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { to: "/admin/reports", label: "Revenue & Overdue", icon: BarChart3 },
    ],
  },
  {
    title: "Portfolio",
    items: [
      { to: "/admin/units", label: "Units", icon: Building2 },
      { to: "/admin/tenants", label: "Tenants", icon: Users },
      { to: "/admin/payments", label: "Payments", icon: CreditCard },
    ],
  },
  {
    title: "Operations",
    items: [
      { to: "/admin/maintenance", label: "Maintenance", icon: Wrench },
      { to: "/notices", label: "Notices", icon: Megaphone },
      { to: "/profile", label: "My Profile", icon: UserCircle },
    ],
  },
];

export const TENANT_NAV_GROUPS = [
  {
    title: "My Tenancy",
    items: [
      { to: "/tenant/dashboard", label: "Overview", icon: LayoutDashboard },
      { to: "/tenant/unit", label: "My Unit", icon: Home },
      { to: "/tenant/payments", label: "Rent & Receipts", icon: CreditCard },
    ],
  },
  {
    title: "Community & Support",
    items: [
      { to: "/tenant/maintenance", label: "Maintenance", icon: ClipboardList },
      { to: "/notices", label: "Notices", icon: Bell },
      { to: "/profile", label: "My Profile", icon: UserCircle },
    ],
  },
];

// Flat lists preserved for compatibility and quick lookup
export const ADMIN_NAV = ADMIN_NAV_GROUPS.flatMap((g) => g.items);
export const TENANT_NAV = TENANT_NAV_GROUPS.flatMap((g) => g.items);

export const ROUTE_META = {
  "/admin/dashboard": { group: "Admin", title: "Dashboard Overview" },
  "/admin/tenants": { group: "Portfolio", title: "Tenant Directory" },
  "/admin/units": { group: "Portfolio", title: "Units & Inventory" },
  "/admin/payments": { group: "Portfolio", title: "Payment Verification" },
  "/admin/reports": { group: "Analytics", title: "Revenue & Overdue" },
  "/admin/maintenance": { group: "Operations", title: "Maintenance Desk" },
  "/tenant/dashboard": { group: "Tenant Portal", title: "Dashboard Overview" },
  "/tenant/unit": { group: "My Tenancy", title: "Assigned Unit" },
  "/tenant/payments": { group: "My Tenancy", title: "Rent & Receipts" },
  "/tenant/maintenance": { group: "Support", title: "Maintenance Requests" },
  "/notices": { group: "Community", title: "Notice Board" },
  "/profile": { group: "Account", title: "Profile Settings" },
};
