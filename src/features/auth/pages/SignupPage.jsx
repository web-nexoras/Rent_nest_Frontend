import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Phone, User, ArrowRight } from "lucide-react";
import { Input } from "../../../components/ui/Input.jsx";
import { PasswordInput } from "../../../components/ui/PasswordInput.jsx";
import Button from "../../../components/ui/Button.jsx";
import { signupSchema } from "../../../lib/schemas.js";
import { authService } from "../../../services/authService.js";
import { useToast } from "../../../context/ToastContext.jsx";
import { getErrorMessage } from "../../../lib/axios.js";

export default function SignupPage() {
  const toast = useToast();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", phone: "", password: "", confirmPassword: "" },
  });

  const onSubmit = async ({ confirmPassword, ...values }) => {
    try {
      const data = await authService.signup(values);
      toast.success(data.message);
      navigate("/verify-otp", { state: { email: values.email } });
    } catch (error) {
      // 502: the account WAS created but the OTP email failed — user can resend from the OTP page.
      if (error?.response?.status === 502) {
        toast.warning(getErrorMessage(error));
        navigate("/verify-otp", { state: { email: values.email, resendHint: true } });
        return;
      }
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="animate-fade-in">
      <p className="text-[11px] font-bold uppercase tracking-widest text-brand-600">Tenant Onboarding</p>
      <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-navy-900 sm:text-3xl">
        Create your account
      </h1>
      <p className="mt-1.5 text-sm text-navy-500">
        Register as a resident. An administrator will approve your account after email verification.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-4" noValidate>
        <Input
          label="Full name"
          icon={User}
          autoComplete="name"
          placeholder="Jane Doe"
          error={errors.name?.message}
          {...register("name")}
        />
        <Input
          label="Email address"
          type="email"
          icon={Mail}
          autoComplete="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register("email")}
        />
        <Input
          label="Phone number"
          type="tel"
          icon={Phone}
          autoComplete="tel"
          placeholder="01XXXXXXXXX"
          error={errors.phone?.message}
          {...register("phone")}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <PasswordInput
            label="Password"
            autoComplete="new-password"
            placeholder="Min. 6 characters"
            error={errors.password?.message}
            {...register("password")}
          />
          <PasswordInput
            label="Confirm password"
            autoComplete="new-password"
            placeholder="Repeat password"
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />
        </div>

        <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
          Create account <ArrowRight className="h-4 w-4" />
        </Button>
      </form>

      <p className="mt-7 text-center text-sm text-navy-500">
        Already registered?{" "}
        <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
          Sign in
        </Link>
      </p>
    </div>
  );
}
