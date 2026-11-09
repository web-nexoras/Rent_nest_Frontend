import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import Logo from "./Logo.jsx";
import { PageLoader } from "../common/PageLoader.jsx";

export default function AuthLayout() {
  return (
    <div className="grid min-h-full lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-navy-900 via-navy-900 to-navy-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-accent-500/10 blur-3xl" />
        <Logo light className="relative" />
        <div className="relative max-w-md">
          <h2 className="text-4xl font-bold leading-tight tracking-tight">
            Rent management, made calm.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-navy-300">
            Units, tenants, payments, notices and maintenance — all in one elegant workspace.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-navy-200">
            {["Approve tenants and assign units", "Verify rent payments and receipts", "Publish notices and track maintenance"].map(
              (item) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent-500" />
                  {item}
                </li>
              ),
            )}
          </ul>
        </div>
        <p className="relative text-xs text-navy-400">© {new Date().getFullYear()} Rent Nest</p>
      </div>

      <div className="flex items-center justify-center px-5 py-10 sm:px-10">
        <div className="w-full max-w-md">
          <Logo className="mb-8 lg:hidden" />
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
