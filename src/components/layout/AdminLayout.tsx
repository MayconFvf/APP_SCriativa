import { Menu } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { LogoutButton } from "../auth/LogoutButton";
import { adminNavItems } from "../../config/navigation";
import { AdminSidebar } from "./AdminSidebar";
import { Logo } from "../brand/Logo";

const mobileAdminLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    "flex min-h-12 items-center gap-3 rounded-lg px-3 py-2 text-sm font-bold",
    isActive ? "bg-white text-ink" : "text-white/[0.68] hover:bg-white/10"
  ].join(" ");

export function AdminLayout() {
  return (
    <div className="admin-surface min-h-screen text-white">
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:block lg:w-72">
        <AdminSidebar />
      </div>

      <header className="sticky top-0 z-30 border-b border-white/10 bg-ink/[0.82] backdrop-blur-xl lg:hidden">
        <div className="flex h-16 items-center justify-between px-4">
          <Logo to="/admin/dashboard" compact />
          <details className="group relative">
            <summary className="grid h-11 w-11 cursor-pointer list-none place-items-center rounded-lg border border-white/10 bg-white/10 marker:hidden">
              <Menu size={21} aria-hidden="true" />
            </summary>
            <nav className="fixed left-4 right-4 top-16 grid max-h-[calc(100svh-5rem)] gap-1 overflow-y-auto rounded-lg border border-white/10 bg-night p-2 shadow-soft">
              {adminNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink key={item.path} to={item.path} className={mobileAdminLinkClass}>
                    <Icon size={18} aria-hidden="true" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
              <LogoutButton className="flex min-h-12 items-center gap-3 rounded-lg px-3 py-2 text-sm font-bold text-coral transition hover:bg-white/10 disabled:opacity-60" />
            </nav>
          </details>
        </div>
      </header>

      <main className="lg:pl-72">
        <div className="mx-auto min-h-screen w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
