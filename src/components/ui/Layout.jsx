import { cn } from "../../lib/utils.js";

export function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && (
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-brand-600">
            {eyebrow}
          </p>
        )}
        <h1 className="font-display text-2xl font-bold tracking-tight text-navy-900 sm:text-[1.75rem]">
          {title}
        </h1>
        {description && <p className="mt-1 text-sm text-navy-500">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2.5">{actions}</div>}
    </div>
  );
}

export function Card({ title, subtitle, action, children, className, padded = true }) {
  return (
    <section className={cn("card", className)}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-3 border-b border-navy-100 px-5 py-4">
          <div>
            <h2 className="font-display text-sm font-bold tracking-tight text-navy-900">{title}</h2>
            {subtitle && <p className="mt-0.5 text-xs text-navy-400">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      <div className={cn(padded && "p-5")}>{children}</div>
    </section>
  );
}

export function Avatar({ name, src, size = "md", ring = false }) {
  const sizes = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-20 w-20 text-2xl",
  };
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn(
          " shrink-0 rounded-full object-cover",
          sizes[size],
          ring && "ring-2 ring-white/80",
        )}
      />
    );
  }
  const letters = (name || "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 font-semibold text-white shadow-sm",
        sizes[size],
        ring && "ring-2 ring-white/80",
      )}
      aria-label={name}
    >
      {letters}
    </div>
  );
}

export function DetailRow({ label, children }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 text-sm">
      <dt className="text-navy-500">{label}</dt>
      <dd className="text-right font-medium text-navy-900">{children ?? "—"}</dd>
    </div>
  );
}
