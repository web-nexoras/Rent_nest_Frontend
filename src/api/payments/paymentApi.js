import api from "../client.js";

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

// Payment, gateway and treasury endpoints (/payment)
export const paymentApi = {
  list: (params) =>
    api.get("/payment/all-payments", { params }).then((r) => r.data),
  myPayments: (params) =>
    api.get("/payment/my-payments", { params }).then((r) => r.data),
  mine: (params) =>
    api.get("/payment/my-payments", { params }).then((r) => r.data),
  submit: (payload) => {
    const rawMethod = payload.paymentMethod || payload.method || "bKash";
    const paymentMethod =
      METHOD_MAP[String(rawMethod).toLowerCase()] || rawMethod;
    const body = {
      ...payload,
      paymentMethod,
    };
    return api.post("/payment/submit", body).then((r) => r.data);
  },
  create: function (payload) {
    return this.submit(payload);
  },
  initSsl: (payload = {}) =>
    api.post("/payment/ssl/init", payload).then((r) => r.data),
  verify: (id) => api.patch(`/payment/verify/${id}`).then((r) => r.data),
  reject: (id) => api.patch(`/payment/reject/${id}`).then((r) => r.data),
  receipt: (id) => api.get(`/payment/receipt/${id}`).then((r) => r.data),
  overdue: (params) =>
    api.get("/payment/overdue", { params }).then((r) => r.data),
  monthlyReport: (params) =>
    api.get("/payment/monthly-report", { params }).then((r) => r.data),
  remindTenant: (tenantId, payload = {}) =>
    api.post(`/payment/remind/${tenantId}`, payload).then((r) => r.data),
  remindAll: (payload = {}) =>
    api.post("/payment/remind-all", payload).then((r) => r.data),
};

export default paymentApi;
