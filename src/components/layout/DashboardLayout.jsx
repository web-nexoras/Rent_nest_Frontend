import { Suspense, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import Topbar from "./Topbar.jsx";
import { ADMIN_NAV, TENANT_NAV } from "./navigation.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { PageLoader } from "../common/PageLoader.jsx";

export default function DashboardLayout() {
  const [open, setOpen] = useState(false);
  const { isAdmin } = useAuth();
  const { pathname } = useLocation();

  return (
    <div className="min-h-full">
      <Sidebar items={isAdmin ? ADMIN_NAV : TENANT_NAV} open={open} onClose={() => setOpen(false)} />
      <div className="lg:pl-72">
        <Topbar onMenu={() => setOpen(true)} />
        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-8 sm:py-8">
          {/* key re-triggers the enter animation on every route change */}
          <div key={pathname} className="animate-fade-in">
            <Suspense fallback={<PageLoader />}>
              <Outlet />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}
