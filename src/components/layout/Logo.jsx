import { cn } from "../../lib/utils.js";

export default function Logo({ light = false, className }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 shadow-lg shadow-brand-500/30">
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
          <path d="M12 3 3 10.5h2.5V20h13v-9.5H21z" fill="white" />
          <rect x="10" y="13" width="4" height="7" rx="0.8" fill="#E9B96E" />
        </svg>
      </div>
      <div className="leading-tight">
        <p className={cn("text-lg font-bold tracking-tight", light ? "text-white" : "text-navy-900")}>
          Rent Nest
        </p>
        <p className={cn("text-[10px] font-medium uppercase tracking-[0.2em]", light ? "text-navy-300" : "text-navy-400")}>
          Property Suite
        </p>
      </div>
    </div>
  );
}
