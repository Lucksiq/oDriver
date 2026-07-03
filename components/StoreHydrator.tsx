"use client";

import { useEffect } from "react";
import { useCommunityStore } from "@/stores/communityStore";
import { useVoiceStore } from "@/stores/voiceStore";

export function StoreHydrator() {
  useEffect(() => {
    useCommunityStore.persist.rehydrate();
    useVoiceStore.persist.rehydrate();
  }, []);

  return null;
}
