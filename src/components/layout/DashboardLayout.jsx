import { Suspense, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import Sidebar from "./Sidebar.jsx";
import Topbar from "./Topbar.jsx";
import { ADMIN_NAV_GROUPS, TENANT_NAV_GROUPS } from "./navigation.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { PageLoader } from "../common/PageLoader.jsx";
import { cn } from "../../lib/utils.js";

export default function DashboardLayout() {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { isAdmin } = useAuth();
  const { pathname } = useLocation();

  return (
    <div className="min-h-full bg-surface">
      <Sidebar
        groups={isAdmin ? ADMIN_NAV_GROUPS : TENANT_NAV_GROUPS}
        open={open}
        onClose={() => setOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
      />
      <div className={cn("transition-all duration-300", collapsed ? "lg:pl-20" : "lg:pl-[17rem]")}>
        <Topbar onMenu={() => setOpen(true)} />
        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-8 sm:py-8">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            <Suspense fallback={<PageLoader />}>
              <Outlet />
            </Suspense>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
