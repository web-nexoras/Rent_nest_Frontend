import { z } from "zod";

// Mirrors the backend rules in controllers/auth/* and models/authSchema.js

// Backend isValidEmail: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const email = z
  .string()
  .trim()
  .min(1, "Email is required")
  .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Enter a valid email address");

// Backend: password required, min 6 characters
const password = z.string().min(6, "Password must be at least 6 characters");

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Password is required"),
});

export const signupSchema = z
  .object({
    // Backend: name 3-25 characters
    name: z
      .string()
      .trim()
      .min(3, "Name must be at least 3 characters")
      .max(25, "Name must not exceed 25 characters"),
    email,
    phone: z.string().trim().min(6, "Enter a valid phone number").max(20, "Phone number is too long"),
    password,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

// Backend generateOTP => 4 digits
export const otpSchema = z.object({
  otp: z.string().trim().regex(/^\d{4}$/, "Enter the 4-digit code"),
});

export const forgotSchema = z.object({ email });

export const resetSchema = z
  .object({
    password,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

// Backend updateProfile only reads: name, presentAddress, permanentAddress, nidNumber, occupation
export const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Name must be at least 3 characters")
    .max(25, "Name must not exceed 25 characters"),
  presentAddress: z.string().trim().max(200).optional().or(z.literal("")),
  permanentAddress: z.string().trim().max(200).optional().or(z.literal("")),
  nidNumber: z.string().trim().max(30).optional().or(z.literal("")),
  occupation: z.string().trim().max(80).optional().or(z.literal("")),
});
