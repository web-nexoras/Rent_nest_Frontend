import api from "@/lib/apiClient.js";

// Admin dashboard overview endpoints (/admin)
export const adminDashboardApi = {
  getDashboard: () => api.get("/admin").then((r) => r.data),
  getAdminDashboard: () => api.get("/admin").then((r) => r.data),
  adminStats: () => api.get("/admin").then((r) => r.data),
};

export default adminDashboardApi;
