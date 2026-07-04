"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { VOICE_CHANNELS } from "@/lib/voice-channels";
import { useVoiceRoomCounts } from "@/hooks/useVoiceRoomCounts";

export function ChannelList({
  joinedChannelId,
  connecting,
  onJoin,
}: {
  joinedChannelId: string | null;
  connecting: boolean;
  onJoin: (channelId: string) => void;
}) {
  const counts = useVoiceRoomCounts();

  return (
    <div className="space-y-3">
      {VOICE_CHANNELS.map((channel) => {
        const isJoined = joinedChannelId === channel.id;
        return (
          <Card key={channel.id} className={isJoined ? "border-primary" : undefined}>
            <CardContent className="flex items-center justify-between gap-3 p-3">
              <div>
                <p className="font-semibold">#{channel.name}</p>
                <p className="text-xs text-muted-foreground">{channel.topic}</p>
                <p className="text-xs text-muted-foreground">
                  {counts[channel.id] ?? 0} online
                </p>
              </div>
              <Button
                size="sm"
                variant={isJoined ? "secondary" : "default"}
                disabled={connecting || joinedChannelId !== null}
                onClick={() => onJoin(channel.id)}
              >
                {isJoined ? "Você está aqui" : "Entrar"}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
