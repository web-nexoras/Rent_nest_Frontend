import { cn } from "../../lib/utils.js";

export function Skeleton({ className }) {
  return <div className={cn("animate-pulse rounded-lg bg-navy-100/70", className)} />;
}

export function CardSkeleton({ lines = 3 }) {
  return (
    <div className="card space-y-3 p-5">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-8 w-1/2" />
      {Array.from({ length: lines - 2 }).map((_, index) => (
        <Skeleton key={index} className="h-3 w-full" />
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 6, cols = 5 }) {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: rows }).map((_, row) => (
        <div key={row} className="flex gap-4">
          {Array.from({ length: cols }).map((__, col) => (
            <Skeleton key={col} className="h-6 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}
