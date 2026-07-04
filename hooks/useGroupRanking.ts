"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { mapGroupRankingEntryRow } from "@/lib/supabase/mappers";
import { useAuth } from "@/providers/AuthProvider";
import type { RankingEntry } from "@/lib/types";

export function useGroupRanking(groupId: string) {
  const { user } = useAuth();
  const [entries, setEntries] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const refresh = useCallback(async () => {
    const { data, error: rpcError } = await supabase.rpc("get_group_ranking", {
      p_group_id: groupId,
    });
    if (rpcError) {
      setError(rpcError.message);
      setLoading(false);
      return;
    }
    setEntries((data ?? []).map((row) => mapGroupRankingEntryRow(row, user?.id)));
    setLoading(false);
  }, [supabase, groupId, user?.id]);

  useEffect(() => {
    // Fetch-on-mount; see useRides.ts for why this needs the disable.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [refresh]);

  return { entries, loading, error };
}
