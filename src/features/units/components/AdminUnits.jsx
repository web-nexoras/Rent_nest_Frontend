import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Building2,
  Plus,
  Sparkles,
} from "lucide-react";
import {
  assignTenantToUnit,
  createUnit,
  deleteUnit,
  listUnits,
  seedBuilding,
  updateUnit,
  vacateUnit,
} from "@/features/units/api/unitApi.js";
import { createTenant, getTenants } from "@/features/tenants/api/tenantApi.js";
import { unitSchema } from "@/utils/validation.js";
import { useToast } from "@/components/feedback/ToastContext.jsx";
import { PageHeader, Card, EmptyState, Skeleton } from "@/components/common/Layout.jsx";
import { Button } from "@/components/common/Button.jsx";
import { Input, Select, Textarea } from "@/components/common/Input.jsx";
import { SearchInput, FilterTabs } from "@/components/common/Filters.jsx";
import { Modal, ConfirmModal } from "@/components/common/Modal.jsx";
import { AssignTenantModal } from "@/features/units/components/AssignTenantModal.jsx";
import { UnitFormModal } from "@/features/units/components/UnitFormModal.jsx";
import UnitCard from "@/features/units/components/UnitCard.jsx";
import { Pagination } from "@/components/common/Pagination.jsx";
import { getErrorMessage } from "@/utils/helpers.js";

// Admin Units & 48-Suite Inventory Management
export default function AdminUnits() {
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
      const res = await listUnits({
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
      const res = await seedBuilding();
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
        await updateUnit(editingUnit._id, values);
        toast.success(`Suite ${values.unitNumber} updated.`);
      } else {
        await createUnit(values);
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
      const list = await getTenants({
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
        await assignTenantToUnit(assignModalUnit._id, selectedTenantId);
        toast.success(`Resident assigned to ${assignModalUnit.unitNumber}`);
      } else {
        await createTenant({
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
      await vacateUnit(vacateTarget._id);
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
      await deleteUnit(deleteTarget._id);
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
        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-label="Residential suites">
          {units.map((unit) => (
            <UnitCard
              key={unit._id}
              unit={unit}
              onAssign={openAssignModal}
              onEdit={openEditModal}
              onVacate={setVacateTarget}
              onDelete={setDeleteTarget}
            />
          ))}
        </section>
      )}

      {pagination && (
        <Card padding="p-0">
          <Pagination pagination={pagination} onPageChange={setPage} />
        </Card>
      )}

      {/* Create / Edit Unit Modal */}
      <UnitFormModal
        isOpen={unitModalOpen}
        onClose={() => setUnitModalOpen(false)}
        isEdit={Boolean(editingUnit)}
        register={register}
        handleSubmit={handleSubmit}
        onSubmit={onSaveUnit}
        errors={errors}
        isSubmitting={isSubmitting}
      />

      {/* Assign Existing OR Onboard New Tenant Modal */}
      <AssignTenantModal
        unit={assignModalUnit}
        onClose={() => setAssignModalUnit(null)}
        assignMode={assignMode}
        setAssignMode={setAssignMode}
        tenants={tenants}
        selectedTenantId={selectedTenantId}
        setSelectedTenantId={setSelectedTenantId}
        newTenantForm={newTenantForm}
        setNewTenantForm={setNewTenantForm}
        onSubmit={handleAssignSubmit}
        assigning={assigning}
      />

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
