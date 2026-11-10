import { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MailCheck } from "lucide-react";
import { Input } from "../../../components/ui/Input.jsx";
import Button from "../../../components/ui/Button.jsx";
import { otpSchema } from "../../../lib/schemas.js";
import { authService } from "../../../services/authService.js";
import { useToast } from "../../../context/ToastContext.jsx";
import { getErrorMessage } from "../../../lib/axios.js";

const RESEND_SECONDS = 60;

export default function VerifyOtpPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const email = state?.email;
  const [cooldown, setCooldown] = useState(state?.resendHint ? 0 : RESEND_SECONDS);
  const [resending, setResending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(otpSchema), defaultValues: { otp: "" } });

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  if (!email) return <Navigate to="/signup" replace />;

  const onSubmit = async ({ otp }) => {
    try {
      const data = await authService.verifyOtp({ email, otp });
      toast.success(data.message);
      navigate("/login", { replace: true, state: { email } });
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const resend = async () => {
    setResending(true);
    try {
      const data = await authService.resendOtp({ email });
      toast.success(data.message);
      setCooldown(RESEND_SECONDS);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 ring-1 ring-brand-500/20">
        <MailCheck className="h-6 w-6" />
      </div>
      <h1 className="font-display text-2xl font-bold tracking-tight text-navy-900 sm:text-3xl">
        Verify your email
      </h1>
      <p className="mt-1.5 text-sm text-navy-500">
        We sent a 4-digit code to <span className="font-semibold text-navy-800">{email}</span>. It
        expires in 5 minutes.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-5" noValidate>
        <Input
          label="Verification code"
          inputMode="numeric"
          maxLength={4}
          autoComplete="one-time-code"
          className="text-center font-display text-xl font-bold tracking-[0.6em]"
          error={errors.otp?.message}
          {...register("otp")}
        />
        <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
          Verify email
        </Button>
      </form>

      <div className="mt-6 flex items-center justify-between text-xs">
        <button
          onClick={resend}
          disabled={cooldown > 0 || resending}
          className="font-semibold text-brand-600 transition hover:text-brand-700 disabled:cursor-not-allowed disabled:text-navy-300"
        >
          {resending ? "Sending…" : cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
        </button>
        <Link to="/login" className="font-medium text-navy-500 hover:text-navy-800">
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
