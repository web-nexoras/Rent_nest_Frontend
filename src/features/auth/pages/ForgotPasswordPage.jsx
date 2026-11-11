import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2, Mail, Send } from "lucide-react";
import { authApi } from "../../../api/auth/authApi";
import { useToast } from "../../../context/ToastContext";
import { getErrorMessage } from "../../../lib/utils";

export default function ForgotPasswordPage() {
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError("Email address is required");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError("Enter a valid email address");
      return;
    }

    setIsSubmitting(true);
    setError("");
    try {
      await authApi.forgotPassword({ email: cleanEmail });
      setSent(true);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to send reset link"), "Error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#C59B27]/10 text-[#C59B27] ring-1 ring-[#D4AF37]/30">
          <Send className="h-6 w-6" />
        </div>
        <div>
          <h2 className="font-display text-2xl font-bold text-[#141413] dark:text-[#F5F0E6]">
            Check your inbox
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-[#6E675F] dark:text-[#9A9488]">
            If an account exists for <span className="font-semibold text-[#141413] dark:text-[#F5F0E6]">{email}</span>,
            we have sent a password reset link. It expires in 15 minutes.
          </p>
        </div>
        <Link
          to="/signin"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#C59B27] dark:text-[#D4AF37] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center sm:text-left">
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#141413] dark:text-[#F5F0E6]">
          Forgot password?
        </h2>
        <p className="mt-1.5 text-xs text-[#6E675F] dark:text-[#9A9488]">
          Enter your email and we'll send you a link to reset your password.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label
            htmlFor="email"
            className="block text-xs font-semibold uppercase tracking-wider text-[#5C5549] dark:text-[#B8B2A6] mb-1.5"
          >
            Email address
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#8C8479]">
              <Mail className="h-4 w-4" />
            </span>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError("");
              }}
              placeholder="Enter registered email"
              className={`w-full rounded-xl border bg-white dark:bg-[#0B0D11] py-2.5 pl-10 pr-4 text-sm text-[#141413] dark:text-[#F5F0E6] placeholder-[#8C8479] outline-none transition focus:ring-1 ${
                error
                  ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500"
                  : "border-[#E5DEC9] dark:border-[#252C3D] focus:border-[#C59B27] focus:ring-[#C59B27]"
              }`}
            />
          </div>
          {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D4AF37] py-3 px-4 text-sm font-semibold text-[#141413] shadow-md transition-all hover:brightness-105 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Sending link...</span>
              </>
            ) : (
              <span>Send Reset Link</span>
            )}
          </button>
        </div>
      </form>

      <div className="border-t border-[#EFE9DC] dark:border-[#1E2433] pt-4 text-center">
        <Link
          to="/signin"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6E675F] dark:text-[#9A9488] hover:text-[#141413] dark:hover:text-[#F5F0E6]"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
        </Link>
      </div>
    </div>
  );
}
