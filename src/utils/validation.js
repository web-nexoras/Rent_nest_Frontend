import { z } from "zod";

// Strict email and BD/international phone validation regexes
export const STRICT_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const STRICT_PHONE_REGEX = /^(?:\+?8801[3-9]\d{8}|01[3-9]\d{8}|\+?[1-9]\d{9,14})$/;

export function isValidEmailStrict(value = "") {
  return STRICT_EMAIL_REGEX.test(String(value).trim());
}

export function isValidPhoneStrict(value = "") {
  const cleaned = String(value).trim().replace(/[\s()-]/g, "");
  return STRICT_PHONE_REGEX.test(cleaned);
}

export function isValidEmailOrPhone(value = "") {
  const trimmed = String(value).trim();
  if (!trimmed) return false;
  return isValidEmailStrict(trimmed) || isValidPhoneStrict(trimmed);
}

export const signinSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, "Email or phone number is required")
    .refine((val) => isValidEmailOrPhone(val), {
      message: "Enter a valid email address or mobile number (e.g. 017XXXXXXXX)",
    }),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
export const loginSchema = signinSchema;

export const signupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Name must be at least 3 characters")
    .max(25, "Name must not exceed 25 characters"),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .refine((val) => isValidEmailStrict(val), {
      message: "Please enter a valid email address",
    }),
  phone: z
    .string()
    .trim()
    .min(1, "Phone number is required")
    .refine((val) => isValidPhoneStrict(val), {
      message: "Enter a valid mobile number (e.g. 017XXXXXXXX)",
    }),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const otpSchema = z.object({
  otp: z
    .string()
    .trim()
    .min(4, "Enter the verification code")
    .max(6, "Invalid OTP length")
    .regex(/^\d{4,6}$/, "OTP must contain only digits"),
});

export const forgotSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .refine((val) => isValidEmailStrict(val), {
      message: "Enter a valid email address",
    }),
});
export const forgotPasswordSchema = forgotSchema;

export const resetSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Please confirm your new password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
export const resetPasswordSchema = resetSchema;

export const unitSchema = z.object({
  unitNumber: z.string().trim().min(1, "Unit number is required"),
  floor: z.string().trim().max(40).optional().or(z.literal("")),
  bedrooms: z.coerce.number().int().min(1, "At least 1 bedroom").default(3),
  sizeSqft: z.coerce.number().min(100, "Size must be at least 100 sqft").default(1400),
  rentAmount: z.coerce.number().positive("Rent amount must be greater than 0"),
  rentDueDay: z.coerce.number().int().min(1).max(31).default(5),
  description: z.string().max(500).optional().or(z.literal("")),
});

export const paymentSchema = z.object({
  unitId: z.string().optional(),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Select a valid billing month"),
  paymentMethod: z
    .enum(["SSLCommerz", "bKash", "Nagad", "Rocket", "Upay", "Bank", "Cash"])
    .default("bKash"),
  transactionId: z.string().trim().max(120).optional().or(z.literal("")),
});

export const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Name must be at least 3 characters")
    .max(25, "Name must not exceed 25 characters"),
  presentAddress: z.string().trim().max(200).optional().or(z.literal("")),
  permanentAddress: z.string().trim().max(200).optional().or(z.literal("")),
  nidNumber: z.string().trim().max(30).optional().or(z.literal("")),
  occupation: z.string().trim().max(60).optional().or(z.literal("")),
});
