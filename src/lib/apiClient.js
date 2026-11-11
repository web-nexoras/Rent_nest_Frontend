import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "/api/v1";

// Auth endpoints that must never trigger the silent-refresh flow.
const NO_REFRESH = [
  "/auth/signin",
  "/auth/signup",
  "/auth/verify-otp",
  "/auth/resend-otp",
  "/auth/forget-password",
  "/auth/reset-password",
  "/auth/refresh-token",
  "/auth/log-out",
];

const api = axios.create({
  baseURL,
  withCredentials: true, // backend uses HTTP-only cookies (accTkn / refTkn)
});

let refreshPromise = null;
let onSessionExpired = null;

/** AuthContext registers a callback so a failed refresh logs the user out. */
export const setSessionExpiredHandler = (handler) => {
  onSessionExpired = handler;
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;
    const url = original?.url || "";

    const skip = NO_REFRESH.some((path) => url.startsWith(path));

    // Access token lasts 15 minutes; transparently renew it with the refresh cookie.
    if (status === 401 && original && !original._retry && !skip) {
      original._retry = true;
      try {
        refreshPromise =
          refreshPromise ||
          api.post("/auth/refresh-token").finally(() => {
            refreshPromise = null;
          });
        await refreshPromise;
        return api(original);
      } catch (refreshError) {
        if (onSessionExpired) onSessionExpired();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

/** Extract the backend's `{ success:false, message }` error message. */
export const getErrorMessage = (error, fallback = "Something went wrong") => {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.code === "ERR_NETWORK") {
    return "Cannot reach the server. Check that the backend is running.";
  }
  return error?.message || fallback;
};

export default api;
