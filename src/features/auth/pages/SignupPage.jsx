import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Eye, EyeOff, Lock, Mail, Phone, User } from "lucide-react";
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

// Clean & Minimalist Signup Page
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
    mode: "onTouched",
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      role: "tenant",
    },
  });

  const nameVal = watch("name") || "";
  const emailVal = watch("email") || "";
  const phoneVal = watch("phone") || "";
  const passwordVal = watch("password") || "";

  const canSubmit =
    nameVal.trim().length >= 3 &&
    isValidEmailStrict(emailVal) &&
    isValidPhoneStrict(phoneVal) &&
    passwordVal.length >= 6;

  const onSubmit = async (values) => {
    try {
      await authService.signup(values);
      toast.success(
        "Verification code sent to your email.",
        "Check Email"
      );
      navigate("/verify-otp", { state: { email: values.email } });
    } catch (err) {
      toast.error(
        getErrorMessage(err, "Registration failed. Please check your inputs."),
        "Error"
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center sm:text-left">
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#141413] dark:text-[#F5F0E6]">
          Create account
        </h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input
          label="Full Name"
          placeholder="Enter full name"
          leftIcon={User}
          error={errors.name?.message}
          {...register("name")}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Email"
            type="email"
            placeholder="Enter email address"
            leftIcon={Mail}
            error={errors.email?.message}
            {...register("email")}
          />

          <Input
            label="Phone"
            type="tel"
            placeholder="Enter phone number"
            leftIcon={Phone}
            error={errors.phone?.message}
            {...register("phone")}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="Create password"
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
            label="Role"
            error={errors.role?.message}
            options={[
              { value: "tenant", label: "Resident" },
              { value: "admin", label: "Admin" },
            ]}
            {...register("role")}
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
            Create Account
          </Button>
        </div>
      </form>

      <div className="border-t border-[#EFE9DC] dark:border-[#1E2433] pt-4 text-center text-xs text-[#6E675F] dark:text-[#9A9488]">
        Already have an account?{" "}
        <Link
          to="/signin"
          className="font-semibold text-[#141413] dark:text-[#D4AF37] underline underline-offset-4 hover:text-[#C59B27]"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
}
