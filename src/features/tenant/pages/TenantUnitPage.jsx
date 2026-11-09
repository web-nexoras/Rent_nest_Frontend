import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BedDouble, Building2, CalendarDays, Layers, Ruler, Wallet } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, DetailRow, PageHeader } from "../../../components/ui/Layout.jsx";
import Button from "../../../components/ui/Button.jsx";
import Badge from "../../../components/ui/Badge.jsx";
import { Skeleton } from "../../../components/ui/Skeleton.jsx";
import { EmptyState, ErrorState } from "../../../components/ui/States.jsx";
import { unitService } from "../../../services/unitService.js";
import { formatMoney } from "../../../lib/utils.js";

export default function TenantUnitPage() {
  const query = useQuery({ queryKey: ["tenant", "unit"], queryFn: unitService.mine });
  const [active, setActive] = useState(0);

  if (query.isLoading) {
    return (
      <>
        <PageHeader title="My unit" />
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
        <PageHeader title="My unit" />
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
        title={`Unit ${unit.unitNumber}`}
        description="Your assigned unit and rent information."
        actions={
          <Link to="/tenant/payments?pay=1">
            <Button variant="secondary"><Wallet className="h-4 w-4" /> Pay rent</Button>
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3" padded={false}>
          <div className="aspect-[16/10] overflow-hidden rounded-t-2xl bg-gradient-to-br from-navy-100 to-navy-50">
            {images[active] ? (
              <img src={images[active]} alt={`Unit ${unit.unitNumber} photo ${active + 1}`} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-navy-200"><Building2 className="h-16 w-16" /></div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 p-4">
              {images.map((src, index) => (
                <button
                  key={src}
                  onClick={() => setActive(index)}
                  className={`h-16 w-20 overflow-hidden rounded-lg border-2 transition ${index === active ? "border-brand-500" : "border-transparent opacity-70 hover:opacity-100"}`}
                  aria-label={`Show photo ${index + 1}`}
                >
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
          {unit.description && (
            <div className="border-t border-navy-100 p-5">
              <h3 className="text-sm font-semibold text-navy-900">About this unit</h3>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-navy-500">{unit.description}</p>
            </div>
          )}
        </Card>

        <div className="space-y-6 lg:col-span-2">
          <Card title="Rent information">
            <div className="rounded-2xl bg-gradient-to-br from-navy-900 to-navy-800 p-5 text-white">
              <p className="text-xs uppercase tracking-wide text-navy-300">Monthly rent</p>
              <p className="mt-1 text-3xl font-bold text-accent-500">{formatMoney(unit.rentAmount)}</p>
              <p className="mt-2 text-sm text-navy-300">Due on day {unit.rentDueDay} of each month</p>
            </div>
          </Card>
          <Card title="Unit details">
            <dl className="divide-y divide-navy-100">
              <DetailRow label="Unit number">{unit.unitNumber}</DetailRow>
              <DetailRow label={<span className="inline-flex items-center gap-1.5"><Layers className="h-3.5 w-3.5" />Floor</span>}>{unit.floor}</DetailRow>
              <DetailRow label={<span className="inline-flex items-center gap-1.5"><BedDouble className="h-3.5 w-3.5" />Bedrooms</span>}>{unit.bedrooms}</DetailRow>
              <DetailRow label={<span className="inline-flex items-center gap-1.5"><Ruler className="h-3.5 w-3.5" />Size</span>}>
                {unit.sizeSqft ? `${unit.sizeSqft} sqft` : null}
              </DetailRow>
              <DetailRow label={<span className="inline-flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" />Rent due day</span>}>{unit.rentDueDay}</DetailRow>
              <DetailRow label="Status"><Badge status={unit.status} /></DetailRow>
            </dl>
          </Card>
        </div>
      </div>
    </>
  );
}
