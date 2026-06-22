import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { clearAuthRememberPreference, setAuthRememberPreference } from "../lib/authStorage";
import { supabase } from "../lib/supabase";
import {
  AuthContext,
  type AuthContextValue,
  type AuthProfile,
  type ClientSignUpPayload
} from "./auth-context";

function getFriendlyAuthError(message?: string) {
  const normalized = message?.toLowerCase() ?? "";

  if (normalized.includes("invalid login credentials")) {
    return "E-mail ou senha inválidos. Confira os dados e tente novamente.";
  }

  if (normalized.includes("email not confirmed")) {
    return "Confirme seu e-mail antes de acessar.";
  }

  if (normalized.includes("user already registered") || normalized.includes("already registered")) {
    return "Já existe uma conta com este e-mail. Faça login para continuar.";
  }

  if (normalized.includes("password")) {
    return "A senha precisa atender aos requisitos de segurança do Supabase.";
  }

  if (normalized.includes("network")) {
    return "Não foi possível conectar ao Supabase agora. Verifique sua internet e tente novamente.";
  }

  return "Não foi possível concluir agora. Tente novamente em instantes.";
}

async function getProfileForUser(user: User) {
  if (!supabase) return null;

  const { data: adminProfile, error: adminProfileError } = await supabase
    .from("admin_profiles")
    .select("id,user_id,nome,email,role,ativo")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .eq("ativo", true)
    .maybeSingle();

  if (adminProfileError) {
    console.error("Erro ao carregar perfil admin em admin_profiles:", adminProfileError);
  }

  if (adminProfile) {
    return {
      id: adminProfile.id,
      user_id: adminProfile.user_id,
      cliente_id: null,
      nome: adminProfile.nome,
      email: adminProfile.email,
      telefone: null,
      role: "admin",
      ativo: adminProfile.ativo
    } satisfies AuthProfile;
  }

  const { data: cliente, error: clienteError } = await supabase
    .from("clientes")
    .select("id,auth_user_id,user_id,nome,email,telefone")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (clienteError) {
    console.error("Erro ao carregar perfil cliente em clientes:", clienteError);
  }

  if (cliente) {
    return {
      id: cliente.id,
      user_id: cliente.auth_user_id ?? cliente.user_id ?? user.id,
      cliente_id: cliente.id,
      nome: cliente.nome,
      email: cliente.email,
      telefone: cliente.telefone,
      role: "cliente",
      ativo: true
    } satisfies AuthProfile;
  }

  console.error("Perfil não encontrado para usuário autenticado:", {
    userId: user.id,
    email: user.email
  });
  return null;
}

async function ensureClienteRecord(user: User, nome: string, email: string) {
  if (!supabase) return;

  const { error } = await supabase
    .from("clientes")
    .upsert(
      {
        auth_user_id: user.id,
        user_id: user.id,
        nome,
        email
      },
      { onConflict: "email" }
    );

  if (error) {
    console.error("Erro ao criar/atualizar cliente após cadastro:", error);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthContextValue["session"]>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (user: User | null) => {
    if (!user) {
      setProfile(null);
      return null;
    }

    try {
      const loadedProfile = await getProfileForUser(user);
      setProfile(loadedProfile);
      return loadedProfile;
    } catch (error) {
      console.error("Erro inesperado ao carregar perfil do usuário:", error);
      setProfile(null);
      return null;
    }
  }, []);

  const applySession = useCallback(
    async (currentSession: AuthContextValue["session"]) => {
      setSession(currentSession);
      await loadProfile(currentSession?.user ?? null);
      setLoading(false);
    },
    [loadProfile]
  );

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    supabase.auth
      .getSession()
      .then(async ({ data }) => {
        if (!isMounted) return;
        await applySession(data.session);
      })
      .catch((error) => {
        console.error("Erro ao recuperar sessão atual do Supabase:", error);
        if (isMounted) setLoading(false);
      });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      void applySession(currentSession).catch((error) => {
        console.error("Erro ao aplicar sessão do Supabase:", error);
        if (isMounted) setLoading(false);
      });
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [applySession]);

  const refreshProfile = useCallback(async () => {
    return loadProfile(session?.user ?? null);
  }, [loadProfile, session?.user]);

  const signIn = useCallback(
    async (email: string, password: string, remember = true) => {
      if (!supabase) {
        return {
          error:
            "Supabase ainda não está configurado. Preencha VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env."
        };
      }

      setAuthRememberPreference(remember);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return { error: getFriendlyAuthError(error.message) };
      }

      setSession(data.session);
      const loadedProfile = await loadProfile(data.user);

      if (!loadedProfile) {
        console.error("Usuário autenticado, mas perfil não encontrado:", {
          userId: data.user.id,
          email: data.user.email
        });
        return { error: "Usuário autenticado, mas perfil não encontrado.", role: null };
      }

      return { error: null, role: loadedProfile.role };
    },
    [loadProfile]
  );

  const signUpCliente = useCallback(
    async (payload: ClientSignUpPayload) => {
      if (!supabase) {
        return {
          error:
            "Supabase ainda não está configurado. Preencha VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env."
        };
      }

      setAuthRememberPreference(true);

      const { data, error } = await supabase.auth.signUp({
        email: payload.email,
        password: payload.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            nome: payload.nome,
            role: "cliente"
          }
        }
      });

      if (error) {
        return { error: getFriendlyAuthError(error.message) };
      }

      if (data.user) {
        await ensureClienteRecord(data.user, payload.nome, payload.email);
      }

      if (data.session && data.user) {
        setSession(data.session);
        const loadedProfile = await loadProfile(data.user);
        return { error: null, role: loadedProfile?.role ?? "cliente" };
      }

      return { error: null, role: "cliente" as const, needsConfirmation: true };
    },
    [loadProfile]
  );

  const signOut = useCallback(async () => {
    clearAuthRememberPreference();

    if (!supabase) {
      setSession(null);
      setProfile(null);
      return { error: null };
    }

    const { error } = await supabase.auth.signOut();

    if (error) {
      return { error: "Não foi possível sair agora. Tente novamente." };
    }

    setSession(null);
    setProfile(null);
    return { error: null };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      role: profile?.role ?? null,
      loading,
      signIn,
      signUpCliente,
      signOut,
      refreshProfile
    }),
    [loading, profile, refreshProfile, session, signIn, signOut, signUpCliente]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
