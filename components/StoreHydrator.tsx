"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useRidesStore } from "@/stores/ridesStore";
import { useFinanceStore } from "@/stores/financeStore";
import { useGoalsStore } from "@/stores/goalsStore";
import { useCommunityStore } from "@/stores/communityStore";
import { useMapStore } from "@/stores/mapStore";
import { useVoiceStore } from "@/stores/voiceStore";

export function StoreHydrator() {
  useEffect(() => {
    useAuthStore.persist.rehydrate();
    useRidesStore.persist.rehydrate();
    useFinanceStore.persist.rehydrate();
    useGoalsStore.persist.rehydrate();
    useCommunityStore.persist.rehydrate();
    useMapStore.persist.rehydrate();
    useVoiceStore.persist.rehydrate();
  }, []);

  return null;
}
