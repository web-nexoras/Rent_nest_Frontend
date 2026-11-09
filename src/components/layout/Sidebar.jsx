import { NavLink } from "react-router-dom";
import { X } from "lucide-react";
import Logo from "./Logo.jsx";
import { cn } from "../../lib/utils.js";

export default function Sidebar({ items, open, onClose }) {
  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-30 bg-navy-950/50 backdrop-blur-sm transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-gradient-to-b from-navy-900 to-navy-950 text-white transition-transform duration-300 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
        aria-label="Main navigation"
      >
        <div className="flex h-20 items-center justify-between px-6">
          <Logo light />
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-navy-300 hover:bg-white/10 lg:hidden"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="scroll-thin flex-1 space-y-1 overflow-y-auto px-4 py-2">
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  "group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all",
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-navy-300 hover:bg-white/5 hover:text-white",
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      "absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-accent-500 transition-all",
                      isActive ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <Icon className={cn("h-5 w-5 transition", isActive ? "text-brand-300" : "group-hover:text-brand-300")} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="m-4 rounded-2xl bg-white/5 p-4 text-xs text-navy-300">
          <p className="font-semibold text-white">Need help?</p>
          <p className="mt-1 leading-relaxed">
            Contact your property administrator for account or billing questions.
          </p>
        </div>
      </aside>
    </>
  );
}
