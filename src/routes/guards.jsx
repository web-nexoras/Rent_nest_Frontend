import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { FullScreenLoader } from "../components/common/PageLoader.jsx";

const homeFor = (user) => (user?.role === "admin" ? "/admin/dashboard" : "/tenant/dashboard");

/** Requires a signed-in user; optionally restricts to a role. */
export function ProtectedRoute({ role }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <FullScreenLoader />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (role && user.role !== role) return <Navigate to={homeFor(user)} replace />;
  return <Outlet />;
}

/** Login/signup pages: bounce signed-in users to their dashboard. */
export function PublicOnlyRoute() {
  const { user, loading } = useAuth();
  if (loading) return <FullScreenLoader />;
  if (user) return <Navigate to={homeFor(user)} replace />;
  return <Outlet />;
}

export function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <FullScreenLoader />;
  return <Navigate to={user ? homeFor(user) : "/login"} replace />;
}
