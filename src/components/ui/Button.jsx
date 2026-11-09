import { Loader2 } from "lucide-react";
import { cn } from "../../lib/utils.js";

const VARIANTS = {
  primary: "bg-navy-900 text-white hover:bg-navy-800 shadow-sm",
  secondary: "bg-brand-500 text-white hover:bg-brand-600 shadow-sm",
  outline: "border border-navy-200 bg-white text-navy-800 hover:bg-navy-50",
  ghost: "text-navy-700 hover:bg-navy-50",
  danger: "bg-red-500 text-white hover:bg-red-600 shadow-sm",
  subtle: "bg-brand-50 text-brand-700 hover:bg-brand-100",
};

const SIZES = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2",
  icon: "h-9 w-9",
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
        "inline-flex items-center justify-center rounded-xl font-medium transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
