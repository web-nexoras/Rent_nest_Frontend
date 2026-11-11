import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

const WINGS = [
  {
    title: "Floors A – D · Podium Suites",
    code: "A-101 to D-404 · 1,350–1,450 Sq.Ft",
    img: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=900&q=80",
    tag: "Executive 3BHK",
  },
  {
    title: "Floors E – H · Skyline Residences",
    code: "E-501 to H-804 · 1,650–1,750 Sq.Ft",
    img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80",
    tag: "Panoramic 3BHK",
  },
  {
    title: "Floors I – L · Royal Penthouses",
    code: "I-901 to L-1204 · 1,900–2,000 Sq.Ft",
    img: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80",
    tag: "4BHK Sky Villa",
  },
];

// Architectural Property Showcase Cards
export function ShowcaseWings() {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
      {WINGS.map((wing) => (
        <div
          key={wing.title}
          onClick={() => navigate("/admin/units")}
          className="surface-card-hover cursor-pointer overflow-hidden p-3"
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
          <div className="px-1 pt-3 pb-1 flex items-center justify-between">
            <div>
              <h3 className="font-display text-base font-bold text-[#141413] dark:text-[#F5F0E6]">
                {wing.title}
              </h3>
              <p className="text-xs text-[#7A7267] dark:text-[#9A9488]">{wing.code}</p>
            </div>
            <ArrowUpRight className="h-4 w-4 text-[#C59B27]" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default ShowcaseWings;
