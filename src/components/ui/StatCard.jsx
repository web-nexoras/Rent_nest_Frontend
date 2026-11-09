import { cn } from "../../lib/utils.js";
import { Skeleton } from "./Skeleton.jsx";

const TONES = {
  navy: "bg-navy-900 text-white",
  brand: "bg-brand-500 text-white",
  accent: "bg-accent-500 text-navy-900",
  red: "bg-red-500 text-white",
};

export default function StatCard({ label, value, icon: Icon, tone = "navy", hint, loading }) {
  return (
    <div className="card group relative overflow-hidden p-5 transition-all hover:-translate-y-0.5 hover:shadow-pop">
      <div
        className={cn(
          "absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-[0.07] transition-transform group-hover:scale-125",
          TONES[tone],
        )}
      />
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium text-navy-400">{label}</p>
          {loading ? (
            <Skeleton className="mt-2 h-8 w-24" />
          ) : (
            <p className="mt-1.5 truncate text-2xl font-bold tracking-tight text-navy-900">
              {value}
            </p>
          )}
          {hint && !loading && <p className="mt-1 text-xs text-navy-400">{hint}</p>}
        </div>
        {Icon && (
          <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", TONES[tone])}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  );
}
