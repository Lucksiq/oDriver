"use client";

import { useEffect, useState } from "react";

export function useVoiceRoomCounts() {
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    let cancelled = false;
    fetch("/api/voice-rooms")
      .then((res) => (res.ok ? res.json() : {}))
      .then((data) => {
        if (!cancelled) setCounts(data);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return counts;
}
