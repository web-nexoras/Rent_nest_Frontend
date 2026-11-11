import api from "../client.js";

// Tenant management endpoints (/admin/tenants)
export const tenantApi = {
  getTenants: (params) => api.get("/admin/tenants", { params }).then((r) => r.data),
  listTenants: (params) => api.get("/admin/tenants", { params }).then((r) => r.data),
  pendingUsers: () => api.get("/admin/pending").then((r) => r.data),
  createTenant: (payload) => {
    const body = {
      ...payload,
      name: payload.name || payload.fullName,
    };
    return api.post("/admin/tenants/create", body).then((r) => r.data);
  },
  updateTenant: (id, payload) => {
    const body = {
      ...payload,
      name: payload.name || payload.fullName,
    };
    return api.patch(`/admin/tenants/${id}`, body).then((r) => r.data);
  },
  removeTenant: (id) => api.delete(`/admin/tenants/${id}`).then((r) => r.data),
  toggleActive: (id) => api.patch(`/admin/tenants/${id}/toggle-active`).then((r) => r.data),
  updateApproval: (id, approvalStatus) =>
    api.patch(`/admin/tenants/${id}/approval`, { approvalStatus }).then((r) => r.data),
};

export default tenantApi;
