import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/utils/index.js";

// Royal Crest RN Monogram with Golden Laurel Wreaths matching the Luxury Ivory & Gold reference
export function Logo({ className = "", stacked = false, to = "/" }) {
  return (
    <Link
      to={to}
      className={cn(
        "group inline-flex items-center focus:outline-none",
        stacked ? "flex-col text-center gap-2" : "gap-3",
        className
      )}
    >
      <div className="relative flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
        <svg
          viewBox="0 0 88 76"
          className={cn(stacked ? "h-16 w-20" : "h-11 w-13")}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Left Golden Laurel Wreath */}
          <path
            d="M25 60C16 53 12 41 14 27C15 20 19 14 24 10"
            stroke="#C59B27"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <ellipse cx="14" cy="44" rx="2.5" ry="5" transform="rotate(-28 14 44)" fill="#C59B27" />
          <ellipse cx="13" cy="34" rx="2.5" ry="5" transform="rotate(-15 13 34)" fill="#D4AF37" />
          <ellipse cx="15" cy="24" rx="2.4" ry="4.8" transform="rotate(8 15 24)" fill="#C59B27" />
          <ellipse cx="20" cy="15" rx="2.2" ry="4.5" transform="rotate(25 20 15)" fill="#D4AF37" />
          <ellipse cx="19" cy="53" rx="2.4" ry="4.8" transform="rotate(-42 19 53)" fill="#D4AF37" />

          {/* Right Golden Laurel Wreath */}
          <path
            d="M63 60C72 53 76 41 74 27C73 20 69 14 64 10"
            stroke="#C59B27"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <ellipse cx="74" cy="44" rx="2.5" ry="5" transform="rotate(28 74 44)" fill="#C59B27" />
          <ellipse cx="75" cy="34" rx="2.5" ry="5" transform="rotate(15 75 34)" fill="#D4AF37" />
          <ellipse cx="73" cy="24" rx="2.4" ry="4.8" transform="rotate(-8 73 24)" fill="#C59B27" />
          <ellipse cx="68" cy="15" rx="2.2" ry="4.5" transform="rotate(-25 68 15)" fill="#D4AF37" />
          <ellipse cx="69" cy="53" rx="2.4" ry="4.8" transform="rotate(42 69 53)" fill="#D4AF37" />

          {/* Crossed Ribbon Stem */}
          <path
            d="M35 63C41 60 47 60 53 63"
            stroke="#C59B27"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Royal Shield Outer Frame */}
          <path
            d="M44 8L64 15V33C64 47.5 55.2 57.8 44 62C32.8 57.8 24 47.5 24 33V15L44 8Z"
            className="fill-[#FAF7F2] dark:fill-[#131722]"
            stroke="#C59B27"
            strokeWidth="2.4"
          />
          {/* Royal Shield Inner Hairline */}
          <path
            d="M44 12L60 17.6V32.5C60 44.3 52.8 53 44 56.8C35.2 53 28 44.3 28 32.5V17.6L44 12Z"
            stroke="#D4AF37"
            strokeWidth="1"
            strokeOpacity="0.65"
          />

          {/* Interlocking RN Serif Monogram */}
          <text
            x="40"
            y="40"
            textAnchor="middle"
            fontFamily="Playfair Display, Georgia, serif"
            fontWeight="700"
            fontSize="20"
            className="fill-[#141413] dark:fill-[#F5F0E6]"
          >
            R
          </text>
          <text
            x="49"
            y="44"
            textAnchor="middle"
            fontFamily="Playfair Display, Georgia, serif"
            fontWeight="700"
            fontSize="18"
            fill="#C59B27"
          >
            N
          </text>
        </svg>
      </div>

      <div className={cn("flex flex-col", stacked ? "items-center" : "items-start")}>
        <span
          className={cn(
            "font-display font-bold tracking-tight text-[#141413] dark:text-[#F5F0E6] leading-none",
            stacked ? "text-2xl" : "text-xl"
          )}
        >
          Rent Nest
        </span>
        <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#9A7B2C] dark:text-[#D4AF37]">
          Luxury Estates
        </span>
      </div>
    </Link>
  );
}
