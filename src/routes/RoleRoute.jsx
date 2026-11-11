import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth.jsx";

const homeFor = (user) =>
  user?.role === "admin" ? "/admin/dashboard" : "/tenant/dashboard";

/**
 * Restricts a route subtree to a single role. Authentication is handled by the
 * parent ProtectedRoute, so this only needs to redirect users with a different role.
 */
export default function RoleRoute({ role }) {
  const { user } = useAuth();

  if (role && user?.role !== role) {
    return <Navigate to={homeFor(user)} replace />;
  }

  return <Outlet />;
}
