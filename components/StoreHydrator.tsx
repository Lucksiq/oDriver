"use client";

import { useEffect } from "react";
import { useVoiceStore } from "@/stores/voiceStore";

export function StoreHydrator() {
  useEffect(() => {
    useVoiceStore.persist.rehydrate();
  }, []);

  return null;
}
