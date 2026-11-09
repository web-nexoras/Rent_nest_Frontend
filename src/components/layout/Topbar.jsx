import { useNavigate } from "react-router-dom";
import { ChevronDown, LogOut, Menu, UserCircle } from "lucide-react";
import Dropdown, { DropdownItem } from "../ui/Dropdown.jsx";
import { Avatar } from "../ui/Layout.jsx";
import Badge from "../ui/Badge.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";

export default function Topbar({ onMenu }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      toast.info("You have been signed out");
    } finally {
      navigate("/login", { replace: true });
    }
  };

  return (
    <header className="sticky top-0 z-20 flex h-20 items-center justify-between gap-4 border-b border-navy-100/70 bg-surface/80 px-4 backdrop-blur-xl sm:px-8">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenu}
          className="rounded-xl border border-navy-200 bg-white p-2.5 text-navy-700 shadow-sm lg:hidden"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="hidden sm:block">
          <p className="text-xs text-navy-400">Welcome back,</p>
          <p className="text-base font-semibold text-navy-900">{user?.name}</p>
        </div>
      </div>

      <Dropdown
        trigger={({ open }) => (
          <button
            className="flex items-center gap-3 rounded-2xl border border-navy-100 bg-white px-2.5 py-1.5 shadow-sm transition hover:shadow-card"
            aria-haspopup="menu"
            aria-expanded={open}
          >
            <Avatar name={user?.name} src={user?.profileImage} size="sm" />
            <div className="hidden text-left sm:block">
              <p className="max-w-[10rem] truncate text-sm font-medium leading-tight text-navy-900">
                {user?.name}
              </p>
              <p className="text-xs capitalize text-navy-400">{user?.role}</p>
            </div>
            <ChevronDown className="h-4 w-4 text-navy-400" />
          </button>
        )}
      >
        <div className="px-3 py-2">
          <p className="truncate text-sm font-semibold text-navy-900">{user?.email}</p>
          <div className="mt-1.5">
            <Badge status={user?.approvalStatus}>{user?.role === "admin" ? "Administrator" : user?.approvalStatus}</Badge>
          </div>
        </div>
        <div className="my-1 border-t border-navy-100" />
        <DropdownItem icon={UserCircle} onClick={() => navigate("/profile")}>
          My profile
        </DropdownItem>
        <DropdownItem icon={LogOut} danger onClick={handleLogout}>
          Sign out
        </DropdownItem>
      </Dropdown>
    </header>
  );
}
