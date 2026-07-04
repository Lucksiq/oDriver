"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { mapRankingStatsRow } from "@/lib/supabase/mappers";
import { useAuth } from "@/providers/AuthProvider";
import type { RankingEntry } from "@/lib/types";

export function useRankingStats() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const refresh = useCallback(async () => {
    const { data } = await supabase
      .from("ranking_stats")
      .select("*")
      .order("weekly_earnings", { ascending: false });
    setEntries((data ?? []).map((row) => mapRankingStatsRow(row, user?.id)));
    setLoading(false);
  }, [supabase, user?.id]);

  useEffect(() => {
    // Fetch-on-mount; see useRides.ts for why this needs the disable.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [refresh]);

  return { entries, loading };
}
