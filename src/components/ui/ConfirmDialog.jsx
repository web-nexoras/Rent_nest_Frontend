import { ShieldAlert } from "lucide-react";
import Modal from "./Modal.jsx";
import Button from "./Button.jsx";

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message,
  confirmLabel = "Confirm",
  variant = "danger",
  loading = false,
}) {
  return (
    <Modal
      open={open}
      onClose={loading ? undefined : onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant={variant} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-3.5">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ring-1 ${
            variant === "danger"
              ? "bg-rose-500/10 text-rose-600 ring-rose-500/20"
              : "bg-brand-500/10 text-brand-600 ring-brand-500/20"
          }`}
        >
          <ShieldAlert className="h-5 w-5" />
        </div>
        <p className="pt-0.5 text-sm leading-relaxed text-navy-600">{message}</p>
      </div>
    </Modal>
  );
}
