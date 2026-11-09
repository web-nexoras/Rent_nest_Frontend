import { Loader2 } from "lucide-react";

export function PageLoader() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
    </div>
  );
}

export function FullScreenLoader() {
  return (
    <div className="flex h-full min-h-screen items-center justify-center bg-surface">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-navy-100 border-t-brand-500" />
        <p className="text-sm text-navy-400">Loading Rent Nest…</p>
      </div>
    </div>
  );
}
