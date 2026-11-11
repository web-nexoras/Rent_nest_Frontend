import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, CreditCard, DollarSign } from "lucide-react";
import { formatCurrency, formatMonthLabel } from "@/utils/helpers.js";

// Light financial summary card
export function FinancialCard({
  currentMonth,
  monthlyCollected = 0,
  expectedMonthlyRent = 0,
  collectionRate = 0,
}) {
  return (
    <div className="flex flex-col justify-between rounded-3xl border border-[#EAE1D0] bg-gradient-to-br from-white via-[#FFFEFB] to-[#F8F5EE] p-5 shadow-sm dark:border-[#252C3D] dark:from-[#171C27] dark:via-[#131722] dark:to-[#191F2B] sm:p-6">
      <div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wide text-[#6E675F] dark:text-[#B8B2A6]">
            Financial Overview
          </span>
          <span className="rounded-full bg-[#F6F2E9] px-2.5 py-0.5 text-[10px] font-semibold text-[#8F6B14] dark:bg-[#C59B27]/15 dark:text-[#D4AF37]">
            {formatMonthLabel(currentMonth)}
          </span>
        </div>

        <p className="mt-3 font-display text-3xl font-bold tracking-tight text-[#8F6B14] dark:text-[#D4AF37] sm:text-4xl">
          {formatCurrency(monthlyCollected)}
        </p>
        <p className="mt-1 text-xs text-[#7A7267] dark:text-[#9A9488]">
          Cumulative verified treasury across all active suites
        </p>

        <div className="mt-6 divide-y divide-[#EAE1D0] dark:divide-[#252C3D]">
          <Link
            to="/admin/payments"
            className="flex items-center justify-between py-3.5 group"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E5DEC9] bg-white text-[#9A7418] dark:border-[#C59B27]/30 dark:bg-[#1C2230] dark:text-[#D4AF37]">
                <DollarSign className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#141413] dark:text-white">
                  {formatCurrency(monthlyCollected)}
                </p>
                <p className="text-xs text-[#7A7267] dark:text-[#9A9488]">Current Month Collected</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-[#8C8479] transition-all group-hover:translate-x-1 group-hover:text-[#9A7418] dark:group-hover:text-[#D4AF37]" />
          </Link>

          <Link
            to="/admin/reports"
            className="flex items-center justify-between py-3.5 group"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E5DEC9] bg-white text-[#9A7418] dark:border-[#C59B27]/30 dark:bg-[#1C2230] dark:text-[#D4AF37]">
                <CreditCard className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#141413] dark:text-white">
                  {formatCurrency(expectedMonthlyRent)}
                </p>
                <p className="text-xs text-[#7A7267] dark:text-[#9A9488]">Expected Monthly Rent Roll</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-[#8C8479] transition-all group-hover:translate-x-1 group-hover:text-[#9A7418] dark:group-hover:text-[#D4AF37]" />
          </Link>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-[#EAE1D0] pt-4 text-xs dark:border-[#252C3D]">
        <span className="text-[#7A7267] dark:text-[#9A9488]">Collection Efficiency</span>
        <span className="font-bold text-[#8F6B14] dark:text-[#D4AF37]">{collectionRate}%</span>
      </div>
    </div>
  );
}

export default FinancialCard;
