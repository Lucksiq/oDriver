"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { mapRideRow } from "@/lib/supabase/mappers";
import { useAuth } from "@/providers/AuthProvider";
import type { Ride } from "@/lib/types";
import type { TablesUpdate } from "@/lib/supabase/types";

export function useRides() {
  const { user } = useAuth();
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const refresh = useCallback(async () => {
    if (!user) {
      setRides([]);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("rides")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setRides((data ?? []).map(mapRideRow));
    setLoading(false);
  }, [user, supabase]);

  useEffect(() => {
    // Fetch-on-mount/user-change; the "no user" branch resolves synchronously,
    // which the linter can't distinguish from an unintended cascading render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [refresh]);

  async function addRide(input: Omit<Ride, "id" | "createdAt">) {
    if (!user) return;
    await supabase.from("rides").insert({
      user_id: user.id,
      platform: input.platform,
      amount: input.amount,
      distance_km: input.distanceKm ?? null,
      duration_minutes: input.durationMinutes ?? null,
      started_at: input.startedAt ?? null,
      ended_at: input.endedAt ?? null,
      ride_type: input.rideType,
      rating: input.rating ?? null,
      notes: input.notes ?? null,
    });
    await refresh();
  }

  async function updateRide(id: string, partial: Partial<Ride>) {
    const patch: TablesUpdate<"rides"> = {};
    if (partial.platform !== undefined) patch.platform = partial.platform;
    if (partial.amount !== undefined) patch.amount = partial.amount;
    if (partial.distanceKm !== undefined) patch.distance_km = partial.distanceKm;
    if (partial.durationMinutes !== undefined)
      patch.duration_minutes = partial.durationMinutes;
    if (partial.startedAt !== undefined) patch.started_at = partial.startedAt;
    if (partial.endedAt !== undefined) patch.ended_at = partial.endedAt;
    if (partial.rideType !== undefined) patch.ride_type = partial.rideType;
    if (partial.rating !== undefined) patch.rating = partial.rating;
    if (partial.notes !== undefined) patch.notes = partial.notes;
    await supabase.from("rides").update(patch).eq("id", id);
    await refresh();
  }

  async function removeRide(id: string) {
    await supabase.from("rides").delete().eq("id", id);
    await refresh();
  }

  return { rides, loading, addRide, updateRide, removeRide };
}
