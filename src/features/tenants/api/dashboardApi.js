import api from "@/lib/apiClient.js";

export const getTenantDashboard = () =>
  api.get("/admin/tenant").then((response) => response.data);
