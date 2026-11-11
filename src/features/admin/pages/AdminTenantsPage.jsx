import React, { useCallback, useEffect, useState } from "react";
import {
  Building2,
  Check,
  Edit3,
  Mail,
  Phone,
  Power,
  ShieldCheck,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";
import { tenantApi } from "@/features/tenants/tenantApi.js";
import { unitApi } from "@/features/units/unitApi.js";
import { useToast } from "@/components/feedback/Toast.jsx";
import { PageHeader, Card } from "@/components/common/Layout.jsx";
import { DataTable } from "@/components/common/DataTable.jsx";
import { Badge } from "@/components/common/Badge.jsx";
import { Button } from "@/components/common/Button.jsx";
import { Input, Select } from "@/components/common/Input.jsx";
import { FilterTabs, SearchInput } from "@/components/common/Filters.jsx";
import { Modal, ConfirmModal } from "@/components/common/Modal.jsx";
import { Pagination } from "@/components/common/Pagination.jsx";
import {
  formatCurrency,
  formatDate,
  formatFloor,
  getErrorMessage,
  getInitials,
} from "@/utils/index.js";

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
export default function AdminTenantsPage() {
  const toast = useToast();
  const [tenants, setTenants] = useState([]);
  const [vacantUnits, setVacantUnits] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

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
        tenantApi.getTenants({
          search: debouncedSearch || undefined,
          status: status || undefined,
          page,
          limit: PAGE_SIZE,
        }),
        unitApi
          .list({ status: "vacant", limit: PAGE_SIZE })
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
      await tenantApi.createTenant({
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
      await tenantApi.updateTenant(editTenant._id, {
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
      const res = await tenantApi.updateApproval(
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
      const res = await tenantApi.updateApproval(
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
      const res = await tenantApi.toggleActive(tenant._id);
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
      await tenantApi.removeTenant(deleteTarget._id);
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

  const columns = [
    {
      key: "resident",
      header: "Resident Dossier",
      render: (row) => (
        <div className="flex items-center gap-3">
          {row.avatar?.url ? (
            <img
              src={row.avatar.url}
              alt={row.fullName}
              className="h-10 w-10 rounded-full object-cover ring-2 ring-[#C59B27]/40"
            />
          ) : (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#141413] text-xs font-bold text-[#D4AF37]">
              {getInitials(row.fullName)}
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate font-semibold text-[#141413] dark:text-[#F5F0E6]">
              {row.fullName || "Unnamed resident"}
            </p>
            <p className="text-xs text-[#7A7267] dark:text-[#9A9488]">
              NID: {row.nationalId || "Not provided"}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "contact",
      header: "Contact Credentials",
      render: (row) => (
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-1.5 text-[#141413] dark:text-[#F5F0E6]">
            <Mail className="h-3.5 w-3.5 shrink-0 text-[#C59B27]" />
            <span className="truncate">{row.email}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#7A7267] dark:text-[#9A9488]">
            <Phone className="h-3.5 w-3.5 shrink-0 text-[#C59B27]" />
            <span>{row.phone || "No mobile"}</span>
          </div>
        </div>
      ),
    },
    {
      key: "unit",
      header: "Assigned Suite",
      render: (row) =>
        row.assignedUnit ? (
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E5DEC9] bg-[#F6F2E9] px-3 py-1 text-xs font-bold text-[#141413] dark:border-[#2A3246] dark:bg-[#1C2230] dark:text-[#D4AF37]">
              <Building2 className="h-3.5 w-3.5 text-[#C59B27]" />
              {row.assignedUnit.unitNumber}
            </span>
            <p className="mt-1 text-xs text-[#7A7267]">
              {formatFloor(
                row.assignedUnit.floor,
                row.assignedUnit.unitNumber
              )}{" "}
              · {formatCurrency(row.assignedUnit.rentAmount)}/mo
            </p>
          </div>
        ) : (
          <Badge status="unverified">Unassigned</Badge>
        ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <div className="flex flex-col items-start gap-1.5">
          <Badge status={row.approvalStatus || "pending"} />
          <Badge tone={row.isActive ? "emerald" : "danger"}>
            {row.isActive ? "Active" : "Suspended"}
          </Badge>
        </div>
      ),
    },
    {
      key: "joined",
      header: "Lease Start",
      render: (row) => (
        <span className="text-xs text-[#6E675F] dark:text-[#9A9488]">
          {formatDate(row.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Manage",
      align: "right",
      render: (row) => (
        <div className="flex flex-wrap items-center justify-end gap-1">
          {row.approvalStatus === "pending" && (
            <>
              <Button
                variant="emerald"
                size="xs"
                leftIcon={Check}
                isLoading={actionId === row._id}
                onClick={() => {
                  setApprovalTarget(row);
                  setApprovalUnitId("");
                }}
              >
                Approve
              </Button>
              <Button
                variant="dangerOutline"
                size="xs"
                leftIcon={X}
                isLoading={actionId === row._id}
                onClick={() => handleReject(row)}
              >
                Reject
              </Button>
            </>
          )}
          <Button
            variant="secondary"
            size="xs"
            leftIcon={Edit3}
            onClick={() => openEditModal(row)}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => handleToggleActive(row)}
            isLoading={actionId === row._id}
            title={row.isActive ? "Suspend resident" : "Activate resident"}
          >
            <Power className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => setDeleteTarget(row)}
            title="Delete resident"
            className="text-rose-600 hover:text-rose-700"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

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
          onChange={(value) => {
            setStatus(value);
            setPage(1);
          }}
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

      {/* Direct Admin Tenant Onboarding Modal */}
      <Modal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Onboard New Resident & Assign Suite"
        description="Creates a pre-verified tenant account and optionally assigns them to a vacant suite."
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <Input
            label="Full Legal Name"
            required
            value={form.fullName}
            onChange={(e) =>
              setForm((s) => ({ ...s, fullName: e.target.value }))
            }
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Email Address"
              type="email"
              required
              value={form.email}
              onChange={(e) =>
                setForm((s) => ({ ...s, email: e.target.value }))
              }
            />
            <Input
              label="Mobile Number (BD)"
              required
              value={form.phone}
              onChange={(e) =>
                setForm((s) => ({ ...s, phone: e.target.value }))
              }
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Initial Password (6+ Chars)"
              type="password"
              required
              value={form.password}
              onChange={(e) =>
                setForm((s) => ({ ...s, password: e.target.value }))
              }
            />
            <Select
              label="Assign Vacant Suite (Optional)"
              value={form.unitId}
              onChange={(e) =>
                setForm((s) => ({ ...s, unitId: e.target.value }))
              }
            >
              <option value="">-- Leave Unassigned for Now --</option>
              {vacantUnits.map((u) => (
                <option key={u._id} value={u._id}>
                  Suite {u.unitNumber} · {formatFloor(u.floor, u.unitNumber)} (
                  {formatCurrency(u.rentAmount)}/mo)
                </option>
              ))}
            </Select>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="National ID / Passport"
              value={form.nationalId}
              onChange={(e) =>
                setForm((s) => ({ ...s, nationalId: e.target.value }))
              }
            />
            <Input
              label="Occupation"
              value={form.occupation}
              onChange={(e) =>
                setForm((s) => ({ ...s, occupation: e.target.value }))
              }
            />
          </div>
          <Input
            label="Present Address"
            value={form.address}
            onChange={(e) =>
              setForm((s) => ({ ...s, address: e.target.value }))
            }
          />
          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={saving}>
              Create & Assign Resident
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Resident / Transfer Suite Modal */}
      <Modal
        isOpen={Boolean(editTenant)}
        onClose={() => setEditTenant(null)}
        title={`Edit Resident — ${editTenant?.fullName || ""}`}
        description="Update contact details, reset the password, or transfer the resident to another suite."
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <Input
            label="Full Legal Name"
            required
            value={form.fullName}
            onChange={(e) =>
              setForm((s) => ({ ...s, fullName: e.target.value }))
            }
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Email Address"
              type="email"
              required
              value={form.email}
              onChange={(e) =>
                setForm((s) => ({ ...s, email: e.target.value }))
              }
            />
            <Input
              label="Mobile Number"
              required
              value={form.phone}
              onChange={(e) =>
                setForm((s) => ({ ...s, phone: e.target.value }))
              }
            />
          </div>
          <Input
            label="New Password (leave blank to keep current)"
            type="password"
            value={form.password}
            onChange={(e) =>
              setForm((s) => ({ ...s, password: e.target.value }))
            }
            hint="Minimum 6 characters"
          />
          <Select
            label="Assigned Suite"
            value={form.unitId}
            onChange={(e) =>
              setForm((s) => ({ ...s, unitId: e.target.value }))
            }
          >
            <option value="">-- Unassigned (Vacate Current Suite) --</option>
            {editTenant?.assignedUnit && (
              <option value={editTenant.assignedUnit._id}>
                Current: Suite {editTenant.assignedUnit.unitNumber} (
                {formatCurrency(editTenant.assignedUnit.rentAmount)}/mo)
              </option>
            )}
            {vacantUnits.map((u) => (
              <option key={u._id} value={u._id}>
                Move to: Suite {u.unitNumber} ·{" "}
                {formatFloor(u.floor, u.unitNumber)} (
                {formatCurrency(u.rentAmount)}/mo)
              </option>
            ))}
          </Select>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="National ID"
              value={form.nationalId}
              onChange={(e) =>
                setForm((s) => ({ ...s, nationalId: e.target.value }))
              }
            />
            <Input
              label="Occupation"
              value={form.occupation}
              onChange={(e) =>
                setForm((s) => ({ ...s, occupation: e.target.value }))
              }
            />
          </div>
          <Input
            label="Present Address"
            value={form.address}
            onChange={(e) =>
              setForm((s) => ({ ...s, address: e.target.value }))
            }
          />
          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={() => setEditTenant(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={saving}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Approve Registration Modal */}
      <Modal
        isOpen={Boolean(approvalTarget)}
        onClose={() => setApprovalTarget(null)}
        title={`Approve ${approvalTarget?.fullName || "resident"}?`}
        description="Approving grants access to the resident portal. You can optionally assign a vacant suite now."
        footer={
          <>
            <Button variant="secondary" onClick={() => setApprovalTarget(null)}>
              Cancel
            </Button>
            <Button variant="emerald" onClick={handleApprove} isLoading={saving}>
              Approve Resident
            </Button>
          </>
        }
      >
        <Select
          label="Assign Vacant Suite (Optional)"
          value={approvalUnitId}
          onChange={(e) => setApprovalUnitId(e.target.value)}
        >
          <option value="">-- Approve without a suite --</option>
          {vacantUnits.map((u) => (
            <option key={u._id} value={u._id}>
              Suite {u.unitNumber} · {formatFloor(u.floor, u.unitNumber)} (
              {formatCurrency(u.rentAmount)}/mo)
            </option>
          ))}
        </Select>
      </Modal>

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
