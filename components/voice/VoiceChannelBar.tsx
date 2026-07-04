"use client";

import { useState } from "react";
import { Mic, MicOff, PhoneOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { VOICE_CHANNELS } from "@/lib/voice-channels";
import type { VoiceParticipant } from "@/hooks/useVoiceRoom";

function initialsOf(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

export function VoiceChannelBar({
  channelId,
  participants,
  muted,
  onLeave,
  onToggleMute,
  onSetMicEnabled,
}: {
  channelId: string;
  participants: VoiceParticipant[];
  muted: boolean;
  onLeave: () => void;
  onToggleMute: () => void;
  onSetMicEnabled: (enabled: boolean) => void;
}) {
  const [pushToTalk, setPushToTalk] = useState(false);
  const channel = VOICE_CHANNELS.find((c) => c.id === channelId);

  return (
    <Card className="border-primary">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-base">
          <span>#{channel?.name ?? channelId}</span>
          <Button variant="ghost" size="sm" className="text-destructive" onClick={onLeave}>
            <PhoneOff className="size-4" />
            Sair
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-3">
          {participants.map((p) => (
            <div key={p.identity} className="flex flex-col items-center gap-1">
              <Avatar
                className={cn(
                  "size-11 ring-2",
                  p.isSpeaking ? "ring-success" : "ring-transparent",
                )}
              >
                <AvatarFallback
                  className={cn(
                    "text-xs",
                    p.isLocal && "bg-primary text-primary-foreground",
                  )}
                >
                  {initialsOf(p.name)}
                </AvatarFallback>
              </Avatar>
              <span className="max-w-14 truncate text-[10px] text-muted-foreground">
                {p.isLocal ? "Você" : p.name.split(" ")[0]}
              </span>
            </div>
          ))}
        </div>

        <label className="flex items-center justify-between rounded-md border p-3">
          <span className="text-sm font-medium">Push-to-talk</span>
          <Switch
            checked={pushToTalk}
            onCheckedChange={(v) => {
              setPushToTalk(v);
              onSetMicEnabled(!v);
            }}
          />
        </label>

        <div className="flex gap-2">
          {pushToTalk ? (
            <Button
              className="flex-1 select-none"
              variant="outline"
              onMouseDown={() => onSetMicEnabled(true)}
              onMouseUp={() => onSetMicEnabled(false)}
              onMouseLeave={() => onSetMicEnabled(false)}
              onTouchStart={() => onSetMicEnabled(true)}
              onTouchEnd={() => onSetMicEnabled(false)}
            >
              <Mic className="size-4" />
              Segure para falar
            </Button>
          ) : (
            <Button variant={muted ? "outline" : "default"} className="flex-1" onClick={onToggleMute}>
              {muted ? <MicOff className="size-4" /> : <Mic className="size-4" />}
              {muted ? "Ativar microfone" : "Silenciar microfone"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
