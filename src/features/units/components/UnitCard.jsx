import React from "react";
import {
  BedDouble,
  Building2,
  Edit3,
  Maximize2,
  Trash2,
  UserCheck,
  UserMinus,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/common/Button.jsx";
import { Badge } from "@/components/common/Badge.jsx";
import { formatCurrency, formatFloor } from "@/utils/helpers.js";

const UNIT_PHOTOS = [
  "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=900&q=78",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=78",
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=78",
  "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=900&q=78",
];

const photoForUnit = (unitNumber = "") => {
  const key = String(unitNumber);
  const index = [...key].reduce((sum, char) => sum + char.charCodeAt(0), 0) % UNIT_PHOTOS.length;
  return UNIT_PHOTOS[index];
};

export default function UnitCard({ unit, onAssign, onEdit, onVacate, onDelete }) {
  const isOccupied = unit.status === "occupied";
  const customPhoto = Array.isArray(unit.images)
    ? unit.images.find((image) => typeof image === "string" && image.trim())
    : null;

  return (
    <article className="surface-card-hover group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-[#E8DFCE] bg-white shadow-sm dark:border-[#252C3D] dark:bg-[#131722]">
      <div className="relative h-28 overflow-hidden bg-gradient-to-br from-[#3A3429] via-[#77705F] to-[#D7C9A8] sm:h-32">
        <Building2 className="absolute left-1/2 top-1/2 h-9 w-9 -translate-x-1/2 -translate-y-1/2 text-white/50" />
        <img
          src={customPhoto || photoForUnit(unit.unitNumber)}
          alt={`Suite ${unit.unitNumber} apartment`}
          loading="lazy"
          onError={(event) => event.currentTarget.remove()}
          className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/15" />
        <div className="absolute inset-x-4 top-3 flex items-start justify-between gap-2">
          <span className="rounded-full border border-white/30 bg-black/40 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
            {formatFloor(unit.floor, unit.unitNumber)}
          </span>
          <Badge status={unit.status} />
        </div>
        <div className="absolute inset-x-4 bottom-3 flex items-end justify-between gap-3 text-white">
          <div className="min-w-0">
            <p className="text-[9px] font-medium uppercase tracking-[0.16em] text-white/75">Luxury residence</p>
            <h3 className="truncate font-display text-xl font-bold">Suite {unit.unitNumber}</h3>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-[9px] font-medium text-white/75">Monthly rent</p>
            <p className="font-display text-base font-bold text-[#F4D77D]">{formatCurrency(unit.rentAmount)}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-3.5">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex min-w-0 items-center gap-1.5 rounded-lg bg-[#FAF7F2] px-2.5 py-2 text-[11px] text-[#5C5549] dark:bg-[#0E1117] dark:text-[#B8B2A6]">
            <BedDouble className="h-3.5 w-3.5 shrink-0 text-[#B18418] dark:text-[#D4AF37]" />
            <span className="truncate">{unit.bedrooms || "—"} bedrooms</span>
          </div>
          <div className="flex min-w-0 items-center gap-1.5 rounded-lg bg-[#FAF7F2] px-2.5 py-2 text-[11px] text-[#5C5549] dark:bg-[#0E1117] dark:text-[#B8B2A6]">
            <Maximize2 className="h-3.5 w-3.5 shrink-0 text-[#B18418] dark:text-[#D4AF37]" />
            <span className="truncate">{unit.sizeSqft ? `${unit.sizeSqft} sqft` : "Size not set"}</span>
          </div>
        </div>

        <section className="mt-2.5 min-h-[58px] rounded-xl border border-[#EAE1D0] bg-[#FCFAF5] px-3 py-2.5 dark:border-[#252C3D] dark:bg-[#171B25]" aria-label="Resident assignment">
          {unit.tenant ? (
            <div className="flex min-w-0 items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8C8479]">Assigned resident</p>
                <p className="truncate text-sm font-semibold text-[#141413] dark:text-[#F5F0E6]">{unit.tenant.fullName}</p>
                <p className="truncate text-[11px] text-[#7A7267] dark:text-[#9A9488]">{unit.tenant.phone || unit.tenant.email}</p>
              </div>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                <UserCheck className="h-4 w-4" />
              </span>
            </div>
          ) : (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8C8479]">Resident assignment</p>
              <p className="mt-1 text-xs text-[#5C5549] dark:text-[#B8B2A6]">Ready for a new resident</p>
            </div>
          )}
        </section>

        <section className="mt-2.5 flex flex-wrap items-center justify-between gap-2 border-t border-[#EFE9DC] pt-2.5 dark:border-[#252C3D]" aria-label="Suite actions">
          {isOccupied ? (
            <Button variant="dangerOutline" size="xs" leftIcon={UserMinus} onClick={() => onVacate(unit)}>
              Vacate Suite
            </Button>
          ) : (
            <Button variant="primary" size="xs" leftIcon={UserPlus} onClick={() => onAssign(unit)}>
              Assign Resident
            </Button>
          )}
          <div className="pointer-events-none flex items-center gap-1 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100 [@media(hover:none)]:pointer-events-auto [@media(hover:none)]:opacity-100">
            <Button variant="ghost" size="xs" onClick={() => onEdit(unit)} title="Edit Suite" aria-label={`Edit suite ${unit.unitNumber}`}>
              <Edit3 className="h-3.5 w-3.5" />
            </Button>
            {!isOccupied && (
              <Button variant="ghost" size="xs" onClick={() => onDelete(unit)} title="Delete Suite" aria-label={`Delete suite ${unit.unitNumber}`} className="text-rose-600 hover:text-rose-700">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </section>
      </div>
    </article>
  );
}
