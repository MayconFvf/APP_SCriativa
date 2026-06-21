import { createContext } from "react";
import type { Session, User } from "@supabase/supabase-js";

export type UserRole = "admin" | "cliente";

export type AuthProfile = {
  id: string;
  user_id: string;
  cliente_id: string | null;
  nome: string | null;
  email: string | null;
  telefone: string | null;
  role: UserRole;
  ativo: boolean | null;
};

type AuthResult = {
  error: string | null;
  role?: UserRole | null;
  needsConfirmation?: boolean;
};

export type ClientSignUpPayload = {
  nome: string;
  email: string;
  password: string;
};

export type AuthContextValue = {
  session: Session | null;
  user: User | null;
  profile: AuthProfile | null;
  role: UserRole | null;
  loading: boolean;
  signIn: (email: string, password: string, remember?: boolean) => Promise<AuthResult>;
  signUpCliente: (payload: ClientSignUpPayload) => Promise<AuthResult>;
  signOut: () => Promise<AuthResult>;
  refreshProfile: () => Promise<AuthProfile | null>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
