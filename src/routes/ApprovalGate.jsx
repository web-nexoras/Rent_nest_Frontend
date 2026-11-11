import { Outlet } from "react-router-dom";
import { Clock, ShieldX, RefreshCw } from "lucide-react";
import { useAuth } from "@/hooks/useAuth.jsx";
import { Card } from "@/components/common/Layout.jsx";
import { useState } from "react";
import { useToast } from "@/components/feedback/ToastContext.jsx";

/**
 * Backend rule (requireApproved): pending/rejected tenants can sign in and see their
 * profile, but every tenant business route returns 403. Show a status screen instead.
 */
export default function ApprovalGate() {
  const { user, isApproved, refreshProfile } = useAuth();
  const toast = useToast();
  const [checking, setChecking] = useState(false);

  if (isApproved) return <Outlet />;

  const rejected = user?.approvalStatus === "rejected";
  const Icon = rejected ? ShieldX : Clock;

  const check = async () => {
    setChecking(true);
    try {
      const updated = await refreshProfile();
      if (updated.approvalStatus === "approved") toast.success("Your account has been approved!");
      else toast.info("Your account is still awaiting approval.");
    } catch {
      toast.error("Could not check your status. Please try again.");
    } finally {
      setChecking(false);
    }
  };

  return (
    <Card className="mx-auto mt-10 max-w-xl text-center">
      <div
        className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl ring-1 ${
          rejected
            ? "bg-rose-50 text-rose-600 ring-rose-600/20"
            : "bg-amber-50 text-amber-600 ring-amber-600/20"
        }`}
      >
        <Icon className="h-8 w-8" />
      </div>
      <p className="text-[11px] font-bold uppercase tracking-widest text-brand-600">
        {rejected ? "Access Restricted" : "Verification In Progress"}
      </p>
      <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-navy-900">
        {rejected ? "Your registration was not approved" : "Awaiting administrator approval"}
      </h2>
      <p className="mx-auto mt-2.5 max-w-md text-sm leading-relaxed text-navy-500">
        {rejected
          ? "An administrator declined this account. Please contact your property manager for details."
          : "Your email is verified. An administrator needs to approve your account before you can view your unit, pay rent or submit maintenance requests."}
      </p>
      {!rejected && (
        <button
          type="button"
          disabled={checking}
          onClick={check}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D4AF37] px-5 py-2.5 text-sm font-semibold text-[#141413] shadow-md transition hover:brightness-105 active:scale-[0.99] disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${checking ? "animate-spin" : ""}`} /> Refresh approval status
        </button>
      )}
    </Card>
  );
}
