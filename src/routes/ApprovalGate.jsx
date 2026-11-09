import { Outlet } from "react-router-dom";
import { Clock, ShieldX } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { Card } from "../components/ui/Layout.jsx";
import Button from "../components/ui/Button.jsx";
import { useState } from "react";
import { useToast } from "../context/ToastContext.jsx";

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
    <Card className="mx-auto mt-6 max-w-xl text-center">
      <div
        className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl ${
          rejected ? "bg-red-50 text-red-500" : "bg-accent-100 text-accent-600"
        }`}
      >
        <Icon className="h-8 w-8" />
      </div>
      <h2 className="text-xl font-bold text-navy-900">
        {rejected ? "Your registration was not approved" : "Awaiting admin approval"}
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-navy-500">
        {rejected
          ? "An administrator declined this account. Please contact your property manager for details."
          : "Your email is verified. An administrator needs to approve your account before you can view your unit, pay rent or submit maintenance requests."}
      </p>
      {!rejected && (
        <Button className="mt-6" variant="outline" loading={checking} onClick={check}>
          Check status
        </Button>
      )}
    </Card>
  );
}
