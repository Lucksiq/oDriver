"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { mapVoiceChannelRow } from "@/lib/supabase/mappers";
import { useAuth } from "@/providers/AuthProvider";
import type { VoiceChannel } from "@/lib/voice-channels";

export function useVoiceChannels() {
  const { user } = useAuth();
  const [myChannels, setMyChannels] = useState<VoiceChannel[]>([]);
  const [discoverChannels, setDiscoverChannels] = useState<VoiceChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const refresh = useCallback(async () => {
    if (!user) {
      setMyChannels([]);
      setDiscoverChannels([]);
      setLoading(false);
      return;
    }
    const [membershipsRes, channelsRes] = await Promise.all([
      supabase.from("voice_channel_members").select("channel_id").eq("user_id", user.id),
      supabase.from("voice_channels").select("*").order("created_at", { ascending: false }),
    ]);
    const myIds = new Set((membershipsRes.data ?? []).map((m) => m.channel_id));
    const channels = (channelsRes.data ?? []).map(mapVoiceChannelRow);
    setMyChannels(channels.filter((c) => myIds.has(c.id)));
    setDiscoverChannels(channels.filter((c) => !myIds.has(c.id) && !c.isPrivate));
    setLoading(false);
  }, [supabase, user]);

  useEffect(() => {
    // Fetch-on-mount; see useRides.ts for why this needs the disable.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [refresh]);

  async function createChannel(input: {
    name: string;
    topic?: string;
    city?: string;
    isPrivate: boolean;
  }) {
    const { data, error } = await supabase.rpc("create_voice_channel", {
      p_name: input.name,
      p_topic: input.topic ?? "",
      p_city: input.city ?? "",
      p_is_private: input.isPrivate,
    });
    if (error || !data) {
      toast.error(error?.message ?? "Não foi possível criar o canal");
      return null;
    }
    await refresh();
    return mapVoiceChannelRow(data);
  }

  /** Joins (or re-opens) a channel by its invite code, persisting membership. */
  async function joinByCode(code: string) {
    const { data, error } = await supabase.rpc("join_voice_channel", {
      p_invite_code: code.trim(),
    });
    if (error || !data) {
      toast.error("Código inválido");
      return null;
    }
    await refresh();
    return mapVoiceChannelRow(data);
  }

  async function leaveChannel(id: string) {
    if (!user) return;
    await supabase
      .from("voice_channel_members")
      .delete()
      .eq("channel_id", id)
      .eq("user_id", user.id);
    await refresh();
  }

  async function deleteChannel(id: string) {
    const { data, error } = await supabase.from("voice_channels").delete().eq("id", id).select();
    if (error || !data || data.length === 0) {
      toast.error(
        error?.message ??
          "Só o criador com oDriver Premium ou um admin pode remover este canal",
      );
      return false;
    }
    await refresh();
    return true;
  }

  return {
    myChannels,
    discoverChannels,
    loading,
    createChannel,
    joinByCode,
    leaveChannel,
    deleteChannel,
  };
}
