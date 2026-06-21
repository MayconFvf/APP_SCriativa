import { useState } from "react";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

type LogoutButtonProps = {
  className?: string;
  iconSize?: number;
};

export function LogoutButton({ className, iconSize = 16 }: LogoutButtonProps) {
  const { role, signOut } = useAuth();
  const navigate = useNavigate();
  const [isLeaving, setIsLeaving] = useState(false);

  async function handleLogout() {
    setIsLeaving(true);
    await signOut();
    navigate(role === "cliente" ? "/cliente/login" : "/gestao-scriativa", { replace: true });
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLeaving}
      className={className}
    >
      <LogOut size={iconSize} aria-hidden="true" />
      <span>{isLeaving ? "Saindo..." : "Sair"}</span>
    </button>
  );
}
