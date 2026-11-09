import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronsLeft, ChevronsRight, LogOut, Sparkles, X } from "lucide-react";
import Logo from "./Logo.jsx";
import { Avatar } from "../ui/Layout.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { cn } from "../../lib/utils.js";

export default function Sidebar({ groups, open, onClose, collapsed, onToggleCollapse }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      toast.info("You have been signed out");
    } finally {
      navigate("/login", { replace: true });
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-30 bg-navy-950/60 backdrop-blur-sm transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col border-r border-white/[0.07] bg-navy-950 text-white transition-all duration-300 lg:translate-x-0",
          collapsed ? "lg:w-20" : "lg:w-[17rem]",
          "w-[17rem]",
          open ? "translate-x-0" : "-translate-x-full",
        )}
        aria-label="Main navigation"
      >
        {/* Top brand bar */}
        <div
          className={cn(
            "flex h-16 items-center border-b border-white/[0.07] px-5",
            collapsed ? "lg:justify-center lg:px-0" : "justify-between",
          )}
        >
          <Logo light collapsed={collapsed} />
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-navy-400 hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
          {!collapsed && (
            <button
              onClick={onToggleCollapse}
              className="hidden rounded-lg p-1.5 text-navy-400 transition hover:bg-white/10 hover:text-white lg:inline-flex"
              aria-label="Collapse sidebar"
              title="Collapse sidebar"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>
          )}
        </div>

        {collapsed && (
          <div className="hidden justify-center border-b border-white/[0.06] py-2 lg:flex">
            <button
              onClick={onToggleCollapse}
              className="rounded-lg p-1.5 text-navy-400 transition hover:bg-white/10 hover:text-white"
              aria-label="Expand sidebar"
              title="Expand sidebar"
            >
              <ChevronsRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Navigation groups */}
        <nav className="scroll-thin flex-1 space-y-6 overflow-y-auto px-3 py-5">
          {groups.map((group) => (
            <div key={group.title}>
              {!collapsed && (
                <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-navy-500">
                  {group.title}
                </p>
              )}
              <div className="space-y-1">
                {group.items.map(({ to, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={onClose}
                    title={collapsed ? label : undefined}
                    className={({ isActive }) =>
                      cn(
                        "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium transition-colors",
                        collapsed && "lg:justify-center lg:px-0",
                        isActive
                          ? "text-white"
                          : "text-navy-400 hover:bg-white/[0.04] hover:text-navy-100",
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <motion.span
                            layoutId="rn-sidebar-active"
                            transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                            className="absolute inset-0 rounded-xl bg-gradient-to-r from-brand-600/90 to-brand-500/80 shadow-md shadow-brand-600/25 ring-1 ring-white/15"
                          />
                        )}
                        <Icon
                          className={cn(
                            "relative z-10 h-4 w-4 shrink-0 transition-transform duration-150 group-hover:scale-105",
                            isActive ? "text-white" : "text-navy-400 group-hover:text-brand-300",
                          )}
                        />
                        {!collapsed && <span className="relative z-10 truncate">{label}</span>}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Workspace card + User profile footer */}
        <div className="border-t border-white/[0.07] p-3">
          {!collapsed && (
            <div className="mb-3 rounded-xl border border-white/[0.07] bg-gradient-to-br from-white/[0.05] to-white/[0.01] p-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-white">
                <Sparkles className="h-3.5 w-3.5 text-brand-400" />
                <span>{user?.role === "admin" ? "Admin Console" : "Tenant Workspace"}</span>
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-navy-400">
                {user?.role === "admin"
                  ? "Real-time portfolio & billing control."
                  : "Manage rent, receipts & unit requests."}
              </p>
            </div>
          )}

          <div
            className={cn(
              "flex items-center gap-2.5 rounded-xl bg-white/[0.04] p-2 ring-1 ring-white/[0.06]",
              collapsed && "lg:flex-col lg:justify-center",
            )}
          >
            <Avatar name={user?.name} src={user?.profileImage} size="sm" />
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-white">{user?.name}</p>
                <p className="truncate text-[11px] text-navy-400">{user?.email}</p>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="rounded-lg p-1.5 text-navy-400 transition hover:bg-rose-500/15 hover:text-rose-300"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
