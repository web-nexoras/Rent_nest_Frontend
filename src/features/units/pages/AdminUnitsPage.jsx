import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  BedDouble,
  Building2,
  Edit3,
  Maximize2,
  Plus,
  Sparkles,
  Trash2,
  UserCheck,
  UserMinus,
  UserPlus,
} from "lucide-react";
import { unitApi } from "@/features/units/unitApi.js";
import { tenantApi } from "@/features/tenants/tenantApi.js";
import { unitSchema } from "@/utils/validation.js";
import { useToast } from "@/components/feedback/Toast.jsx";
import { PageHeader, Card, EmptyState, Skeleton } from "@/components/common/Layout.jsx";
import { Button } from "@/components/common/Button.jsx";
import { Badge } from "@/components/common/Badge.jsx";
import { Input, Select, Textarea } from "@/components/common/Input.jsx";
import { SearchInput, FilterTabs } from "@/components/common/Filters.jsx";
import { Modal, ConfirmModal } from "@/components/common/Modal.jsx";
import { Pagination } from "@/components/common/Pagination.jsx";
import { formatCurrency, formatFloor, getErrorMessage } from "@/utils/index.js";

// Admin Units & 48-Suite Inventory Management
export default function AdminUnitsPage() {
  const toast = useToast();
  const [units, setUnits] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [unitModalOpen, setUnitModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);

  const [assignModalUnit, setAssignModalUnit] = useState(null);
  const [assignMode, setAssignMode] = useState("existing"); // "existing" | "new"
  const [tenants, setTenants] = useState([]);
  const [selectedTenantId, setSelectedTenantId] = useState("");
  const [newTenantForm, setNewTenantForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    nationalId: "",
  });
  const [assigning, setAssigning] = useState(false);

  const [vacateTarget, setVacateTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(unitSchema),
    defaultValues: {
      unitNumber: "",
      floor: "",
      bedrooms: 3,
      sizeSqft: 1450,
      rentAmount: 22000,
      rentDueDay: 5,
      description: "",
    },
  });

  const fetchUnits = useCallback(async () => {
    try {
      setLoading(true);
      const res = await unitApi.list({
        status: statusFilter || undefined,
        search: search || undefined,
        page,
        limit: 12,
      });
      setUnits(res?.units || []);
      setPagination(res?.pagination || null);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to load units"));
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search, page, toast]);

  useEffect(() => {
    fetchUnits();
  }, [fetchUnits]);

  const handleSeedBuilding = async () => {
    try {
      setSeeding(true);
      const res = await unitApi.seedBuilding();
      toast.success(
        res?.message || "48 units across 12 floors (A-101 to L-1204) initialized!",
        "Building Ready"
      );
      fetchUnits();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to seed building"));
    } finally {
      setSeeding(false);
    }
  };

  const openCreateModal = () => {
    setEditingUnit(null);
    reset({
      unitNumber: "",
      floor: "",
      bedrooms: 3,
      sizeSqft: 1450,
      rentAmount: 22000,
      rentDueDay: 5,
      description: "",
    });
    setUnitModalOpen(true);
  };

  const openEditModal = (unit) => {
    setEditingUnit(unit);
    reset({
      unitNumber: unit.unitNumber,
      floor: unit.floor || "",
      bedrooms: unit.bedrooms,
      sizeSqft: unit.sizeSqft,
      rentAmount: unit.rentAmount,
      rentDueDay: unit.rentDueDay || 5,
      description: unit.description || "",
    });
    setUnitModalOpen(true);
  };

  const onSaveUnit = async (values) => {
    try {
      if (editingUnit) {
        await unitApi.update(editingUnit._id, values);
        toast.success(`Suite ${values.unitNumber} updated.`);
      } else {
        await unitApi.create(values);
        toast.success(`Suite ${values.unitNumber} created.`);
      }
      setUnitModalOpen(false);
      fetchUnits();
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not save unit"));
    }
  };

  const openAssignModal = async (unit) => {
    setAssignModalUnit(unit);
    setAssignMode("existing");
    setSelectedTenantId("");
    setNewTenantForm({
      fullName: "",
      email: "",
      phone: "",
      password: "",
      nationalId: "",
    });
    try {
      const list = await tenantApi.getTenants({
        status: "approved",
        limit: 50,
      });
      setTenants(
        (list?.tenants || []).filter(
          (t) => !t.assignedUnit && t.isActive !== false
        )
      );
    } catch {
      setTenants([]);
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!assignModalUnit) return;
    try {
      setAssigning(true);
      if (assignMode === "existing") {
        if (!selectedTenantId) {
          toast.error("Please select a tenant to assign.");
          return;
        }
        await unitApi.assignTenant(assignModalUnit._id, selectedTenantId);
        toast.success(`Resident assigned to ${assignModalUnit.unitNumber}`);
      } else {
        await tenantApi.createTenant({
          ...newTenantForm,
          unitId: assignModalUnit._id,
        });
        toast.success(
          `New resident onboarded & assigned to ${assignModalUnit.unitNumber}`
        );
      }
      setAssignModalUnit(null);
      fetchUnits();
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not assign tenant"));
    } finally {
      setAssigning(false);
    }
  };

  const handleVacate = async () => {
    if (!vacateTarget) return;
    try {
      setActionLoading(true);
      await unitApi.vacate(vacateTarget._id);
      toast.success(`Suite ${vacateTarget.unitNumber} marked vacant.`);
      setVacateTarget(null);
      fetchUnits();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to vacate unit"));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setActionLoading(true);
      await unitApi.remove(deleteTarget._id);
      toast.success(`Suite ${deleteTarget.unitNumber} removed.`);
      setDeleteTarget(null);
      fetchUnits();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to delete unit"));
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Residential Suites & Units"
        description="Manage all 48 luxury flats across Floors A–L, fixed rent rates, and resident assignments."
        actions={
          <>
            <Button
              variant="gold"
              size="sm"
              leftIcon={Sparkles}
              isLoading={seeding}
              onClick={handleSeedBuilding}
            >
              Seed 48-Unit Building (A–L)
            </Button>
            <Button variant="primary" size="sm" leftIcon={Plus} onClick={openCreateModal}>
              Add Custom Suite
            </Button>
          </>
        }
      />

      {/* Filter & Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <FilterTabs
          value={statusFilter}
          onChange={(val) => {
            setStatusFilter(val);
            setPage(1);
          }}
          options={[
            { value: "", label: "All Suites" },
            { value: "occupied", label: "Occupied" },
            { value: "vacant", label: "Vacant" },
          ]}
        />
        <SearchInput
          value={search}
          onChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          placeholder="Search units"
        />
      </div>

      {/* Units Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-56" />
          ))}
        </div>
      ) : units.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No residential suites found"
          description="Initialize the 12-floor, 48-unit building (A-101 to L-1204) in one click or add a custom unit."
          action={
            <Button variant="gold" leftIcon={Sparkles} onClick={handleSeedBuilding}>
              Initialize 48 Units (Floors A–L)
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {units.map((unit) => (
            <Card
              key={unit._id}
              padding="p-5"
              className="surface-card-hover flex flex-col justify-between gap-4"
            >
              <div>
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

                <div className="mt-3 flex items-baseline justify-between border-y border-[#F0EAE0] dark:border-[#1E2433] py-2.5">
                  <span className="text-xs text-[#7A7267] dark:text-[#9A9488]">
                    Fixed Monthly Rent
                  </span>
                  <span className="font-display text-xl font-bold text-[#141413] dark:text-[#D4AF37]">
                    {formatCurrency(unit.rentAmount)}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-[#5C5549] dark:text-[#B8B2A6]">
                  <span className="inline-flex items-center gap-1.5">
                    <BedDouble className="h-3.5 w-3.5 text-[#C59B27]" />
                    {unit.bedrooms} Bed
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Maximize2 className="h-3.5 w-3.5 text-[#C59B27]" />
                    {unit.sizeSqft} sqft
                  </span>
                </div>

                {/* Assigned Resident Box */}
                <div className="mt-4 rounded-xl bg-[#FAF7F2] dark:bg-[#0E1117] border border-[#EAE1D0] dark:border-[#1E2433] p-3">
                  {unit.tenant ? (
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-wider text-[#8C8479]">
                          Assigned Resident
                        </p>
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
                    <p className="text-xs text-[#8C8479] italic">
                      Ready for immediate resident assignment
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#F0EAE0] dark:border-[#1E2433]">
                {unit.status === "occupied" ? (
                  <Button
                    variant="dangerOutline"
                    size="xs"
                    leftIcon={UserMinus}
                    onClick={() => setVacateTarget(unit)}
                  >
                    Vacate Suite
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="xs"
                    leftIcon={UserPlus}
                    onClick={() => openAssignModal(unit)}
                  >
                    Assign Resident
                  </Button>
                )}

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => openEditModal(unit)}
                    title="Edit Suite"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </Button>
                  {unit.status !== "occupied" && (
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => setDeleteTarget(unit)}
                      title="Delete Suite"
                      className="text-rose-600 hover:text-rose-700"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {pagination && (
        <Card padding="p-0">
          <Pagination pagination={pagination} onPageChange={setPage} />
        </Card>
      )}

      {/* Create / Edit Unit Modal */}
      <Modal
        isOpen={unitModalOpen}
        onClose={() => setUnitModalOpen(false)}
        title={editingUnit ? `Edit Suite ${editingUnit.unitNumber}` : "Create New Suite"}
        description="Configure unit specifications and fixed monthly rent."
      >
        <form onSubmit={handleSubmit(onSaveUnit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Suite Number"
              error={errors.unitNumber?.message}
              {...register("unitNumber")}
            />
            <Input
              label="Floor / Level"
              placeholder="e.g. A (Floor 1) or 3"
              error={errors.floor?.message}
              {...register("floor")}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Bedrooms"
              type="number"
              error={errors.bedrooms?.message}
              {...register("bedrooms")}
            />
            <Input
              label="Area (Sq.Ft)"
              type="number"
              error={errors.sizeSqft?.message}
              {...register("sizeSqft")}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Fixed Monthly Rent (BDT)"
              type="number"
              error={errors.rentAmount?.message}
              {...register("rentAmount")}
            />
            <Input
              label="Rent Due Day (1–31)"
              type="number"
              error={errors.rentDueDay?.message}
              {...register("rentDueDay")}
            />
          </div>
          <Textarea
            label="Description / Notes"
            rows={3}
            error={errors.description?.message}
            {...register("description")}
          />
          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={() => setUnitModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              {editingUnit ? "Save Changes" : "Create Suite"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Assign Existing OR Onboard New Tenant Modal */}
      <Modal
        isOpen={Boolean(assignModalUnit)}
        onClose={() => setAssignModalUnit(null)}
        title={`Assign Resident to Suite ${assignModalUnit?.unitNumber}`}
        description={`Fixed Rent: ${formatCurrency(assignModalUnit?.rentAmount || 0)}/month`}
      >
        <form onSubmit={handleAssignSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-2 rounded-2xl bg-[#F2ECE1] dark:bg-[#0E1117] p-1 sm:grid-cols-2 sm:rounded-full">
            <button
              type="button"
              onClick={() => setAssignMode("existing")}
              className={`rounded-xl px-2 py-2 text-[11px] font-semibold leading-tight transition-all sm:rounded-full sm:text-xs ${
                assignMode === "existing"
                  ? "bg-[#121212] text-white dark:bg-[#D4AF37] dark:text-[#0B0D11]"
                  : "text-[#6E675F]"
              }`}
            >
              Existing Unassigned Tenant
            </button>
            <button
              type="button"
              onClick={() => setAssignMode("new")}
              className={`rounded-xl px-2 py-2 text-[11px] font-semibold leading-tight transition-all sm:rounded-full sm:text-xs ${
                assignMode === "new"
                  ? "bg-[#121212] text-white dark:bg-[#D4AF37] dark:text-[#0B0D11]"
                  : "text-[#6E675F]"
              }`}
            >
              Create & Assign New Tenant
            </button>
          </div>

          {assignMode === "existing" ? (
            <Select
              label="Select Registered Unassigned Resident"
              value={selectedTenantId}
              onChange={(e) => setSelectedTenantId(e.target.value)}
            >
              <option value="">-- Choose a resident --</option>
              {tenants.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.fullName} ({t.phone || t.email})
                </option>
              ))}
            </Select>
          ) : (
            <div className="space-y-3">
              <Input
                label="Resident Full Name"
                required
                value={newTenantForm.fullName}
                onChange={(e) =>
                  setNewTenantForm((s) => ({ ...s, fullName: e.target.value }))
                }
              />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Input
                  label="Email Address"
                  type="email"
                  required
                  value={newTenantForm.email}
                  onChange={(e) =>
                    setNewTenantForm((s) => ({ ...s, email: e.target.value }))
                  }
                />
                <Input
                  label="Mobile Number"
                  required
                  value={newTenantForm.phone}
                  onChange={(e) =>
                    setNewTenantForm((s) => ({ ...s, phone: e.target.value }))
                  }
                />
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Input
                  label="Initial Password (6+ Chars)"
                  type="password"
                  required
                  value={newTenantForm.password}
                  onChange={(e) =>
                    setNewTenantForm((s) => ({ ...s, password: e.target.value }))
                  }
                />
                <Input
                  label="National ID (Optional)"
                  value={newTenantForm.nationalId}
                  onChange={(e) =>
                    setNewTenantForm((s) => ({ ...s, nationalId: e.target.value }))
                  }
                />
              </div>
            </div>
          )}

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={() => setAssignModalUnit(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={assigning}>
              Confirm Assignment
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={Boolean(vacateTarget)}
        onClose={() => setVacateTarget(null)}
        onConfirm={handleVacate}
        isLoading={actionLoading}
        title={`Vacate Suite ${vacateTarget?.unitNumber}?`}
        description="This will unassign the current resident and mark the flat as vacant."
        confirmLabel="Vacate Suite"
      />

      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        isLoading={actionLoading}
        title={`Delete Suite ${deleteTarget?.unitNumber}?`}
        description="This action permanently removes the unit from the inventory."
        confirmLabel="Delete Suite"
      />
    </div>
  );
}
