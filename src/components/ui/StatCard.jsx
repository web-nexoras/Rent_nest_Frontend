import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { cn } from "../../lib/utils.js";
import { Skeleton } from "./Skeleton.jsx";

const TONES = {
  navy: {
    icon: "bg-navy-900 text-white shadow-sm shadow-navy-900/20",
    glow: "from-navy-500/10 to-transparent",
    ring: "group-hover:border-navy-300",
  },
  brand: {
    icon: "bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-sm shadow-brand-600/25",
    glow: "from-brand-500/12 to-transparent",
    ring: "group-hover:border-brand-300/80",
  },
  emerald: {
    icon: "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-sm shadow-emerald-600/25",
    glow: "from-emerald-500/12 to-transparent",
    ring: "group-hover:border-emerald-300/80",
  },
  accent: {
    icon: "bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-sm shadow-amber-600/25",
    glow: "from-amber-500/12 to-transparent",
    ring: "group-hover:border-amber-300/80",
  },
  red: {
    icon: "bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-sm shadow-rose-600/25",
    glow: "from-rose-500/12 to-transparent",
    ring: "group-hover:border-rose-300/80",
  },
};

export default function StatCard({
  label,
  value,
  icon: Icon,
  tone = "brand",
  hint,
  badge,
  loading,
  interactive = false,
}) {
  const palette = TONES[tone] || TONES.brand;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className={cn(
        "card group relative overflow-hidden p-5 transition-all duration-200 hover:shadow-elevated",
        palette.ring,
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b opacity-80 transition-opacity group-hover:opacity-100",
          palette.glow,
        )}
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-navy-500">{label}</p>
            {interactive && (
              <ArrowUpRight className="h-3.5 w-3.5 text-navy-300 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand-600" />
            )}
          </div>
          {loading ? (
            <Skeleton className="mt-2.5 h-8 w-28" />
          ) : (
            <p className="tabular mt-2 truncate font-display text-2xl font-bold tracking-tight text-navy-900 sm:text-[1.7rem]">
              {value ?? "—"}
            </p>
          )}
        </div>
        {Icon && (
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105",
              palette.icon,
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>

      {(hint || badge) && !loading && (
        <div className="relative mt-3.5 flex items-center justify-between gap-2 border-t border-navy-100 pt-2.5 text-xs">
          {hint ? <span className="truncate text-navy-500">{hint}</span> : <span />}
          {badge}
        </div>
      )}
    </motion.div>
  );
}
