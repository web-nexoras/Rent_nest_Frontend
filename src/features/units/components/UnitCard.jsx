import React from "react";
import { BedDouble, Edit3, Maximize2, Trash2, UserCheck, UserMinus, UserPlus } from "lucide-react";
import { Card } from "@/components/common/Layout.jsx";
import { Button } from "@/components/common/Button.jsx";
import { Badge } from "@/components/common/Badge.jsx";
import { formatCurrency, formatFloor } from "@/utils/helpers.js";

export default function UnitCard({ unit, onAssign, onEdit, onVacate, onDelete }) {
  const isOccupied = unit.status === "occupied";

  return (
    <Card
      padding="p-5"
      className="surface-card-hover flex flex-col justify-between gap-4"
    >
      <section aria-label={`Suite ${unit.unitNumber} details`}>
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#9A7418] dark:text-[#D4AF37]">
              {formatFloor(unit.floor, unit.unitNumber)}
            </span>
            <h3 className="font-display text-2xl font-bold text-[#141413] dark:text-[#F5F0E6]">
              Suite {unit.unitNumber}
            </h3>
          </div>
          <Badge status={unit.status} />
        </div>

        <div className="mt-3 flex items-baseline justify-between border-y border-[#F0EAE0] py-2.5 dark:border-[#1E2433]">
          <span className="text-xs text-[#7A7267] dark:text-[#9A9488]">Fixed Monthly Rent</span>
          <span className="font-display text-xl font-bold text-[#141413] dark:text-[#D4AF37]">
            {formatCurrency(unit.rentAmount)}
          </span>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-[#5C5549] dark:text-[#B8B2A6]">
          <span className="inline-flex items-center gap-1.5">
            <BedDouble className="h-3.5 w-3.5 text-[#C59B27]" /> {unit.bedrooms} Bed
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Maximize2 className="h-3.5 w-3.5 text-[#C59B27]" /> {unit.sizeSqft} sqft
          </span>
        </div>

        <section className="mt-4 rounded-xl border border-[#EAE1D0] bg-[#FAF7F2] p-3 dark:border-[#1E2433] dark:bg-[#0E1117]" aria-label="Resident assignment">
          {unit.tenant ? (
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wider text-[#8C8479]">Assigned Resident</p>
                <p className="truncate text-xs font-bold text-[#141413] dark:text-[#F5F0E6]">
                  {unit.tenant.fullName}
                </p>
                <p className="truncate text-[11px] text-[#7A7267]">
                  {unit.tenant.phone || unit.tenant.email}
                </p>
              </div>
              <UserCheck className="h-4 w-4 shrink-0 text-emerald-600" />
            </div>
          ) : (
            <p className="text-xs italic text-[#8C8479]">Ready for immediate resident assignment</p>
          )}
        </section>
      </section>

      <section className="flex items-center justify-between gap-2 border-t border-[#F0EAE0] pt-2 dark:border-[#1E2433]" aria-label="Suite actions">
        {isOccupied ? (
          <Button variant="dangerOutline" size="xs" leftIcon={UserMinus} onClick={() => onVacate(unit)}>
            Vacate Suite
          </Button>
        ) : (
          <Button variant="primary" size="xs" leftIcon={UserPlus} onClick={() => onAssign(unit)}>
            Assign Resident
          </Button>
        )}

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="xs" onClick={() => onEdit(unit)} title="Edit Suite">
            <Edit3 className="h-3.5 w-3.5" />
          </Button>
          {!isOccupied && (
            <Button
              variant="ghost"
              size="xs"
              onClick={() => onDelete(unit)}
              title="Delete Suite"
              className="text-rose-600 hover:text-rose-700"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </section>
    </Card>
  );
}
