import React from "react";
import { Download } from "lucide-react";
import { Badge } from "@/components/common/Badge.jsx";
import { Button } from "@/components/common/Button.jsx";
import { formatCurrency, formatDate, formatMonthLabel } from "@/utils/helpers.js";

const receiptNumber = (payment) =>
  payment?.receiptNumber ||
  (payment?._id ? `RN-${String(payment._id).slice(-6).toUpperCase()}` : "—");

const methodLabel = (payment) =>
  String(payment?.paymentMethod || payment?.method || "").replace(/_/g, " ");

export function createTenantPaymentColumns({ unit, onReceipt }) {
  return [
    {
      key: "invoice",
      header: "Invoice & Month",
      render: (row) => (
        <div>
          <p className="font-semibold text-[#141413] dark:text-[#F5F0E6]">
            {formatMonthLabel(row.month)}
          </p>
          <p className="text-xs text-[#7A7267] dark:text-[#9A9488]">
            Ref: {row.transactionId || receiptNumber(row)}
          </p>
        </div>
      ),
    },
    {
      key: "suite",
      header: "Suite",
      render: (row) => (
        <span className="font-semibold text-[#141413] dark:text-[#D4AF37]">
          {row.unit?.unitNumber || unit?.unitNumber || "—"}
        </span>
      ),
    },
    {
      key: "amount",
      header: "Fixed Rent",
      render: (row) => (
        <span className="font-bold text-[#141413] dark:text-[#F5F0E6]">
          {formatCurrency(row.amount)}
        </span>
      ),
    },
    {
      key: "method",
      header: "Gateway / Method",
      render: (row) => (
        <span className="text-xs font-medium uppercase tracking-wider text-[#5C5549] dark:text-[#B8B2A6]">
          {methodLabel(row)}
        </span>
      ),
    },
    { key: "status", header: "Status", render: (row) => <Badge status={row.status} /> },
    {
      key: "date",
      header: "Date",
      render: (row) => (
        <span className="text-xs text-[#7A7267]">{formatDate(row.paidAt || row.createdAt)}</span>
      ),
    },
    {
      key: "receipt",
      header: "Receipt",
      align: "right",
      render: (row) =>
        row.status === "verified" ? (
          <Button variant="secondary" size="xs" leftIcon={Download} onClick={() => onReceipt(row)}>
            Receipt PDF
          </Button>
        ) : (
          <span className="text-xs text-[#7A7267]">
            {row.status === "pending" ? "Awaiting verification" : "—"}
          </span>
        ),
    },
  ];
}
