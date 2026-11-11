import { dashboardApi } from "../api/dashboard/dashboardApi.js";
import { tenantApi } from "../api/tenants/tenantApi.js";

export const dashboardService = {
  ...dashboardApi,
  ...tenantApi,
};

export default dashboardService;
