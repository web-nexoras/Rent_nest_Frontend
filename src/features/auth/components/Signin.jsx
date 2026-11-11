import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, Loader2, Lock, Phone } from "lucide-react";
import { useAuth } from "@/hooks/useAuth.jsx";
import { useToast } from "@/components/feedback/ToastContext.jsx";
import { getErrorMessage } from "@/utils/helpers.js";
import AuthHeader from "@/features/auth/components/AuthHeader.jsx";
import AuthFooter from "@/features/auth/components/AuthFooter.jsx";

// Clean & Minimalist Luxury Signin Page
export default function Signin() {
  const { signin } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const validate = () => {
    const errs = {};
    const id = formData.identifier.trim();
    if (!id) {
      errs.identifier = "Email or phone is required";
    } else {
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(id);
      const isPhone = /^(?:\+?88)?01[3-9]\d{8}$/.test(id.replace(/[\s-]/g, ""));
      if (!isEmail && !isPhone) {
        errs.identifier = "Enter a valid email or phone number";
      }
    }

    if (!formData.password) {
      errs.password = "Password is required";
    } else if (formData.password.length < 6) {
      errs.password = "Password must be at least 6 characters";
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
      const loggedUser = await signin(formData);
      toast.success(
        `Welcome back, ${loggedUser?.fullName || "Resident"}!`,
        "Authenticated"
      );
      const from = location.state?.from?.pathname;
      if (from && from !== "/signin" && from !== "/login") {
        navigate(from, { replace: true });
      } else {
        navigate(
          loggedUser?.role === "admin"
            ? "/admin/dashboard"
            : "/tenant/dashboard",
          { replace: true }
        );
      }
    } catch (err) {
      toast.error(
        getErrorMessage(err, "Invalid credentials. Please try again."),
        "Signin Failed"
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <section className="space-y-6" aria-label="Sign in">
      <AuthHeader title="Sign in to Rent Nest" />
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Email or Phone Field */}
        <div>
          <label
            htmlFor="identifier"
            className="block text-xs font-semibold uppercase tracking-wider text-[#5C5549] dark:text-[#B8B2A6] mb-1.5"
          >
            Email or Phone Number
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#8C8479]">
              <Phone className="h-4 w-4" />
            </span>
            <input
              id="identifier"
              name="identifier"
              type="text"
              value={formData.identifier}
              onChange={handleChange}
              placeholder="Enter email or phone"
              className={`w-full rounded-xl border bg-white dark:bg-[#0B0D11] py-2.5 pl-10 pr-4 text-sm text-[#141413] dark:text-[#F5F0E6] placeholder-[#8C8479] outline-none transition focus:ring-1 ${
                errors.identifier
                  ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500"
                  : "border-[#E5DEC9] dark:border-[#252C3D] focus:border-[#C59B27] focus:ring-[#C59B27]"
              }`}
            />
          </div>
          {errors.identifier && (
            <p className="mt-1 text-xs text-rose-500">{errors.identifier}</p>
          )}
        </div>

        {/* Password Field */}
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
              placeholder="enter your pass"
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
          {errors.password && (
            <p className="mt-1 text-xs text-rose-500">{errors.password}</p>
          )}
        </div>

        {/* Dynamic Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D4AF37] py-3 px-4 text-sm font-semibold text-[#141413] shadow-md transition-all hover:brightness-105 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </form>
      <AuthFooter
        promptText="Don't have an account?"
        linkText="Create account"
        to="/signup"
      />
    </section>
  );
}
