import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Mail, Send } from "lucide-react";
import { Input } from "../../../components/ui/Input.jsx";
import Button from "../../../components/ui/Button.jsx";
import { forgotSchema } from "../../../lib/schemas.js";
import { authService } from "../../../services/authService.js";
import { useToast } from "../../../context/ToastContext.jsx";
import { getErrorMessage } from "../../../lib/axios.js";

export default function ForgotPasswordPage() {
  const toast = useToast();
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(forgotSchema), defaultValues: { email: "" } });

  const onSubmit = async (values) => {
    try {
      await authService.forgotPassword(values);
      setSent(true);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  if (sent) {
    return (
      <div className="animate-fade-in text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 ring-1 ring-brand-500/20">
          <Send className="h-7 w-7" />
        </div>
        <h1 className="font-display text-2xl font-bold text-navy-900">Check your inbox</h1>
        <p className="mt-2 text-sm leading-relaxed text-navy-500">
          If an account exists for <span className="font-semibold text-navy-800">{getValues("email")}</span>,
          we've sent a password reset link. It expires in 15 minutes.
        </p>
        <Link to="/signin" className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:text-brand-700">
          <ArrowLeft className="h-4 w-4" /> Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <p className="text-[11px] font-bold uppercase tracking-widest text-brand-600">Account Recovery</p>
      <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-navy-900 sm:text-3xl">
        Forgot password?
      </h1>
      <p className="mt-1.5 text-sm text-navy-500">
        Enter your email address and we'll send you a secure link to reset your password.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-5" noValidate>
        <Input
          label="Email address"
          type="email"
          icon={Mail}
          autoComplete="email"
          placeholder="Enter registered email"
          error={errors.email?.message}
          {...register("email")}
        />
        <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
          Send reset link
        </Button>
      </form>

      <Link to="/signin" className="mt-7 flex items-center justify-center gap-2 text-sm font-medium text-navy-500 hover:text-navy-800">
        <ArrowLeft className="h-4 w-4" /> Back to sign in
      </Link>
    </div>
  );
}
