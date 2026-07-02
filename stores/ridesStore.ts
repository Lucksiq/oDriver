import { create } from "zustand";
import { persist } from "zustand/middleware";
import { uid } from "@/lib/id";
import { safeStorage } from "@/lib/persist";
import { seedRides } from "@/lib/mock-seed";
import type { Ride } from "@/lib/types";

interface RidesState {
  hydrated: boolean;
  rides: Ride[];
  setHydrated: (v: boolean) => void;
  addRide: (input: Omit<Ride, "id" | "createdAt">) => void;
  updateRide: (id: string, partial: Partial<Ride>) => void;
  removeRide: (id: string) => void;
}

export const useRidesStore = create<RidesState>()(
  persist(
    (set) => ({
      hydrated: false,
      rides: seedRides,
      setHydrated: (v) => set({ hydrated: v }),
      addRide: (input) =>
        set((s) => ({
          rides: [
            { ...input, id: uid(), createdAt: new Date().toISOString() },
            ...s.rides,
          ],
        })),
      updateRide: (id, partial) =>
        set((s) => ({
          rides: s.rides.map((r) => (r.id === id ? { ...r, ...partial } : r)),
        })),
      removeRide: (id) =>
        set((s) => ({ rides: s.rides.filter((r) => r.id !== id) })),
    }),
    {
      name: "odriver-rides",
      storage: safeStorage<RidesState>(),
      skipHydration: true,
      partialize: (s) => ({ rides: s.rides }) as RidesState,
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);
