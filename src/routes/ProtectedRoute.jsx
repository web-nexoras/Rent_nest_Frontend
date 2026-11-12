import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth.jsx";
import { FullScreenLoader } from "@/components/common/PageLoader.jsx";

const homeFor = (user) => (user?.role === "admin" ? "/admin/dashboard" : "/tenant/dashboard");

/** Requires a signed-in user; optionally restricts to a role. */
export function ProtectedRoute({ role }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <FullScreenLoader />;
  if (!user) return <Navigate to="/signin" replace state={{ from: location.pathname }} />;
  if (role && user.role !== role) return <Navigate to={homeFor(user)} replace />;
  return <Outlet />;
}

/** Signin/signup pages: bounce signed-in users to their dashboard. */
export function PublicOnlyRoute() {
  const { user, loading } = useAuth();
  // Let public forms render while session restoration is in flight. A slow or
  // sleeping API should not block the signup page from appearing.
  if (loading) return <Outlet />;
  if (user) return <Navigate to={homeFor(user)} replace />;
  return <Outlet />;
}

export function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <FullScreenLoader />;
  return <Navigate to={user ? homeFor(user) : "/signin"} replace />;
}
