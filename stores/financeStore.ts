import { create } from "zustand";
import { persist } from "zustand/middleware";
import { uid } from "@/lib/id";
import { safeStorage } from "@/lib/persist";
import { seedExpenses, seedExtraEarnings } from "@/lib/mock-seed";
import type { Expense, ExtraEarning } from "@/lib/types";

interface FinanceState {
  hydrated: boolean;
  expenses: Expense[];
  extraEarnings: ExtraEarning[];
  setHydrated: (v: boolean) => void;
  addExpense: (input: Omit<Expense, "id" | "createdAt">) => void;
  removeExpense: (id: string) => void;
  addExtraEarning: (input: Omit<ExtraEarning, "id">) => void;
  removeExtraEarning: (id: string) => void;
}

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set) => ({
      hydrated: false,
      expenses: seedExpenses,
      extraEarnings: seedExtraEarnings,
      setHydrated: (v) => set({ hydrated: v }),
      addExpense: (input) =>
        set((s) => ({
          expenses: [
            { ...input, id: uid(), createdAt: new Date().toISOString() },
            ...s.expenses,
          ],
        })),
      removeExpense: (id) =>
        set((s) => ({ expenses: s.expenses.filter((e) => e.id !== id) })),
      addExtraEarning: (input) =>
        set((s) => ({
          extraEarnings: [{ ...input, id: uid() }, ...s.extraEarnings],
        })),
      removeExtraEarning: (id) =>
        set((s) => ({
          extraEarnings: s.extraEarnings.filter((e) => e.id !== id),
        })),
    }),
    {
      name: "odriver-finance",
      storage: safeStorage<FinanceState>(),
      skipHydration: true,
      partialize: (s) =>
        ({ expenses: s.expenses, extraEarnings: s.extraEarnings }) as FinanceState,
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);
