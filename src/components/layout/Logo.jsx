import { cn } from "../../lib/utils.js";

export default function Logo({ light = false, collapsed = false, className }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700 shadow-md shadow-brand-600/30 ring-1 ring-white/20">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
          <path d="M12 3.2 3.2 10.4h2.3V20h13v-9.6h2.3z" fill="white" />
          <rect x="10" y="13.2" width="4" height="6.8" rx="0.9" fill="#0B1120" />
        </svg>
      </div>
      {!collapsed && (
        <div className="leading-none">
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                "font-display text-base font-extrabold tracking-tight",
                light ? "text-white" : "text-navy-900",
              )}
            >
              Rent Nest
            </span>
            <span
              className={cn(
                "rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider",
                light
                  ? "bg-brand-500/20 text-brand-300 ring-1 ring-brand-400/30"
                  : "bg-brand-50 text-brand-700 ring-1 ring-brand-500/20",
              )}
            >
              Pro
            </span>
          </div>
          <p
            className={cn(
              "mt-1 text-[10px] font-medium tracking-wider",
              light ? "text-navy-400" : "text-navy-400",
            )}
          >
            PROPERTY CLOUD
          </p>
        </div>
      )}
    </div>
  );
}
