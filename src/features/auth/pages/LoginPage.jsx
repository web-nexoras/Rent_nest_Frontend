import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, ArrowRight } from "lucide-react";
import { Input } from "../../../components/ui/Input.jsx";
import { PasswordInput } from "../../../components/ui/PasswordInput.jsx";
import Button from "../../../components/ui/Button.jsx";
import { loginSchema } from "../../../lib/schemas.js";
import { useAuth } from "../../../context/AuthContext.jsx";
import { useToast } from "../../../context/ToastContext.jsx";
import { getErrorMessage } from "../../../lib/axios.js";

export default function LoginPage() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [needsVerification, setNeedsVerification] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: location.state?.email || "", password: "" },
  });

  const onSubmit = async (values) => {
    setNeedsVerification(false);
    try {
      const user = await login(values);
      toast.success(`Welcome back, ${user.name}`);
      const fallback = user.role === "admin" ? "/admin/dashboard" : "/tenant/dashboard";
      const from = location.state?.from;
      navigate(from && from !== "/login" ? from : fallback, { replace: true });
    } catch (error) {
      const message = getErrorMessage(error);
      if (error?.response?.status === 403 && /verify your email/i.test(message)) {
        setNeedsVerification(true);
      }
      toast.error(message);
    }
  };

  return (
    <div className="animate-fade-in">
      <p className="text-[11px] font-bold uppercase tracking-widest text-brand-600">Welcome back</p>
      <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-navy-900 sm:text-3xl">
        Sign in to Rent Nest
      </h1>
      <p className="mt-1.5 text-sm text-navy-500">Enter your credentials to access your workspace.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-5" noValidate>
        <Input
          label="Email address"
          type="email"
          autoComplete="email"
          icon={Mail}
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register("email")}
        />
        <PasswordInput
          label="Password"
          autoComplete="current-password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register("password")}
        />

        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
            Forgot password?
          </Link>
        </div>

        {needsVerification && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-900">
            Your email isn't verified yet.{" "}
            <Link
              to="/verify-otp"
              state={{ email: getValues("email") }}
              className="font-bold text-brand-700 underline"
            >
              Enter your verification code
            </Link>
          </div>
        )}

        <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
          Sign in <ArrowRight className="h-4 w-4" />
        </Button>
      </form>

      <p className="mt-7 text-center text-sm text-navy-500">
        New tenant?{" "}
        <Link to="/signup" className="font-semibold text-brand-600 hover:text-brand-700">
          Create an account
        </Link>
      </p>
    </div>
  );
}
