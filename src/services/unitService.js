import api from "../lib/axios.js";

// Unit inventory, 48-unit building seeder, and live status matrix endpoints (mounted at /unit)
export const unitService = {
  list: (params) => api.get("/unit/all-unit", { params }).then((r) => {
    const data = r.data;
    if (data && Array.isArray(data.units)) {
      data.units = data.units.map((u) => ({
        ...u,
        tenant: u.assignedTenant || u.tenant || null,
      }));
    }
    return data;
  }),
  mine: () => api.get("/unit/my-unit").then((r) => r.data),
  getById: (id) => api.get(`/unit/single-unit/${id}`).then((r) => r.data),
  create: (payload) => api.post("/unit/create", payload).then((r) => r.data),
  update: (id, payload) => api.patch(`/unit/update-unit/${id}`, payload).then((r) => r.data),
  remove: (id) => api.delete(`/unit/del-unit/${id}`).then((r) => r.data),
  assignTenant: (id, tenantId) =>
    api.patch(`/unit/assign-tenant/${id}`, { tenantId }).then((r) => r.data),
  vacate: (id) => api.patch(`/unit/unassign-tenant/${id}`).then((r) => r.data),
  unassignTenant: (id) => api.patch(`/unit/unassign-tenant/${id}`).then((r) => r.data),
  seedBuilding: () => api.post("/unit/seed-building").then((r) => r.data),
  statusMatrix: (params) => api.get("/unit/status-matrix", { params }).then((r) => r.data),
};
