import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, Loader2, Lock, Mail, Phone, User } from "lucide-react";
import { signup } from "@/features/auth/api/authApi.js";
import { useToast } from "@/components/feedback/ToastContext.jsx";
import { getErrorMessage } from "@/utils/helpers.js";
import AuthHeader from "@/features/auth/components/AuthHeader.jsx";
import AuthFooter from "@/features/auth/components/AuthFooter.jsx";

// Clean & Minimalist Signup Page
export default function Signup() {
  const toast = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const passwordIsValid = formData.password.length >= 6;
  const validate = () => {
    const errs = {};
    const name = formData.name.trim();
    const email = formData.email.trim();
    const phone = formData.phone.trim().replace(/[\s-]/g, "");
    const password = formData.password;

    if (!name) {
      errs.name = "Full name is required";
    } else if (name.length < 3) {
      errs.name = "Name must be at least 3 characters";
    } else if (name.length > 25) {
      errs.name = "Name must not exceed 25 characters";
    }

    if (!email) {
      errs.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = "Enter a valid email address";
    }

    if (!phone) {
      errs.phone = "Phone number is required";
    } else if (!/^(?:\+?88)?01[3-9]\d{8}$/.test(phone)) {
      errs.phone = "Enter a valid 11-digit Bangladeshi mobile number";
    }

    if (!password) {
      errs.password = "Password is required";
    } else if (password.length < 6) {
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
    // Keep the request boundary guarded even if submit is triggered outside the button.
    if (isSubmitting || !passwordIsValid) return;
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const signupPayload = {
        ...formData,
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim().replace(/[\s-]/g, ""),
      };
      const response = await signup(signupPayload);
      toast.success(
        response?.message || "Your verification code is on its way to your email.",
        "Check Email"
      );
      navigate("/verify-otp", { state: { email: signupPayload.email } });
    } catch (err) {
      toast.error(
        getErrorMessage(err, "Registration failed. Please check your inputs."),
        "Error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <section className="space-y-6" aria-label="Create account">
      <AuthHeader title="Create account" />
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Full Name */}
        <div>
          <label
            htmlFor="name"
            className="block text-xs font-semibold uppercase tracking-wider text-[#5C5549] dark:text-[#B8B2A6] mb-1.5"
          >
            Full Name
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#8C8479]">
              <User className="h-4 w-4" />
            </span>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              maxLength={25}
              placeholder="Enter full name"
              className={`w-full rounded-xl border bg-white dark:bg-[#0B0D11] py-2.5 pl-10 pr-4 text-sm text-[#141413] dark:text-[#F5F0E6] placeholder-[#8C8479] outline-none transition focus:ring-1 ${
                errors.name
                  ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500"
                  : "border-[#E5DEC9] dark:border-[#252C3D] focus:border-[#C59B27] focus:ring-[#C59B27]"
              }`}
            />
          </div>
          {errors.name && <p className="mt-1 text-xs text-rose-500">{errors.name}</p>}
        </div>

        {/* Email & Phone Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-semibold uppercase tracking-wider text-[#5C5549] dark:text-[#B8B2A6] mb-1.5"
            >
              Email
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#8C8479]">
                <Mail className="h-4 w-4" />
              </span>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email address"
                className={`w-full rounded-xl border bg-white dark:bg-[#0B0D11] py-2.5 pl-10 pr-4 text-sm text-[#141413] dark:text-[#F5F0E6] placeholder-[#8C8479] outline-none transition focus:ring-1 ${
                  errors.email
                    ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500"
                    : "border-[#E5DEC9] dark:border-[#252C3D] focus:border-[#C59B27] focus:ring-[#C59B27]"
                }`}
              />
            </div>
            {errors.email && <p className="mt-1 text-xs text-rose-500">{errors.email}</p>}
          </div>

          <div>
            <label
              htmlFor="phone"
              className="block text-xs font-semibold uppercase tracking-wider text-[#5C5549] dark:text-[#B8B2A6] mb-1.5"
            >
              Phone
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#8C8479]">
                <Phone className="h-4 w-4" />
              </span>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
                className={`w-full rounded-xl border bg-white dark:bg-[#0B0D11] py-2.5 pl-10 pr-4 text-sm text-[#141413] dark:text-[#F5F0E6] placeholder-[#8C8479] outline-none transition focus:ring-1 ${
                  errors.phone
                    ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500"
                    : "border-[#E5DEC9] dark:border-[#252C3D] focus:border-[#C59B27] focus:ring-[#C59B27]"
                }`}
              />
            </div>
            {errors.phone && <p className="mt-1 text-xs text-rose-500">{errors.phone}</p>}
          </div>
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="block text-xs font-semibold uppercase tracking-wider text-[#5C5549] dark:text-[#B8B2A6] mb-1.5"
          >
            Password
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#8C8479]">
              <Lock className="h-4 w-4" />
            </span>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              minLength={6}
              value={formData.password}
              onChange={handleChange}
              placeholder="Create password"
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

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting || !passwordIsValid}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D4AF37] py-3 px-4 text-sm font-semibold text-[#141413] shadow-md transition-all hover:brightness-105 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Creating account...</span>
              </>
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </form>
      <AuthFooter
        promptText="Already have an account?"
        linkText="Sign In"
        to="/signin"
      />
    </section>
  );
}
