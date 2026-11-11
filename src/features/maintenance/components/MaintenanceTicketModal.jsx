import React from "react";
import { Modal } from "@/components/common/Modal.jsx";
import { Button } from "@/components/common/Button.jsx";
import { Input, Select, Textarea } from "@/components/common/Input.jsx";

const CATEGORIES = [
  { value: "plumbing", label: "Plumbing & Sanitary" },
  { value: "electrical", label: "Electrical & Lighting" },
  { value: "appliance", label: "HVAC & Appliances" },
  { value: "structural", label: "Carpentry & Structural" },
  { value: "other", label: "Other Vault Service" },
];

const PRIORITIES = [
  { value: "low", label: "Low Priority" },
  { value: "medium", label: "Standard / Medium" },
  { value: "high", label: "High Priority" },
  { value: "emergency", label: "Urgent Emergency" },
];

export function MaintenanceTicketModal({
  isOpen,
  onClose,
  unit,
  form,
  setForm,
  onSubmit,
  submitting = false,
}) {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Submit Maintenance Ticket"
      description="Report an issue with your suite. The estate facilities team will respond promptly."
    >
      <form onSubmit={onSubmit} className="space-y-4">
        {unit && (
          <Input
            label="Assigned Suite"
            value={`Suite ${unit.unitNumber} (Floor ${unit.floor})`}
            readOnly
            disabled
          />
        )}

        <Input
          label="Issue Title / Summary"
          placeholder="e.g. Master bathroom water heater leaking"
          required
          value={form.title}
          onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select
            label="Category"
            value={form.category}
            onChange={(e) => setForm((s) => ({ ...s, category: e.target.value }))}
            options={CATEGORIES}
          />
          <Select
            label="Urgency"
            value={form.priority}
            onChange={(e) => setForm((s) => ({ ...s, priority: e.target.value }))}
            options={PRIORITIES}
          />
        </div>

        <Textarea
          label="Detailed Description"
          placeholder="Describe the issue in detail, including when it started..."
          rows={3}
          required
          value={form.description}
          onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
        />

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={submitting}>
            Submit Ticket
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default MaintenanceTicketModal;
