import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import { Building2, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import { Logo } from "./Logo";
import { CuteThemeToggle } from "./Topbar";

// 3D interactive Auth Layout with perspective mouse-tilt card & floating luxury showcase
export function AuthLayout() {
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({
      rotateX: Number((-y * 8).toFixed(2)),
      rotateY: Number((x * 10).toFixed(2)),
    });
  };

  const handleMouseLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0 });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#FAF7F2] dark:bg-[#0B0D11] text-[#141413] dark:text-[#F5F0E6] transition-colors duration-300 flex flex-col">
      {/* Ambient Floating 3D Gold & Obsidian Orbs */}
      <div className="pointer-events-none absolute -left-28 -top-28 h-96 w-96 rounded-full bg-[#C59B27]/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-24 h-[28rem] w-[28rem] rounded-full bg-[#D4AF37]/12 blur-3xl" />

      {/* Top Header with Royal Crest Logo & Cute Theme Toggle */}
      <header className="relative z-20 mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-5 sm:px-8">
        <Logo to="/login" />
        <CuteThemeToggle />
      </header>

      {/* Main Responsive 2-Column 3D Showcase + Interactive Form Card */}
      <div className="relative z-10 mx-auto flex flex-1 w-full max-w-7xl flex-col lg:flex-row items-center justify-center gap-10 px-4 py-6 sm:px-8">
        {/* Left 3D Architectural Tower Showcase (Desktop) */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="hidden lg:flex lg:w-1/2 flex-col justify-between rounded-3xl bg-[#121212] text-[#FAF7F2] p-10 border border-[#C59B27]/35 shadow-obsidian relative overflow-hidden"
        >
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#C59B27]/20 blur-2xl" />
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#C59B27]/40 bg-[#C59B27]/15 px-3.5 py-1 text-xs font-semibold text-[#D4AF37]">
              <Sparkles className="h-3.5 w-3.5" />
              Tower Vault · 12-Floor Luxury Residence
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold leading-tight text-white">
              Precision Dossier & Automated Lease Treasury.
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-[#C8C2B8]">
              Manage all 48 residential suites (Floors A–L), automated 10th-of-month rent
              compliance, instant SSLCommerz settlements, and downloadable legal tenancy
              agreements in one unified sanctuary.
            </p>
          </div>

          {/* 3D Floating Metric Cards inside Showcase */}
          <div className="my-8 grid grid-cols-2 gap-4">
            <motion.div
              whileHover={{ y: -6, scale: 1.02 }}
              className="rounded-2xl border border-[#2C2820] bg-[#1A1917] p-4 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#A69F91]">Tower Capacity</span>
                <Building2 className="h-4 w-4 text-[#D4AF37]" />
              </div>
              <p className="mt-2 font-display text-2xl font-bold text-[#D4AF37]">
                48 Luxury Flats
              </p>
              <p className="mt-0.5 text-[11px] text-[#8C8479]">Units A-101 through L-1204</p>
            </motion.div>

            <motion.div
              whileHover={{ y: -6, scale: 1.02 }}
              className="rounded-2xl border border-[#2C2820] bg-[#1A1917] p-4 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#A69F91]">Payment Gateway</span>
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
              </div>
              <p className="mt-2 font-display text-2xl font-bold text-white">
                SSLCommerz
              </p>
              <p className="mt-0.5 text-[11px] text-[#8C8479]">Fixed rent lock & PDF receipts</p>
            </motion.div>
          </div>

          <div className="flex flex-wrap items-center gap-4 border-t border-[#26231D] pt-5 text-xs text-[#C8C2B8]">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-[#D4AF37]" />
              Email or Mobile Login
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-[#D4AF37]" />
              Official Lease PDF
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-[#D4AF37]" />
              2-Stage Due Alerts
            </span>
          </div>
        </motion.div>

        {/* Right Interactive 3D Tilt Auth Card */}
        <div
          className="w-full max-w-md lg:w-1/2 perspective-1200"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <motion.div
            animate={{
              rotateX: tilt.rotateX,
              rotateY: tilt.rotateY,
            }}
            transition={{ type: "spring", stiffness: 220, damping: 20, mass: 0.6 }}
            className="preserve-3d relative rounded-3xl border border-[#E5DEC9] dark:border-[#252C3D] bg-white/95 dark:bg-[#131722]/95 p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(20,20,19,0.14)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.65)] backdrop-blur-xl"
          >
            {/* Top Golden Hairline Accent */}
            <div className="absolute inset-x-10 top-0 h-1 rounded-b-full bg-gradient-to-r from-transparent via-[#C59B27] to-transparent" />
            <Outlet />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
