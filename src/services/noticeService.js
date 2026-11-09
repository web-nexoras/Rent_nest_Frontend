import api from "../lib/axios.js";

// Endpoints from routes/noticeRoute/allNoticeRoutes.js (mounted at /notice)
export const noticeService = {
  list: (params) => api.get("/notice/getall", { params }).then((r) => r.data),
  get: (id) => api.get(`/notice/single/${id}`).then((r) => r.data),
  create: (payload) => api.post("/notice/create", payload).then((r) => r.data),
  update: (id, payload) => api.patch(`/notice/update/${id}`, payload).then((r) => r.data),
  remove: (id) => api.delete(`/notice/del/${id}`).then((r) => r.data),
  addComment: (id, text) =>
    api.post(`/notice/comment/${id}`, { text }).then((r) => r.data),
  deleteComment: (id, commentId) =>
    api.delete(`/notice/del-comment/${id}/${commentId}`).then((r) => r.data),
};
