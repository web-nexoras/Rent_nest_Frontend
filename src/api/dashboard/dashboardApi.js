import api from "../client.js";

// Dashboard overview endpoints (/admin)
export const dashboardApi = {
  getAdminDashboard: () => api.get("/admin").then((r) => r.data),
  adminStats: () => api.get("/admin").then((r) => r.data),
  getTenantDashboard: () => api.get("/admin/tenant").then((r) => r.data),
  tenantSummary: () => api.get("/admin/tenant").then((r) => r.data),
};

export default dashboardApi;
