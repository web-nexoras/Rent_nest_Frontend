import React from "react";
import { Modal } from "@/components/common/Modal.jsx";
import { Button } from "@/components/common/Button.jsx";
import { Select } from "@/components/common/Input.jsx";
import { formatCurrency } from "@/utils/helpers.js";

// Modal for approving a resident and optionally assigning a suite
export function ApprovalModal({
  approvalTarget,
  onClose,
  vacantUnits = [],
  approvalUnitId,
  setApprovalUnitId,
  handleApprove,
  saving = false,
}) {
  if (!approvalTarget) return null;

  return (
    <Modal
      isOpen={Boolean(approvalTarget)}
      onClose={onClose}
      title={`Approve Resident · ${approvalTarget.fullName || approvalTarget.name}`}
      description="Approve this resident to grant access. You can assign a suite now or leave them unassigned until one opens up."
    >
      <div className="space-y-4">
        <div className="min-w-0 rounded-2xl border border-[#E5DEC9] dark:border-[#252C3D] bg-[#FAF7F2] dark:bg-[#0B0D11] p-4 text-xs space-y-1.5">
          <p className="font-semibold text-[#141413] dark:text-[#F5F0E6]">
            {approvalTarget.fullName || approvalTarget.name}
          </p>
          <p className="break-all text-[#6E675F] dark:text-[#9A9488]">
            Email: {approvalTarget.email}
          </p>
          <p className="break-words text-[#6E675F] dark:text-[#9A9488]">
            Phone: {approvalTarget.phone || "Not provided"}
          </p>
          {approvalTarget.occupation && (
            <p className="text-[#6E675F] dark:text-[#9A9488]">
              Occupation: {approvalTarget.occupation}
            </p>
          )}
          {approvalTarget.address && (
            <p className="break-words text-[#6E675F] dark:text-[#9A9488]">
              Address: {approvalTarget.address}
            </p>
          )}
        </div>

        <Select
          label="Assign Suite on Approval (Optional)"
          value={approvalUnitId}
          onChange={(e) => setApprovalUnitId(e.target.value)}
        >
          <option value="">-- Approve Without Suite Assignment --</option>
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
            type="button"
            variant="emerald"
            isLoading={saving}
            onClick={handleApprove}
          >
            Confirm Approval
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default ApprovalModal;
