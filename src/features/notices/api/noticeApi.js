import api from "@/lib/apiClient.js";

export const listNotices = (params) =>
  api.get("/notice/getall", { params }).then((response) => response.data);

export const getNotice = (id) =>
  api.get(`/notice/single/${id}`).then((response) => response.data);

export const createNotice = (payload) =>
  api.post("/notice/create", payload).then((response) => response.data);

export const updateNotice = (id, payload) =>
  api.patch(`/notice/update/${id}`, payload).then((response) => response.data);

export const deleteNotice = (id) =>
  api.delete(`/notice/del/${id}`).then((response) => response.data);

export const addNoticeComment = (id, text) =>
  api.post(`/notice/comment/${id}`, { text }).then((response) => response.data);

export const deleteNoticeComment = (id, commentId) =>
  api.delete(`/notice/del-comment/${id}/${commentId}`).then((response) => response.data);
