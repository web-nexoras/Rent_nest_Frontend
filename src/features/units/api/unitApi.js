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

export const listUnits = (params) =>
  api.get("/unit/all-unit", { params }).then((response) => {
    const data = response.data;
    if (!data || !Array.isArray(data.units)) return data;

    return {
      ...data,
      units: data.units.map(normalizeUnit),
      pagination: toPagination(data, Number(params?.limit) || DEFAULT_LIMIT),
    };
  });

export const getMyUnit = () =>
  api.get("/unit/my-unit").then((response) => response.data);

export const getUnitById = (id) =>
  api.get(`/unit/single-unit/${id}`).then((response) => response.data);

export const createUnit = (payload) =>
  api.post("/unit/create", payload).then((response) => response.data);

export const updateUnit = (id, payload) =>
  api.patch(`/unit/update-unit/${id}`, payload).then((response) => response.data);

export const deleteUnit = (id) =>
  api.delete(`/unit/del-unit/${id}`).then((response) => response.data);

export const assignTenantToUnit = (id, tenantId) =>
  api.patch(`/unit/assign-tenant/${id}`, { tenantId }).then((response) => response.data);

export const vacateUnit = (id) =>
  api.patch(`/unit/unassign-tenant/${id}`).then((response) => response.data);

export const seedBuilding = () =>
  api.post("/unit/seed-building").then((response) => response.data);

export const getUnitStatusMatrix = (params) =>
  api.get("/unit/status-matrix", { params }).then((response) => response.data);
