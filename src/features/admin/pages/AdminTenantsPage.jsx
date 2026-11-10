import React, { useCallback, useEffect, useState } from "react";
import {
  Building2,
  Edit3,
  Mail,
  Phone,
  ShieldCheck,
  UserPlus,
} from "lucide-react";
import { dashboardService } from "../../../services/dashboardService";
import { unitService } from "../../../services/unitService";
import { useToast } from "../../../components/ui/Toast";
import { PageHeader, Card } from "../../../components/ui/Layout";
import { DataTable } from "../../../components/ui/DataTable";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Input, Select } from "../../../components/ui/Input";
import { SearchInput } from "../../../components/ui/Filters";
import { Modal } from "../../../components/ui/Modal";
import {
  formatCurrency,
  formatDate,
  getErrorMessage,
  getInitials,
} from "../../../lib/utils";

// Admin Resident Dossier with Direct Tenant Onboarding & Flat Assignment
export default function AdminTenantsPage() {
  const toast = useToast();
  const [tenants, setTenants] = useState([]);
  const [vacantUnits, setVacantUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [editTenant, setEditTenant] = useState(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    nationalId: "",
    emergencyContact: "",
    address: "",
    unitId: "",
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [tenantList, unitRes] = await Promise.all([
        dashboardService.getTenants({ search: search || undefined }),
        unitService.list({ status: "vacant", limit: 100 }).catch(() => ({ units: [] })),
      ]);
      setTenants(tenantList || []);
      setVacantUnits(unitRes?.units || []);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to load residents"));
    } finally {
      setLoading(false);
    }
  }, [search, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openCreateModal = () => {
    setForm({
      fullName: "",
      email: "",
      phone: "",
      password: "",
      nationalId: "",
      emergencyContact: "",
      address: "",
      unitId: "",
    });
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
      emergencyContact: tenant.emergencyContact || "",
      address: tenant.address || "",
      unitId: tenant.assignedUnit?._id || "",
    });
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await dashboardService.createTenant({
        ...form,
        unitId: form.unitId || undefined,
      });
      toast.success("Resident account created & verified!", "Onboarding Complete");
      setCreateOpen(false);
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
      await dashboardService.updateTenant(editTenant._id, {
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        nationalId: form.nationalId,
        emergencyContact: form.emergencyContact,
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
          <div>
            <p className="font-semibold text-[#141413] dark:text-[#F5F0E6]">
              {row.fullName}
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
            <Mail className="h-3.5 w-3.5 text-[#C59B27]" />
            <span>{row.email}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#7A7267] dark:text-[#9A9488]">
            <Phone className="h-3.5 w-3.5 text-[#C59B27]" />
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
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F6F2E9] dark:bg-[#1C2230] px-3 py-1 text-xs font-bold text-[#141413] dark:text-[#D4AF37] border border-[#E5DEC9] dark:border-[#2A3246]">
              <Building2 className="h-3.5 w-3.5 text-[#C59B27]" />
              {row.assignedUnit.unitNumber}
            </span>
            <p className="mt-1 text-xs text-[#7A7267]">
              {formatCurrency(row.assignedUnit.rentAmount)}/mo
            </p>
          </div>
        ) : (
          <Badge status="unverified">Unassigned</Badge>
        ),
    },
    {
      key: "verified",
      header: "Status",
      render: (row) => (
        <Badge status={row.isVerified ? "verified" : "unverified"}>
          {row.isVerified ? "Verified" : "Pending OTP"}
        </Badge>
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
        <Button
          variant="secondary"
          size="xs"
          leftIcon={Edit3}
          onClick={() => openEditModal(row)}
        >
          Edit / Move Flat
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Resident Roster & Lease Dossier"
        description="Onboard new tenants directly (pre-verified, no OTP wait) and assign or transfer flats."
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

      <div className="flex items-center justify-between gap-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search residents"
        />
        <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-[#7A7267]">
          <ShieldCheck className="h-4 w-4 text-[#C59B27]" />
          {tenants.length} Registered Resident(s)
        </span>
      </div>

      <Card padding="p-0" className="overflow-hidden">
        <DataTable
          columns={columns}
          data={tenants}
          isLoading={loading}
          emptyTitle="No residents found"
          emptyDescription="Click 'Add Resident & Assign Suite' to onboard your first tenant."
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
            onChange={(e) => setForm((s) => ({ ...s, fullName: e.target.value }))}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Email Address"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
            />
            <Input
              label="Mobile Number (BD)"
              required
              value={form.phone}
              onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Initial Password (6+ Chars)"
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
            />
            <Select
              label="Assign Vacant Suite (Optional)"
              value={form.unitId}
              onChange={(e) => setForm((s) => ({ ...s, unitId: e.target.value }))}
            >
              <option value="">-- Leave Unassigned for Now --</option>
              {vacantUnits.map((u) => (
                <option key={u._id} value={u._id}>
                  Suite {u.unitNumber} · Floor {u.floor} ({formatCurrency(u.rentAmount)}/mo)
                </option>
              ))}
            </Select>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="National ID / Passport"
              value={form.nationalId}
              onChange={(e) => setForm((s) => ({ ...s, nationalId: e.target.value }))}
            />
            <Input
              label="Emergency Contact"
              value={form.emergencyContact}
              onChange={(e) =>
                setForm((s) => ({ ...s, emergencyContact: e.target.value }))
              }
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
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
        title={`Edit Resident — ${editTenant?.fullName}`}
        description="Update contact details or transfer resident to another suite."
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <Input
            label="Full Legal Name"
            required
            value={form.fullName}
            onChange={(e) => setForm((s) => ({ ...s, fullName: e.target.value }))}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Email Address"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
            />
            <Input
              label="Mobile Number"
              required
              value={form.phone}
              onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))}
            />
          </div>
          <Select
            label="Assigned Suite"
            value={form.unitId}
            onChange={(e) => setForm((s) => ({ ...s, unitId: e.target.value }))}
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
                Move to: Suite {u.unitNumber} · Floor {u.floor} (
                {formatCurrency(u.rentAmount)}/mo)
              </option>
            ))}
          </Select>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="National ID"
              value={form.nationalId}
              onChange={(e) => setForm((s) => ({ ...s, nationalId: e.target.value }))}
            />
            <Input
              label="Emergency Contact"
              value={form.emergencyContact}
              onChange={(e) =>
                setForm((s) => ({ ...s, emergencyContact: e.target.value }))
              }
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setEditTenant(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={saving}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
