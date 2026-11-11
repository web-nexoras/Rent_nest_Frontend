import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { LogOut, ShieldCheck, X } from "lucide-react";
import { Logo } from "@/components/layout/Logo.jsx";
import { adminNavigation, tenantNavigation } from "@/lib/constants.js";
import { useAuth } from "@/hooks/useAuth.jsx";
import { cn } from "@/utils/index.js";

// Full-height Left Sidebar matching the Luxury Warm Parchment & Obsidian reference
export function Sidebar({ isOpen, onClose }) {
  const { isAdmin, logout } = useAuth();
  const [vaultVisible, setVaultVisible] = useState(true);
  const navItems = isAdmin ? adminNavigation : tenantNavigation;
  const homePath = isAdmin ? "/admin/dashboard" : "/tenant/dashboard";

  const renderSidebarContent = () => (
    <div className="flex h-full flex-col justify-between overflow-y-auto bg-[#F6F2E9] dark:bg-[#0E1117] border-r border-[#E4DAC8] dark:border-[#1E2433] px-5 py-6 select-none transition-colors duration-300">
      {/* Top Royal Crest Logo */}
      <div>
        <div className="relative flex flex-col items-center justify-center pb-6 pt-1 border-b border-[#E6DEC8]/80 dark:border-[#1E2433]">
          <Logo stacked to={homePath} />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="absolute right-0 top-0 rounded-xl p-1.5 text-[#6E675F] hover:bg-[#EAE3D5] dark:text-slate-400 dark:hover:bg-slate-800 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Clean Project Navigation */}
        <nav className="mt-6 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    "group flex items-center gap-3.5 rounded-full px-5 py-3 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-[#111111] text-white shadow-md dark:bg-gradient-to-r dark:from-[#D4AF37] dark:to-[#C59B27] dark:text-[#0B0D11] dark:font-semibold"
                      : "text-[#3D3934] hover:bg-[#ECE5D7] hover:text-[#111111] dark:text-[#B8B2A6] dark:hover:bg-[#161B26] dark:hover:text-white"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={cn(
                        "h-[18px] w-[18px] shrink-0 transition-transform duration-200 group-hover:scale-110",
                        isActive
                          ? "text-[#D4AF37] dark:text-[#0B0D11]"
                          : "text-[#7A7267] group-hover:text-[#111111] dark:text-[#9A9488] dark:group-hover:text-[#D4AF37]"
                      )}
                    />
                    <span className="truncate">{item.name}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Tower Vault Security Status Card + Sign Out */}
      <div className="space-y-3 pt-4">
        {vaultVisible && (
          <div className="relative rounded-2xl border border-[#E5DEC9] dark:border-[#252C3D] bg-[#FCFBF7] dark:bg-[#131722] p-4 text-center shadow-sm">
            <button
              type="button"
              onClick={() => setVaultVisible(false)}
              aria-label="Dismiss badge"
              className="absolute right-2.5 top-2.5 rounded-lg p-1 text-[#8C8479] hover:bg-[#F2ECE1] dark:hover:bg-slate-800"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#141413] dark:bg-[#1C2230] border-2 border-[#C59B27] shadow-sm">
              <ShieldCheck className="h-5 w-5 text-[#D4AF37]" />
            </div>
            <p className="font-heading text-sm font-bold text-[#141413] dark:text-[#F5F0E6]">
              Tower Vault
            </p>
            <p className="mt-0.5 text-[11px] text-[#7A7267] dark:text-[#9A9488]">
              Security status badge · 48 Units
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-[#E2D9C5] dark:border-[#242B3D] bg-white/70 dark:bg-[#131722] px-4 py-2.5 text-xs font-semibold text-[#5C554B] dark:text-[#C8C2B8] hover:border-rose-300 hover:bg-rose-50/70 hover:text-rose-700 dark:hover:border-rose-500/40 dark:hover:bg-rose-950/30 dark:hover:text-rose-300 transition-colors"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Sign out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Full-Height Left Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:block lg:w-64">
        {renderSidebarContent()}
      </aside>

      {/* Mobile / Tablet Responsive Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={onClose}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] shadow-2xl">
            {renderSidebarContent()}
          </aside>
        </div>
      )}
    </>
  );
}
