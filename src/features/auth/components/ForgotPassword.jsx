import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2, Mail } from "lucide-react";
import { forgotPassword } from "@/features/auth/api/authApi.js";
import { useToast } from "@/components/feedback/ToastContext.jsx";
import { getErrorMessage } from "@/utils/helpers.js";
import AuthHeader from "@/features/auth/components/AuthHeader.jsx";
import ForgotPasswordSuccess from "@/features/auth/components/ForgotPasswordSuccess.jsx";

export default function ForgotPassword() {
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleEmailChange = (value) => {
    setEmail(value);
    if (error) setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
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
      await forgotPassword({ email: cleanEmail });
      setSent(true);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to send reset link"), "Error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (sent) return <ForgotPasswordSuccess email={email} />;

  return (
    <section className="space-y-6" aria-labelledby="forgot-password-title">
      <AuthHeader
        id="forgot-password-title"
        title="Forgot password?"
        subtitle="Enter your email and we'll send you a link to reset your password."
      />

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <section aria-label="Email address">
          <label
            htmlFor="email"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#5C5549] dark:text-[#B8B2A6]"
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
              onChange={(event) => handleEmailChange(event.target.value)}
              placeholder="Enter registered email"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "email-error" : undefined}
              className={`w-full rounded-xl border bg-white py-2.5 pl-10 pr-4 text-sm text-[#141413] placeholder-[#8C8479] outline-none transition focus:ring-1 dark:bg-[#0B0D11] dark:text-[#F5F0E6] ${
                error
                  ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500"
                  : "border-[#E5DEC9] focus:border-[#C59B27] focus:ring-[#C59B27] dark:border-[#252C3D]"
              }`}
            />
          </div>
          {error && (
            <p id="email-error" className="mt-1 text-xs text-rose-500">
              {error}
            </p>
          )}
        </section>

        <section className="pt-2" aria-label="Submit reset request">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D4AF37] px-4 py-3 text-sm font-semibold text-[#141413] shadow-md transition-all hover:brightness-105 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
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
        </section>
      </form>

      <section className="border-t border-[#EFE9DC] pt-4 text-center dark:border-[#1E2433]" aria-label="Sign-in navigation">
        <Link
          to="/signin"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6E675F] hover:text-[#141413] dark:text-[#9A9488] dark:hover:text-[#F5F0E6]"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
        </Link>
      </section>
    </section>
  );
}
