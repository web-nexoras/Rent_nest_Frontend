import React from "react";
import { cn } from "@/utils/helpers.js";

const baseInputClasses =
  "w-full rounded-xl border border-[#E5DEC9] dark:border-[#252C3D] bg-white dark:bg-[#131722] px-3.5 py-2.5 text-sm text-[#141413] dark:text-[#F5F0E6] placeholder:text-[#968E82] dark:placeholder:text-[#6E7687] shadow-2xs transition-all duration-150 focus:border-[#C59B27] focus:outline-none focus:ring-2 focus:ring-[#C59B27]/20 disabled:bg-[#F6F2E9] dark:disabled:bg-[#0E1117] disabled:text-[#8C8479] disabled:cursor-not-allowed";

export const Input = React.forwardRef(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      icon,
      rightElement,
      className,
      containerClassName,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || props.name;
    const LeftIcon = leftIcon || icon;
    return (
      <div className={cn("w-full", containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#5C5549] dark:text-[#B8B2A6]"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {LeftIcon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#8C8479] dark:text-[#9A9488]">
              <LeftIcon className="h-4 w-4" />
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              baseInputClasses,
              "h-11",
              LeftIcon && "pl-10",
              rightElement && "pr-10",
              error && "border-rose-400 focus:border-rose-500 focus:ring-rose-500/20",
              className
            )}
            {...props}
          />
          {rightElement && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              {rightElement}
            </div>
          )}
        </div>
        {error ? (
          <p className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">{error}</p>
        ) : (
          hint && <p className="mt-1.5 text-xs text-[#7A7267] dark:text-[#9A9488]">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export const Select = React.forwardRef(
  ({ label, error, hint, options = [], className, containerClassName, children, id, ...props }, ref) => {
    const selectId = id || props.name;
    return (
      <div className={cn("w-full", containerClassName)}>
        {label && (
          <label
            htmlFor={selectId}
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#5C5549] dark:text-[#B8B2A6]"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            baseInputClasses,
            "h-11",
            error && "border-rose-400 focus:border-rose-500 focus:ring-rose-500/20",
            className
          )}
          {...props}
        >
          {children
            ? children
            : options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
        </select>
        {error ? (
          <p className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">{error}</p>
        ) : (
          hint && <p className="mt-1.5 text-xs text-[#7A7267] dark:text-[#9A9488]">{hint}</p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

export const Textarea = React.forwardRef(
  ({ label, error, hint, className, containerClassName, rows = 4, id, ...props }, ref) => {
    const textareaId = id || props.name;
    return (
      <div className={cn("w-full", containerClassName)}>
        {label && (
          <label
            htmlFor={textareaId}
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#5C5549] dark:text-[#B8B2A6]"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          className={cn(
            baseInputClasses,
            error && "border-rose-400 focus:border-rose-500 focus:ring-rose-500/20",
            className
          )}
          {...props}
        />
        {error ? (
          <p className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">{error}</p>
        ) : (
          hint && <p className="mt-1.5 text-xs text-[#7A7267] dark:text-[#9A9488]">{hint}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
export default Input;
