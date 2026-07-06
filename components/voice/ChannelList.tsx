"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useVoiceChannels } from "@/hooks/useVoiceChannels";
import { useAuth } from "@/providers/AuthProvider";
import { CreateVoiceChannelDialog } from "@/components/voice/CreateVoiceChannelDialog";
import { canModerate } from "@/lib/permissions";
import type { VoiceChannel } from "@/lib/voice-channels";

export function ChannelList({ onOpen }: { onOpen: (channel: VoiceChannel) => void }) {
  const { user, profile } = useAuth();
  const { myChannels, discoverChannels, createChannel, joinByCode, leaveChannel, deleteChannel } =
    useVoiceChannels();
  const [createOpen, setCreateOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState("");

  async function handleOpen(channel: VoiceChannel) {
    // Opening a channel (public or via code) is also what persists membership,
    // so it shows up in "Meus canais" the next time.
    const joined = await joinByCode(channel.inviteCode);
    if (joined) onOpen(joined);
  }

  async function handleJoinByCode() {
    const channel = await joinByCode(inviteCode);
    if (channel) {
      onOpen(channel);
      setInviteCode("");
    }
  }

  async function handleLeave(id: string) {
    await leaveChannel(id);
    toast.info("Você saiu do canal");
  }

  async function handleDelete(id: string) {
    await deleteChannel(id);
    toast.info("Canal removido");
  }

  function renderChannel(channel: VoiceChannel, mine: boolean) {
    const canRemove = canModerate(profile, channel.ownerId, user?.id);
    return (
      <Card key={channel.id}>
        <CardContent className="flex items-center justify-between gap-3 p-3">
          <div className="min-w-0">
            <p className="truncate font-semibold">
              #{channel.name}
              {channel.isPrivate && " 🔒"}
            </p>
            {channel.topic && <p className="text-xs text-muted-foreground">{channel.topic}</p>}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {mine && (
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive"
                onClick={() => (canRemove ? handleDelete(channel.id) : handleLeave(channel.id))}
              >
                {canRemove ? "Remover" : "Sair"}
              </Button>
            )}
            <Button size="sm" onClick={() => handleOpen(channel)}>
              Abrir
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          placeholder="Código de convite"
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value)}
        />
        <Button variant="outline" onClick={handleJoinByCode}>
          Entrar
        </Button>
      </div>

      {myChannels.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground">Meus canais</p>
          {myChannels.map((c) => renderChannel(c, true))}
        </div>
      )}

      {discoverChannels.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground">Descobrir</p>
          {discoverChannels.map((c) => renderChannel(c, false))}
        </div>
      )}

      {myChannels.length === 0 && discoverChannels.length === 0 && (
        <p className="py-6 text-center text-sm text-muted-foreground">
          Nenhum canal ainda. Crie o primeiro ou entre com um código de convite.
        </p>
      )}

      <Button variant="outline" className="w-full" onClick={() => setCreateOpen(true)}>
        Criar canal
      </Button>

      <CreateVoiceChannelDialog open={createOpen} onOpenChange={setCreateOpen} onCreate={createChannel} />
    </div>
  );
}
