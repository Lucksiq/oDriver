"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Room, RoomEvent } from "livekit-client";
import { toast } from "sonner";
import { useAuth } from "@/providers/AuthProvider";

export interface VoiceParticipant {
  identity: string;
  name: string;
  isSpeaking: boolean;
  isLocal: boolean;
}

export function useVoiceRoom() {
  const { user } = useAuth();
  const roomRef = useRef<Room | null>(null);
  const [channelId, setChannelId] = useState<string | null>(null);
  const [participants, setParticipants] = useState<VoiceParticipant[]>([]);
  const [muted, setMuted] = useState(false);
  const [connecting, setConnecting] = useState(false);

  const syncParticipants = useCallback(() => {
    const room = roomRef.current;
    if (!room) {
      setParticipants([]);
      return;
    }
    const all = [room.localParticipant, ...Array.from(room.remoteParticipants.values())];
    setParticipants(
      all.map((p) => ({
        identity: p.identity,
        name: p.name || p.identity,
        isSpeaking: p.isSpeaking,
        isLocal: p === room.localParticipant,
      })),
    );
  }, []);

  const join = useCallback(
    async (id: string) => {
      if (!user || roomRef.current) return;
      setConnecting(true);
      try {
        const res = await fetch("/api/voice-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ room: id }),
        });
        if (!res.ok) throw new Error("token");
        const { token, url } = await res.json();

        const room = new Room();
        room
          .on(RoomEvent.ParticipantConnected, syncParticipants)
          .on(RoomEvent.ParticipantDisconnected, syncParticipants)
          .on(RoomEvent.ActiveSpeakersChanged, syncParticipants)
          .on(RoomEvent.Disconnected, () => {
            roomRef.current = null;
            setChannelId(null);
            setParticipants([]);
          });

        await room.connect(url, token);
        try {
          await room.localParticipant.setMicrophoneEnabled(true);
        } catch {
          toast.error("Não foi possível acessar o microfone. Verifique as permissões do navegador.");
        }
        roomRef.current = room;
        setChannelId(id);
        setMuted(false);
        syncParticipants();
      } catch {
        toast.error("Não foi possível entrar no canal de voz.");
      } finally {
        setConnecting(false);
      }
    },
    [user, syncParticipants],
  );

  const leave = useCallback(async () => {
    await roomRef.current?.disconnect();
    roomRef.current = null;
    setChannelId(null);
    setParticipants([]);
  }, []);

  const setMicEnabled = useCallback(async (enabled: boolean) => {
    const room = roomRef.current;
    if (!room) return;
    await room.localParticipant.setMicrophoneEnabled(enabled);
    setMuted(!enabled);
  }, []);

  const toggleMute = useCallback(() => setMicEnabled(muted), [muted, setMicEnabled]);

  useEffect(() => {
    return () => {
      roomRef.current?.disconnect();
    };
  }, []);

  return { channelId, participants, muted, connecting, join, leave, toggleMute, setMicEnabled };
}
