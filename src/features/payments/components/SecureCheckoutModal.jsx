import React from "react";
import { CreditCard, LockKeyhole, ShieldCheck } from "lucide-react";
import { Modal } from "@/components/common/Modal.jsx";
import { Button } from "@/components/common/Button.jsx";
import { formatCurrency, formatMonthLabel } from "@/utils/helpers.js";

export default function SecureCheckoutModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  unit,
  amount,
  month,
}) {
  const handleClose = () => {
    if (!isLoading) onClose?.();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Review your rent payment"
      description="Confirm the details before continuing to secure checkout."
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} disabled={isLoading}>
            Go back
          </Button>
          <Button
            variant="gold"
            leftIcon={LockKeyhole}
            isLoading={isLoading}
            onClick={onConfirm}
          >
            Continue securely
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="rounded-2xl border border-[#E5DEC9] bg-gradient-to-br from-[#FBF7EA] via-white to-[#F6F2E9] p-4 dark:border-[#3A3427] dark:from-[#1C2230] dark:via-[#131722] dark:to-[#191D27]">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#141413] text-[#D4AF37] dark:bg-[#D4AF37] dark:text-[#0B0D11]">
              <CreditCard className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#8C8479] dark:text-[#9A9488]">Secure rent checkout</p>
              <p className="truncate font-display text-lg font-bold text-[#141413] dark:text-[#F5F0E6]">{formatCurrency(amount)}</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[#E9E0CE] pt-3 dark:border-[#2A3042]">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8C8479] dark:text-[#9A9488]">Suite</p>
              <p className="mt-0.5 text-sm font-semibold text-[#141413] dark:text-[#F5F0E6]">{unit?.unitNumber || "—"}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8C8479] dark:text-[#9A9488]">Billing month</p>
              <p className="mt-0.5 text-sm font-semibold text-[#141413] dark:text-[#F5F0E6]">{formatMonthLabel(month)}</p>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-2.5 rounded-xl bg-emerald-50 px-3.5 py-3 text-xs leading-relaxed text-emerald-800 dark:bg-emerald-950/35 dark:text-emerald-200">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
          <p>Your rent is fixed to the assigned suite. Card and account details are entered only on the secure payment provider checkout.</p>
        </div>
        <p className="text-center text-[11px] text-[#8C8479] dark:text-[#9A9488]">Payment processing is provided securely by SSLCommerz.</p>
      </div>
    </Modal>
  );
}
