import api from "@/lib/apiClient.js";

// Authentication endpoints (/auth)
export const authApi = {
  signup: (payload) => api.post("/auth/signup", payload).then((r) => r.data),
  verifyOtp: (payload) => api.post("/auth/verify-otp", payload).then((r) => r.data),
  resendOtp: (payload) => api.post("/auth/resend-otp", payload).then((r) => r.data),
  signin: (payload) => api.post("/auth/signin", payload).then((r) => r.data),
  forgotPassword: (payload) =>
    api.post("/auth/forget-password", payload).then((r) => r.data),
  resetPassword: (token, payload) =>
    api.patch(`/auth/reset-password/${token}`, payload).then((r) => r.data),
  logout: () => api.post("/auth/log-out").then((r) => r.data),
  getProfile: () => api.get("/auth/get-profile").then((r) => r.data),
  updateProfile: (formData) =>
    api.put("/auth/update-profile", formData).then((r) => r.data),
};

export default authApi;
