"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { mapProfileRow } from "@/lib/supabase/mappers";
import type { Profile } from "@/lib/types";
import type { TablesUpdate } from "@/lib/supabase/types";

interface AuthContextValue {
  user: User | null;
  profile: Profile | null;
  updateProfile: (
    partial: TablesUpdate<"profiles">,
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
  refreshProfile: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  initialUser: User | null;
  initialProfile: Profile | null;
  children: React.ReactNode;
}

export function AuthProvider({ initialUser, initialProfile, children }: AuthProviderProps) {
  // Keyed by user id so a different signed-in user (or logout) remounts this
  // subtree with fresh state, instead of syncing props into state via effect.
  return (
    <AuthProviderInner
      key={initialUser?.id ?? "anonymous"}
      initialUser={initialUser}
      initialProfile={initialProfile}
    >
      {children}
    </AuthProviderInner>
  );
}

function AuthProviderInner({ initialUser, initialProfile, children }: AuthProviderProps) {
  const [user, setUser] = useState(initialUser);
  const [profile, setProfile] = useState(initialProfile);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        setUser(null);
        setProfile(null);
      } else if (event === "USER_UPDATED" && session?.user) {
        setUser(session.user);
      }
    });
    return () => subscription.unsubscribe();
  }, [supabase]);

  async function updateProfile(partial: TablesUpdate<"profiles">) {
    if (!user) return { ok: false as const, error: "Não autenticado" };
    const { data, error } = await supabase
      .from("profiles")
      .update(partial)
      .eq("id", user.id)
      .select()
      .single();
    if (error || !data) {
      return { ok: false as const, error: error?.message ?? "Erro ao salvar" };
    }
    setProfile(mapProfileRow(data, user));
    return { ok: true as const };
  }

  async function refreshProfile() {
    const {
      data: { user: freshUser },
    } = await supabase.auth.getUser();
    if (!freshUser) return;
    setUser(freshUser);
    const { data } = await supabase.from("profiles").select("*").eq("id", freshUser.id).single();
    if (data) setProfile(mapProfileRow(data, freshUser));
  }

  async function logout() {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    router.push("/login");
  }

  return (
    <AuthContext.Provider value={{ user, profile, updateProfile, refreshProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function useCurrentProfile() {
  return useAuth().profile;
}
