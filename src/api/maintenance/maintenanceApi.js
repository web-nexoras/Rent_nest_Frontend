import api from "../client.js";

// Maintenance requests endpoints (/maintenance)
export const maintenanceApi = {
  create: (formData) => api.post("/maintenance/create", formData).then((r) => r.data),
  mine: () => api.get("/maintenance/getmy").then((r) => r.data),
  list: (params) => api.get("/maintenance/getall", { params }).then((r) => r.data),
  get: (id) => api.get(`/maintenance/single/${id}`).then((r) => r.data),
  remove: (id) => api.delete(`/maintenance/del/${id}`).then((r) => r.data),
  updateStatus: (id, status) =>
    api.patch(`/maintenance/update/${id}`, { status }).then((r) => r.data),
};

export default maintenanceApi;
