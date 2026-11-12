import React from "react";
import { Modal } from "@/components/common/Modal.jsx";
import { Button } from "@/components/common/Button.jsx";
import { Input, Select } from "@/components/common/Input.jsx";
import { formatCurrency } from "@/utils/helpers.js";

const MANUAL_METHODS = [
  { value: "bkash", label: "bKash Transfer" },
  { value: "nagad", label: "Nagad Transfer" },
  { value: "rocket", label: "Rocket Transfer" },
  { value: "upay", label: "Upay Transfer" },
  { value: "bank_transfer", label: "Bank Transfer / EFT" },
  { value: "cash", label: "Cash at Vault Desk" },
];

// Manual Transfer Modal (With Read-Only Fixed Rent Lock)
export function ManualPaymentModal({
  isOpen,
  onClose,
  unit,
  lockedRentAmount,
  joinMonth,
  form,
  setForm,
  onSubmit,
  isSubmitting = false,
  paymentLocked = false,
}) {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Bank / Mobile Rent Transfer"
      description="Your rent amount is strictly locked to your assigned suite's monthly rate."
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Assigned Suite (Locked)"
            value={unit ? `Suite ${unit.unitNumber}` : ""}
            readOnly
            disabled
          />
          <Input
            label="Fixed Monthly Rent (Locked)"
            value={formatCurrency(lockedRentAmount)}
            readOnly
            disabled
            hint="Fixed rent cannot be edited by tenant"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Billing Month"
            type="month"
            min={joinMonth}
            required
            value={form.month}
            onChange={(e) =>
              setForm((s) => ({ ...s, month: e.target.value }))
            }
          />
          <Select
            label="Payment Channel"
            value={form.method}
            onChange={(e) =>
              setForm((s) => ({ ...s, method: e.target.value }))
            }
            options={MANUAL_METHODS}
          />
        </div>

        <Input
          label={
            form.method === "cash"
              ? "Transaction / Reference ID (optional for cash)"
              : "Transaction / Reference ID"
          }
          placeholder="e.g. 8N7K3P2Q"
          hint={
            form.method === "cash"
              ? undefined
              : "Complete the transfer first, then enter its transaction/reference ID."
          }
          required={form.method !== "cash"}
          value={form.transactionId}
          onChange={(e) =>
            setForm((s) => ({ ...s, transactionId: e.target.value }))
          }
        />

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting} disabled={paymentLocked}>
            Submit Fixed Rent ({formatCurrency(lockedRentAmount)})
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default ManualPaymentModal;
