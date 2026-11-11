import React from "react";
import { Modal } from "@/components/common/Modal.jsx";
import { Button } from "@/components/common/Button.jsx";
import { Input, Select } from "@/components/common/Input.jsx";
import { formatCurrency } from "@/utils/helpers.js";

export function AssignTenantModal({
  unit,
  onClose,
  assignMode,
  setAssignMode,
  tenants = [],
  selectedTenantId,
  setSelectedTenantId,
  newTenantForm,
  setNewTenantForm,
  onSubmit,
  assigning = false,
}) {
  if (!unit) return null;

  return (
    <Modal
      isOpen={Boolean(unit)}
      onClose={onClose}
      title={`Assign Resident to Suite ${unit.unitNumber}`}
      description={`Fixed Rent: ${formatCurrency(unit.rentAmount || 0)}/month`}
    >
      <form onSubmit={onSubmit} className="space-y-4">
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
                  setNewTenantForm((s) => ({
                    ...s,
                    nationalId: e.target.value,
                  }))
                }
              />
            </div>
          </div>
        )}

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={assigning}>
            Confirm Assignment
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default AssignTenantModal;
