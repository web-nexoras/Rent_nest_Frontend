import { Loader2 } from "lucide-react";
import { cn } from "../../lib/utils.js";

const VARIANTS = {
  primary:
    "bg-gradient-to-b from-brand-500 to-brand-600 text-white shadow-sm shadow-brand-600/25 ring-1 ring-inset ring-white/15 hover:from-brand-600 hover:to-brand-700 hover:shadow-md hover:shadow-brand-600/30",
  secondary:
    "bg-navy-900 text-white shadow-sm shadow-navy-900/20 ring-1 ring-inset ring-white/10 hover:bg-navy-800",
  outline:
    "border border-navy-200 bg-white text-navy-700 shadow-sm hover:border-navy-300 hover:bg-navy-50 hover:text-navy-900",
  ghost: "text-navy-600 hover:bg-navy-100/80 hover:text-navy-900",
  danger:
    "bg-gradient-to-b from-rose-500 to-rose-600 text-white shadow-sm shadow-rose-600/25 ring-1 ring-inset ring-white/15 hover:from-rose-600 hover:to-rose-700",
  subtle:
    "bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-500/20 hover:bg-brand-100/80",
  emerald:
    "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-500/20 hover:bg-emerald-100/80",
};

const SIZES = {
  sm: "h-8 px-3 text-xs gap-1.5 rounded-lg",
  md: "h-10 px-4 text-sm gap-2 rounded-xl",
  lg: "h-11 px-5 text-sm gap-2 rounded-xl",
  icon: "h-9 w-9 rounded-xl",
};

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  className,
  children,
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center font-medium transition-all duration-150 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-55",
        VARIANTS[variant] || VARIANTS.primary,
        SIZES[size] || SIZES.md,
        className,
      )}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
