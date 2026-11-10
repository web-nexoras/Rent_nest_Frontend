import {
  BarChart3,
  Bell,
  Building2,
  CreditCard,
  FileCheck2,
  Home,
  LayoutDashboard,
  UserCircle,
  Users,
  Wrench,
} from "lucide-react";

// Clean project-specific navigation items for Admin and Tenant sidebars
export const adminNavigation = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Units", href: "/admin/units", icon: Building2 },
  { name: "Tenants", href: "/admin/tenants", icon: Users },
  { name: "Payments", href: "/admin/payments", icon: CreditCard },
  { name: "Maintenance", href: "/admin/maintenance", icon: Wrench },
  { name: "Notices", href: "/admin/notices", icon: Bell },
  { name: "Reports", href: "/admin/reports", icon: BarChart3 },
  { name: "Profile", href: "/admin/profile", icon: UserCircle },
];

export const tenantNavigation = [
  { name: "Dashboard", href: "/tenant/dashboard", icon: LayoutDashboard },
  { name: "My Unit", href: "/tenant/unit", icon: Home },
  { name: "Payments", href: "/tenant/payments", icon: CreditCard },
  { name: "Maintenance", href: "/tenant/maintenance", icon: Wrench },
  { name: "Agreement", href: "/tenant/agreement", icon: FileCheck2 },
  { name: "Notices", href: "/tenant/notices", icon: Bell },
  { name: "Profile", href: "/tenant/profile", icon: UserCircle },
];
