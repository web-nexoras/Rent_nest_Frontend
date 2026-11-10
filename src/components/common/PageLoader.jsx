import { Loader2 } from "lucide-react";

export function PageLoader() {
  return (
    <div className="flex min-h-[45vh] items-center justify-center">
      <div className="flex items-center gap-3 rounded-2xl border border-navy-200/70 bg-white dark:bg-[#131722] px-4 py-2.5 shadow-card">
        <Loader2 className="h-4 w-4 animate-spin text-brand-600" />
        <span className="text-xs font-semibold text-navy-600">Loading module…</span>
      </div>
    </div>
  );
}

export function FullScreenLoader() {
  return (
    <div className="flex h-full min-h-screen items-center justify-center bg-surface-muted">
      <div className="flex flex-col items-center gap-4">
        <div className="h-11 w-11 animate-spin rounded-full border-[3px] border-navy-200 border-t-brand-600" />
        <p className="text-xs font-semibold uppercase tracking-widest text-navy-500">Loading Rent Nest…</p>
      </div>
    </div>
  );
}
