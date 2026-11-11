import React, { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ShieldCheck, UserPlus } from "lucide-react";
import {
  createTenant,
  deleteTenant,
  getTenants,
  toggleTenantActive,
  updateTenant,
  updateTenantApproval,
} from "@/features/tenants/api/tenantApi.js";
import { listUnits } from "@/features/units/api/unitApi.js";
import { useToast } from "@/components/feedback/ToastContext.jsx";
import { PageHeader, Card } from "@/components/common/Layout.jsx";
import { DataTable } from "@/components/common/DataTable.jsx";
import { Button } from "@/components/common/Button.jsx";
import { FilterTabs, SearchInput } from "@/components/common/Filters.jsx";
import { ConfirmModal } from "@/components/common/Modal.jsx";
import { Pagination } from "@/components/common/Pagination.jsx";
import { ApprovalModal } from "@/features/admin/components/ApprovalModal.jsx";
import { TenantFormModal } from "@/features/admin/components/TenantFormModal.jsx";
import { getErrorMessage } from "@/utils/helpers.js";
import { createTenantColumns } from "@/features/admin/components/TenantTableColumns.jsx";

const PAGE_SIZE = 50;

const emptyForm = {
  fullName: "",
  email: "",
  phone: "",
  password: "",
  nationalId: "",
  occupation: "",
  address: "",
  unitId: "",
};

const STATUS_TABS = [
  { value: "", label: "All Residents" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

// Admin Resident Dossier with Direct Tenant Onboarding & Flat Assignment
export default function AdminTenants() {
  const toast = useToast();
  const [tenants, setTenants] = useState([]);
  const [vacantUnits, setVacantUnits] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);

  const [searchParams, setSearchParams] = useSearchParams();
  const urlStatus = searchParams.get("status") || "";

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState(urlStatus);
  const [page, setPage] = useState(1);

  // Sync status when URL search parameter changes
  useEffect(() => {
    if (urlStatus !== status) {
      setStatus(urlStatus);
      setPage(1);
    }
  }, [urlStatus]);

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    setPage(1);
    if (newStatus) {
      setSearchParams({ status: newStatus });
    } else {
      setSearchParams({});
    }
  };

  const [createOpen, setCreateOpen] = useState(false);
  const [editTenant, setEditTenant] = useState(null);
  const [approvalTarget, setApprovalTarget] = useState(null);
  const [approvalUnitId, setApprovalUnitId] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState(null);

  const [form, setForm] = useState(emptyForm);

  // Debounce the search box so typing does not fire a request per keystroke.
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [tenantRes, unitRes] = await Promise.all([
        getTenants({
          search: debouncedSearch || undefined,
          status: status || undefined,
          page,
          limit: PAGE_SIZE,
        }),
        listUnits({ status: "vacant", limit: PAGE_SIZE })
          .catch(() => ({ units: [] })),
      ]);
      setTenants(tenantRes?.tenants || []);
      setPagination(tenantRes?.pagination || null);
      setVacantUnits(unitRes?.units || []);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to load residents"));
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, status, page, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openCreateModal = () => {
    setForm(emptyForm);
    setCreateOpen(true);
  };

  const openEditModal = (tenant) => {
    setEditTenant(tenant);
    setForm({
      fullName: tenant.fullName || "",
      email: tenant.email || "",
      phone: tenant.phone || "",
      password: "",
      nationalId: tenant.nationalId || "",
      occupation: tenant.occupation || "",
      address: tenant.address || "",
      unitId: tenant.assignedUnit?._id || "",
    });
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await createTenant({
        ...form,
        unitId: form.unitId || undefined,
      });
      toast.success(
        "Resident account created & verified!",
        "Onboarding Complete"
      );
      setCreateOpen(false);
      setPage(1);
      loadData();
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not onboard resident"));
    } finally {
      setSaving(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editTenant) return;
    try {
      setSaving(true);
      await updateTenant(editTenant._id, {
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        ...(form.password ? { password: form.password } : {}),
        nationalId: form.nationalId,
        occupation: form.occupation,
        address: form.address,
        unitId: form.unitId || null,
      });
      toast.success("Resident dossier updated.");
      setEditTenant(null);
      loadData();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to update resident"));
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async () => {
    if (!approvalTarget) return;
    try {
      setSaving(true);
      const res = await updateTenantApproval(
        approvalTarget._id,
        "approved",
        approvalUnitId || undefined
      );
      toast.success(res?.message || "Resident approved.", "Approval Complete");
      setApprovalTarget(null);
      setApprovalUnitId("");
      loadData();
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not approve resident"));
    } finally {
      setSaving(false);
    }
  };

  const handleReject = async (tenant) => {
    try {
      setActionId(tenant._id);
      const res = await updateTenantApproval(
        tenant._id,
        "rejected"
      );
      toast.success(res?.message || "Resident rejected.", "Registration Declined");
      loadData();
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not reject resident"));
    } finally {
      setActionId(null);
    }
  };

  const handleToggleActive = async (tenant) => {
    try {
      setActionId(tenant._id);
      const res = await toggleTenantActive(tenant._id);
      toast.success(res?.message || "Resident status updated.");
      loadData();
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not update resident status"));
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setSaving(true);
      await deleteTenant(deleteTarget._id);
      toast.success("Resident account removed.");
      setDeleteTarget(null);
      if (tenants.length === 1 && page > 1) setPage((p) => p - 1);
      else loadData();
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not remove resident"));
    } finally {
      setSaving(false);
    }
  };

  const columns = createTenantColumns({ actionId, setApprovalTarget, setApprovalUnitId, handleReject, openEditModal, handleToggleActive, setDeleteTarget });
  const totalResidents = pagination?.total ?? tenants.length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Resident Roster & Lease Dossier"
        description="Onboard new tenants directly (pre-verified, no OTP wait), approve registrations, and assign or transfer flats."
        actions={
          <Button
            variant="primary"
            size="sm"
            leftIcon={UserPlus}
            onClick={openCreateModal}
          >
            Add Resident & Assign Suite
          </Button>
        }
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <FilterTabs
          value={status}
          onChange={handleStatusChange}
          options={STATUS_TABS}
        />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search name, email, phone or NID"
          />
          <span className="inline-flex items-center gap-1.5 text-xs text-[#7A7267]">
            <ShieldCheck className="h-4 w-4 text-[#C59B27]" />
            {totalResidents} Registered Resident(s)
          </span>
        </div>
      </div>

      <Card padding="p-0" className="overflow-hidden">
        <DataTable
          columns={columns}
          data={tenants}
          isLoading={loading}
          emptyTitle="No residents found"
          emptyDescription="Click 'Add Resident & Assign Suite' to onboard your first tenant."
          footer={
            pagination ? (
              <Pagination pagination={pagination} onPageChange={setPage} />
            ) : null
          }
        />
      </Card>

      {/* Direct Admin Tenant Onboarding & Edit Modal */}
      <TenantFormModal
        isOpen={createOpen || Boolean(editTenant)}
        onClose={() => {
          setCreateOpen(false);
          setEditTenant(null);
        }}
        isEdit={Boolean(editTenant)}
        form={form}
        setForm={setForm}
        onSubmit={editTenant ? handleEditSubmit : handleCreateSubmit}
        saving={saving}
        vacantUnits={vacantUnits}
        editTenant={editTenant}
      />

      {/* Approve Registration Modal */}
      <ApprovalModal
        approvalTarget={approvalTarget}
        onClose={() => {
          setApprovalTarget(null);
          setApprovalUnitId("");
        }}
        vacantUnits={vacantUnits}
        approvalUnitId={approvalUnitId}
        setApprovalUnitId={setApprovalUnitId}
        handleApprove={handleApprove}
        saving={saving}
      />

      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        isLoading={saving}
        title={`Delete ${deleteTarget?.fullName || "resident"}?`}
        description="This permanently removes the resident account. Their suite will be marked vacant if assigned."
        confirmLabel="Delete Resident"
      />
    </div>
  );
}
