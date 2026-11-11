import api from "@/lib/apiClient.js";

export const getAdminDashboard = () =>
  api.get("/admin").then((response) => response.data);
