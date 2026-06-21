import { LoaderCircle } from "lucide-react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import type { UserRole } from "../../contexts/auth-context";
import { useAuth } from "../../hooks/useAuth";

type ProtectedRouteProps = {
  allowedRoles?: UserRole[];
  redirectTo?: string;
};

function getHomeForRole(role: UserRole | null) {
  if (role === "admin") return "/admin/dashboard";
  if (role === "cliente") return "/cliente/pedidos";
  return "/cliente/login";
}

export function ProtectedRoute({ allowedRoles, redirectTo = "/cliente/login" }: ProtectedRouteProps) {
  const { loading, role, session, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (loading) {
    return (
      <main className="creative-surface grid min-h-screen place-items-center px-4 text-white">
        <div className="flex max-w-full items-center gap-3 rounded-lg border border-white/10 bg-white/[0.08] px-5 py-4 shadow-line backdrop-blur-xl">
          <LoaderCircle className="animate-spin text-aqua" size={22} aria-hidden="true" />
          <span className="text-sm font-bold text-white/[0.7]">Verificando sessão...</span>
        </div>
      </main>
    );
  }

  if (!session) {
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }

  if (!role) {
    return (
      <main className="creative-surface grid min-h-screen place-items-center px-4 text-white">
        <section className="neon-card w-full max-w-lg p-5 text-center sm:p-6">
          <h1 className="text-xl font-black text-white sm:text-2xl">Não foi possível identificar seu acesso</h1>
          <p className="mt-3 text-sm leading-6 text-white/[0.62]">
            Sua sessão está ativa, mas o perfil não foi encontrado como admin ou cliente.
            Confira o cadastro no Supabase e tente entrar novamente.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              className="btn-secondary w-full sm:w-auto"
              type="button"
              onClick={() => {
                void signOut().then(() => navigate("/cliente/login", { replace: true }));
              }}
            >
              Sair e tentar de novo
            </button>
            <button className="btn-primary w-full sm:w-auto" type="button" onClick={() => navigate("/", { replace: true })}>
              Voltar ao início
            </button>
          </div>
        </section>
      </main>
    );
  }

  if (allowedRoles?.length && (!role || !allowedRoles.includes(role))) {
    return <Navigate to={getHomeForRole(role)} replace />;
  }

  return <Outlet />;
}
