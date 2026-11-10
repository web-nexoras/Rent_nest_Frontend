import React, { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "../../lib/utils.js";
import { Button } from "./Button.jsx";

const sizeClasses = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

export function Modal({
  isOpen,
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
}) {
  const visible = Boolean(isOpen ?? open);

  useEffect(() => {
    if (!visible) return;
    const handleKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [visible, onClose]);

  return (
    <AnimatePresence>
      {visible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/55 backdrop-blur-xs"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={cn(
              "relative z-10 w-full rounded-3xl bg-white dark:bg-[#131722] shadow-2xl border border-[#E6DEC8] dark:border-[#252C3D] overflow-hidden my-8",
              sizeClasses[size] || sizeClasses.md
            )}
          >
            {(title || description) && (
              <div className="flex items-start justify-between gap-4 border-b border-[#EFE9DC] dark:border-[#1E2433] bg-[#FAF7F2] dark:bg-[#0E1117] px-6 py-4">
                <div>
                  {title && (
                    <h3 className="font-display text-lg font-bold text-[#141413] dark:text-[#F5F0E6]">
                      {title}
                    </h3>
                  )}
                  {description && (
                    <p className="mt-0.5 text-xs text-[#7A7267] dark:text-[#9A9488]">
                      {description}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close modal"
                  className="rounded-full p-1.5 text-[#7A7267] hover:bg-[#EAE2D3] dark:hover:bg-[#1C2230] hover:text-[#141413] dark:hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            <div className="px-6 py-5 max-h-[78vh] overflow-y-auto">{children}</div>
            {footer && (
              <div className="flex items-center justify-end gap-2.5 border-t border-[#EFE9DC] dark:border-[#1E2433] bg-[#FAF7F2]/80 dark:bg-[#0E1117]/80 px-6 py-3.5">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function ConfirmModal({
  isOpen,
  open,
  onClose,
  onConfirm,
  title = "Confirm Action",
  description = "Are you sure you want to proceed?",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  isLoading = false,
  loading = false,
}) {
  const busy = isLoading || loading;
  return (
    <Modal
      isOpen={isOpen ?? open}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            {cancelLabel}
          </Button>
          <Button variant={variant} onClick={onConfirm} isLoading={busy}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm text-[#5C5549] dark:text-[#B8B2A6]">
        Please review carefully before continuing.
      </p>
    </Modal>
  );
}

export default Modal;
