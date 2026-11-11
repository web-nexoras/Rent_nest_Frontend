import api from "@/lib/apiClient.js";

const DEFAULT_LIMIT = 10;

const normalizeUnit = (unit = {}) => {
  const assignedTenant = unit.assignedTenant || unit.tenant || null;
  const tenant = assignedTenant
    ? {
        ...assignedTenant,
        fullName: assignedTenant.fullName || assignedTenant.name || "",
      }
    : null;

  return {
    ...unit,
    tenant,
  };
};

const toPagination = (data, fallbackLimit = DEFAULT_LIMIT) => {
  const limit = Number(data?.limit) || fallbackLimit;
  const total = Number(data?.total ?? data?.units?.length ?? 0);
  const totalPages =
    Number(data?.totalPages) || Math.max(1, Math.ceil(total / Math.max(1, limit)));

  return {
    page: Number(data?.page) || 1,
    limit,
    total,
    totalPages,
    pages: totalPages,
  };
};

// Unit inventory and building status endpoints (/unit)
export const unitApi = {
  list: (params) =>
    api.get("/unit/all-unit", { params }).then((r) => {
      const data = r.data;
      if (!data || !Array.isArray(data.units)) return data;

      return {
        ...data,
        units: data.units.map(normalizeUnit),
        pagination: toPagination(data, Number(params?.limit) || DEFAULT_LIMIT),
      };
    }),
  mine: () => api.get("/unit/my-unit").then((r) => r.data),
  getById: (id) => api.get(`/unit/single-unit/${id}`).then((r) => r.data),
  create: (payload) => api.post("/unit/create", payload).then((r) => r.data),
  update: (id, payload) =>
    api.patch(`/unit/update-unit/${id}`, payload).then((r) => r.data),
  remove: (id) => api.delete(`/unit/del-unit/${id}`).then((r) => r.data),
  assignTenant: (id, tenantId) =>
    api.patch(`/unit/assign-tenant/${id}`, { tenantId }).then((r) => r.data),
  vacate: (id) =>
    api.patch(`/unit/unassign-tenant/${id}`).then((r) => r.data),
  unassignTenant: (id) =>
    api.patch(`/unit/unassign-tenant/${id}`).then((r) => r.data),
  seedBuilding: () => api.post("/unit/seed-building").then((r) => r.data),
  statusMatrix: (params) =>
    api.get("/unit/status-matrix", { params }).then((r) => {
      const data = r.data;
      if (!data || !Array.isArray(data.units)) return data;

      return {
        ...data,
        units: data.units.map(normalizeUnit),
      };
    }),
};

export default unitApi;
