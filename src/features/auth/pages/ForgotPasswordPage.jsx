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
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
          <Send className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-bold text-navy-900">Check your inbox</h1>
        <p className="mt-2 text-sm leading-relaxed text-navy-400">
          If an account exists for <span className="font-semibold text-navy-700">{getValues("email")}</span>,
          we've sent a password reset link. It expires in 15 minutes.
        </p>
        <Link to="/login" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-brand-600">
          <ArrowLeft className="h-4 w-4" /> Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold tracking-tight text-navy-900">Forgot password?</h1>
      <p className="mt-2 text-sm text-navy-400">
        Enter your email and we'll send you a link to reset your password.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate>
        <Input
          label="Email"
          type="email"
          icon={Mail}
          autoComplete="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register("email")}
        />
        <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
          Send reset link
        </Button>
      </form>

      <Link to="/login" className="mt-8 flex items-center justify-center gap-2 text-sm text-navy-400 hover:text-navy-700">
        <ArrowLeft className="h-4 w-4" /> Back to sign in
      </Link>
    </div>
  );
}
