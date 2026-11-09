import { Link, useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  CreditCard,
  LogOut,
  Megaphone,
  Menu,
  UserCheck,
  UserCircle,
  Wrench,
} from "lucide-react";
import Dropdown, { DropdownItem } from "../ui/Dropdown.jsx";
import { Avatar } from "../ui/Layout.jsx";
import Badge from "../ui/Badge.jsx";
import { ROUTE_META } from "./navigation.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { adminService, tenantService } from "../../services/dashboardService.js";
import { formatMoney, formatMonth } from "../../lib/utils.js";

function NotificationMenu() {
  const { isAdmin, isApproved } = useAuth();
  const navigate = useNavigate();

  const adminStats = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: adminService.getStats,
    enabled: isAdmin,
  });

  const tenantData = useQuery({
    queryKey: ["tenant", "dashboard"],
    queryFn: tenantService.getDashboard,
    enabled: !isAdmin && isApproved,
  });

  const items = [];

  if (isAdmin && adminStats.data?.stats) {
    const s = adminStats.data.stats;
    if (s.pendingApprovals > 0) {
      items.push({
        id: "approvals",
        icon: UserCheck,
        tone: "bg-amber-500/10 text-amber-600",
        title: `${s.pendingApprovals} tenant${s.pendingApprovals === 1 ? "" : "s"} awaiting approval`,
        sub: "Review and assign a vacant unit",
        to: "/admin/tenants?status=pending",
      });
    }
    if (s.overdueTenantsCount > 0) {
      items.push({
        id: "overdue",
        icon: AlertTriangle,
        tone: "bg-rose-500/10 text-rose-600",
        title: `${s.overdueTenantsCount} overdue rent account${s.overdueTenantsCount === 1 ? "" : "s"}`,
        sub: "No payment submitted this month",
        to: "/admin/reports",
      });
    }
    if (s.pendingMaintenanceCount > 0) {
      items.push({
        id: "maint",
        icon: Wrench,
        tone: "bg-brand-500/10 text-brand-600",
        title: `${s.pendingMaintenanceCount} open maintenance ticket${s.pendingMaintenanceCount === 1 ? "" : "s"}`,
        sub: "Inspect and update resolution status",
        to: "/admin/maintenance?status=pending",
      });
    }
  } else if (!isAdmin && tenantData.data) {
    const d = tenantData.data;
    if (d.dueStatus?.status === "unpaid") {
      items.push({
        id: "rent-due",
        icon: CreditCard,
        tone: "bg-rose-500/10 text-rose-600",
        title: `Rent due for ${formatMonth(d.currentMonth)}`,
        sub: `${formatMoney(d.dueStatus.amountDue)} outstanding`,
        to: "/tenant/payments?pay=1",
      });
    } else if (d.dueStatus?.status === "pending_verification") {
      items.push({
        id: "rent-pending",
        icon: Clock,
        tone: "bg-amber-500/10 text-amber-600",
        title: "Payment awaiting verification",
        sub: `Submitted for ${formatMonth(d.currentMonth)}`,
        to: "/tenant/payments",
      });
    }
    if (d.pendingMaintenanceCount > 0) {
      items.push({
        id: "my-maint",
        icon: Wrench,
        tone: "bg-brand-500/10 text-brand-600",
        title: `${d.pendingMaintenanceCount} active maintenance request${d.pendingMaintenanceCount === 1 ? "" : "s"}`,
        sub: "Track progress in Maintenance",
        to: "/tenant/maintenance",
      });
    }
    if (d.recentNotices?.length > 0) {
      items.push({
        id: "notice",
        icon: Megaphone,
        tone: "bg-emerald-500/10 text-emerald-600",
        title: d.recentNotices[0].title,
        sub: "Latest community announcement",
        to: `/notices/${d.recentNotices[0]._id}`,
      });
    }
  }

  const count = items.length;

  return (
    <Dropdown
      className="w-80 p-2"
      trigger={({ open }) => (
        <button
          className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-navy-200/80 bg-white text-navy-600 shadow-sm transition hover:border-navy-300 hover:bg-navy-50 hover:text-navy-900"
          aria-label="Notifications"
          aria-expanded={open}
        >
          <Bell className="h-4 w-4" />
          {count > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white ring-2 ring-white">
              {count}
            </span>
          )}
        </button>
      )}
    >
      <div className="flex items-center justify-between border-b border-navy-100 px-2.5 pb-2 pt-1">
        <span className="font-display text-xs font-bold text-navy-900">Activity Center</span>
        <span className="rounded-full bg-navy-100 px-2 py-0.5 text-[10px] font-semibold text-navy-600">
          {count} active
        </span>
      </div>
      {count === 0 ? (
        <div className="flex flex-col items-center py-7 text-center">
          <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <p className="text-xs font-semibold text-navy-800">All caught up</p>
          <p className="mt-0.5 text-[11px] text-navy-400">No pending alerts right now.</p>
        </div>
      ) : (
        <div className="mt-1 space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => navigate(item.to)}
                className="flex w-full items-start gap-3 rounded-xl p-2.5 text-left transition hover:bg-navy-50"
              >
                <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${item.tone}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-navy-900">{item.title}</p>
                  <p className="mt-0.5 truncate text-[11px] text-navy-500">{item.sub}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </Dropdown>
  );
}

export default function Topbar({ onMenu }) {
  const { user, isAdmin, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const toast = useToast();

  const meta =
    ROUTE_META[pathname] ||
    (pathname.startsWith("/notices/")
      ? { group: "Community", title: "Notice Details" }
      : { group: isAdmin ? "Admin" : "Tenant", title: "Workspace" });

  const handleLogout = async () => {
    try {
      await logout();
      toast.info("You have been signed out");
    } finally {
      navigate("/login", { replace: true });
    }
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-navy-200/70 bg-white/80 px-4 backdrop-blur-xl sm:px-8">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenu}
          className="rounded-xl border border-navy-200 bg-white p-2 text-navy-700 shadow-sm hover:bg-navy-50 lg:hidden"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs">
          <Link
            to={isAdmin ? "/admin/dashboard" : "/tenant/dashboard"}
            className="hidden font-medium text-navy-400 transition hover:text-navy-700 sm:inline"
          >
            {meta.group}
          </Link>
          <ChevronRight className="hidden h-3.5 w-3.5 text-navy-300 sm:inline" />
          <span className="font-display text-sm font-bold text-navy-900">{meta.title}</span>
        </nav>
      </div>

      <div className="flex items-center gap-2.5">
        <NotificationMenu />

        <Dropdown
          trigger={({ open }) => (
            <button
              className="flex items-center gap-2.5 rounded-xl border border-navy-200/80 bg-white py-1.5 pl-2 pr-2.5 shadow-sm transition hover:border-navy-300 hover:bg-navy-50/60"
              aria-haspopup="menu"
              aria-expanded={open}
            >
              <Avatar name={user?.name} src={user?.profileImage} size="sm" />
              <div className="hidden text-left sm:block">
                <p className="max-w-[9rem] truncate text-xs font-semibold leading-tight text-navy-900">
                  {user?.name}
                </p>
                <p className="text-[11px] capitalize text-navy-400">{user?.role}</p>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-navy-400" />
            </button>
          )}
        >
          <div className="px-3 py-2">
            <p className="truncate text-xs font-semibold text-navy-900">{user?.name}</p>
            <p className="truncate text-[11px] text-navy-400">{user?.email}</p>
            <div className="mt-2">
              <Badge status={user?.approvalStatus}>
                {user?.role === "admin" ? "Administrator" : user?.approvalStatus}
              </Badge>
            </div>
          </div>
          <div className="my-1 border-t border-navy-100" />
          <DropdownItem icon={UserCircle} onClick={() => navigate("/profile")}>
            Profile settings
          </DropdownItem>
          <DropdownItem icon={LogOut} danger onClick={handleLogout}>
            Sign out
          </DropdownItem>
        </Dropdown>
      </div>
    </header>
  );
}
