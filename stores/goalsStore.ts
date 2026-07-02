import { create } from "zustand";
import { persist } from "zustand/middleware";
import { safeStorage } from "@/lib/persist";
import { seedGoalsHistory, type GoalHistoryEntry } from "@/lib/mock-seed";

interface GoalsState {
  hydrated: boolean;
  history: GoalHistoryEntry[];
  setHydrated: (v: boolean) => void;
}

export const useGoalsStore = create<GoalsState>()(
  persist(
    (set) => ({
      hydrated: false,
      history: seedGoalsHistory,
      setHydrated: (v) => set({ hydrated: v }),
    }),
    {
      name: "odriver-goals",
      storage: safeStorage<GoalsState>(),
      skipHydration: true,
      partialize: (s) => ({ history: s.history }) as GoalsState,
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);
