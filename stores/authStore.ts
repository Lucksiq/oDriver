import { create } from "zustand";
import { persist } from "zustand/middleware";
import { uid } from "@/lib/id";
import { safeStorage } from "@/lib/persist";
import { DEMO_CITY } from "@/lib/geo";
import type { Platform, Profile } from "@/lib/types";

interface Account {
  password: string;
  profile: Profile;
}

interface AuthState {
  hydrated: boolean;
  currentUserId: string | null;
  accounts: Record<string, Account>;
  setHydrated: (v: boolean) => void;
  register: (input: {
    displayName: string;
    email: string;
    password: string;
  }) => { ok: true } | { ok: false; error: string };
  login: (input: {
    email: string;
    password: string;
  }) => { ok: true } | { ok: false; error: string };
  loginDemo: () => void;
  logout: () => void;
  completeOnboarding: (data: {
    platforms: Platform[];
    city: string;
    state: string;
    dailyGoal: number;
  }) => void;
  updateProfile: (partial: Partial<Profile>) => void;
  setPremium: (value: boolean) => void;
  currentUser: () => Profile | null;
}

function demoAccount(): Account {
  const email = "demo@odriver.app";
  const profile: Profile = {
    id: "demo-user",
    email,
    username: "demo",
    displayName: "Carlos Mendes",
    city: DEMO_CITY.name,
    state: DEMO_CITY.state,
    platforms: ["uber", "99", "ifood"],
    dailyGoal: 200,
    weeklyGoal: 1200,
    monthlyGoal: 5000,
    isPremium: false,
    showEarningsPublic: false,
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    onboardingComplete: true,
  };
  return { password: "demo123", profile };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      currentUserId: null,
      accounts: { "demo@odriver.app": demoAccount() },
      setHydrated: (v) => set({ hydrated: v }),
      register: ({ displayName, email, password }) => {
        const key = email.toLowerCase();
        if (get().accounts[key]) {
          return { ok: false, error: "Já existe uma conta com este e-mail" };
        }
        const profile: Profile = {
          id: uid(),
          email: key,
          username: key.split("@")[0],
          displayName,
          city: "",
          state: "",
          platforms: [],
          dailyGoal: 150,
          weeklyGoal: 900,
          monthlyGoal: 3800,
          isPremium: false,
          showEarningsPublic: false,
          createdAt: new Date().toISOString(),
          onboardingComplete: false,
        };
        set((s) => ({
          accounts: { ...s.accounts, [key]: { password, profile } },
          currentUserId: key,
        }));
        return { ok: true };
      },
      login: ({ email, password }) => {
        const key = email.toLowerCase();
        const account = get().accounts[key];
        if (!account || account.password !== password) {
          return { ok: false, error: "E-mail ou senha incorretos" };
        }
        set({ currentUserId: key });
        return { ok: true };
      },
      loginDemo: () => set({ currentUserId: "demo@odriver.app" }),
      logout: () => set({ currentUserId: null }),
      completeOnboarding: (data) => {
        const key = get().currentUserId;
        if (!key) return;
        set((s) => ({
          accounts: {
            ...s.accounts,
            [key]: {
              ...s.accounts[key],
              profile: {
                ...s.accounts[key].profile,
                ...data,
                onboardingComplete: true,
              },
            },
          },
        }));
      },
      updateProfile: (partial) => {
        const key = get().currentUserId;
        if (!key) return;
        set((s) => ({
          accounts: {
            ...s.accounts,
            [key]: {
              ...s.accounts[key],
              profile: { ...s.accounts[key].profile, ...partial },
            },
          },
        }));
      },
      setPremium: (value) => {
        const key = get().currentUserId;
        if (!key) return;
        set((s) => ({
          accounts: {
            ...s.accounts,
            [key]: {
              ...s.accounts[key],
              profile: {
                ...s.accounts[key].profile,
                isPremium: value,
                premiumUntil: value
                  ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
                  : undefined,
              },
            },
          },
        }));
      },
      currentUser: () => {
        const key = get().currentUserId;
        return key ? (get().accounts[key]?.profile ?? null) : null;
      },
    }),
    {
      name: "odriver-auth",
      storage: safeStorage<AuthState>(),
      skipHydration: true,
      partialize: (s) =>
        ({ currentUserId: s.currentUserId, accounts: s.accounts }) as AuthState,
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);

export function useCurrentProfile() {
  return useAuthStore((s) =>
    s.currentUserId ? (s.accounts[s.currentUserId]?.profile ?? null) : null,
  );
}
