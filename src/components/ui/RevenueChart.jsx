import { useState } from "react";
import { formatMoney, formatMonth } from "../../lib/utils.js";

/** Lightweight SVG/CSS bar chart (no chart library). data: [{ month, total, count }] */
export default function RevenueChart({ data = [] }) {
  const [active, setActive] = useState(null);
  const max = Math.max(...data.map((item) => item.total), 1);

  if (!data.length) return null;

  return (
    <div>
      <div className="flex h-56 items-end gap-2 sm:gap-4" role="img" aria-label="Verified revenue by month">
        {data.map((item, index) => {
          const height = Math.max((item.total / max) * 100, 3);
          const isActive = active === index;
          return (
            <div
              key={item.month}
              className="group relative flex h-full flex-1 flex-col items-center justify-end"
              onMouseEnter={() => setActive(index)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(index)}
              onBlur={() => setActive(null)}
              tabIndex={0}
            >
              {isActive && (
                <div className="absolute -top-2 z-10 -translate-y-full whitespace-nowrap rounded-lg bg-navy-900 px-2.5 py-1.5 text-xs text-white shadow-pop">
                  <p className="font-semibold">{formatMoney(item.total)}</p>
                  <p className="text-navy-300">
                    {item.count} payment{item.count === 1 ? "" : "s"}
                  </p>
                </div>
              )}
              <div
                className="w-full max-w-[3.5rem] origin-bottom rounded-t-lg bg-gradient-to-t from-brand-600 to-brand-300 transition-all duration-700 ease-out group-hover:from-navy-800 group-hover:to-navy-500"
                style={{ height: `${height}%` }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex gap-2 sm:gap-4">
        {data.map((item) => (
          <p key={item.month} className="flex-1 text-center text-xs text-navy-400">
            {formatMonth(item.month)}
          </p>
        ))}
      </div>
    </div>
  );
}
