import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { getDefaultUnitImage } from "@/features/units/unitImages.js";

const WINGS = [
  {
    title: "Floors A – D · Podium Suites",
    code: "A-101 to D-404 · 1,350–1,450 Sq.Ft",
    img: getDefaultUnitImage("A-101"),
    tag: "Executive 3BHK",
  },
  {
    title: "Floors E – H · Skyline Residences",
    code: "E-501 to H-804 · 1,650–1,750 Sq.Ft",
    img: getDefaultUnitImage("E-502"),
    tag: "Panoramic 3BHK",
  },
  {
    title: "Floors I – L · Royal Penthouses",
    code: "I-901 to L-1204 · 1,900–2,000 Sq.Ft",
    img: getDefaultUnitImage("I-903"),
    tag: "4BHK Sky Villa",
  },
];

// Architectural Property Showcase Cards
export function ShowcaseWings() {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
      {WINGS.map((wing) => (
        <Link
          key={wing.title}
          to="/admin/units"
          className="surface-card-hover block overflow-hidden p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C59B27]"
        >
          <div className="relative h-44 w-full overflow-hidden rounded-xl">
            <img
              src={wing.img}
              alt={wing.title}
              className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
            />
            <span className="absolute left-3 top-3 rounded-full bg-[#121212]/85 px-3 py-1 text-[11px] font-semibold text-[#D4AF37] backdrop-blur-xs">
              {wing.tag}
            </span>
          </div>
          <div className="flex items-center justify-between px-1 pb-1 pt-3">
            <div className="min-w-0">
              <h3 className="font-display text-base font-bold text-[#141413] dark:text-[#F5F0E6]">
                {wing.title}
              </h3>
              <p className="text-xs text-[#7A7267] dark:text-[#9A9488]">{wing.code}</p>
            </div>
            <ArrowUpRight className="ml-2 h-4 w-4 shrink-0 text-[#C59B27]" />
          </div>
        </Link>
      ))}
    </div>
  );
}

export default ShowcaseWings;
