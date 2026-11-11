import React from "react";
import { Modal } from "@/components/common/Modal.jsx";
import { Button } from "@/components/common/Button.jsx";
import { Input, Textarea } from "@/components/common/Input.jsx";

export function UnitFormModal({
  isOpen,
  onClose,
  isEdit = false,
  register,
  handleSubmit,
  onSubmit,
  errors = {},
  isSubmitting = false,
}) {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Suite Configuration" : "Add Luxury Suite to Tower"}
      description="Configure suite number, floor assignment, and fixed monthly rent roll."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Suite Number"
            placeholder="e.g. A-101"
            error={errors.unitNumber?.message}
            {...register("unitNumber")}
          />
          <Input
            label="Floor / Level"
            placeholder="e.g. A (Floor 1) or 3"
            error={errors.floor?.message}
            {...register("floor")}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Bedrooms"
            type="number"
            placeholder="3"
            error={errors.bedrooms?.message}
            {...register("bedrooms")}
          />
          <Input
            label="Area (Sq.Ft)"
            type="number"
            placeholder="1450"
            error={errors.sizeSqft?.message}
            {...register("sizeSqft")}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Fixed Monthly Rent (BDT)"
            type="number"
            placeholder="25000"
            error={errors.rentAmount?.message}
            {...register("rentAmount")}
          />
          <Input
            label="Rent Due Day (1–31)"
            type="number"
            placeholder="10"
            error={errors.rentDueDay?.message}
            {...register("rentDueDay")}
          />
        </div>
        <Textarea
          label="Description / Notes"
          rows={3}
          placeholder="Luxury 3BHK suite with panoramic balcony views..."
          error={errors.description?.message}
          {...register("description")}
        />
        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            {isEdit ? "Save Changes" : "Create Suite"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default UnitFormModal;
