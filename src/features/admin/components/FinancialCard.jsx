import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, CreditCard, DollarSign } from "lucide-react";
import { formatCurrency, formatMonthLabel } from "@/utils/helpers.js";

// Signature Dark Obsidian Financial Overview Card
export function FinancialCard({
  currentMonth,
  monthlyCollected = 0,
  expectedMonthlyRent = 0,
  collectionRate = 0,
}) {
  return (
    <div className="obsidian-card p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium tracking-wide text-[#B8B2A6]">
            Financial Overview
          </span>
          <span className="rounded-full bg-[#C59B27]/20 px-2.5 py-0.5 text-[10px] font-semibold text-[#D4AF37]">
            {formatMonthLabel(currentMonth)}
          </span>
        </div>

        <p className="mt-3 font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#D4AF37]">
          {formatCurrency(monthlyCollected)}
        </p>
        <p className="mt-1 text-xs text-[#9A9488]">
          Cumulative verified treasury across all active suites
        </p>

        <div className="mt-6 divide-y divide-[#26231D]">
          <Link
            to="/admin/payments"
            className="flex items-center justify-between py-3.5 group"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1F1C16] border border-[#C59B27]/40 text-[#D4AF37]">
                <DollarSign className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">
                  {formatCurrency(monthlyCollected)}
                </p>
                <p className="text-xs text-[#8C8479]">Current Month Collected</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-[#8C8479] group-hover:translate-x-1 group-hover:text-[#D4AF37] transition-all" />
          </Link>

          <Link
            to="/admin/reports"
            className="flex items-center justify-between py-3.5 group"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1F1C16] border border-[#C59B27]/40 text-[#D4AF37]">
                <CreditCard className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">
                  {formatCurrency(expectedMonthlyRent)}
                </p>
                <p className="text-xs text-[#8C8479]">Expected Monthly Rent Roll</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-[#8C8479] group-hover:translate-x-1 group-hover:text-[#D4AF37] transition-all" />
          </Link>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-[#26231D] flex items-center justify-between text-xs">
        <span className="text-[#9A9488]">Collection Efficiency</span>
        <span className="font-bold text-[#D4AF37]">{collectionRate}%</span>
      </div>
    </div>
  );
}

export default FinancialCard;
