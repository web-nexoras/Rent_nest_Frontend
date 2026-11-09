import {
  Bell,
  Building2,
  ClipboardList,
  CreditCard,
  Home,
  LayoutDashboard,
  Megaphone,
  Users,
  Wrench,
  BarChart3,
} from "lucide-react";

export const ADMIN_NAV = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/tenants", label: "Tenants", icon: Users },
  { to: "/admin/units", label: "Units", icon: Building2 },
  { to: "/admin/payments", label: "Payments", icon: CreditCard },
  { to: "/admin/reports", label: "Revenue & Overdue", icon: BarChart3 },
  { to: "/notices", label: "Notices", icon: Megaphone },
  { to: "/admin/maintenance", label: "Maintenance", icon: Wrench },
];

export const TENANT_NAV = [
  { to: "/tenant/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/tenant/unit", label: "My Unit", icon: Home },
  { to: "/tenant/payments", label: "Payments", icon: CreditCard },
  { to: "/notices", label: "Notices", icon: Bell },
  { to: "/tenant/maintenance", label: "Maintenance", icon: ClipboardList },
];
