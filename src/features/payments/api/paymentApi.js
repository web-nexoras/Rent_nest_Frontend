import api from "@/lib/apiClient.js";

const METHOD_MAP = {
  bkash: "bKash",
  nagad: "Nagad",
  rocket: "Rocket",
  upay: "Upay",
  bank_transfer: "Bank",
  bank: "Bank",
  cash: "Cash",
  sslcommerz: "SSLCommerz",
};

export const listPayments = (params) =>
  api.get("/payment/all-payments", { params }).then((response) => response.data);

export const getMyPayments = (params) =>
  api.get("/payment/my-payments", { params }).then((response) => response.data);

export const submitPayment = (payload) => {
  const rawMethod = payload.paymentMethod || payload.method || "bKash";
  const paymentMethod = METHOD_MAP[String(rawMethod).toLowerCase()] || rawMethod;
  return api
    .post("/payment/submit", { ...payload, paymentMethod })
    .then((response) => response.data);
};

export const initSslPayment = (payload = {}) =>
  api.post("/payment/ssl/init", payload).then((response) => response.data);

export const verifyPayment = (id) =>
  api.patch(`/payment/verify/${id}`).then((response) => response.data);

export const rejectPayment = (id) =>
  api.patch(`/payment/reject/${id}`).then((response) => response.data);

export const getPaymentReceipt = (id) =>
  api.get(`/payment/receipt/${id}`).then((response) => response.data);

export const getOverduePayments = (params) =>
  api.get("/payment/overdue", { params }).then((response) => response.data);

export const getMonthlyPaymentReport = (params) =>
  api.get("/payment/monthly-report", { params }).then((response) => response.data);

export const remindTenant = (tenantId, payload = {}) =>
  api.post(`/payment/remind/${tenantId}`, payload).then((response) => response.data);

export const remindAllTenants = (payload = {}) =>
  api.post("/payment/remind-all", payload).then((response) => response.data);
