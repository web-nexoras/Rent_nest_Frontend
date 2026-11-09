import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { Building2, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import Logo from "./Logo.jsx";
import { PageLoader } from "../common/PageLoader.jsx";

const HIGHLIGHTS = [
  {
    icon: Building2,
    title: "Unified Unit & Lease Control",
    desc: "Manage occupancy, tenant approvals, and unit assignments from one command center.",
  },
  {
    icon: CheckCircle2,
    title: "Verified Rent Ledger & Receipts",
    desc: "Instant payment verification with printable receipts and monthly revenue analytics.",
  },
  {
    icon: ShieldCheck,
    title: "Role-Based Security",
    desc: "HTTP-only session cookies, OTP verification, and dedicated Admin & Tenant workspaces.",
  },
];

export default function AuthLayout() {
  return (
    <div className="grid min-h-full bg-surface lg:grid-cols-12">
      {/* Left showcase panel */}
      <div className="relative hidden overflow-hidden bg-navy-950 p-12 text-white lg:col-span-6 lg:flex lg:flex-col lg:justify-between xl:col-span-7">
        {/* Ambient radial glows & subtle grid */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-[28rem] w-[28rem] rounded-full bg-brand-600/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 -left-20 h-[24rem] w-[24rem] rounded-full bg-indigo-500/15 blur-3xl" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <Logo light className="relative z-10" />

        <div className="relative z-10 my-auto max-w-xl py-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-brand-300 backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Modern Property Operations Platform</span>
          </div>
          <h2 className="mt-5 font-display text-4xl font-extrabold leading-[1.15] tracking-tight text-white xl:text-5xl">
            Property management,{" "}
            <span className="bg-gradient-to-r from-brand-300 via-indigo-200 to-white bg-clip-text text-transparent">
              engineered for clarity.
            </span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-navy-300">
            Streamline tenant onboarding, rent collection, maintenance workflows, and community notices in one refined workspace.
          </p>

          <div className="mt-8 space-y-3.5">
            {HIGHLIGHTS.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="flex items-start gap-3.5 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 backdrop-blur-sm"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-500/20 text-brand-300 ring-1 ring-brand-400/30">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-navy-300">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-xs text-navy-400">
          <span>© {new Date().getFullYear()} Rent Nest Property Suite</span>
          <span>Enterprise-grade security</span>
        </div>
      </div>

      {/* Right form container */}
      <div className="flex items-center justify-center px-4 py-10 sm:px-8 lg:col-span-6 xl:col-span-5">
        <div className="w-full max-w-md">
          <Logo className="mb-8 lg:hidden" />
          <div className="card p-6 sm:p-8">
            <Suspense fallback={<PageLoader />}>
              <Outlet />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
