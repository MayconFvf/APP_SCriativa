import { Component, type ErrorInfo, type ReactNode } from "react";
import { Link } from "react-router-dom";

type AppErrorBoundaryProps = {
  children: ReactNode;
};

type AppErrorBoundaryState = {
  hasError: boolean;
};

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = {
    hasError: false
  };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Erro ao renderizar rota:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="creative-surface grid min-h-screen place-items-center px-4 text-white">
          <section className="neon-card w-full max-w-lg p-5 text-center sm:p-6">
            <h1 className="text-xl font-black text-white sm:text-2xl">Algo não carregou como esperado</h1>
            <p className="mt-3 text-sm leading-6 text-white/[0.62]">
              A rota encontrou um erro ao renderizar. Atualize a página ou volte ao início.
            </p>
            <Link className="btn-primary mt-6 w-full sm:w-auto" to="/">
              Voltar ao início
            </Link>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}
