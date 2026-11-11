import api from "@/lib/apiClient.js";

export const signup = (payload) =>
  api.post("/auth/signup", payload).then((response) => response.data);

export const verifyOtp = (payload) =>
  api.post("/auth/verify-otp", payload).then((response) => response.data);

export const resendOtp = (payload) =>
  api.post("/auth/resend-otp", payload).then((response) => response.data);

export const signin = (payload) =>
  api.post("/auth/signin", payload).then((response) => response.data);

export const forgotPassword = (payload) =>
  api.post("/auth/forget-password", payload).then((response) => response.data);

export const resetPassword = (token, payload) =>
  api.patch(`/auth/reset-password/${token}`, payload).then((response) => response.data);

export const logout = () =>
  api.post("/auth/log-out").then((response) => response.data);

export const getProfile = () =>
  api.get("/auth/get-profile").then((response) => response.data);

export const updateProfile = (formData) =>
  api.put("/auth/update-profile", formData).then((response) => response.data);
