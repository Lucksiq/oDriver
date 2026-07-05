"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCurrentProfile } from "@/providers/AuthProvider";
import type { VoiceChannel } from "@/lib/voice-channels";

export function CreateVoiceChannelDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (input: {
    name: string;
    topic?: string;
    city?: string;
    isPrivate: boolean;
  }) => Promise<VoiceChannel | null>;
}) {
  const profile = useCurrentProfile();
  const [name, setName] = useState("");
  const [topic, setTopic] = useState("");
  const [city, setCity] = useState(profile?.city ?? "");
  const [isPrivate, setIsPrivate] = useState(false);

  function reset() {
    setName("");
    setTopic("");
    setCity(profile?.city ?? "");
    setIsPrivate(false);
  }

  async function submit() {
    if (!name.trim()) {
      toast.error("Dê um nome ao canal");
      return;
    }
    const channel = await onCreate({
      name: name.trim(),
      topic: topic.trim() || undefined,
      city: city.trim() || undefined,
      isPrivate,
    });
    if (!channel) return;
    if (isPrivate) {
      toast.success(`Canal criado! Código de convite: ${channel.inviteCode}`);
    } else {
      toast.success("Canal criado!");
    }
    reset();
    onOpenChange(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar canal de voz</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="channel-name">Nome</Label>
            <Input
              id="channel-name"
              value={name}
              maxLength={60}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="channel-topic">Tópico</Label>
            <Input
              id="channel-topic"
              placeholder="Opcional"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="channel-city">Cidade</Label>
            <Input
              id="channel-city"
              placeholder="Opcional"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="channel-private">Privado (só entra com código)</Label>
            <Switch id="channel-private" checked={isPrivate} onCheckedChange={setIsPrivate} />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={submit}>Criar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
