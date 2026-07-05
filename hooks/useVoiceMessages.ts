"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { mapVoiceMessageRow } from "@/lib/supabase/mappers";
import { useAuth } from "@/providers/AuthProvider";
import type { VoiceMessage } from "@/lib/voice-channels";

export function useVoiceMessages(channelId: string | null) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const instanceId = useId();

  const refresh = useCallback(async () => {
    if (!channelId) {
      setMessages([]);
      setLoading(false);
      return;
    }
    // Best-effort opportunistic cleanup of anything already past its 12h
    // expiry — the RLS policy already hides expired rows from everyone, this
    // just reclaims the space instead of waiting for a scheduled job.
    await supabase.rpc("cleanup_expired_voice_messages");
    const { data } = await supabase
      .from("voice_messages")
      .select("*, profiles(display_name)")
      .eq("channel_id", channelId)
      .order("created_at", { ascending: false });
    setMessages((data ?? []).map(mapVoiceMessageRow));
    setLoading(false);
  }, [supabase, channelId]);

  useEffect(() => {
    // Fetch-on-mount; see useRides.ts for why this needs the disable.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!channelId) return;
    const channel = supabase
      .channel(`voice_messages_${channelId}_${instanceId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "voice_messages", filter: `channel_id=eq.${channelId}` },
        () => refresh(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, channelId, refresh, instanceId]);

  async function postMessage(audioBase64: string, mimeType: string, durationSeconds: number) {
    if (!user || !channelId) return;
    await supabase.from("voice_messages").insert({
      channel_id: channelId,
      user_id: user.id,
      audio_data: audioBase64,
      mime_type: mimeType,
      duration_seconds: durationSeconds,
    });
    await refresh();
  }

  async function deleteMessage(id: string) {
    await supabase.from("voice_messages").delete().eq("id", id);
    await refresh();
  }

  return { messages, loading, postMessage, deleteMessage };
}
