import React from "react";
import { Inbox } from "lucide-react";
import { cn, initials } from "../../lib/utils.js";

export function PageHeader({ eyebrow, title, description, actions, badge, className }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-1",
        className
      )}
    >
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#9A7418] dark:text-[#D4AF37] mb-1">
            {eyebrow}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="font-display text-xl sm:text-3xl font-bold tracking-tight text-[#141413] dark:text-[#F5F0E6] break-words">
            {title}
          </h1>
          {badge}
        </div>
        {description && (
          <p className="mt-1 text-sm text-[#6E675F] dark:text-[#9A9488] max-w-2xl">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2.5 sm:shrink-0">{actions}</div>}
    </div>
  );
}

export function Card({ title, subtitle, action, padded = true, padding, children, className }) {
  const padClass = padding ?? (padded ? "p-6" : "p-0");
  return (
    <div className={cn("surface-card", padClass, className)}>
      {(title || subtitle || action) && (
        <div className={cn("flex items-center justify-between gap-4 mb-5", !padded && "px-6 pt-5")}>
          <div>
            {title && (
              <h2 className="font-display text-lg font-bold text-[#141413] dark:text-[#F5F0E6]">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-xs text-[#7A7267] dark:text-[#9A9488] mt-0.5">{subtitle}</p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action, icon: Icon, className }) {
  return (
    <div className={cn("flex items-center justify-between gap-4 mb-5", className)}>
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F6F2E9] dark:bg-[#1C2230] text-[#C59B27] ring-1 ring-[#E5DEC9] dark:ring-[#252C3D]">
            <Icon className="h-5 w-5" />
          </div>
        )}
        <div>
          <h2 className="font-display text-lg font-bold text-[#141413] dark:text-[#F5F0E6]">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs text-[#7A7267] dark:text-[#9A9488] mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function Avatar({ name = "", src, size = "md", className }) {
  const sizes = {
    sm: "h-9 w-9 text-xs",
    md: "h-11 w-11 text-sm",
    lg: "h-20 w-20 text-xl",
  };
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn(
          "shrink-0 rounded-full object-cover ring-2 ring-[#C59B27]/40",
          sizes[size] || sizes.md,
          className
        )}
      />
    );
  }
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-[#141413] font-bold text-[#D4AF37] ring-1 ring-[#C59B27]/40",
        sizes[size] || sizes.md,
        className
      )}
    >
      {initials(name)}
    </div>
  );
}

export function DetailRow({ label, children }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 text-xs sm:text-sm">
      <dt className="font-medium text-[#7A7267] dark:text-[#9A9488]">{label}</dt>
      <dd className="font-semibold text-[#141413] dark:text-[#F5F0E6] text-right">
        {children ?? "—"}
      </dd>
    </div>
  );
}

export function EmptyState({
  icon: Icon = Inbox,
  title = "No records found",
  description = "There are no items matching your current criteria.",
  action,
  className,
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#E2D9C5] dark:border-[#252C3D] bg-[#FAF7F2]/60 dark:bg-[#0E1117]/60 px-6 py-12 text-center",
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white dark:bg-[#131722] text-[#C59B27] shadow-xs ring-1 ring-[#E5DEC9] dark:ring-[#252C3D]">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-4 font-display text-base font-bold text-[#141413] dark:text-[#F5F0E6]">
        {title}
      </h3>
      <p className="mt-1 max-w-sm text-xs text-[#7A7267] dark:text-[#9A9488]">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Skeleton({ className }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-[#EDE6D6]/80 dark:bg-[#1B2130]",
        className
      )}
    />
  );
}
