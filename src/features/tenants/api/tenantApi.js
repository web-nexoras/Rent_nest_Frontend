import api from "@/lib/apiClient.js";

const DEFAULT_LIMIT = 50;

const toPagination = (data, fallbackLimit = DEFAULT_LIMIT) => {
  const limit = Number(data?.limit) || fallbackLimit;
  const total = Number(data?.total ?? data?.tenants?.length ?? 0);
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

/**
 * The API returns raw Mongo documents (`name`, `nidNumber`, `presentAddress`,
 * `profileImage`). Normalize once here so every page can rely on the same
 * friendly field names without duplicating mappings.
 */
export const normalizeTenant = (tenant = {}) => {
  const profileImage = tenant.profileImage;
  const avatar =
    tenant.avatar ||
    (typeof profileImage === "string" && profileImage
      ? { url: profileImage }
      : profileImage || null);

  return {
    ...tenant,
    fullName: tenant.fullName || tenant.name || "",
    nationalId: tenant.nationalId || tenant.nidNumber || "",
    address: tenant.address || tenant.presentAddress || "",
    avatar,
  };
};

const normalizeTenantResponse = (data) => {
  if (!data) return data;

  if (Array.isArray(data)) {
    return data.map(normalizeTenant);
  }

  if (!Array.isArray(data.tenants)) return data;

  return {
    ...data,
    tenants: data.tenants.map(normalizeTenant),
    pagination: toPagination(data),
  };
};

/** Map the UI's friendly names back to the backend's Mongo field names. */
const toTenantBody = (payload = {}) => {
  const body = { ...payload };

  if (body.name === undefined && body.fullName !== undefined) {
    body.name = body.fullName;
  }
  if (body.nidNumber === undefined && body.nationalId !== undefined) {
    body.nidNumber = body.nationalId;
  }
  if (body.presentAddress === undefined && body.address !== undefined) {
    body.presentAddress = body.address;
  }

  delete body.fullName;
  delete body.nationalId;
  delete body.address;
  delete body.avatar;
  delete body.emergencyContact;

  // An empty password means "leave the current password unchanged".
  if (body.password === "" || body.password === null) {
    delete body.password;
  }

  return body;
};

export const getTenants = (params) =>
  api
    .get("/admin/tenants", { params })
    .then((response) => normalizeTenantResponse(response.data));

export const getPendingUsers = () =>
  api.get("/admin/pending").then((response) => {
    const data = response.data;
    return {
      ...data,
      pendingUsers: (data?.pendingUsers || []).map(normalizeTenant),
    };
  });

export const createTenant = (payload) =>
  api
    .post("/admin/tenants/create", toTenantBody(payload))
    .then((response) => response.data);

export const updateTenant = (id, payload) =>
  api
    .patch(`/admin/tenants/${id}`, toTenantBody(payload))
    .then((response) => response.data);

export const deleteTenant = (id) =>
  api.delete(`/admin/tenants/${id}`).then((response) => response.data);

export const toggleTenantActive = (id) =>
  api.patch(`/admin/tenants/${id}/toggle-active`).then((response) => response.data);

export const updateTenantApproval = (id, approvalStatus, unitId) =>
  api
    .patch(`/admin/tenants/${id}/approval`, {
      approvalStatus,
      ...(unitId ? { unitId } : {}),
    })
    .then((response) => response.data);
