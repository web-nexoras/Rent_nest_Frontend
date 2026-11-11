import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Eye, EyeOff, Loader2, Lock } from "lucide-react";
import { authApi } from "@/features/auth/authApi.js";
import { useToast } from "@/components/feedback/ToastContext.jsx";
import { getErrorMessage } from "@/utils/index.js";

export default function ResetPasswordPage() {
  const { token } = useParams();
  const toast = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validate = () => {
    const errs = {};
    if (!formData.password) {
      errs.password = "Password is required";
    } else if (formData.password.length < 6) {
      errs.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      errs.confirmPassword = "Confirm password is required";
    } else if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = "Passwords do not match";
    }
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await authApi.resetPassword(token, { password: formData.password });
      toast.success(data.message || "Password reset successfully!", "Success");
      navigate("/signin", { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to reset password"), "Error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center sm:text-left">
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#141413] dark:text-[#F5F0E6]">
          Set new password
        </h2>
        <p className="mt-1.5 text-xs text-[#6E675F] dark:text-[#9A9488]">
          Choose a secure password with at least 6 characters.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* New Password */}
        <div>
          <label
            htmlFor="password"
            className="block text-xs font-semibold uppercase tracking-wider text-[#5C5549] dark:text-[#B8B2A6] mb-1.5"
          >
            New Password
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#8C8479]">
              <Lock className="h-4 w-4" />
            </span>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter new password"
              className={`w-full rounded-xl border bg-white dark:bg-[#0B0D11] py-2.5 pl-10 pr-10 text-sm text-[#141413] dark:text-[#F5F0E6] placeholder-[#8C8479] outline-none transition focus:ring-1 ${
                errors.password
                  ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500"
                  : "border-[#E5DEC9] dark:border-[#252C3D] focus:border-[#C59B27] focus:ring-[#C59B27]"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#8C8479] hover:text-[#141413] dark:hover:text-white"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-xs text-rose-500">{errors.password}</p>}
        </div>

        {/* Confirm Password */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-xs font-semibold uppercase tracking-wider text-[#5C5549] dark:text-[#B8B2A6] mb-1.5"
          >
            Confirm Password
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#8C8479]">
              <Lock className="h-4 w-4" />
            </span>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm new password"
              className={`w-full rounded-xl border bg-white dark:bg-[#0B0D11] py-2.5 pl-10 pr-4 text-sm text-[#141413] dark:text-[#F5F0E6] placeholder-[#8C8479] outline-none transition focus:ring-1 ${
                errors.confirmPassword
                  ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500"
                  : "border-[#E5DEC9] dark:border-[#252C3D] focus:border-[#C59B27] focus:ring-[#C59B27]"
              }`}
            />
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-rose-500">{errors.confirmPassword}</p>
          )}
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D4AF37] py-3 px-4 text-sm font-semibold text-[#141413] shadow-md transition-all hover:brightness-105 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Resetting...</span>
              </>
            ) : (
              <span>Reset Password</span>
            )}
          </button>
        </div>
      </form>

      <div className="border-t border-[#EFE9DC] dark:border-[#1E2433] pt-4 text-center text-xs text-[#6E675F] dark:text-[#9A9488]">
        Link expired?{" "}
        <Link
          to="/forgot-password"
          className="font-semibold text-[#141413] dark:text-[#D4AF37] underline underline-offset-4 hover:text-[#C59B27]"
        >
          Request a new one
        </Link>
      </div>
    </div>
  );
}
