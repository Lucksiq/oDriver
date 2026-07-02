import { create } from "zustand";
import { persist } from "zustand/middleware";
import { safeStorage } from "@/lib/persist";
import { generateVoiceChannels } from "@/lib/mock-seed";
import type { VoiceChannel } from "@/lib/types";

interface VoiceState {
  hydrated: boolean;
  channels: VoiceChannel[];
  joinedChannelId: string | null;
  muted: boolean;
  setHydrated: (v: boolean) => void;
  join: (channelId: string) => void;
  leave: () => void;
  toggleMute: () => void;
}

export const useVoiceStore = create<VoiceState>()(
  persist(
    (set) => ({
      hydrated: false,
      channels: generateVoiceChannels(),
      joinedChannelId: null,
      muted: false,
      setHydrated: (v) => set({ hydrated: v }),
      join: (channelId) => set({ joinedChannelId: channelId, muted: false }),
      leave: () => set({ joinedChannelId: null }),
      toggleMute: () => set((s) => ({ muted: !s.muted })),
    }),
    {
      name: "odriver-voice",
      storage: safeStorage<VoiceState>(),
      skipHydration: true,
      partialize: (s) =>
        ({
          joinedChannelId: s.joinedChannelId,
          muted: s.muted,
        }) as VoiceState,
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);
