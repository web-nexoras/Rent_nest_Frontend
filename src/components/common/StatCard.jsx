import React from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/utils/helpers.js";

const iconToneStyles = {
  indigo:
    "bg-[#F6F2E9] text-[#141413] ring-[#E5DEC9] dark:bg-[#1C2230] dark:text-[#D4AF37] dark:ring-[#C59B27]/30",
  brand:
    "bg-[#F6F2E9] text-[#141413] ring-[#E5DEC9] dark:bg-[#1C2230] dark:text-[#D4AF37] dark:ring-[#C59B27]/30",
  emerald:
    "bg-emerald-50 text-emerald-700 ring-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-500/30",
  amber:
    "bg-[#FBF3DC] text-[#9A7418] ring-[#E8D49B] dark:bg-amber-950/40 dark:text-[#E2BE5C] dark:ring-[#D4AF37]/30",
  rose:
    "bg-rose-50 text-rose-700 ring-rose-200/60 dark:bg-rose-950/40 dark:text-rose-300 dark:ring-rose-500/30",
  sky:
    "bg-[#F6F2E9] text-[#8F6B14] ring-[#E5DEC9] dark:bg-[#1C2230] dark:text-[#D4AF37] dark:ring-[#C59B27]/30",
  violet:
    "bg-[#141413] text-[#D4AF37] ring-[#C59B27]/50 dark:bg-[#D4AF37] dark:text-[#0B0D11] dark:ring-[#D4AF37]",
  accent:
    "bg-[#141413] text-[#D4AF37] ring-[#C59B27]/50 dark:bg-[#D4AF37] dark:text-[#0B0D11] dark:ring-[#D4AF37]",
};

export function StatCard({
  label,
  value,
  subtext,
  hint,
  badge,
  trend,
  trendDirection = "up",
  icon: Icon,
  tone = "indigo",
  className,
}) {
  const note = subtext || hint || badge;
  return (
    <div
      className={cn(
        "surface-card-hover p-5 flex flex-col justify-between gap-3",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7A7267] dark:text-[#9A9488]">
            {label}
          </p>
          <p className="mt-2 font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#141413] dark:text-[#F5F0E6]">
            {value ?? "—"}
          </p>
        </div>
        {Icon && (
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ring-1",
              iconToneStyles[tone] || iconToneStyles.indigo
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>

      {(note || trend) && (
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#F0EAE0] dark:border-[#1E2433] text-xs">
          {trend && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 font-semibold",
                trendDirection === "down"
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-emerald-600 dark:text-emerald-400"
              )}
            >
              {trendDirection === "down" ? (
                <ArrowDownRight className="h-3.5 w-3.5" />
              ) : (
                <ArrowUpRight className="h-3.5 w-3.5" />
              )}
              {trend}
            </span>
          )}
          {note && (
            <span className="text-[#7A7267] dark:text-[#9A9488] truncate">{note}</span>
          )}
        </div>
      )}
    </div>
  );
}

export default StatCard;
