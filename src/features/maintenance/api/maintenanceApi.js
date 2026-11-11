import api from "@/lib/apiClient.js";

export const createMaintenanceRequest = (formData) =>
  api.post("/maintenance/create", formData).then((response) => response.data);

export const getMyMaintenanceRequests = () =>
  api.get("/maintenance/getmy").then((response) => response.data);

export const listMaintenanceRequests = (params) =>
  api.get("/maintenance/getall", { params }).then((response) => response.data);

export const getMaintenanceRequest = (id) =>
  api.get(`/maintenance/single/${id}`).then((response) => response.data);

export const deleteMaintenanceRequest = (id) =>
  api.delete(`/maintenance/del/${id}`).then((response) => response.data);

export const updateMaintenanceStatus = (id, status) =>
  api.patch(`/maintenance/update/${id}`, { status }).then((response) => response.data);
