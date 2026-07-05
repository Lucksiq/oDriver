"use client";

import { useEffect, useRef, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Mic, Square, Play, Pause, Trash2, X, LogOut } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useVoiceMessages } from "@/hooks/useVoiceMessages";
import { useAudioRecorder, MAX_RECORDING_SECONDS } from "@/hooks/useAudioRecorder";
import { useAuth } from "@/providers/AuthProvider";
import { base64ToObjectUrl, blobToBase64, formatDuration } from "@/lib/audio";
import type { VoiceChannel, VoiceMessage } from "@/lib/voice-channels";

function initialsOf(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

function MessageBubble({
  message,
  isOwn,
  onDelete,
}: {
  message: VoiceMessage;
  isOwn: boolean;
  onDelete: (id: string) => void;
}) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, []);

  function toggle() {
    if (!audioRef.current) {
      const url = base64ToObjectUrl(message.audioData, message.mimeType);
      urlRef.current = url;
      const audio = new Audio(url);
      audio.onended = () => setPlaying(false);
      audioRef.current = audio;
    }
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play();
      setPlaying(true);
    }
  }

  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-3">
        <Avatar className="size-9 shrink-0">
          <AvatarFallback className="text-xs">{initialsOf(message.authorName)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{message.authorName}</p>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true, locale: ptBR })}
          </p>
        </div>
        <Button size="icon" variant="outline" onClick={toggle}>
          {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
        </Button>
        {message.durationSeconds !== undefined && (
          <span className="w-10 text-xs tabular-nums text-muted-foreground">
            {formatDuration(message.durationSeconds)}
          </span>
        )}
        {isOwn && (
          <Button size="icon" variant="ghost" onClick={() => onDelete(message.id)}>
            <Trash2 className="size-4 text-destructive" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export function VoiceMessageBoard({
  channel,
  onLeave,
}: {
  channel: VoiceChannel;
  onLeave: () => void;
}) {
  const { user } = useAuth();
  const { messages, loading, postMessage, deleteMessage } = useVoiceMessages(channel.id);
  const recorder = useAudioRecorder();

  async function handleStopAndSend() {
    const result = await recorder.stop();
    if (result && result.seconds > 0) {
      const base64 = await blobToBase64(result.blob);
      await postMessage(base64, result.blob.type || "audio/webm", result.seconds);
    }
  }

  useEffect(() => {
    if (recorder.recording && recorder.seconds >= MAX_RECORDING_SECONDS) {
      handleStopAndSend();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recorder.recording, recorder.seconds]);

  return (
    <Card className="border-primary">
      <CardHeader className="flex-row items-center justify-between pb-2">
        <CardTitle className="text-base">#{channel.name}</CardTitle>
        <Button variant="ghost" size="sm" onClick={onLeave}>
          <LogOut className="size-4" />
          Sair
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">
          Áudios ficam disponíveis por 12h e depois são apagados automaticamente.
        </p>

        <div className="max-h-96 space-y-2 overflow-y-auto">
          {!loading && messages.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Nenhum áudio ainda. Grave o primeiro!
            </p>
          )}
          {messages.map((m) => (
            <MessageBubble
              key={m.id}
              message={m}
              isOwn={m.authorId === user?.id}
              onDelete={deleteMessage}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          {recorder.recording ? (
            <>
              <Button variant="destructive" className="flex-1" onClick={handleStopAndSend}>
                <Square className="size-4" />
                Parar e enviar ({recorder.seconds}s)
              </Button>
              <Button variant="outline" size="icon" onClick={recorder.cancel}>
                <X className="size-4" />
              </Button>
            </>
          ) : (
            <Button className="flex-1" onClick={recorder.start}>
              <Mic className="size-4" />
              Gravar áudio
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
