import { useAuthStore } from "@/stores/authStore";
import { useRidesStore } from "@/stores/ridesStore";
import { useFinanceStore } from "@/stores/financeStore";
import { useGoalsStore } from "@/stores/goalsStore";
import { useCommunityStore } from "@/stores/communityStore";
import { useMapStore } from "@/stores/mapStore";
import { useVoiceStore } from "@/stores/voiceStore";

/** True once every persisted store has finished reading localStorage. */
export function useAppHydrated() {
  const auth = useAuthStore((s) => s.hydrated);
  const rides = useRidesStore((s) => s.hydrated);
  const finance = useFinanceStore((s) => s.hydrated);
  const goals = useGoalsStore((s) => s.hydrated);
  const community = useCommunityStore((s) => s.hydrated);
  const map = useMapStore((s) => s.hydrated);
  const voice = useVoiceStore((s) => s.hydrated);
  return auth && rides && finance && goals && community && map && voice;
}
