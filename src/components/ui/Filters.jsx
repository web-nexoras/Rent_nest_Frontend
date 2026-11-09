import { Search } from "lucide-react";
import { cn } from "../../lib/utils.js";

export function SearchInput({ value, onChange, placeholder = "Search...", className }) {
  return (
    <div className={cn("relative w-full sm:w-72", className)}>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-300" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-10 w-full rounded-xl border border-navy-200 bg-white pl-10 pr-3 text-sm placeholder:text-navy-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
      />
    </div>
  );
}

/** Segmented filter used for status filters above tables. options: [{value,label}] */
export function FilterTabs({ value, onChange, options }) {
  return (
    <div className="scroll-thin flex gap-1 overflow-x-auto rounded-xl bg-navy-50 p-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "whitespace-nowrap rounded-lg px-3.5 py-1.5 text-sm font-medium transition",
            value === option.value
              ? "bg-white text-navy-900 shadow-sm"
              : "text-navy-500 hover:text-navy-800",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
