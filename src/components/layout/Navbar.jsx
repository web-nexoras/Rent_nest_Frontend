import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Bell,
  ChevronDown,
  FileCheck2,
  LogOut,
  Menu,
  Moon,
  Search,
  Sparkles,
  Sun,
  User,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth.jsx";
import { useTheme } from "@/hooks/useTheme.jsx";
import { adminNavigation, tenantNavigation } from "@/lib/constants.js";
import { getInitials } from "@/utils/helpers.js";
import { useNoticeBadge } from "@/hooks/useNoticeBadge.js";
import { getAdminDashboard } from "@/features/admin/api/adminApi.js";
import { getTenantDashboard } from "@/features/tenants/api/dashboardApi.js";
import { getUnitStatusMatrix } from "@/features/units/api/unitApi.js";

// Cute animated Sun/Moon + Stars theme toggle switch
export function CuteThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      className="group flex items-center gap-2.5 focus:outline-none"
    >
      <span className="hidden sm:inline text-xs font-semibold tracking-wide text-[#5C5549] dark:text-[#C8C2B8]">
        {isDark ? "Dark" : "Light"}
      </span>
      <div
        className={`relative flex h-8 w-16 items-center rounded-full p-1 transition-all duration-500 border ${
          isDark
            ? "bg-gradient-to-r from-[#141926] via-[#1D2436] to-[#0E1117] border-[#C59B27]/50 shadow-[0_0_15px_rgba(212,175,55,0.2)]"
            : "bg-gradient-to-r from-[#EFE9DC] via-[#FAF7F2] to-[#E8DFD1] border-[#D8CCB8] shadow-inner"
        }`}
      >
        {/* Background decorative clouds / twinkling stars */}
        <span
          className={`absolute right-2.5 flex items-center gap-0.5 transition-all duration-300 ${
            isDark ? "opacity-0 scale-50" : "opacity-80 scale-100"
          }`}
        >
          <span className="h-1.5 w-3 rounded-full bg-[#C59B27]/30" />
        </span>
        <span
          className={`absolute left-2 flex items-center gap-0.5 text-[#D4AF37] transition-all duration-300 ${
            isDark ? "opacity-100 scale-100" : "opacity-0 scale-50"
          }`}
        >
          <Sparkles className="h-3 w-3 animate-pulse" />
        </span>

        {/* Sliding cute orb */}
        <div
          className={`relative z-10 flex h-6 w-6 transform items-center justify-center rounded-full shadow-md transition-all duration-500 ease-out ${
            isDark
              ? "translate-x-8 bg-gradient-to-br from-[#D4AF37] to-[#9A7418] text-[#0B0D11] rotate-0"
              : "translate-x-0 bg-gradient-to-br from-[#FFFFFF] to-[#F7EFE0] text-[#C59B27] rotate-12"
          }`}
        >
          {isDark ? (
            <Moon className="h-3.5 w-3.5 fill-current" />
          ) : (
            <Sun className="h-3.5 w-3.5 fill-current" />
          )}
        </div>
      </div>
    </button>
  );
}

// Right-only Top Navbar: Search input on the left, Cute Toggle + Notification Icons + User Profile on the far right
export function Navbar({ onOpenSidebar }) {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const { hasUnseen, markSeen } = useNoticeBadge();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [hasRentDue, setHasRentDue] = useState(false);
  const searchRef = useRef(null);
  const profileRef = useRef(null);

  const navItems = isAdmin ? adminNavigation : tenantNavigation;
  const filteredRoutes = navItems.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  useEffect(() => {
    let active = true;
    const checkRentStatus = async () => {
      if (!user?._id) {
        if (active) setHasRentDue(false);
        return;
      }

      try {
        if (isAdmin) {
          const [dashboard, matrix] = await Promise.all([
            getAdminDashboard(),
            getUnitStatusMatrix().catch(() => null),
          ]);
          const dueInMatrix = (matrix?.units || []).some((unit) =>
            unit.occupancyStatus === "occupied" &&
            (unit.isOverdue || ["due", "due_alert", "overdue"].includes(unit.paymentStatus))
          );
          if (active) {
            setHasRentDue(Number(dashboard?.stats?.unpaidUnitsCount || 0) > 0 || dueInMatrix);
          }
        } else {
          const dashboard = await getTenantDashboard();
          const dueStatus = dashboard?.dueStatus;
          const isDue = Boolean(dashboard?.unit) && (
            dueStatus?.isOverdue || ["due", "overdue"].includes(dueStatus?.status)
          );
          if (active) setHasRentDue(isDue);
        }
      } catch {
        // Keep the last known status if a temporary refresh fails.
      }
    };

    checkRentStatus();
    const intervalId = window.setInterval(checkRentStatus, 120_000);
    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [isAdmin, user?._id]);

  useEffect(() => {
    const handleOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (filteredRoutes.length > 0) {
      navigate(filteredRoutes[0].href);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <header className="sticky top-0 z-20 bg-[#FAF7F2]/90 dark:bg-[#0B0D11]/90 backdrop-blur-md border-b border-[#EAE2D3] dark:border-[#1B202E] px-4 py-3.5 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        {/* Left: Mobile Menu Button + Pill Search Input */}
        <div className="flex min-w-0 flex-1 items-center gap-3 max-w-xl" ref={searchRef}>
          <button
            type="button"
            onClick={onOpenSidebar}
            aria-label="Open menu"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#E5DEC9] dark:border-[#242B3D] bg-white dark:bg-[#131722] text-[#141413] dark:text-[#F5F0E6] shadow-xs lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onFocus={() => setSearchOpen(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchOpen(true);
              }}
              placeholder="Search"
              className="h-11 w-full rounded-xl border border-[#E6DEC8] dark:border-[#242B3D] bg-white dark:bg-[#131722] pl-4 pr-11 text-sm text-[#141413] dark:text-[#F5F0E6] placeholder:text-[#968E82] dark:placeholder:text-[#7C8496] shadow-xs focus:border-[#C59B27] focus:outline-none focus:ring-2 focus:ring-[#C59B27]/20 transition-all"
            />
            <button
              type="submit"
              aria-label="Search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4A453E] dark:text-[#C59B27] hover:text-[#C59B27]"
            >
              <Search className="h-4 w-4" />
            </button>

            {/* Quick jump dropdown when typing in search */}
            {searchOpen && searchQuery.trim() && (
              <div className="absolute left-0 right-0 top-12 z-40 rounded-2xl border border-[#E5DEC9] dark:border-[#252C3D] bg-white dark:bg-[#131722] p-2 shadow-xl">
                <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#8C8479]">
                  Quick Navigation
                </p>
                {filteredRoutes.length > 0 ? (
                  filteredRoutes.map((route) => {
                    const Icon = route.icon;
                    return (
                      <button
                        key={route.href}
                        type="button"
                        onClick={() => {
                          navigate(route.href);
                          setSearchOpen(false);
                          setSearchQuery("");
                        }}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium text-[#141413] dark:text-[#F5F0E6] hover:bg-[#F6F2E9] dark:hover:bg-[#1C2230]"
                      >
                        <Icon className="h-4 w-4 text-[#C59B27]" />
                        <span>Go to {route.name}</span>
                      </button>
                    );
                  })
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      navigate(isAdmin ? "/admin/units" : "/tenant/payments");
                      setSearchOpen(false);
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium text-[#141413] dark:text-[#F5F0E6] hover:bg-[#F6F2E9] dark:hover:bg-[#1C2230]"
                  >
                    <Search className="h-4 w-4 text-[#C59B27]" />
                    <span>Search "{searchQuery}"</span>
                  </button>
                )}
              </div>
            )}
          </form>
        </div>

        {/* Far Right Corner: Cute Theme Toggle + Alert Icon + Notification Bell + User Profile */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          <CuteThemeToggle />

          {/* Overdue / Priority Alert Quick Button */}
          <button
            type="button"
            onClick={() => navigate(isAdmin ? "/admin/payments" : "/tenant/payments")}
            title={hasRentDue ? "Rent due: open payment status" : "No rent due"}
            className="relative hidden sm:inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#E6DEC8] dark:border-[#242B3D] bg-white dark:bg-[#131722] text-[#2C2925] dark:text-[#E5DFD3] hover:border-[#C59B27] transition-colors"
          >
            <AlertTriangle className="h-4 w-4" />
            {hasRentDue && (
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-[#131722]" />
            )}
          </button>

          {/* Notification Bell Icon (Left of User Profile) */}
          <button
            type="button"
            onClick={() => {
              markSeen();
              navigate(isAdmin ? "/admin/notices" : "/tenant/notices");
            }}
            title="Building Notices & Notifications"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#E6DEC8] dark:border-[#242B3D] bg-white dark:bg-[#131722] text-[#2C2925] dark:text-[#E5DFD3] hover:border-[#C59B27] transition-colors"
          >
            <Bell className="h-4 w-4" />
            {hasUnseen && (
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-[#131722]" />
            )}
          </button>

          {/* Far Right User Logo, Name & Profile Menu */}
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => setProfileOpen((prev) => !prev)}
              className="flex items-center gap-2.5 rounded-full border border-[#E6DEC8] dark:border-[#242B3D] bg-white dark:bg-[#131722] py-1 pl-1.5 pr-3 shadow-xs hover:border-[#C59B27] transition-all"
            >
              {user?.avatar?.url ? (
                <img
                  src={user.avatar.url}
                  alt={user.fullName}
                  className="h-8 w-8 rounded-full object-cover ring-2 ring-[#C59B27]/50"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#141413] to-[#332E26] dark:from-[#D4AF37] dark:to-[#9A7418] text-xs font-bold text-[#D4AF37] dark:text-[#0B0D11]">
                  {getInitials(user?.fullName || "RN")}
                </div>
              )}
              <div className="hidden text-left md:block">
                <p className="max-w-[130px] truncate text-xs font-semibold text-[#141413] dark:text-[#F5F0E6]">
                  {user?.fullName || (isAdmin ? "Luxury Manager" : "Resident")}
                </p>
                <p className="text-[10px] font-medium capitalize text-[#8C8479] dark:text-[#9A9488]">
                  {user?.role || "member"}
                </p>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-[#7A7267]" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-[#E5DEC9] dark:border-[#252C3D] bg-white dark:bg-[#131722] p-2 shadow-xl z-50">
                <div className="border-b border-[#EFE9DC] dark:border-[#1E2433] px-3 py-2.5">
                  <p className="truncate text-sm font-bold text-[#141413] dark:text-[#F5F0E6]">
                    {user?.fullName}
                  </p>
                  <p className="truncate text-xs text-[#7A7267] dark:text-[#9A9488]">
                    {user?.email || user?.phone}
                  </p>
                </div>
                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      navigate(isAdmin ? "/admin/profile" : "/tenant/profile");
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-[#2C2925] dark:text-[#E5DFD3] hover:bg-[#F6F2E9] dark:hover:bg-[#1C2230]"
                  >
                    <User className="h-4 w-4 text-[#C59B27]" />
                    <span>My Profile & Security</span>
                  </button>
                  {!isAdmin && (
                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen(false);
                        navigate("/tenant/agreement");
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-[#2C2925] dark:text-[#E5DFD3] hover:bg-[#F6F2E9] dark:hover:bg-[#1C2230]"
                    >
                      <FileCheck2 className="h-4 w-4 text-[#C59B27]" />
                      <span>Tenancy Agreement (PDF)</span>
                    </button>
                  )}
                </div>
                <div className="border-t border-[#EFE9DC] dark:border-[#1E2433] pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      logout();
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
