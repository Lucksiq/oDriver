"use client";

import { useEffect } from "react";
import { useCommunityStore } from "@/stores/communityStore";
import { useMapStore } from "@/stores/mapStore";
import { useVoiceStore } from "@/stores/voiceStore";

export function StoreHydrator() {
  useEffect(() => {
    useCommunityStore.persist.rehydrate();
    useMapStore.persist.rehydrate();
    useVoiceStore.persist.rehydrate();
  }, []);

  return null;
}
