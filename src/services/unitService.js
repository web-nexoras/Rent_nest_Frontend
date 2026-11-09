import api from "../lib/axios.js";

// Endpoints from routes/unitRoute/allUnitsRoutes.js (mounted at /unit)
export const unitService = {
  list: (params) => api.get("/unit/all-unit", { params }).then((r) => r.data),
  mine: () => api.get("/unit/my-unit").then((r) => r.data),
  get: (id) => api.get(`/unit/single-unit/${id}`).then((r) => r.data),
  create: (formData) => api.post("/unit/create", formData).then((r) => r.data),
  update: (id, formData) =>
    api.patch(`/unit/update-unit/${id}`, formData).then((r) => r.data),
  remove: (id) => api.delete(`/unit/del-unit/${id}`).then((r) => r.data),
  assignTenant: (id, tenantId) =>
    api.patch(`/unit/assign-tenant/${id}`, { tenantId }).then((r) => r.data),
  unassignTenant: (id) =>
    api.patch(`/unit/unassign-tenant/${id}`).then((r) => r.data),
};
