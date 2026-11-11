import React from "react";
import { Modal } from "@/components/common/Modal.jsx";
import { Button } from "@/components/common/Button.jsx";
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
          placeholder="e.g. Tanvir Ahmed"
          value={form.fullName}
          onChange={(e) => setForm((s) => ({ ...s, fullName: e.target.value }))}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Email Address"
            type="email"
            required
            placeholder="tanvir@example.com"
            value={form.email}
            onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
          />
          <Input
            label="Mobile Number (BD)"
            required
            placeholder="017XXXXXXXX"
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
            placeholder={isEdit ? "Leave blank to keep unchanged" : "Min 6 characters"}
            value={form.password}
            onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
          />
          <Input
            label="National ID / Passport"
            placeholder="NID or Passport number"
            value={form.nationalId}
            onChange={(e) => setForm((s) => ({ ...s, nationalId: e.target.value }))}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Occupation / Profession"
            placeholder="e.g. Software Engineer"
            value={form.occupation}
            onChange={(e) => setForm((s) => ({ ...s, occupation: e.target.value }))}
          />
          <Input
            label="Emergency Contact / NID Address"
            placeholder="e.g. Road 12, Banani, Dhaka"
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

        <div className="flex items-center justify-end gap-2 pt-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={saving}
          >
            {isEdit ? "Save Changes" : "Onboard Resident"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default TenantFormModal;
