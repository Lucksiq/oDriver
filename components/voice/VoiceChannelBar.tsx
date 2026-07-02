"use client";

import { useEffect, useState } from "react";
import { Mic, MicOff, PhoneOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useVoiceStore } from "@/stores/voiceStore";
import { useCurrentProfile } from "@/stores/authStore";

function initialsOf(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

export function VoiceChannelBar() {
  const channels = useVoiceStore((s) => s.channels);
  const joinedChannelId = useVoiceStore((s) => s.joinedChannelId);
  const muted = useVoiceStore((s) => s.muted);
  const toggleMute = useVoiceStore((s) => s.toggleMute);
  const leave = useVoiceStore((s) => s.leave);
  const profile = useCurrentProfile();

  const [pushToTalk, setPushToTalk] = useState(false);
  const [holding, setHolding] = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState(0);

  const channel = channels.find((c) => c.id === joinedChannelId);

  useEffect(() => {
    if (!channel) return;
    const interval = setInterval(() => {
      setSpeakingIndex(Math.floor(Math.random() * channel.membersOnline.length));
    }, 2200);
    return () => clearInterval(interval);
  }, [channel]);

  if (!channel) return null;

  const iAmSpeaking = pushToTalk ? holding && !muted : !muted;

  return (
    <Card className="border-primary">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-base">
          <span>#{channel.name}</span>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive"
            onClick={leave}
          >
            <PhoneOff className="size-4" />
            Sair
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-3">
          <div className="flex flex-col items-center gap-1">
            <Avatar
              className={cn(
                "size-11 ring-2",
                iAmSpeaking ? "ring-success" : "ring-transparent",
              )}
            >
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                {initialsOf(profile?.displayName ?? "Você")}
              </AvatarFallback>
            </Avatar>
            <span className="text-[10px] text-muted-foreground">Você</span>
          </div>
          {channel.membersOnline.map((name, i) => (
            <div key={name} className="flex flex-col items-center gap-1">
              <Avatar
                className={cn(
                  "size-11 ring-2",
                  i === speakingIndex ? "ring-success" : "ring-transparent",
                )}
              >
                <AvatarFallback className="text-xs">{initialsOf(name)}</AvatarFallback>
              </Avatar>
              <span className="max-w-14 truncate text-[10px] text-muted-foreground">
                {name.split(" ")[0]}
              </span>
            </div>
          ))}
        </div>

        <label className="flex items-center justify-between rounded-md border p-3">
          <span className="text-sm font-medium">Push-to-talk</span>
          <Switch checked={pushToTalk} onCheckedChange={setPushToTalk} />
        </label>

        <div className="flex gap-2">
          {pushToTalk ? (
            <Button
              className="flex-1 select-none"
              variant={holding ? "default" : "outline"}
              onMouseDown={() => setHolding(true)}
              onMouseUp={() => setHolding(false)}
              onMouseLeave={() => setHolding(false)}
              onTouchStart={() => setHolding(true)}
              onTouchEnd={() => setHolding(false)}
            >
              <Mic className="size-4" />
              Segure para falar
            </Button>
          ) : (
            <Button variant={muted ? "outline" : "default"} className="flex-1" onClick={toggleMute}>
              {muted ? <MicOff className="size-4" /> : <Mic className="size-4" />}
              {muted ? "Ativar microfone" : "Silenciar microfone"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
