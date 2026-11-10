import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  Shield,
  User,
} from "lucide-react";
import {
  isValidEmailStrict,
  isValidPhoneStrict,
  signupSchema,
} from "../../../lib/schemas";
import { authService } from "../../../services/authService";
import { useToast } from "../../../components/ui/Toast";
import { Input, Select } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import { getErrorMessage } from "../../../lib/utils";

// 3D Interactive Signup Page with strict email/phone regex & 6+ char password gate
export default function SignupPage() {
  const toast = useToast();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signupSchema),
    mode: "onChange",
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      role: "tenant",
    },
  });

  const fullNameVal = watch("fullName") || "";
  const emailVal = watch("email") || "";
  const phoneVal = watch("phone") || "";
  const passwordVal = watch("password") || "";

  const isNameOk = fullNameVal.trim().length >= 2;
  const isEmailOk = isValidEmailStrict(emailVal);
  const isPhoneOk = isValidPhoneStrict(phoneVal);
  const isPasswordOk = passwordVal.length >= 6;
  const canSubmit = isNameOk && isEmailOk && isPhoneOk && isPasswordOk;

  const onSubmit = async (values) => {
    try {
      await authService.signup(values);
      toast.success(
        "Verification code sent to your email. Please verify your OTP.",
        "Registration Initiated"
      );
      navigate("/verify-otp", { state: { email: values.email } });
    } catch (err) {
      toast.error(getErrorMessage(err, "Registration failed. Please check your inputs."), "Error");
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#141413] dark:text-[#F5F0E6]">
          Create Luxury Account
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-[#6E675F] dark:text-[#9A9488]">
          Register with a verified email and mobile number to access Rent Nest.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5" noValidate>
        <Input
          label="Full Legal Name"
          leftIcon={User}
          error={errors.fullName?.message}
          {...register("fullName")}
        />

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <Input
            label="Email Address"
            type="email"
            leftIcon={Mail}
            error={errors.email?.message}
            {...register("email")}
          />

          <Input
            label="Mobile Number"
            type="tel"
            leftIcon={Phone}
            error={errors.phone?.message}
            {...register("phone")}
          />
        </div>

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <Input
            label="Password (6+ Chars)"
            type={showPassword ? "text" : "password"}
            leftIcon={Lock}
            error={errors.password?.message}
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="text-[#8C8479] hover:text-[#141413] dark:hover:text-white"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            {...register("password")}
          />

          <Select
            label="Account Role"
            error={errors.role?.message}
            options={[
              { value: "tenant", label: "Resident / Tenant" },
              { value: "admin", label: "Property Admin" },
            ]}
            {...register("role")}
          />
        </div>

        {/* Live Validation Gate */}
        <div className="grid grid-cols-2 gap-2 rounded-2xl border border-[#EAE2D3] dark:border-[#1E2433] bg-[#FAF7F2] dark:bg-[#0E1117] p-3 text-[11px]">
          <span className="flex items-center gap-1.5 text-[#5C5549] dark:text-[#B8B2A6]">
            <CheckCircle2
              className={`h-3.5 w-3.5 ${isEmailOk ? "text-emerald-600" : "text-[#C4BBAF]"}`}
            />
            Valid Email Regex
          </span>
          <span className="flex items-center gap-1.5 text-[#5C5549] dark:text-[#B8B2A6]">
            <CheckCircle2
              className={`h-3.5 w-3.5 ${isPhoneOk ? "text-emerald-600" : "text-[#C4BBAF]"}`}
            />
            Valid Mobile Number
          </span>
          <span className="flex items-center gap-1.5 text-[#5C5549] dark:text-[#B8B2A6]">
            <CheckCircle2
              className={`h-3.5 w-3.5 ${isNameOk ? "text-emerald-600" : "text-[#C4BBAF]"}`}
            />
            Full Name (2+ chars)
          </span>
          <span className="flex items-center gap-1.5 text-[#5C5549] dark:text-[#B8B2A6]">
            <CheckCircle2
              className={`h-3.5 w-3.5 ${isPasswordOk ? "text-emerald-600" : "text-[#C4BBAF]"}`}
            />
            Password ({passwordVal.length}/6+)
          </span>
        </div>

        <AnimatePresence mode="wait">
          {canSubmit ? (
            <motion.div
              key="signup-unlocked"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
            >
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isSubmitting}
                rightIcon={ArrowRight}
                className="w-full"
              >
                Create Account & Send OTP
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="signup-locked"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-full border border-dashed border-[#D8CCB8] dark:border-[#252C3D] bg-[#F6F2E9]/70 dark:bg-[#0E1117]/70 px-4 text-xs font-medium text-[#8C8479]"
            >
              <Shield className="h-4 w-4 text-[#C59B27]" />
              <span>Complete all verified fields & 6+ char password to unlock</span>
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      <div className="border-t border-[#EFE9DC] dark:border-[#1E2433] pt-4 text-center text-xs text-[#6E675F] dark:text-[#9A9488]">
        Already registered?{" "}
        <Link
          to="/login"
          className="font-semibold text-[#141413] dark:text-[#D4AF37] underline underline-offset-4 hover:text-[#C59B27]"
        >
          Sign in with Email or Phone
        </Link>
      </div>
    </div>
  );
}
