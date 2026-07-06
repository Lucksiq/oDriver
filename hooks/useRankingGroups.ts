"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { mapRankingGroupRow } from "@/lib/supabase/mappers";
import { useAuth } from "@/providers/AuthProvider";
import type { RankingGroup, RankingMetric, RankingPeriod } from "@/lib/types";

export function useRankingGroups() {
  const { user } = useAuth();
  const [myGroups, setMyGroups] = useState<RankingGroup[]>([]);
  const [discoverGroups, setDiscoverGroups] = useState<RankingGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const refresh = useCallback(async () => {
    if (!user) {
      setMyGroups([]);
      setDiscoverGroups([]);
      setLoading(false);
      return;
    }
    const [membershipsRes, groupsRes] = await Promise.all([
      supabase.from("ranking_group_members").select("group_id").eq("user_id", user.id),
      supabase.from("ranking_groups").select("*, ranking_group_members(count)"),
    ]);
    const myGroupIds = new Set((membershipsRes.data ?? []).map((m) => m.group_id));
    const groups = (groupsRes.data ?? []).map(mapRankingGroupRow);
    setMyGroups(groups.filter((g) => myGroupIds.has(g.id)));
    setDiscoverGroups(groups.filter((g) => !myGroupIds.has(g.id) && !g.isPrivate));
    setLoading(false);
  }, [supabase, user]);

  useEffect(() => {
    // Fetch-on-mount; see useRides.ts for why this needs the disable.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [refresh]);

  async function createGroup(input: {
    name: string;
    description?: string;
    isPrivate: boolean;
    metric: RankingMetric;
    period: RankingPeriod;
  }) {
    const { data, error } = await supabase.rpc("create_ranking_group", {
      p_name: input.name,
      p_description: input.description ?? "",
      p_is_private: input.isPrivate,
      p_metric: input.metric,
      p_period: input.period,
    });
    if (error || !data) {
      toast.error(error?.message ?? "Não foi possível criar o grupo");
      return null;
    }
    await refresh();
    return mapRankingGroupRow({ ...data, ranking_group_members: [{ count: 1 }] });
  }

  async function joinGroup(inviteCode: string) {
    const { error } = await supabase.rpc("join_ranking_group", {
      p_invite_code: inviteCode.trim(),
    });
    if (error) {
      toast.error("Código inválido ou grupo lotado");
      return false;
    }
    await refresh();
    return true;
  }

  async function leaveGroup(groupId: string) {
    if (!user) return;
    await supabase
      .from("ranking_group_members")
      .delete()
      .eq("group_id", groupId)
      .eq("user_id", user.id);
    await refresh();
  }

  async function deleteGroup(groupId: string) {
    const { data, error } = await supabase
      .from("ranking_groups")
      .delete()
      .eq("id", groupId)
      .select();
    if (error || !data || data.length === 0) {
      toast.error(
        error?.message ??
          "Só o criador com oDriver Premium ou um admin pode remover este grupo",
      );
      return false;
    }
    await refresh();
    return true;
  }

  return { myGroups, discoverGroups, loading, createGroup, joinGroup, leaveGroup, deleteGroup };
}
