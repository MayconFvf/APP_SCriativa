import { ClipboardList, Home, LogOut, Menu } from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Logo } from "../brand/Logo";

const customerNavItems = [
  { label: "Painel", path: "/cliente/painel", icon: Home },
  { label: "Pedidos", path: "/cliente/pedidos", icon: ClipboardList }
];

const navClass = ({ isActive }: { isActive: boolean }) =>
  [
    "flex min-h-11 items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold transition",
    isActive ? "bg-white text-ink" : "text-white/[0.68] hover:bg-white/10 hover:text-white"
  ].join(" ");

export function CustomerLayout() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await signOut();
    navigate("/cliente/login", { replace: true });
  }

  return (
    <div className="creative-surface min-h-screen text-white">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-ink/[0.78] backdrop-blur-xl">
        <div className="section-shell flex h-16 items-center justify-between gap-4">
          <Logo to="/cliente/painel" />

          <nav className="hidden items-center gap-1 rounded-lg border border-white/10 bg-white/[0.08] p-1 md:flex">
            {customerNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink key={item.path} to={item.path} className={navClass}>
                  <Icon size={17} aria-hidden="true" />
                  {item.label}
                </NavLink>
              );
            })}
            <button
              type="button"
              onClick={handleLogout}
              className="flex min-h-11 items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold text-coral transition hover:bg-white/10"
            >
              <LogOut size={17} aria-hidden="true" />
              Sair
            </button>
          </nav>

          <details className="group relative md:hidden">
            <summary className="grid h-11 w-11 cursor-pointer list-none place-items-center rounded-lg border border-white/10 bg-white/10 marker:hidden">
              <Menu size={21} aria-hidden="true" />
            </summary>
            <nav className="fixed left-4 right-4 top-16 grid max-h-[calc(100svh-5rem)] gap-1 overflow-y-auto rounded-lg border border-white/10 bg-night p-2 shadow-soft">
              {customerNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink key={item.path} to={item.path} className={navClass}>
                    <Icon size={17} aria-hidden="true" />
                    {item.label}
                  </NavLink>
                );
              })}
              <button
                type="button"
                onClick={handleLogout}
                className="flex min-h-11 items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold text-coral transition hover:bg-white/10"
              >
                <LogOut size={17} aria-hidden="true" />
                Sair
              </button>
            </nav>
          </details>
        </div>
      </header>

      <main className="section-shell py-6 sm:py-8 lg:py-10">
        <div className="mb-6 sm:mb-8">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-aqua">
            Área do cliente
          </p>
          <h1 className="mt-2 text-2xl font-black text-white sm:text-3xl">
            Olá, {profile?.nome ?? "cliente"}
          </h1>
          <p className="mt-2 text-sm leading-6 text-white/[0.58]">
            Acompanhe seus pedidos, status e valores finais sem informações internas.
          </p>
        </div>
        <Outlet />
      </main>
    </div>
  );
}
