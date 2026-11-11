import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BedDouble, Building2, CalendarDays, Layers, Ruler, Wallet } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, DetailRow, PageHeader } from "@/components/common/Layout.jsx";
import Button from "@/components/common/Button.jsx";
import Badge from "@/components/common/Badge.jsx";
import { Skeleton } from "@/components/common/Skeleton.jsx";
import { EmptyState, ErrorState } from "@/components/feedback/States.jsx";
import { unitApi } from "@/features/units/unitApi.js";
import { formatFloor, formatMoney } from "@/utils/index.js";

export default function TenantUnitPage() {
  const query = useQuery({ queryKey: ["tenant", "unit"], queryFn: unitApi.mine });
  const [active, setActive] = useState(0);

  if (query.isLoading) {
    return (
      <>
        <PageHeader eyebrow="My Tenancy" title="My Unit" />
        <Skeleton className="h-72 w-full rounded-3xl" />
      </>
    );
  }
  if (query.isError) {
    return (
      <Card padded={false}>
        <ErrorState error={query.error} onRetry={query.refetch} />
      </Card>
    );
  }

  const unit = query.data.unit;
  if (!unit) {
    return (
      <>
        <PageHeader eyebrow="My Tenancy" title="My Unit" />
        <Card>
          <EmptyState
            icon={Building2}
            title="No unit assigned yet"
            description="Once an administrator assigns you a unit, its details and rent information will appear here."
          />
        </Card>
      </>
    );
  }

  const images = unit.images || [];

  return (
    <>
      <PageHeader
        eyebrow="My Tenancy"
        title={`Unit ${unit.unitNumber}`}
        description="Your assigned apartment specifications and monthly rent schedule."
        actions={
          <Link to="/tenant/payments?pay=1">
            <Button variant="primary"><Wallet className="h-4 w-4" /> Pay rent</Button>
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3" padded={false}>
          <div className="aspect-[16/10] overflow-hidden rounded-t-2xl bg-gradient-to-br from-[#1A1814] via-[#121212] to-[#0B0D11]">
            {images[active] ? (
              <img src={images[active]} alt={`Unit ${unit.unitNumber} photo ${active + 1}`} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-navy-400">
                <Building2 className="h-14 w-14 text-brand-400/60" />
                <span className="text-xs font-semibold uppercase tracking-widest text-navy-400">Unit {unit.unitNumber}</span>
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2.5 p-4">
              {images.map((src, index) => (
                <button
                  key={src}
                  onClick={() => setActive(index)}
                  className={`h-16 w-20 overflow-hidden rounded-xl border-2 transition ${index === active ? "border-brand-600 shadow-xs" : "border-transparent opacity-60 hover:opacity-100"}`}
                  aria-label={`Show photo ${index + 1}`}
                >
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
          {unit.description && (
            <div className="border-t border-navy-100/80 p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-navy-400">About this unit</h3>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-navy-600">{unit.description}</p>
            </div>
          )}
        </Card>

        <div className="space-y-6 lg:col-span-2">
          <Card title="Rent Schedule" subtitle="Monthly lease terms">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1A1814] via-[#121212] to-[#0B0D11] p-5 text-white">
              <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-brand-500/25 blur-2xl" />
              <p className="text-[11px] font-bold uppercase tracking-widest text-brand-300">Monthly Rent</p>
              <p className="mt-1.5 font-display text-3xl font-bold tabular text-white">{formatMoney(unit.rentAmount)}</p>
              <p className="mt-2 text-xs font-medium text-navy-300">Due on day {unit.rentDueDay} of each month</p>
            </div>
          </Card>

          <Card title="Unit Specifications" subtitle="Property attributes">
            <dl className="divide-y divide-navy-100/80">
              <DetailRow label="Unit number">{unit.unitNumber}</DetailRow>
              <DetailRow label={<span className="inline-flex items-center gap-1.5"><Layers className="h-3.5 w-3.5 text-navy-400" />Floor</span>}>{formatFloor(unit.floor, unit.unitNumber)}</DetailRow>
              <DetailRow label={<span className="inline-flex items-center gap-1.5"><BedDouble className="h-3.5 w-3.5 text-navy-400" />Bedrooms</span>}>{unit.bedrooms}</DetailRow>
              <DetailRow label={<span className="inline-flex items-center gap-1.5"><Ruler className="h-3.5 w-3.5 text-navy-400" />Size</span>}>
                {unit.sizeSqft ? `${unit.sizeSqft} sqft` : null}
              </DetailRow>
              <DetailRow label={<span className="inline-flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5 text-navy-400" />Rent due day</span>}>{unit.rentDueDay}</DetailRow>
              <DetailRow label="Status"><Badge status={unit.status} /></DetailRow>
            </dl>
          </Card>
        </div>
      </div>
    </>
  );
}
