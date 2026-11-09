import api from "../lib/axios.js";

// Admin endpoints from routes/dashboardRoute/allDashboardRoute.js (mounted at /admin)
export const adminService = {
  getStats: () => api.get("/admin").then((r) => r.data),
  getTenants: (params) => api.get("/admin/tenants", { params }).then((r) => r.data),
  getPending: () => api.get("/admin/pending").then((r) => r.data),
  removeTenant: (id) => api.delete(`/admin/tenants/${id}`).then((r) => r.data),
  toggleTenantActive: (id) =>
    api.patch(`/admin/tenants/${id}/toggle-active`).then((r) => r.data),
  updateApproval: (id, payload) =>
    api.patch(`/admin/tenants/${id}/approval`, payload).then((r) => r.data),
};

// Tenant dashboard is also mounted on the dashboard router: GET /admin/tenant
export const tenantService = {
  getDashboard: () => api.get("/admin/tenant").then((r) => r.data),
};
