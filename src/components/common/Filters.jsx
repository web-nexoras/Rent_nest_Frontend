import React from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/utils/helpers.js";

export function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
  className,
}) {
  return (
    <div className={cn("relative w-full sm:w-72", className)}>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8C8479] dark:text-[#9A9488]" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-full border border-[#E5DEC9] dark:border-[#252C3D] bg-white dark:bg-[#131722] pl-9 pr-8 text-xs font-medium text-[#141413] dark:text-[#F5F0E6] placeholder:text-[#968E82] dark:placeholder:text-[#6E7687] shadow-2xs transition-colors focus:border-[#C59B27] focus:outline-none focus:ring-2 focus:ring-[#C59B27]/20"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-[#8C8479] hover:text-[#141413] dark:hover:text-white"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

export function FilterTabs({ options = [], value, onChange, className }) {
  return (
    <div
      className={cn(
        "inline-flex flex-wrap items-center gap-1 rounded-full bg-[#F2ECE1] dark:bg-[#0E1117] p-1 border border-[#E5DEC9] dark:border-[#242B3D]",
        className
      )}
    >
      {options.map((opt) => {
        const isActive = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "inline-flex min-h-10 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all",
              isActive
                ? "bg-[#121212] text-white shadow-xs dark:bg-gradient-to-r dark:from-[#D4AF37] dark:to-[#C59B27] dark:text-[#0B0D11]"
                : "text-[#5C5549] dark:text-[#9A9488] hover:text-[#141413] dark:hover:text-white"
            )}
          >
            <span>{opt.label}</span>
            {opt.count !== undefined && (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.2 text-[10px]",
                  isActive
                    ? "bg-white/20 text-white dark:bg-black/20 dark:text-[#0B0D11]"
                    : "bg-white/80 dark:bg-[#1C2230] text-[#6E675F] dark:text-[#B8B2A6]"
                )}
              >
                {opt.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
