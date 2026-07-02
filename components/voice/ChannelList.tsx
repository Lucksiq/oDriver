"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useVoiceStore } from "@/stores/voiceStore";

export function ChannelList() {
  const channels = useVoiceStore((s) => s.channels);
  const joinedChannelId = useVoiceStore((s) => s.joinedChannelId);
  const join = useVoiceStore((s) => s.join);

  return (
    <div className="space-y-3">
      {channels.map((channel) => {
        const isJoined = joinedChannelId === channel.id;
        return (
          <Card key={channel.id} className={isJoined ? "border-primary" : undefined}>
            <CardContent className="flex items-center justify-between gap-3 p-3">
              <div>
                <p className="font-semibold">#{channel.name}</p>
                <p className="text-xs text-muted-foreground">{channel.topic}</p>
                <p className="text-xs text-muted-foreground">
                  {channel.membersOnline.length} online
                </p>
              </div>
              <Button
                size="sm"
                variant={isJoined ? "secondary" : "default"}
                disabled={isJoined}
                onClick={() => join(channel.id)}
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
