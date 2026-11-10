import React from "react";
import { Outlet } from "react-router-dom";
import { Logo } from "./Logo";
import { CuteThemeToggle } from "./Topbar";

// Clean & Minimalist Luxury Auth Layout
export function AuthLayout() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#FAF7F2] dark:bg-[#0B0D11] text-[#141413] dark:text-[#F5F0E6] transition-colors duration-300 flex flex-col justify-between">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute -left-28 -top-28 h-96 w-96 rounded-full bg-[#C59B27]/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-24 h-[28rem] w-[28rem] rounded-full bg-[#D4AF37]/10 blur-3xl" />

      {/* Header */}
      <header className="relative z-20 mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6">
        <Logo to="/signin" />
        <CuteThemeToggle />
      </header>

      {/* Center Auth Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="rounded-3xl border border-[#E5DEC9] dark:border-[#252C3D] bg-white dark:bg-[#131722] p-7 sm:p-9 shadow-card">
            <Outlet />
          </div>
        </div>
      </main>

      {/* Clean Footer */}
      <footer className="relative z-10 py-4 text-center text-xs text-[#8C8479]">
        &copy; {new Date().getFullYear()} Rent Nest Luxury Estates
      </footer>
    </div>
  );
}
