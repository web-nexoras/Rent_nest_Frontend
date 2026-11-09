import { Search, X } from "lucide-react";
import { motion } from "framer-motion";
import { useId } from "react";
import { cn } from "../../lib/utils.js";

export function SearchInput({ value, onChange, placeholder = "Search...", className }) {
  return (
    <div className={cn("relative w-full sm:w-72", className)}>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-10 w-full rounded-xl border border-navy-200 bg-white pl-10 pr-8 text-sm text-navy-900 shadow-sm shadow-navy-900/[0.02] placeholder:text-navy-400 transition hover:border-navy-300 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-navy-400 hover:bg-navy-100 hover:text-navy-700"
          aria-label="Clear search"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

/** Segmented filter tabs with smooth animated active indicator. */
export function FilterTabs({ value, onChange, options }) {
  const layoutId = useId();
  return (
    <div className="scroll-thin inline-flex max-w-full gap-1 overflow-x-auto rounded-xl border border-navy-200/80 bg-navy-100/70 p-1">
      {options.map((option) => {
        const active = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "relative whitespace-nowrap rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors",
              active ? "text-navy-900" : "text-navy-500 hover:text-navy-800",
            )}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                transition={{ type: "spring", bounce: 0.15, duration: 0.35 }}
                className="absolute inset-0 rounded-lg bg-white shadow-sm ring-1 ring-navy-900/5"
              />
            )}
            <span className="relative z-10">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
