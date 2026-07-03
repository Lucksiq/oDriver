"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { mapGoalRow } from "@/lib/supabase/mappers";
import { useAuth } from "@/providers/AuthProvider";
import type { GoalHistoryEntry } from "@/lib/mock-seed";

export function useGoals() {
  const { user } = useAuth();
  const [history, setHistory] = useState<GoalHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const refresh = useCallback(async () => {
    if (!user) {
      setHistory([]);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", user.id)
      .eq("type", "daily")
      .order("period_start", { ascending: true })
      .limit(30);
    setHistory((data ?? []).map(mapGoalRow));
    setLoading(false);
  }, [user, supabase]);

  useEffect(() => {
    // Fetch-on-mount/user-change; the "no user" branch resolves synchronously,
    // which the linter can't distinguish from an unintended cascading render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [refresh]);

  /** Upserts today's daily-goal record — called whenever today's progress changes. */
  const recordDailyGoal = useCallback(
    async (amount: number, achieved: boolean) => {
      if (!user) return;
      const today = new Date().toISOString().slice(0, 10);
      await supabase.from("goals").upsert(
        {
          user_id: user.id,
          type: "daily",
          amount,
          period_start: today,
          period_end: today,
          achieved,
          achieved_at: achieved ? new Date().toISOString() : null,
        },
        { onConflict: "user_id,type,period_start" },
      );
      await refresh();
    },
    [user, supabase, refresh],
  );

  return { history, loading, recordDailyGoal };
}
