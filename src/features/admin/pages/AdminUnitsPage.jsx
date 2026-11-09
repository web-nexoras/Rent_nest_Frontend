import { useEffect, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  BedDouble,
  Building2,
  CalendarDays,
  MoreVertical,
  Pencil,
  Plus,
  Ruler,
  Trash2,
  UserMinus,
  UserPlus,
} from "lucide-react";
import { PageHeader, Card, Avatar } from "../../../components/ui/Layout.jsx";
import Button from "../../../components/ui/Button.jsx";
import Badge from "../../../components/ui/Badge.jsx";
import Modal from "../../../components/ui/Modal.jsx";
import ConfirmDialog from "../../../components/ui/ConfirmDialog.jsx";
import Dropdown, { DropdownItem } from "../../../components/ui/Dropdown.jsx";
import Pagination from "../../../components/ui/Pagination.jsx";
import ImagePicker from "../../../components/ui/ImagePicker.jsx";
import { FilterTabs, SearchInput } from "../../../components/ui/Filters.jsx";
import { Input, Select, Textarea } from "../../../components/ui/Input.jsx";
import { Skeleton } from "../../../components/ui/Skeleton.jsx";
import { EmptyState, ErrorState } from "../../../components/ui/States.jsx";
import { unitService } from "../../../services/unitService.js";
import { adminService } from "../../../services/dashboardService.js";
import { useApiMutation } from "../../../hooks/useApiMutation.js";
import { useDebounce } from "../../../hooks/useDebounce.js";
import { formatMoney, toFormData } from "../../../lib/utils.js";

const LIMIT = 9;
const TABS = [
  { value: "", label: "All Units" },
  { value: "vacant", label: "Vacant" },
  { value: "occupied", label: "Occupied" },
];

const optionalNumber = (label, { min = 0, max, integer = false } = {}) =>
  z
    .string()
    .trim()
    .refine((value) => value === "" || Number.isFinite(Number(value)), `${label} must be a number`)
    .refine((value) => value === "" || Number(value) >= min, `${label} must be at least ${min}`)
    .refine((value) => value === "" || max === undefined || Number(value) <= max, `${label} must not exceed ${max}`)
    .refine((value) => value === "" || !integer || Number.isInteger(Number(value)), `${label} must be a whole number`);

const unitSchema = z.object({
  unitNumber: z.string().trim().min(1, "Unit number is required"),
  floor: z.string().trim().optional(),
  sizeSqft: optionalNumber("Size"),
  bedrooms: optionalNumber("Bedrooms", { integer: true }),
  rentAmount: z
    .string()
    .trim()
    .min(1, "Rent amount is required")
    .refine((value) => Number.isFinite(Number(value)) && Number(value) >= 0, "Rent must be a positive number"),
  rentDueDay: optionalNumber("Due day", { min: 1, max: 31, integer: true }),
  description: z.string().trim().optional(),
});

const emptyUnit = { unitNumber: "", floor: "", sizeSqft: "", bedrooms: "", rentAmount: "", rentDueDay: "1", description: "" };

function UnitFormModal({ open, unit, onClose }) {
  const [images, setImages] = useState([]);
  const [pickerKey, setPickerKey] = useState(0);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(unitSchema), defaultValues: emptyUnit });

  useEffect(() => {
    if (!open) return;
    setImages([]);
    setPickerKey((key) => key + 1);
    reset(
      unit
        ? {
            unitNumber: unit.unitNumber || "",
            floor: unit.floor || "",
            sizeSqft: unit.sizeSqft ?? "",
            bedrooms: unit.bedrooms ?? "",
            rentAmount: unit.rentAmount ?? "",
            rentDueDay: unit.rentDueDay ?? "1",
            description: unit.description || "",
          }
        : emptyUnit,
    );
  }, [open, unit, reset]);

  const mutation = useApiMutation(
    (values) => {
      const form = toFormData(values, { images });
      return unit ? unitService.update(unit._id, form) : unitService.create(form);
    },
    { invalidate: [["units"], ["admin"]], onSuccess: onClose },
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={unit ? `Edit Unit ${unit.unitNumber}` : "Add a new rental unit"}
      description="Configure unit specifications, monthly rent, and gallery photos."
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="unit-form" loading={mutation.isPending}>
            {unit ? "Save changes" : "Create unit"}
          </Button>
        </>
      }
    >
      <form id="unit-form" onSubmit={handleSubmit((values) => mutation.mutate(values))} className="space-y-4" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Unit number" placeholder="A-101" error={errors.unitNumber?.message} {...register("unitNumber")} />
          <Input label="Floor" placeholder="1" error={errors.floor?.message} {...register("floor")} />
          <Input label="Monthly rent (৳)" type="number" min="0" error={errors.rentAmount?.message} {...register("rentAmount")} />
          <Input label="Rent due day (1–31)" type="number" min="1" max="31" error={errors.rentDueDay?.message} {...register("rentDueDay")} />
          <Input label="Bedrooms" type="number" min="0" error={errors.bedrooms?.message} {...register("bedrooms")} />
          <Input label="Size (sqft)" type="number" min="0" error={errors.sizeSqft?.message} {...register("sizeSqft")} />
        </div>
        <Textarea label="Description" rows={3} placeholder="Balcony, south-facing, parking included…" error={errors.description?.message} {...register("description")} />
        <ImagePicker
          key={pickerKey}
          label={unit ? "Replace photos (optional)" : "Photos"}
          max={3}
          existing={unit?.images}
          onChange={setImages}
        />
        {unit && images.length > 0 && (
          <p className="text-xs font-medium text-amber-600">New photos will replace all existing photos for this unit.</p>
        )}
      </form>
    </Modal>
  );
}

function AssignModal({ unit, onClose }) {
  const [tenantId, setTenantId] = useState("");

  const tenants = useQuery({
    queryKey: ["admin", "tenants", "assignable"],
    queryFn: () => adminService.getTenants({ status: "approved", limit: 50 }),
    enabled: Boolean(unit),
  });
  useEffect(() => setTenantId(""), [unit]);

  const assignable = (tenants.data?.tenants || []).filter((tenant) => !tenant.assignedUnit && tenant.isActive);

  const assign = useApiMutation(() => unitService.assignTenant(unit._id, tenantId), {
    invalidate: [["units"], ["admin"]],
    onSuccess: onClose,
  });

  return (
    <Modal
      open={Boolean(unit)}
      onClose={onClose}
      size="sm"
      title={`Assign tenant to Unit ${unit?.unitNumber || ""}`}
      description={unit ? `Monthly rent: ${formatMoney(unit.rentAmount)}` : ""}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="primary" disabled={!tenantId} loading={assign.isPending} onClick={() => assign.mutate()}>
            Assign tenant
          </Button>
        </>
      }
    >
      {tenants.isLoading ? (
        <Skeleton className="h-10 w-full" />
      ) : tenants.isError ? (
        <ErrorState error={tenants.error} onRetry={tenants.refetch} />
      ) : assignable.length === 0 ? (
        <p className="text-sm text-navy-500">
          There are no approved tenants without a unit. Approve a pending tenant first.
        </p>
      ) : (
        <Select label="Approved tenant" value={tenantId} onChange={(event) => setTenantId(event.target.value)}>
          <option value="">Select a tenant…</option>
          {assignable.map((tenant) => (
            <option key={tenant._id} value={tenant._id}>
              {tenant.name} — {tenant.email}
            </option>
          ))}
        </Select>
      )}
    </Modal>
  );
}

export default function AdminUnitsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const debounced = useDebounce(search);
  const [form, setForm] = useState({ open: false, unit: null });
  const [assigning, setAssigning] = useState(null);
  const [confirm, setConfirm] = useState(null);

  useEffect(() => setPage(1), [status, debounced]);

  const query = useQuery({
    queryKey: ["units", { page, status, search: debounced }],
    queryFn: () => unitService.list({ page, limit: LIMIT, status: status || undefined, search: debounced || undefined }),
    placeholderData: keepPreviousData,
  });

  const close = () => setConfirm(null);
  const invalidate = [["units"], ["admin"]];
  const remove = useApiMutation((id) => unitService.remove(id), { invalidate, onSuccess: close });
  const unassign = useApiMutation((id) => unitService.unassignTenant(id), { invalidate, onSuccess: close });

  const units = query.data?.units || [];

  return (
    <>
      <PageHeader
        eyebrow="Property Portfolio"
        title="Rental Units"
        description="Manage unit inventory, monthly rent schedules, and resident assignments."
        actions={
          <Button onClick={() => setForm({ open: true, unit: null })}>
            <Plus className="h-4 w-4" /> Add unit
          </Button>
        }
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <FilterTabs value={status} onChange={setStatus} options={TABS} />
        <SearchInput value={search} onChange={setSearch} placeholder="Search unit number…" />
      </div>

      {query.isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="card overflow-hidden">
              <Skeleton className="h-44 w-full rounded-none" />
              <div className="space-y-3 p-5">
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : query.isError ? (
        <Card padded={false}><ErrorState error={query.error} onRetry={query.refetch} /></Card>
      ) : units.length === 0 ? (
        <Card padded={false}>
          <EmptyState
            icon={Building2}
            title={debounced || status ? "No units match these filters" : "No units yet"}
            description="Add your first rental unit to start assigning tenants."
            action={!debounced && !status && (
              <Button onClick={() => setForm({ open: true, unit: null })}><Plus className="h-4 w-4" /> Add unit</Button>
            )}
          />
        </Card>
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {units.map((unit) => (
              <article key={unit._id} className="card-interactive group flex flex-col overflow-hidden">
                <div className="relative h-44 overflow-hidden bg-gradient-to-br from-navy-900 via-navy-800 to-brand-950">
                  {unit.images?.[0] ? (
                    <img
                      src={unit.images[0]}
                      alt={`Unit ${unit.unitNumber}`}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-2 text-navy-500">
                      <Building2 className="h-10 w-10 text-brand-400/60" />
                      <span className="text-[11px] font-semibold uppercase tracking-widest text-navy-400">
                        Unit {unit.unitNumber}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950/60 via-transparent to-transparent" />
                  <div className="absolute left-3.5 top-3.5">
                    <Badge status={unit.status} className="bg-white/95 shadow-xs backdrop-blur" />
                  </div>
                  <div className="absolute right-3.5 top-3.5">
                    <Dropdown
                      trigger={() => (
                        <button
                          className="rounded-xl bg-white/95 p-1.5 text-navy-700 shadow-sm backdrop-blur transition hover:bg-white"
                          aria-label={`Actions for unit ${unit.unitNumber}`}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      )}
                    >
                      <DropdownItem icon={Pencil} onClick={() => setForm({ open: true, unit })}>Edit unit</DropdownItem>
                      {unit.assignedTenant ? (
                        <DropdownItem icon={UserMinus} onClick={() => setConfirm({ type: "unassign", unit })}>Unassign tenant</DropdownItem>
                      ) : (
                        <DropdownItem icon={UserPlus} onClick={() => setAssigning(unit)}>Assign tenant</DropdownItem>
                      )}
                      <DropdownItem icon={Trash2} danger onClick={() => setConfirm({ type: "delete", unit })}>Delete unit</DropdownItem>
                    </Dropdown>
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-display text-lg font-bold text-navy-900">Unit {unit.unitNumber}</h3>
                      <p className="text-xs font-medium text-navy-400">{unit.floor ? `Floor ${unit.floor}` : "Floor not set"}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-lg font-bold tabular text-brand-600">{formatMoney(unit.rentAmount)}</p>
                      <p className="text-[11px] font-medium text-navy-400">per month</p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium text-navy-600">
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-surface-subtle px-2.5 py-1">
                      <BedDouble className="h-3.5 w-3.5 text-navy-400" />
                      {unit.bedrooms ?? "—"} bed
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-surface-subtle px-2.5 py-1">
                      <Ruler className="h-3.5 w-3.5 text-navy-400" />
                      {unit.sizeSqft ? `${unit.sizeSqft} sqft` : "—"}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-surface-subtle px-2.5 py-1">
                      <CalendarDays className="h-3.5 w-3.5 text-navy-400" />
                      Due day {unit.rentDueDay}
                    </span>
                  </div>

                  <div className="mt-auto border-t border-navy-100/80 pt-4">
                    {unit.assignedTenant ? (
                      <div className="flex items-center justify-between gap-2 pt-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Avatar name={unit.assignedTenant.name} size="sm" />
                          <div className="min-w-0">
                            <p className="truncate text-xs font-bold text-navy-900">{unit.assignedTenant.name}</p>
                            <p className="truncate text-[11px] text-navy-400">{unit.assignedTenant.phone}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setConfirm({ type: "unassign", unit })}
                          className="text-xs font-semibold text-navy-400 hover:text-rose-600"
                        >
                          Unassign
                        </button>
                      </div>
                    ) : (
                      <div className="pt-3">
                        <Button
                          variant="subtle"
                          size="sm"
                          className="w-full"
                          onClick={() => setAssigning(unit)}
                        >
                          <UserPlus className="h-3.5 w-3.5" /> Assign a tenant
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
          <div className="card mt-6 overflow-hidden">
            <Pagination page={page} total={query.data.total} totalPages={query.data.totalPages} limit={LIMIT} onPageChange={setPage} />
          </div>
        </>
      )}

      <UnitFormModal open={form.open} unit={form.unit} onClose={() => setForm({ open: false, unit: null })} />
      <AssignModal unit={assigning} onClose={() => setAssigning(null)} />
      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={close}
        onConfirm={() => (confirm.type === "delete" ? remove : unassign).mutate(confirm.unit._id)}
        loading={remove.isPending || unassign.isPending}
        title={confirm?.type === "delete" ? "Delete this unit?" : "Unassign tenant?"}
        message={
          confirm?.type === "delete"
            ? `Unit ${confirm?.unit.unitNumber} and its photos will be permanently deleted. Occupied units can't be deleted.`
            : `${confirm?.unit.assignedTenant?.name} will be removed from unit ${confirm?.unit.unitNumber}, which becomes vacant.`
        }
        confirmLabel={confirm?.type === "delete" ? "Delete unit" : "Unassign"}
      />
    </>
  );
}
