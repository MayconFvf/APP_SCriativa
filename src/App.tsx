import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AdminLayout } from "./components/layout/AdminLayout";
import { CustomerLayout } from "./components/layout/CustomerLayout";
import { PublicLayout } from "./components/layout/PublicLayout";
import { AppErrorBoundary } from "./components/ui/AppErrorBoundary";
import { AuthCallbackPage } from "./pages/auth/AuthCallbackPage";
import { AdminArtPage } from "./pages/admin/AdminArtPage";
import { AdminBudgetListPage } from "./pages/admin/AdminBudgetListPage";
import { AdminClientsPage } from "./pages/admin/AdminClientsPage";
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage";
import { AdminLoginPage } from "./pages/admin/AdminLoginPage";
import { AdminProductsPage } from "./pages/admin/AdminProductsPage";
import { AdminProvidersPage } from "./pages/admin/AdminProvidersPage";
import { AdminReportsPage } from "./pages/admin/AdminReportsPage";
import { AdminServicesPage } from "./pages/admin/AdminServicesPage";
import { AdminSettingsPage } from "./pages/admin/AdminSettingsPage";
import { CustomerDashboardPage } from "./pages/customer/CustomerDashboardPage";
import { CustomerLoginPage } from "./pages/customer/CustomerLoginPage";
import { CustomerOrdersPage } from "./pages/customer/CustomerOrdersPage";
import { CustomerResendConfirmationPage } from "./pages/customer/CustomerResendConfirmationPage";
import { CustomerSignupPage } from "./pages/customer/CustomerSignupPage";
import { BudgetPage } from "./pages/public/BudgetPage";
import { HomePage } from "./pages/public/HomePage";
import { PrivacyPage } from "./pages/public/PrivacyPage";
import { ResultPage } from "./pages/public/ResultPage";
import { TermsPage } from "./pages/public/TermsPage";

export default function App() {
  return (
    <AppErrorBoundary>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/orcamento" element={<BudgetPage />} />
          <Route path="/resultado" element={<ResultPage />} />
          <Route path="/termos" element={<TermsPage />} />
          <Route path="/privacidade" element={<PrivacyPage />} />
        </Route>

        <Route path="/gestao-scriativa" element={<AdminLoginPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/cliente/login" element={<CustomerLoginPage />} />
        <Route path="/cliente/cadastro" element={<CustomerSignupPage />} />
        <Route path="/cliente/reenviar-confirmacao" element={<CustomerResendConfirmationPage />} />

        <Route element={<ProtectedRoute allowedRoles={["cliente"]} redirectTo="/cliente/login" />}>
          <Route path="/cliente" element={<CustomerLayout />}>
            <Route index element={<Navigate to="/cliente/pedidos" replace />} />
            <Route path="painel" element={<CustomerDashboardPage />} />
            <Route path="pedidos" element={<CustomerOrdersPage />} />
            <Route path="*" element={<Navigate to="/cliente/pedidos" replace />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["admin"]} redirectTo="/gestao-scriativa" />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="clientes" element={<AdminClientsPage />} />
            <Route path="produtos" element={<AdminProductsPage />} />
            <Route path="fornecedores" element={<AdminProvidersPage />} />
            <Route path="servicos" element={<AdminServicesPage />} />
            <Route path="artes" element={<AdminArtPage />} />
            <Route path="configuracoes" element={<AdminSettingsPage />} />
            <Route path="orcamentos" element={<AdminBudgetListPage />} />
            <Route path="relatorios" element={<AdminReportsPage />} />
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppErrorBoundary>
  );
}
