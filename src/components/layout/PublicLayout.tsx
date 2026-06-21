import { Outlet } from "react-router-dom";
import { Header } from "./Header";

export function PublicLayout() {
  return (
    <div className="min-h-screen creative-surface text-white">
      <Header />
      <main>
        <Outlet />
      </main>
      <footer className="border-t border-white/10 py-6">
        <div className="section-shell flex flex-col gap-2 text-sm text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <span>SCRIATIVA Orçamentos</span>
          <span>Sistema inteligente para personalizados.</span>
        </div>
      </footer>
    </div>
  );
}
