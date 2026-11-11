import React from "react";
import { Modal } from "@/components/common/Modal.jsx";
import { Input, Select } from "@/components/common/Input.jsx";
import { formatCurrency } from "@/utils/helpers.js";

// Modal for adding a new resident or editing an existing one
export function TenantFormModal({
  isOpen,
  onClose,
  isEdit = false,
  form,
  setForm,
  onSubmit,
  saving = false,
  vacantUnits = [],
  editTenant = null,
}) {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        isEdit
          ? `Edit Resident Dossier · ${editTenant?.fullName || ""}`
          : "Onboard New Resident & Assign Suite"
      }
      description={
        isEdit
          ? "Update resident credentials, NID records, or transfer to another vacant flat."
          : "Creates a pre-verified resident account and optionally assigns them to a vacant suite."
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
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
            label={
              isEdit
                ? "New Password (Optional)"
                : "Initial Password (6+ Chars)"
            }
            type="password"
            required={!isEdit}
            value={form.password}
            onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
          />
          <Input
            label="National ID / Passport"
            value={form.nationalId}
            onChange={(e) => setForm((s) => ({ ...s, nationalId: e.target.value }))}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Occupation / Profession"
            value={form.occupation}
            onChange={(e) => setForm((s) => ({ ...s, occupation: e.target.value }))}
          />
          <Input
            label="Emergency Contact / NID Address"
            value={form.address}
            onChange={(e) => setForm((s) => ({ ...s, address: e.target.value }))}
          />
        </div>

        <Select
          label="Assign Vacant Suite (Optional)"
          value={form.unitId}
          onChange={(e) => setForm((s) => ({ ...s, unitId: e.target.value }))}
        >
          <option value="">-- Leave Unassigned for Now --</option>
          {isEdit && editTenant?.assignedUnit && (
            <option value={editTenant.assignedUnit._id}>
              Current: Suite {editTenant.assignedUnit.unitNumber} · Floor{" "}
              {editTenant.assignedUnit.floor} (
              {formatCurrency(editTenant.assignedUnit.rentAmount)}/mo)
            </option>
          )}
          {vacantUnits.map((u) => (
            <option key={u._id} value={u._id}>
              Suite {u.unitNumber} · Floor {u.floor} · {formatCurrency(u.rentAmount)}/mo
            </option>
          ))}
        </Select>

        <div className="flex flex-col-reverse gap-2 pt-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            className="min-h-10 w-full rounded-xl border border-[#E5DEC9] bg-white px-4 py-2 text-sm font-semibold text-[#141413] hover:bg-[#F6F2E9] disabled:opacity-50 sm:w-auto dark:border-[#252C3D] dark:bg-[#131722] dark:text-[#F5F0E6]"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="min-h-10 w-full rounded-xl bg-[#141413] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2A2927] disabled:opacity-50 sm:w-auto dark:bg-[#D4AF37] dark:text-[#0B0D11]"
            disabled={saving}
          >
            {isEdit ? "Save Changes" : "Onboard Resident"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default TenantFormModal;
