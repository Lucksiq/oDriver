"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { mapMapReportRow } from "@/lib/supabase/mappers";
import { useAuth } from "@/providers/AuthProvider";
import type { MapReport, MapReportType } from "@/lib/types";

export function useMapReports() {
  const { user } = useAuth();
  const [reports, setReports] = useState<MapReport[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const instanceId = useId();

  const refresh = useCallback(async () => {
    const { data } = await supabase
      .from("map_reports")
      .select("*")
      .eq("active", true)
      .order("created_at", { ascending: false });
    setReports((data ?? []).map(mapMapReportRow));
    setLoading(false);
  }, [supabase]);

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

  async function confirmReport(id: string) {
    await supabase.rpc("confirm_map_report", { report_id: id });
  }

  const myReportsCount = user
    ? reports.filter((r) => r.userId === user.id).length
    : 0;

  return { reports, loading, myReportsCount, addReport, confirmReport };
}
