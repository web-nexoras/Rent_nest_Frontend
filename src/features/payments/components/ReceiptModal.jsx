import React from "react";
import { Printer } from "lucide-react";
import { Modal } from "@/components/common/Modal.jsx";
import { Button } from "@/components/common/Button.jsx";
import { Badge } from "@/components/common/Badge.jsx";
import { Logo } from "@/components/layout/Logo.jsx";
import {
  formatCurrency,
  formatDate,
  formatMonthLabel,
} from "@/utils/helpers.js";

const receiptNumber = (payment) =>
  payment?.receiptNumber ||
  (payment?._id ? `RN-${String(payment._id).slice(-6).toUpperCase()}` : "—");

const methodLabel = (payment) =>
  String(payment?.paymentMethod || payment?.method || "").replace(/_/g, " ");

// Printable Official Payment Receipt Modal
export function ReceiptModal({
  isOpen,
  onClose,
  payment,
  unit,
  user,
}) {
  if (!payment) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Official Rent Payment Receipt"
      description="Verified Tower Vault payment voucher"
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="gold"
            leftIcon={Printer}
            onClick={() => window.print()}
          >
            Print / Save PDF Receipt
          </Button>
        </>
      }
    >
      <div
        id="receipt-print"
        className="space-y-5 rounded-2xl border-2 border-[#E5DEC9] bg-[#FAF7F2] p-4 dark:border-[#252C3D] dark:bg-[#0E1117] sm:p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5DEC9] pb-4 dark:border-[#1E2433]">
          <Logo to="/tenant/dashboard" />
          <div className="text-right">
            <p className="text-xs font-bold uppercase tracking-widest text-[#9A7418] dark:text-[#D4AF37]">
              Official Rent Receipt
            </p>
            <p className="text-sm font-bold text-[#141413] dark:text-[#F5F0E6]">
              {receiptNumber(payment)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs sm:gap-4">
          <div>
            <p className="text-[#7A7267]">Resident Name</p>
            <p className="break-words text-sm font-bold text-[#141413] dark:text-[#F5F0E6]">
              {payment.tenant?.name || user?.fullName}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[#7A7267]">Suite & Billing Month</p>
            <p className="break-words text-sm font-bold text-[#141413] dark:text-[#D4AF37]">
              Suite {payment.unit?.unitNumber || unit?.unitNumber} ·{" "}
              {formatMonthLabel(payment.month)}
            </p>
          </div>
          <div>
            <p className="text-[#7A7267]">Payment Method & Reference</p>
            <p className="break-words font-semibold uppercase text-[#141413] dark:text-[#F5F0E6]">
              {methodLabel(payment)}{" "}
              {payment.transactionId ? `(${payment.transactionId})` : ""}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[#7A7267]">Settlement Date</p>
            <p className="font-semibold text-[#141413] dark:text-[#F5F0E6]">
              {formatDate(payment.paidAt || payment.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#121212] p-4 text-white">
          <div>
            <p className="text-xs text-[#B8B2A6]">Total Fixed Rent Settled</p>
            <p className="font-display text-2xl font-bold text-[#D4AF37]">
              {formatCurrency(payment.amount)}
            </p>
          </div>
          <Badge status={payment.status} />
        </div>
      </div>
    </Modal>
  );
}

export default ReceiptModal;
