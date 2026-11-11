import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";

export default function ForgotPasswordSuccess({ email }) {
  return (
    <section className="space-y-6 text-center" aria-labelledby="reset-email-sent-title">
      <section
        className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#C59B27]/10 text-[#C59B27] ring-1 ring-[#D4AF37]/30"
        aria-hidden="true"
      >
        <Send className="h-6 w-6" />
      </section>

      <section>
        <h2 id="reset-email-sent-title" className="font-display text-2xl font-bold text-[#141413] dark:text-[#F5F0E6]">
          Check your inbox
        </h2>
        <p className="mt-2 text-xs leading-relaxed text-[#6E675F] dark:text-[#9A9488]">
          If an account exists for{" "}
          <span className="font-semibold text-[#141413] dark:text-[#F5F0E6]">{email}</span>,
          we have sent a password reset link. It expires in 15 minutes.
        </p>
      </section>

      <section aria-label="Sign-in navigation">
        <Link
          to="/signin"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#C59B27] hover:underline dark:text-[#D4AF37]"
        >
          <ArrowLeft className="h-4 w-4" /> Back to sign in
        </Link>
      </section>
    </section>
  );
}
