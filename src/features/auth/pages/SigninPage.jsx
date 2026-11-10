import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Eye, EyeOff, Lock, Phone } from "lucide-react";
import { isValidEmailOrPhone, signinSchema } from "../../../lib/schemas";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../components/ui/Toast";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import { getErrorMessage } from "../../../lib/utils";

// Clean & Minimalist Luxury Signin Page
export default function SigninPage() {
  const { signin } = useAuth();
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
    resolver: zodResolver(signinSchema),
    mode: "onTouched",
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const identifierValue = watch("identifier") || "";
  const passwordValue = watch("password") || "";

  const canSubmit =
    isValidEmailOrPhone(identifierValue) && passwordValue.length >= 6;

  const onSubmit = async (values) => {
    try {
      const loggedUser = await signin(values);
      toast.success(
        `Welcome back, ${loggedUser?.fullName || "Resident"}!`,
        "Authenticated",
      );
      const from = location.state?.from?.pathname;
      if (from && from !== "/signin" && from !== "/login") {
        navigate(from, { replace: true });
      } else {
        navigate(
          loggedUser?.role === "admin"
            ? "/admin/dashboard"
            : "/tenant/dashboard",
          { replace: true },
        );
      }
    } catch (err) {
      toast.error(
        getErrorMessage(err, "Invalid credentials. Please try again."),
        "Signin Failed",
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center sm:text-left">
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#141413] dark:text-[#F5F0E6]">
          Sign in to Rent Nest
        </h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input
          label="Email or Phone Number"
          type="text"
          placeholder="Enter email or phone"
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
              Password
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
            placeholder="Enter your password"
            leftIcon={Lock}
            error={errors.password?.message}
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="text-[#8C8479] hover:text-[#141413] dark:hover:text-white"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            }
            {...register("password")}
          />
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            disabled={!canSubmit}
            rightIcon={ArrowRight}
            className="w-full shadow-lg"
          >
            Sign In
          </Button>
        </div>
      </form>

      <div className="border-t border-[#EFE9DC] dark:border-[#1E2433] pt-4 text-center text-xs text-[#6E675F] dark:text-[#9A9488]">
        Don&apos;t have an account?{" "}
        <Link
          to="/signup"
          className="font-semibold text-[#141413] dark:text-[#D4AF37] underline underline-offset-4 hover:text-[#C59B27]"
        >
          Create account
        </Link>
      </div>
    </div>
  );
}
