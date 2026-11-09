import api from "../lib/axios.js";

// Endpoints from routes/paymentRoute/allPaymentsRoutes.js (mounted at /payment)
export const paymentService = {
  submit: (payload) => api.post("/payment/submit", payload).then((r) => r.data),
  mine: (params) => api.get("/payment/my-payments", { params }).then((r) => r.data),
  receipt: (id) => api.get(`/payment/receipt/${id}`).then((r) => r.data),
  list: (params) => api.get("/payment/all-payments", { params }).then((r) => r.data),
  verify: (id) => api.patch(`/payment/verify/${id}`).then((r) => r.data),
  reject: (id) => api.patch(`/payment/reject/${id}`).then((r) => r.data),
  overdue: (params) => api.get("/payment/overdue", { params }).then((r) => r.data),
  monthlyReport: (params) =>
    api.get("/payment/monthly-report", { params }).then((r) => r.data),
};
