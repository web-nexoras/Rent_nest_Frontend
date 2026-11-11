import React from "react";
import { CreditCard, Lock } from "lucide-react";
import { Button } from "@/components/common/Button.jsx";
import { formatCurrency, formatMonthLabel } from "@/utils/helpers.js";

export default function TenantCheckoutCard({
  unit,
  lockedRentAmount,
  paymentLocked,
  selectedRecord,
  selectedMonth,
  onMonthChange,
  minMonth,
  isPaying,
  onCheckout,
}) {
  return (
    <section className="obsidian-card p-6 sm:p-7" aria-label="Online rent checkout">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#C59B27]/40 bg-[#C59B27]/15 px-3 py-1 text-xs font-semibold text-[#D4AF37]">
            <Lock className="h-3.5 w-3.5" />
            Fixed Rent Lock · Suite {unit.unitNumber}
          </div>
          <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
            Instant Online Rent Settlement (SSLCommerz)
          </h2>
          <p className="max-w-2xl text-xs text-[#B8B2A6] sm:text-sm">
            Pay securely with Visa, Mastercard, bKash, Nagad, Rocket, or Internet Banking.
            The rent amount is strictly locked to your lease rate of{" "}
            <strong className="text-[#D4AF37]">{formatCurrency(lockedRentAmount)}</strong>.
          </p>
          {paymentLocked && (
            <p className="text-xs font-semibold text-[#D4AF37]">
              {selectedRecord?.status === "verified"
                ? `${formatMonthLabel(selectedMonth)} rent is already paid & verified.`
                : `${formatMonthLabel(selectedMonth)} payment is awaiting admin verification.`}
            </p>
          )}
        </div>

        <section className="flex flex-col items-stretch gap-3 rounded-2xl border border-[#2A3042] bg-[#181B24] p-4 sm:flex-row sm:items-end" aria-label="Payment details">
          <div className="w-full sm:w-auto">
            <label htmlFor="billing-month" className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[#9A9488]">
              Billing Month
            </label>
            <input
              id="billing-month"
              type="month"
              min={minMonth}
              value={selectedMonth}
              onChange={(event) => onMonthChange(event.target.value)}
              className="h-10 w-full rounded-xl border border-[#2F364A] bg-[#0E1117] px-3 text-xs font-semibold text-white focus:border-[#D4AF37] focus:outline-none sm:w-auto"
            />
          </div>
          <div className="w-full sm:w-auto">
            <label htmlFor="locked-rent" className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[#9A9488]">
              Locked Rent (Read-Only)
            </label>
            <input
              id="locked-rent"
              type="text"
              readOnly
              value={formatCurrency(lockedRentAmount)}
              className="h-10 w-full cursor-not-allowed rounded-xl border border-[#2F364A] bg-[#0E1117]/80 px-3 text-xs font-bold text-[#D4AF37] sm:w-36"
            />
          </div>
          <Button
            variant="gold"
            size="md"
            leftIcon={CreditCard}
            isLoading={isPaying}
            disabled={paymentLocked}
            onClick={onCheckout}
          >
            Pay with SSLCommerz
          </Button>
        </section>
      </div>
    </section>
  );
}
