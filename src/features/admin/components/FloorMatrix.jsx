import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Layers } from "lucide-react";
import { Card, CardHeader } from "@/components/common/Layout.jsx";
import { formatCurrency, formatFloor } from "@/utils/helpers.js";

// Live 12-Floor Tower Matrix (Floors A – L)
export function FloorMatrix({ floors = [] }) {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const pageSize = 3;
  const pageCount = Math.ceil(floors.length / pageSize);
  const visibleFloors = floors.slice(page * pageSize, (page + 1) * pageSize);

  if (floors.length === 0) return null;

  return (
    <Card padding="p-6">
      <CardHeader
        icon={Layers}
        title="Live 12-Floor Tower Matrix (Floors A – L)"
        subtitle="Real-time occupancy and current-month rent status"
        action={
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 text-emerald-700 dark:text-emerald-300 font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Paid
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FBF3DC] dark:bg-amber-950/40 px-2.5 py-1 text-[#8F6B14] dark:text-[#E2BE5C] font-medium">
              <span className="h-2 w-2 rounded-full bg-[#C59B27]" /> Due
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 dark:bg-rose-950/40 px-2.5 py-1 text-rose-700 dark:text-rose-300 font-medium">
              <span className="h-2 w-2 rounded-full bg-rose-500" /> Overdue
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F2ECE1] dark:bg-[#1C2230] px-2.5 py-1 text-[#6E675F] dark:text-[#9A9488] font-medium">
              <span className="h-2 w-2 rounded-full bg-[#8C8479]" /> Vacant
            </span>
          </div>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-[#7A7267] dark:text-[#9A9488]">
          Showing floors {page * pageSize + 1}–{Math.min((page + 1) * pageSize, floors.length)} of {floors.length}
        </p>
        {pageCount > 1 && (
          <div className="flex items-center justify-between gap-2 sm:justify-end">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(0, current - 1))}
              disabled={page === 0}
              aria-label="Show previous floors"
              className="inline-flex min-h-10 items-center justify-center gap-1 rounded-xl border border-[#E5DEC9] bg-white px-3 py-2 text-sm font-semibold text-[#5C5549] transition hover:bg-[#F6F2E9] disabled:cursor-not-allowed disabled:opacity-45 dark:border-[#252C3D] dark:bg-[#131722] dark:text-[#F5F0E6] dark:hover:bg-[#1C2230]"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </button>
            <span className="min-w-16 text-center text-xs font-semibold text-[#6E675F] dark:text-[#B8B2A6]">
              {page + 1} / {pageCount}
            </span>
            <button
              type="button"
              onClick={() => setPage((current) => Math.min(pageCount - 1, current + 1))}
              disabled={page >= pageCount - 1}
              aria-label="Show next floors"
              className="inline-flex min-h-10 items-center justify-center gap-1 rounded-xl border border-[#E5DEC9] bg-white px-3 py-2 text-sm font-semibold text-[#5C5549] transition hover:bg-[#F6F2E9] disabled:cursor-not-allowed disabled:opacity-45 dark:border-[#252C3D] dark:bg-[#131722] dark:text-[#F5F0E6] dark:hover:bg-[#1C2230]"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {visibleFloors.map((f) => {
          const occupiedCount = f.units.filter((u) => (u.occupancyStatus || u.status) === "occupied").length;
          return (
            <div
              key={f.key || f.floor}
              className="rounded-2xl border border-[#EAE1D0] dark:border-[#1E2433] bg-[#FAF7F2]/70 dark:bg-[#0E1117]/70 p-3.5"
            >
              <div className="mb-2.5 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#141413] dark:text-[#D4AF37]">
                  {formatFloor(f.floorValue || f.floor, f.units[0]?.unitNumber)}
                </span>
                <span className="text-[11px] text-[#7A7267] dark:text-[#9A9488]">
                  {occupiedCount}/{f.units.length} Occupied
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {f.units.map((u) => {
                  const isOccupied = (u.occupancyStatus || u.status) === "occupied";
                  const pStatus = u.currentMonthPaymentStatus;
                  const pillClass = !isOccupied
                    ? "border-[#E2D9C5] dark:border-[#242B3D] bg-white dark:bg-[#131722] text-[#6E675F] dark:text-[#9A9488]"
                    : pStatus === "paid"
                    ? "border-emerald-300 dark:border-emerald-500/40 bg-emerald-50/90 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200"
                    : pStatus === "overdue"
                    ? "border-rose-300 dark:border-rose-500/40 bg-rose-50/90 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200"
                    : "border-[#D4AF37] bg-[#FBF3DC] dark:bg-amber-950/40 text-[#7A590E] dark:text-[#E2BE5C]";

                  return (
                    <button
                      key={u._id}
                      type="button"
                      onClick={() => navigate("/admin/units")}
                      title={`${u.unitNumber} · ${
                        u.tenant ? u.tenant.fullName : "Vacant"
                      } · ${formatCurrency(u.rentAmount)}`}
                      className={`min-w-0 rounded-xl border px-1.5 py-2 text-center transition-transform hover:-translate-y-0.5 sm:px-2 ${pillClass}`}
                    >
                      <p className="text-xs font-bold">{u.unitNumber}</p>
                      <p className="mt-0.5 truncate text-[10px] opacity-85">
                        {isOccupied
                          ? u.tenant?.fullName?.split(" ")[0] || "Occupied"
                          : "Vacant"}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export default FloorMatrix;
