"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { mapMapReportRow } from "@/lib/supabase/mappers";
import { useAuth } from "@/providers/AuthProvider";
import type { MapReport, MapReportType, MapReportVote } from "@/lib/types";

export function useMapReports() {
  const { user } = useAuth();
  const [reports, setReports] = useState<MapReport[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const instanceId = useId();

  const refresh = useCallback(async () => {
    const [reportsRes, votesRes] = await Promise.all([
      supabase
        .from("map_reports")
        .select("*")
        .eq("active", true)
        .order("created_at", { ascending: false }),
      user
        ? supabase.from("map_report_votes").select("report_id, vote").eq("user_id", user.id)
        : Promise.resolve({ data: [] as { report_id: string; vote: string }[] }),
    ]);
    const myVotes = new Map(
      (votesRes.data ?? []).map((v) => [v.report_id, v.vote as MapReportVote]),
    );
    setReports((reportsRes.data ?? []).map((r) => mapMapReportRow(r, myVotes.get(r.id))));
    setLoading(false);
  }, [supabase, user]);

  useEffect(() => {
    // Fetch-on-mount; see useRides.ts for why this needs the disable.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [refresh]);

  useEffect(() => {
    // Unique per hook instance so a Strict Mode double-mount (or two
    // components using this hook at once) never collide on the same topic.
    const channel = supabase
      .channel(`map_reports_changes_${instanceId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "map_reports" },
        () => refresh(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, refresh, instanceId]);

  async function addReport(input: {
    type: MapReportType;
    description?: string;
    latitude: number;
    longitude: number;
    city: string;
  }) {
    if (!user) return;
    await supabase.from("map_reports").insert({
      user_id: user.id,
      type: input.type,
      description: input.description ?? null,
      latitude: input.latitude,
      longitude: input.longitude,
      city: input.city,
    });
  }

  async function voteReport(id: string, vote: MapReportVote) {
    const { error } = await supabase.rpc("vote_map_report", { p_report_id: id, p_vote: vote });
    if (error) {
      toast.error(error.message);
      return;
    }
    await refresh();
  }

  const myReportsCount = user
    ? reports.filter((r) => r.userId === user.id).length
    : 0;

  return { reports, loading, myReportsCount, addReport, voteReport };
}
