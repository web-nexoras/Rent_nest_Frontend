import api from "@/lib/apiClient.js";

// Tenant dashboard summary endpoint (served under /admin for the signed-in tenant)
export const tenantDashboardApi = {
  getDashboard: () => api.get("/admin/tenant").then((r) => r.data),
  getTenantDashboard: () => api.get("/admin/tenant").then((r) => r.data),
  tenantSummary: () => api.get("/admin/tenant").then((r) => r.data),
};

export default tenantDashboardApi;
