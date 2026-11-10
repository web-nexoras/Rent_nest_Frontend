import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Phone,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { isValidEmailOrPhone, loginSchema } from "../../../lib/schemas";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../components/ui/Toast";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import { getErrorMessage } from "../../../lib/utils";

// 3D Interactive Login Page with Dual Email/Phone validation & 6+ password gate
export default function LoginPage() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const identifierValue = watch("identifier") || "";
  const passwordValue = watch("password") || "";

  // Submit button unlocks only when identifier matches strict email/phone regex AND password >= 6 chars
  const isIdentifierValid = isValidEmailOrPhone(identifierValue);
  const isPasswordValid = passwordValue.length >= 6;
  const canSubmit = isIdentifierValid && isPasswordValid;

  const onSubmit = async (values) => {
    try {
      const loggedUser = await login(values);
      toast.success(
        `Welcome back, ${loggedUser?.fullName || "Resident"}!`,
        "Authenticated"
      );
      const from = location.state?.from?.pathname;
      if (from && from !== "/login") {
        navigate(from, { replace: true });
      } else {
        navigate(
          loggedUser?.role === "admin" ? "/admin/dashboard" : "/tenant/dashboard",
          { replace: true }
        );
      }
    } catch (err) {
      toast.error(getErrorMessage(err, "Invalid credentials. Please try again."), "Login Failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-[#F6F2E9] dark:bg-[#1C2230] px-3 py-1 text-[11px] font-semibold text-[#8F6B14] dark:text-[#D4AF37] border border-[#E5DEC9] dark:border-[#2A3246]">
          <ShieldCheck className="h-3.5 w-3.5" />
          Dual Resident & Admin Portal
        </div>
        <h2 className="mt-3 font-display text-2xl sm:text-3xl font-bold text-[#141413] dark:text-[#F5F0E6]">
          Sign in to Rent Nest
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-[#6E675F] dark:text-[#9A9488]">
          Enter your registered <strong>Email Address</strong> or <strong>Mobile Number</strong>.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input
          label="Email or Phone Number"
          type="text"
          leftIcon={Phone}
          error={errors.identifier?.message}
          {...register("identifier")}
        />

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="password"
              className="text-xs font-semibold uppercase tracking-wider text-[#5C5549] dark:text-[#B8B2A6]"
            >
              Password (Min 6 Characters)
            </label>
            <Link
              to="/forgot-password"
              className="text-xs font-semibold text-[#9A7418] dark:text-[#D4AF37] hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            leftIcon={Lock}
            error={errors.password?.message}
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="text-[#8C8479] hover:text-[#141413] dark:hover:text-white"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            {...register("password")}
          />
        </div>

        {/* Live Validation Security Gate Checklist */}
        <div className="rounded-2xl border border-[#EAE2D3] dark:border-[#1E2433] bg-[#FAF7F2] dark:bg-[#0E1117] p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 text-[#5C5549] dark:text-[#B8B2A6]">
              <CheckCircle2
                className={`h-4 w-4 transition-colors ${
                  isIdentifierValid ? "text-emerald-600 dark:text-emerald-400" : "text-[#C4BBAF]"
                }`}
              />
              Valid Email or BD Mobile Number
            </span>
            <span
              className={`text-[11px] font-semibold ${
                isIdentifierValid ? "text-emerald-600 dark:text-emerald-400" : "text-[#8C8479]"
              }`}
            >
              {isIdentifierValid ? "Verified" : "Required"}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 text-[#5C5549] dark:text-[#B8B2A6]">
              <CheckCircle2
                className={`h-4 w-4 transition-colors ${
                  isPasswordValid ? "text-emerald-600 dark:text-emerald-400" : "text-[#C4BBAF]"
                }`}
              />
              Password at least 6 characters
            </span>
            <span
              className={`text-[11px] font-semibold ${
                isPasswordValid ? "text-emerald-600 dark:text-emerald-400" : "text-[#8C8479]"
              }`}
            >
              {passwordValue.length}/6+
            </span>
          </div>
        </div>

        {/* Submit Button reveals smoothly only when regex & 6+ char password pass */}
        <AnimatePresence mode="wait">
          {canSubmit ? (
            <motion.div
              key="unlocked"
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isSubmitting}
                rightIcon={ArrowRight}
                className="w-full shadow-lg"
              >
                Access Rent Nest Workspace
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="locked"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-full border border-dashed border-[#D8CCB8] dark:border-[#252C3D] bg-[#F6F2E9]/70 dark:bg-[#0E1117]/70 px-4 text-xs font-medium text-[#8C8479]"
            >
              <UserCheck className="h-4 w-4 text-[#C59B27]" />
              <span>Enter valid email/phone & 6+ char password to unlock Sign In</span>
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      <div className="border-t border-[#EFE9DC] dark:border-[#1E2433] pt-4 text-center text-xs text-[#6E675F] dark:text-[#9A9488]">
        Don&apos;t have an account yet?{" "}
        <Link
          to="/signup"
          className="font-semibold text-[#141413] dark:text-[#D4AF37] underline underline-offset-4 hover:text-[#C59B27]"
        >
          Create Resident or Admin Account
        </Link>
      </div>
    </div>
  );
}
