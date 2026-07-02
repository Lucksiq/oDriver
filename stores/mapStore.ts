import { create } from "zustand";
import { persist } from "zustand/middleware";
import { uid } from "@/lib/id";
import { safeStorage } from "@/lib/persist";
import { seedMapReports } from "@/lib/mock-seed";
import type { MapReport, MapReportType } from "@/lib/types";

interface MapState {
  hydrated: boolean;
  reports: MapReport[];
  myReportsCount: number;
  setHydrated: (v: boolean) => void;
  addReport: (input: {
    type: MapReportType;
    description?: string;
    latitude: number;
    longitude: number;
    city: string;
  }) => void;
  confirmReport: (id: string) => void;
}

export const useMapStore = create<MapState>()(
  persist(
    (set) => ({
      hydrated: false,
      reports: seedMapReports,
      myReportsCount: 0,
      setHydrated: (v) => set({ hydrated: v }),
      addReport: (input) =>
        set((s) => ({
          reports: [
            {
              id: uid(),
              type: input.type,
              latitude: input.latitude,
              longitude: input.longitude,
              description: input.description,
              city: input.city,
              confirmations: 1,
              active: true,
              createdAt: new Date().toISOString(),
            },
            ...s.reports,
          ],
          myReportsCount: s.myReportsCount + 1,
        })),
      confirmReport: (id) =>
        set((s) => ({
          reports: s.reports.map((r) =>
            r.id === id ? { ...r, confirmations: r.confirmations + 1 } : r,
          ),
        })),
    }),
    {
      name: "odriver-map",
      storage: safeStorage<MapState>(),
      skipHydration: true,
      partialize: (s) =>
        ({ reports: s.reports, myReportsCount: s.myReportsCount }) as MapState,
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);
