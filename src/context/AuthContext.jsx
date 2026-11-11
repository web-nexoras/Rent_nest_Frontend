import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { authApi as authService } from "../api/auth/authApi.js";
import { setSessionExpiredHandler } from "../lib/axios.js";
import { queryClient } from "../lib/queryClient.js";

const AuthContext = createContext(null);

const normalizeUser = (u) => {
  if (!u) return null;
  return {
    ...u,
    fullName: u.fullName || u.name || "",
  };
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const clearSession = useCallback(() => {
    setUser(null);
    queryClient.clear();
  }, []);

  // Restore the session on page load. The access/refresh tokens live in
  // HTTP-only cookies, so the only way to know if we're signed in is to ask the API.
  // A 401 here is retried once through the refresh-token interceptor.
  useEffect(() => {
    let active = true;
    authService
      .getProfile()
      .then((data) => active && setUser(normalizeUser(data.user)))
      .catch(() => active && setUser(null))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setSessionExpiredHandler(clearSession);
    return () => setSessionExpiredHandler(null);
  }, [clearSession]);

  const signin = useCallback(async (credentials) => {
    await authService.signin(credentials);
    const data = await authService.getProfile();
    const norm = normalizeUser(data.user);
    setUser(norm);
    return norm;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const refreshProfile = useCallback(async () => {
    const data = await authService.getProfile();
    const norm = normalizeUser(data.user);
    setUser(norm);
    return norm;
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === "admin",
      isTenant: user?.role === "tenant",
      isApproved: user?.role === "admin" || user?.approvalStatus === "approved",
      signin,
      login: signin,
      logout,
      refreshProfile,
      setUser,
    }),
    [user, loading, signin, logout, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
