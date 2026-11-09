import { cn } from "../../lib/utils.js";

export function PageHeader({ title, description, actions }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy-900">{title}</h1>
        {description && <p className="mt-1 text-sm text-navy-400">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ title, action, children, className, padded = true }) {
  return (
    <section className={cn("card", className)}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-3 border-b border-navy-100 px-5 py-4">
          <h2 className="text-base font-semibold text-navy-900">{title}</h2>
          {action}
        </div>
      )}
      <div className={cn(padded && "p-5")}>{children}</div>
    </section>
  );
}

export function Avatar({ name, src, size = "md" }) {
  const sizes = { sm: "h-8 w-8 text-xs", md: "h-10 w-10 text-sm", lg: "h-20 w-20 text-2xl" };
  if (src) {
    return <img src={src} alt={name} className={cn("rounded-full object-cover", sizes[size])} />;
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
        "flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 font-semibold text-white",
        sizes[size],
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
      <dt className="text-navy-400">{label}</dt>
      <dd className="text-right font-medium text-navy-800">{children ?? "—"}</dd>
    </div>
  );
}
