import { forwardRef, useId } from "react";
import { cn } from "../../lib/utils.js";

const base =
  "w-full rounded-xl border bg-white px-3.5 text-sm text-navy-900 placeholder:text-navy-300 transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:bg-navy-50";

export function Field({ label, error, hint, htmlFor, children, className }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <label htmlFor={htmlFor} className="block text-sm font-medium text-navy-800">
          {label}
        </label>
      )}
      {children}
      {hint && !error && <p className="text-xs text-navy-400">{hint}</p>}
      {error && (
        <p role="alert" className="text-xs font-medium text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}

export const Input = forwardRef(function Input(
  { label, error, hint, icon: Icon, className, id, ...props },
  ref,
) {
  const generated = useId();
  const inputId = id || generated;
  return (
    <Field label={label} error={error} hint={hint} htmlFor={inputId}>
      <div className="relative">
        {Icon && (
          <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-300" />
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={Boolean(error)}
          className={cn(
            base,
            "h-10",
            Icon && "pl-10",
            error ? "border-red-300" : "border-navy-200",
            className,
          )}
          {...props}
        />
      </div>
    </Field>
  );
});

export const Textarea = forwardRef(function Textarea(
  { label, error, hint, className, id, rows = 4, ...props },
  ref,
) {
  const generated = useId();
  const inputId = id || generated;
  return (
    <Field label={label} error={error} hint={hint} htmlFor={inputId}>
      <textarea
        ref={ref}
        id={inputId}
        rows={rows}
        aria-invalid={Boolean(error)}
        className={cn(base, "py-2.5", error ? "border-red-300" : "border-navy-200", className)}
        {...props}
      />
    </Field>
  );
});

export const Select = forwardRef(function Select(
  { label, error, hint, className, id, children, ...props },
  ref,
) {
  const generated = useId();
  const inputId = id || generated;
  return (
    <Field label={label} error={error} hint={hint} htmlFor={inputId}>
      <select
        ref={ref}
        id={inputId}
        aria-invalid={Boolean(error)}
        className={cn(base, "h-10", error ? "border-red-300" : "border-navy-200", className)}
        {...props}
      >
        {children}
      </select>
    </Field>
  );
});
