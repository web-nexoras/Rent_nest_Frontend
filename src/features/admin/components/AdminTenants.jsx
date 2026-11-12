import React, { useCallback, useEffect, useRef, useState } from "react";
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
  const loadRequestRef = useRef(0);

  const [form, setForm] = useState(emptyForm);

  // Debounce the search box so typing does not fire a request per keystroke.
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  const loadData = useCallback(async (pageOverride = page) => {
    const requestId = ++loadRequestRef.current;
    try {
      setLoading(true);
      const [tenantRes, unitRes] = await Promise.all([
        getTenants({
          search: debouncedSearch || undefined,
          status: status || undefined,
          page: pageOverride,
          limit: PAGE_SIZE,
        }),
        listUnits({ status: "vacant", limit: PAGE_SIZE })
          .catch(() => ({ units: [] })),
      ]);
      if (requestId !== loadRequestRef.current) return;
      setTenants(tenantRes?.tenants || []);
      setPagination(tenantRes?.pagination || null);
      setVacantUnits(unitRes?.units || []);
    } catch (err) {
      if (requestId === loadRequestRef.current) {
        toast.error(getErrorMessage(err, "Failed to load residents"));
      }
    } finally {
      if (requestId === loadRequestRef.current) setLoading(false);
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
      await loadData(1);
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
      await loadData();
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
      await loadData();
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
      await loadData();
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
      await loadData();
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
      else await loadData();
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not remove resident"));
    } finally {
      setSaving(false);
    }
  };

  const columns = createTenantColumns({ actionId, setApprovalTarget, setApprovalUnitId, handleReject, openEditModal, handleToggleActive, setDeleteTarget });
  const columnByKey = Object.fromEntries(columns.map((column) => [column.key, column]));
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

      <div className="flex min-w-0 flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <FilterTabs
          value={status}
          onChange={handleStatusChange}
          options={STATUS_TABS}
        />
        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center xl:justify-end">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search name, email, phone or NID"
            className="sm:min-w-0 sm:flex-1 xl:flex-none"
          />
          <span className="inline-flex shrink-0 items-center gap-1.5 text-xs text-[#7A7267]">
            <ShieldCheck className="h-4 w-4 text-[#C59B27]" />
            {totalResidents} Registered Resident(s)
          </span>
        </div>
      </div>

      <Card padding="p-0" className="overflow-hidden">
        <div className="space-y-3 p-3 2xl:hidden">
          {loading ? (
            Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="h-36 animate-pulse rounded-2xl bg-[#F2ECE1] dark:bg-[#1B2130]" />
            ))
          ) : tenants.length ? (
            tenants.map((tenant) => (
              <article key={tenant._id} className={`group relative min-w-0 overflow-hidden rounded-2xl border border-[#E8DFCE] bg-gradient-to-br from-white via-white to-[#FBF7EE] p-4 shadow-sm transition duration-200 before:absolute before:inset-x-8 before:top-0 before:h-0.5 before:rounded-full before:bg-gradient-to-r before:from-transparent before:via-[#D4AF37] before:to-transparent hover:-translate-y-0.5 hover:border-[#D6C18B] hover:shadow-md dark:border-[#252C3D] dark:from-[#151A24] dark:via-[#131722] dark:to-[#171B25] dark:hover:border-[#806A32] sm:p-5 ${tenant.approvalStatus === "pending" ? "pb-4" : "pb-12"}`}>
                <div className="flex min-w-0 items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    {columnByKey.resident.render(tenant)}
                  </div>
                  <div className="shrink-0">
                    {columnByKey.status.render(tenant)}
                  </div>
                </div>
                <div className="mt-4 grid min-w-0 grid-cols-1 gap-2.5 border-t border-[#EFE9DC] pt-3 text-xs dark:border-[#1C2230] sm:grid-cols-2">
                  <div className="min-w-0 rounded-xl border border-[#EFE9DC] bg-white/80 p-3 dark:border-[#252C3D] dark:bg-[#10131A]/70">
                    <p className="mb-1 font-semibold uppercase tracking-wide text-[#8C8479]">Contact</p>
                    {columnByKey.contact.render(tenant)}
                  </div>
                  <div className="min-w-0 rounded-xl border border-[#EFE9DC] bg-white/80 p-3 dark:border-[#252C3D] dark:bg-[#10131A]/70">
                    <p className="mb-1 font-semibold uppercase tracking-wide text-[#8C8479]">Suite & Lease</p>
                    <div>{columnByKey.unit.render(tenant)}</div>
                    <div className="mt-1">{columnByKey.joined.render(tenant)}</div>
                  </div>
                </div>
                <div className={tenant.approvalStatus === "pending"
                  ? "mt-3 border-t border-[#EFE9DC] pt-3 dark:border-[#1C2230]"
                  : "pointer-events-none absolute bottom-2.5 right-3 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100 [@media(hover:none)]:pointer-events-auto [@media(hover:none)]:opacity-100 sm:right-4"}>
                  {columnByKey.actions.render(tenant)}
                </div>
              </article>
            ))
          ) : (
            <p className="rounded-xl px-4 py-10 text-center text-sm text-[#7A7267]">No residents found. Try another filter or add a resident.</p>
          )}
          {pagination && <Pagination pagination={pagination} onPageChange={setPage} />}
        </div>
        <div className="hidden 2xl:block">
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
        </div>
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
