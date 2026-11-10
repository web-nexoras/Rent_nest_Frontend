import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../../lib/utils.js";

const variants = {
  primary:
    "bg-[#121212] text-white hover:bg-[#23211D] dark:bg-gradient-to-r dark:from-[#D4AF37] dark:to-[#C59B27] dark:text-[#0B0D11] dark:hover:brightness-110 shadow-sm",
  gold:
    "bg-gradient-to-r from-[#D4AF37] to-[#C59B27] text-[#111111] font-semibold hover:brightness-105 shadow-sm",
  emerald:
    "bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs",
  secondary:
    "bg-white text-[#141413] border border-[#E5DEC9] hover:bg-[#F6F2E9] hover:border-[#C59B27]/50 dark:bg-[#131722] dark:text-[#F5F0E6] dark:border-[#252C3D] dark:hover:bg-[#1C2230] shadow-xs",
  outline:
    "bg-white dark:bg-[#131722] text-[#141413] dark:text-[#F5F0E6] border border-[#E5DEC9] dark:border-[#252C3D] hover:bg-[#F6F2E9] dark:hover:bg-[#1C2230]",
  danger:
    "bg-rose-600 text-white hover:bg-rose-700 shadow-xs focus-visible:ring-rose-500",
  dangerOutline:
    "bg-white dark:bg-[#131722] text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30 hover:bg-rose-50 dark:hover:bg-rose-950/30",
  ghost:
    "bg-transparent text-[#5C5549] dark:text-[#B8B2A6] hover:bg-[#F2ECE1] dark:hover:bg-[#1C2230] hover:text-[#141413] dark:hover:text-white",
};

const sizes = {
  xs: "h-8 px-3 text-xs rounded-full gap-1.5",
  sm: "h-9 px-3.5 text-xs rounded-full gap-1.5",
  md: "h-10 px-4.5 text-sm rounded-full gap-2",
  lg: "h-11 px-6 text-sm rounded-full gap-2",
  icon: "h-9 w-9 rounded-full p-0",
};

export const Button = React.forwardRef(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      loading = false,
      disabled,
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      children,
      type = "button",
      ...props
    },
    ref
  ) => {
    const busy = isLoading || loading;
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || busy}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C59B27]/40 disabled:opacity-55 disabled:pointer-events-none active:scale-[0.98]",
          variants[variant] || variants.primary,
          sizes[size] || sizes.md,
          className
        )}
        {...props}
      >
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin shrink-0" />
        ) : (
          LeftIcon && <LeftIcon className="h-4 w-4 shrink-0" />
        )}
        {children}
        {!busy && RightIcon && <RightIcon className="h-4 w-4 shrink-0" />}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
