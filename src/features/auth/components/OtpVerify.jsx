import React, { useState, useEffect } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, MailCheck } from "lucide-react";
import { resendOtp, verifyOtp } from "@/features/auth/api/authApi.js";
import { useToast } from "@/components/feedback/ToastContext.jsx";
import { getErrorMessage } from "@/utils/helpers.js";
import AuthHeader from "@/features/auth/components/AuthHeader.jsx";

const RESEND_SECONDS = 60;

export default function OtpVerify() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const email = state?.email;
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(state?.resendHint ? 0 : RESEND_SECONDS);
  const [resending, setResending] = useState(false);
  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = setTimeout(() => setCooldown((val) => val - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);
  if (!email) return <Navigate to="/signup" replace />;
  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanOtp = otp.trim();
    if (!cleanOtp) {
      setError("Verification code is required");
      return;
    }
    if (cleanOtp.length !== 4) {
      setError("Please enter all 4 digits");
      return;
    }

    setIsSubmitting(true);
    setError("");
    try {
      const data = await verifyOtp({ email, otp: cleanOtp });
      toast.success(data.message || "Email verified successfully!", "Success");
      navigate("/signin", { replace: true, state: { email } });
    } catch (err) {
      setError(getErrorMessage(err, "Verification failed"));
      toast.error(getErrorMessage(err, "Verification failed"), "Error");
    } finally {
      setIsSubmitting(false);
    }
  };
  const resend = async () => {
    setResending(true);
    try {
      const data = await resendOtp({ email });
      toast.success(data.message || "Code resent to your email", "Sent");
      setCooldown(RESEND_SECONDS);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to resend code"), "Error");
    } finally {
      setResending(false);
    }
  };
  return (
    <section className="space-y-6" aria-label="Verify email">
      <section className="text-center sm:text-left" aria-label="Verification instructions">
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#C59B27]/10 text-[#C59B27] ring-1 ring-[#D4AF37]/30">
          <MailCheck className="h-6 w-6" />
        </div>
        <AuthHeader
          title="Verify your email"
          subtitle={<>We sent a 4-digit code to <span className="font-semibold text-[#141413] dark:text-[#F5F0E6]">{email}</span>.</>}
        />
      </section>
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label
            htmlFor="otp"
            className="block text-xs font-semibold uppercase tracking-wider text-[#5C5549] dark:text-[#B8B2A6] mb-1.5"
          >
            Verification code
          </label>
          <input
            id="otp"
            name="otp"
            type="text"
            inputMode="numeric"
            maxLength={4}
            value={otp}
            onChange={(e) => {
              setOtp(e.target.value.replace(/\D/g, ""));
              if (error) setError("");
            }}
            placeholder="• • • •"
            className={`w-full rounded-xl border bg-white dark:bg-[#0B0D11] py-3 text-center font-display text-2xl font-bold tracking-[0.5em] text-[#141413] dark:text-[#F5F0E6] outline-none transition focus:ring-1 ${
              error
                ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500"
                : "border-[#E5DEC9] dark:border-[#252C3D] focus:border-[#C59B27] focus:ring-[#C59B27]"
            }`}
          />
          {error && <p className="mt-1 text-center text-xs text-rose-500">{error}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting || otp.length !== 4}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D4AF37] py-3 px-4 text-sm font-semibold text-[#141413] shadow-md transition-all hover:brightness-105 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Verifying...</span>
            </>
          ) : (
            <span>Verify Email</span>
          )}
        </button>
      </form>
      <section className="flex items-center justify-between pt-2 text-xs" aria-label="Verification options">
        <button
          type="button"
          onClick={resend}
          disabled={cooldown > 0 || resending}
          className="font-semibold text-[#C59B27] dark:text-[#D4AF37] hover:underline disabled:opacity-40 disabled:no-underline"
        >
          {resending ? "Sending..." : cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
        </button>
        <Link
          to="/signin"
          className="inline-flex items-center gap-1 font-medium text-[#6E675F] dark:text-[#9A9488] hover:text-[#141413] dark:hover:text-[#F5F0E6]"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
        </Link>
      </section>
    </section>
  );
}
