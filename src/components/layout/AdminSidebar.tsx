import { NavLink } from "react-router-dom";
import { LogoutButton } from "../auth/LogoutButton";
import { useAuth } from "../../hooks/useAuth";
import { adminNavItems } from "../../config/navigation";
import { Logo } from "../brand/Logo";

const adminLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    "flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm font-bold transition",
    isActive
      ? "bg-white text-ink shadow-neon"
      : "text-white/[0.62] hover:bg-white/10 hover:text-white"
  ].join(" ");

export function AdminSidebar() {
  const { user } = useAuth();

  return (
    <aside className="flex h-full flex-col border-r border-white/10 bg-gradient-to-b from-night via-graphite to-ink px-4 py-5 text-white">
      <Logo to="/admin/dashboard" />

      <div className="mt-6 rounded-lg border border-white/10 bg-white/[0.08] p-3">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-aqua">
          Orçamentos inteligentes
        </p>
        <p className="mt-2 text-sm leading-6 text-white/[0.58]">
          Painel interno para operação SCRIATIVA.
        </p>
      </div>

      <nav className="mt-6 grid gap-1">
        {adminNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink key={item.path} to={item.path} className={adminLinkClass}>
              <Icon size={18} aria-hidden="true" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-auto rounded-lg border border-white/10 bg-white/[0.08] p-3">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-white/[0.38]">
          Admin
        </p>
        <p className="mt-1 truncate text-sm font-black text-white">
          {user?.email ?? "SCRIATIVA"}
        </p>
        <LogoutButton className="mt-3 flex min-h-10 items-center gap-2 rounded-lg text-sm font-bold text-white/[0.62] transition hover:text-coral disabled:opacity-60" />
      </div>
    </aside>
  );
}
